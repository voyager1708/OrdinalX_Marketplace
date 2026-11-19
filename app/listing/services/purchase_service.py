"""
購入（documents/Specification.md §8.3・§5）。

**市場が組む**。入力に OrdLock が入るので BE には組めない（BE の UTXO 表に
無い）。鍵は要らない — v2 の購入は署名ではなく `<preimage> OP_0` で解け、
契約は「入力 i が指す出力 i が、出品に焼き込まれた payout と完全一致すること」
だけを見る（SIGHASH_SINGLE が入力 i と出力 i を対にする）。

    draft  … 買い手の入力と受取先を集め、v2 が要求する並びで出力を組む
    submit … 買い手が署名した tx を受け、出品の入力を解いて放送する

出力の並びは **first-sat ordering** で決まっていて、崩すと ordinal が買い手に
届かない（参照実装 `planPurchase` と同じ）:

    入力  : 0…k-1 前払い · k 出品 · k+1… 手数料ぶんの追加入力
    出力  : 0 クッション · 1…k-1 0 sat の詰め物 · k payout · k+1 受け取り
            · k+2 市場手数料 · k+3 追加入力のお釣り

クッションは **前払い合計 − 価格** でなければならない。ここを削って手数料に
回すと、1 sat の ordinal が payout 側にずれて**買い手に届かなくなる**。
だからマイナー手数料と市場手数料は**出品の入力より後ろの入力**で賄う。
"""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any, Dict, List, Optional

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from listing.be_client import BackendClient
from listing.models import (
    EventKind,
    Listing,
    ListingEvent,
    ListingStatus,
    Purchase,
    PurchaseStatus,
    TemplateKind,
    TxTemplate,
)
from listing.ordlock import decode as decode_ordlock
from listing.ordlock import plan_purchase
from listing.ordlock.script import build_output, p2pkh
from listing.ordlock.unlock import purchase_subscript, purchase_unlocking_script
from listing.services import chain
from listing.services.listing_service import tx_fingerprint
from yp_marketplace.api.errors import (
    ErrorCode,
    InvalidRequestError,
    MarketError,
    NotFoundError,
    TemplateExpiredError,
)

logger = logging.getLogger('market.purchase')
audit = logging.getLogger('market.audit')

# 買い手が署名する範囲。出力は全部確定しているので ALL でよい
# （出品の入力は署名ではなく preimage で解くので、買い手の署名とは独立）。
BUYER_SIGHASH = 'ALL|FORKID'

BUYABLE = (ListingStatus.ACTIVE, ListingStatus.PENDING)


class ListingNotBuyableError(MarketError):
    error_code = ErrorCode.LISTING_NOT_ACTIVE
    status_code = 409


def _fee_script() -> Optional[bytes]:
    """市場手数料の受取先（§10）。設定が無ければ fee wallet のアドレス。"""
    configured = (getattr(settings, 'MARKET_FEE_SCRIPT', '') or '').strip()
    if configured:
        return bytes.fromhex(configured)
    address = (getattr(settings, 'MARKET_FEE_WALLET_ADDRESS', '') or '').strip()
    if not address:
        return None
    from bsv.utils import address_to_public_key_hash
    return p2pkh(address_to_public_key_hash(address))


def _pick_inputs(utxos: List[Dict[str, Any]], needed: int) -> List[Dict[str, Any]]:
    """必要額に届くまで大きい順に取る。届かなければ例外。"""
    usable = [u for u in utxos
              if u.get('locking_script') and u.get('derivation_path')
              and int(u.get('satoshis') or 0) > 0]
    usable.sort(key=lambda u: -int(u['satoshis']))
    picked: List[Dict[str, Any]] = []
    total = 0
    for utxo in usable:
        picked.append(utxo)
        total += int(utxo['satoshis'])
        if total >= needed:
            return picked
    raise MarketError(
        f'not enough balance: need {needed} sat, have {total} sat',
        ErrorCode.INVALID_REQUEST, 400)


def _as_template_input(utxo: Dict[str, Any]) -> Dict[str, Any]:
    """BE の NC テンプレートと同じ形にそろえる（端末の検証を使い回すため）。"""
    return {
        'txid': utxo['txid'],
        'output_index': int(utxo['output_index']),
        'satoshis': int(utxo['satoshis']),
        'locking_script': utxo['locking_script'],
        'derivation_path': utxo['derivation_path'],
    }


def create_purchase_draft(*, principal: int, token: str, listing_id: int,
                          receive_script: str) -> Dict[str, Any]:
    """購入の未署名テンプレートを作る。"""
    try:
        receive_raw = bytes.fromhex(receive_script)
    except ValueError:
        raise InvalidRequestError('receive_script must be hex') from None
    if not receive_raw:
        raise InvalidRequestError('receive_script must not be empty')

    client = BackendClient(token)

    with transaction.atomic():
        listing = (Listing.objects
                   .select_for_update()
                   .filter(id=listing_id, market_env=settings.MARKET_ENV)
                   .first())
        if listing is None:
            raise NotFoundError('listing not found')
        if listing.status not in BUYABLE:
            raise ListingNotBuyableError(f'this listing is {listing.status}')
        if not listing.listed_outpoint or not listing.ordlock_script_hex:
            raise ListingNotBuyableError('this listing has no on-chain outpoint yet')

        # 予約（§5。TTL 3 分）。同じ出品に 2 人が同時に入るのを塞ぐ
        _assert_not_reserved(listing)

        lock_raw = bytes.fromhex(listing.ordlock_script_hex)
        decoded = decode_ordlock(lock_raw)
        if decoded is None:
            raise MarketError('the stored listing script is not an OrdLock v2 listing',
                              ErrorCode.INTERNAL_ERROR, 500)

        _assert_be_knows_the_receive_address(client, receive_raw)

        price = decoded.price_satoshis
        fee_script = _fee_script()
        fee_satoshis = price * listing.fee_bps // 10_000 if fee_script else 0

        utxos = (client.list_utxos() or {}).get('utxos') or []
        # 前払い（payout を賄う）と、その後ろの手数料ぶんを分けて取る
        front = _pick_inputs(utxos, price)
        front_total = sum(int(u['satoshis']) for u in front)

        used = {(u['txid'], int(u['output_index'])) for u in front}
        rest = [u for u in utxos if (u['txid'], int(u['output_index'])) not in used]
        # マイナー手数料の見積もり（出品の解錠が preimage ぶん大きい）
        rough_size = 400 + len(lock_raw) + 180 * (len(front) + 2)
        miner_fee = chain.estimate_fee(rough_size)
        trailing = _pick_inputs(rest, fee_satoshis + miner_fee + chain.DUST_LIMIT)
        trailing_total = sum(int(u['satoshis']) for u in trailing)

        plan = plan_purchase(
            front_satoshis=[int(u['satoshis']) for u in front],
            listings=[lock_raw],
            receive_scripts=[receive_raw],
            cushion_script=bytes.fromhex(front[0]['locking_script']),
        )

        outputs = [{'satoshis': sats, 'locking_script': script.hex()}
                   for sats, script in plan.outputs]
        if fee_script and fee_satoshis:
            outputs.append({'satoshis': fee_satoshis, 'locking_script': fee_script.hex()})
        change = trailing_total - fee_satoshis - miner_fee
        if change >= chain.DUST_LIMIT:
            outputs.append({'satoshis': change,
                            'locking_script': trailing[0]['locking_script']})

        inputs = ([_as_template_input(u) for u in front]
                  + [{'txid': listing.listed_outpoint.split(':')[0],
                      'output_index': int(listing.listed_outpoint.split(':')[1]),
                      'satoshis': 1,
                      'locking_script': listing.ordlock_script_hex}]
                  + [_as_template_input(u) for u in trailing])
        listing_input_index = len(front)
        client_signs = ([i for i in range(len(front))]
                        + [listing_input_index + 1 + i for i in range(len(trailing))])

        unsigned_hex = _unsigned_tx_hex(inputs, outputs)
        fingerprint = tx_fingerprint(inputs, outputs)

        row = TxTemplate.objects.create(
            kind=TemplateKind.BUY, principal=principal, listing=listing,
            unsigned_tx_hex=unsigned_hex, inputs=inputs, outputs=outputs,
            tx_fingerprint=fingerprint,
            expires_at=timezone.now() + timedelta(
                seconds=settings.PURCHASE_RESERVATION_TTL_SECONDS),
        )
        purchase = Purchase.objects.create(
            listing=listing, buyer_principal=principal, template=row,
            paid_satoshis=price, fee_satoshis=fee_satoshis,
            status=PurchaseStatus.PENDING, market_env=settings.MARKET_ENV)
        ListingEvent.objects.create(
            listing=listing, purchase=purchase, template=row,
            kind=EventKind.TEMPLATE_ISSUED, principal=principal,
            detail={'kind': 'buy', 'price_satoshis': price,
                    'fee_satoshis': fee_satoshis})

    audit.info('TEMPLATE_ISSUED(buy) listing=%s template=%s principal=%s',
               listing.id, row.template_id, principal)

    return {
        'listing_id': listing.id,
        'purchase_id': purchase.id,
        'template_id': str(row.template_id),
        'tx_fingerprint': fingerprint,
        'price_satoshis': price,
        'fee_bps': listing.fee_bps,
        'fee_satoshis': fee_satoshis,
        'miner_fee_satoshis': miner_fee,
        'ordlock_script_hex': listing.ordlock_script_hex,
        'listing_input_index': listing_input_index,
        'receive_vout': plan.receive_vouts[0],
        'payout_vout': plan.payout_vouts[0],
        'expires_at': row.expires_at.isoformat(),
        # 端末の検証は BE の NC と同じ形で回す（§8.4）
        'template': {
            'template_id': str(row.template_id),
            'unsigned_transaction_hex': unsigned_hex,
            'inputs': inputs,
            'outputs': outputs,
            'client_signs_input_indices': client_signs,
            'tx_fingerprint': fingerprint,
            'sighash': BUYER_SIGHASH,
        },
    }


def _assert_not_reserved(listing: Listing) -> None:
    """生きている予約があるなら、他の人には出さない（§5。TTL 3 分）。"""
    alive = (Purchase.objects
             .filter(listing=listing, status=PurchaseStatus.PENDING,
                     template__expires_at__gt=timezone.now())
             .exists())
    if alive:
        raise MarketError('someone is buying this right now; try again shortly',
                          ErrorCode.PURCHASE_IN_PROGRESS, 409)


def _assert_be_knows_the_receive_address(client: BackendClient, receive: bytes) -> None:
    """
    受取先が **BE の知っているアドレス**か確かめる（§8.3 の警告）。

    知らないアドレスへ渡すと、成約後に BE が NFT を再紐付けできず
    **買い手のウォレットから NFT が消える**。端末が自分で導出した受取先でも、
    BE が知らなければ同じことなので、ここで止める。
    """
    from bsv.utils import address_to_public_key_hash

    if len(receive) != 25 or not receive.startswith(b'\x76\xa9\x14'):
        raise InvalidRequestError('receive_script must be a P2PKH script')
    pkh = receive[3:23]

    try:
        known = client.nft_legacy_addresses()
    except MarketError:
        raise
    addresses = known.get('Address') if isinstance(known, dict) else known
    if isinstance(addresses, str):
        addresses = [addresses]
    for address in addresses or []:
        try:
            if address_to_public_key_hash(str(address)) == pkh:
                return
        except Exception:                 # noqa: BLE001 — 形の違う行は無視
            continue
    raise MarketError(
        'the receive address is not one the wallet backend knows; '
        'the NFT would disappear from your wallet after the purchase',
        ErrorCode.INVALID_REQUEST, 400)


def _unsigned_tx_hex(inputs: List[Dict[str, Any]],
                     outputs: List[Dict[str, Any]]) -> str:
    """解錠スクリプトが空の tx（BE のテンプレートと同じ作り）。"""
    from bsv import Script, Transaction, TransactionInput, TransactionOutput

    tx = Transaction()
    for item in inputs:
        tx.add_input(TransactionInput(source_txid=item['txid'],
                                      source_output_index=int(item['output_index']),
                                      unlocking_script=Script(b'')))
    for item in outputs:
        tx.add_output(TransactionOutput(
            locking_script=Script(bytes.fromhex(item['locking_script'])),
            satoshis=int(item['satoshis'])))
    return tx.hex()


def submit_purchase(*, principal: int, template_id: str,
                    signed_transaction_hex: str) -> Dict[str, Any]:
    """買い手の署名を受け、出品の入力を解いて放送する。"""
    row = TxTemplate.objects.filter(template_id=template_id,
                                    kind=TemplateKind.BUY).first()
    if row is None or row.principal != principal:
        raise NotFoundError('template not found')
    if row.consumed_at is not None:
        raise MarketError('this template was already used',
                          ErrorCode.TEMPLATE_ALREADY_CONSUMED, 409)
    if row.expires_at <= timezone.now():
        raise TemplateExpiredError('this template has expired; request a new one')

    listing = row.listing
    purchase = row.purchases.first()
    ListingEvent.objects.create(listing=listing, purchase=purchase, template=row,
                                kind=EventKind.SIGNED_RECEIVED, principal=principal)

    raw_hex = _complete_purchase_tx(row, signed_transaction_hex)

    ListingEvent.objects.create(listing=listing, purchase=purchase, template=row,
                                kind=EventKind.VERIFY_OK, principal=principal)

    try:
        txid = chain.broadcast(raw_hex)
    except MarketError as exc:
        ListingEvent.objects.create(listing=listing, purchase=purchase, template=row,
                                    kind=EventKind.BROADCAST_FAIL, principal=principal,
                                    detail={'reason': str(exc)})
        if purchase is not None:
            purchase.status = PurchaseStatus.FAILED
            purchase.save(update_fields=['status'])
        audit.warning('BROADCAST_FAIL(buy) listing=%s', listing.id)
        raise

    with transaction.atomic():
        row.consumed_at = timezone.now()
        row.save(update_fields=['consumed_at'])
        if purchase is not None:
            purchase.txid = txid
            purchase.status = PurchaseStatus.BROADCAST
            purchase.save(update_fields=['txid', 'status'])
        listing.status = ListingStatus.SOLD
        listing.closed_at = timezone.now()
        listing.save(update_fields=['status', 'closed_at'])
        ListingEvent.objects.create(listing=listing, purchase=purchase, template=row,
                                    kind=EventKind.BROADCAST_OK, principal=principal,
                                    txid=txid, detail={'kind': 'buy'})

    audit.info('BROADCAST_OK(buy) listing=%s txid=%s', listing.id, txid)
    return {'listing_id': listing.id, 'purchase_id': getattr(purchase, 'id', None),
            'txid': txid, 'status': ListingStatus.SOLD}


def _complete_purchase_tx(row: TxTemplate, signed_hex: str) -> str:
    """
    署名済み tx を**発行した形と突き合わせ**、出品の入力を解いて完成させる。

    市場も端末を信頼しない（出品の submit と対称）。入力・出力が 1 つでも
    違えば放送しない。
    """
    from bsv import Script, Transaction

    try:
        tx = Transaction.from_hex(signed_hex)
    except Exception:                      # noqa: BLE001
        raise InvalidRequestError('signed_transaction_hex is not a transaction') from None

    inputs, outputs = row.inputs, row.outputs
    if len(tx.inputs) != len(inputs) or len(tx.outputs) != len(outputs):
        raise MarketError('the signed transaction does not match the template',
                          ErrorCode.TEMPLATE_MISMATCH, 409)

    for index, declared in enumerate(inputs):
        tx_in = tx.inputs[index]
        if (tx_in.source_txid != declared['txid']
                or tx_in.source_output_index != int(declared['output_index'])):
            raise MarketError(f'input {index} was changed',
                              ErrorCode.TEMPLATE_MISMATCH, 409)
    for index, declared in enumerate(outputs):
        tx_out = tx.outputs[index]
        if (tx_out.satoshis != int(declared['satoshis'])
                or tx_out.locking_script.serialize().hex() != declared['locking_script']):
            raise MarketError(f'output {index} was changed',
                              ErrorCode.TEMPLATE_MISMATCH, 409)

    listing_index = next(i for i, item in enumerate(inputs)
                         if item['locking_script'] == row.listing.ordlock_script_hex)
    lock_raw = bytes.fromhex(row.listing.ordlock_script_hex)

    # 契約が見るのは「出力 i が payout と完全一致すること」。先に確かめる
    decoded = decode_ordlock(lock_raw)
    bound = outputs[listing_index]
    serialized = build_output(int(bound['satoshis']),
                              bytes.fromhex(bound['locking_script']))
    if serialized != decoded.payout:
        raise MarketError(
            f'output {listing_index} must be the seller payout',
            ErrorCode.TEMPLATE_MISMATCH, 409)

    # 出品の入力を解く: <preimage> OP_0（署名は要らない）
    preimage = _purchase_preimage(tx, listing_index, lock_raw)
    tx.inputs[listing_index].unlocking_script = Script(
        purchase_unlocking_script(preimage))
    return tx.hex()


def _purchase_preimage(tx, index: int, lock_raw: bytes) -> bytes:
    """
    SIGHASH_SINGLE|ANYONECANPAY|FORKID の preimage。

    scriptCode は **OP_CODESEPARATOR より後ろ**（`purchase_subscript`）。
    bsv は入力の `locking_script` を scriptCode に使うので、そこへ入れる。
    """
    from bsv import Script
    from bsv.constants import SIGHASH

    subscript = purchase_subscript(lock_raw)
    if subscript is None:
        raise MarketError('the listing script is not an OrdLock v2 listing',
                          ErrorCode.INTERNAL_ERROR, 500)

    tx_in = tx.inputs[index]
    tx_in.locking_script = Script(subscript)
    tx_in.satoshis = 1
    tx_in.sighash = SIGHASH.SINGLE_ANYONECANPAY_FORKID
    return tx.preimage(index)
