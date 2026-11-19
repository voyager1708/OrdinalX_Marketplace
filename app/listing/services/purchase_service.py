"""
購入（documents/Specification.md §8.3・§5、S018 で **v1** に決定）。

**市場が組む**。入力に OrdLock が入るので BE には組めない（BE の UTXO 表に無い）。
鍵は要らない — v1 の購入は署名ではなく

    <出力0の直列化> <出力2以降の直列化 | OP_0> <preimage> OP_0

で解け、契約は「渡された preimage がこの tx のものか」と「出力 0・1・残りが
噛み合うか」だけを見る。出力 1（売り手への払い）は**ロックに焼き込まれた**ものを
契約自身が使うので、価格は改竄できない。

    draft  … 買い手の入力と受取先を集め、v1 が要求する並びで出力を組む
    submit … 買い手が署名した tx を受け、出品の入力を解いて放送する

**出力の並びは固定**（参照実装 `purchaseListing`）:

    入力  : 0 出品（OrdLock）· 1… 買い手の支払い
    出力  : 0 買い手の ordinal(1 sat) · 1 売り手への払い · 2… 市場手数料 / お釣り

出品の入力を**先頭に置く**のは first-sat ordering のため。ordinal の 1 sat は
入力の並び順で見た先頭にあるので、出力 0 に落ちる。ここを崩すと**買い手に
ordinal が届かない**。

マイナー手数料は買い手が持つ（§8.3）。買い手の署名は `ALL|FORKID` で、
**出力はすべて確定してから**署名してもらう（v2 と違い後から足せない）。
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
from listing.ordlock.v1.unlock import (
    estimate_purchase_unlock_length,
    purchase_unlocking_script,
    serialize_outputs,
)
from listing.ordlock.v2.script import build_output, p2pkh
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

# 出品の入力・出力の位置（v1 は固定）
LISTING_INPUT_INDEX = 0
ORDINAL_VOUT = 0
PAYOUT_VOUT = 1

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


def _estimate_tx_size(lock_raw: bytes, funding_inputs: int, outputs: int) -> int:
    """
    購入 tx のバイト数の見積もり。

    内訳は version 4 + 入力数の varint + 入力 + 出力数の varint + 出力 + locktime 4。
    出品の入力は **解錠だけで 1 KB 超**（preimage が scriptCode を丸ごと含む）なので、
    ここを定数で済ませると手数料が足りずに ARC が弾く（実機で踏んだ）。
    余裕を 10% 見る（お釣りの額で出力長は変わらないが、署名長は 1 バイト揺れる）。
    """
    listing_input = 32 + 4 + 4 + estimate_purchase_unlock_length(lock_raw) + 3
    p2pkh_input = 32 + 4 + 4 + 107 + 1
    p2pkh_output = 8 + 1 + 25
    size = (4 + 1 + listing_input + p2pkh_input * funding_inputs
            + 1 + p2pkh_output * outputs + 4)
    return int(size * 1.1)


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
        # 買い手が払うのは 価格 + 市場手数料 + マイナー手数料（§8.3）。
        # サイズは**実際の形から**見積もる（出品の解錠が 1 KB を超えるので、
        # 大雑把な定数では足りずに ARC が "Fees are insufficient" を返す）。
        miner_fee = chain.estimate_fee(
            _estimate_tx_size(lock_raw, funding_inputs=2, outputs=4))
        needed = price + fee_satoshis + miner_fee + chain.DUST_LIMIT
        funding = _pick_inputs(utxos, needed)
        funding_total = sum(int(u['satoshis']) for u in funding)

        # **出力の並びは固定**（v1）。0 が買い手の ordinal、1 が売り手への払い。
        outputs = [
            {'satoshis': 1, 'locking_script': receive_raw.hex()},
            {'satoshis': price, 'locking_script': decoded.payout_script.hex()},
        ]
        if fee_script and fee_satoshis:
            outputs.append({'satoshis': fee_satoshis,
                            'locking_script': fee_script.hex()})
        # お釣り（ordinal の 1 sat は出力 0 で出ていくので入力側の 1 と相殺）
        change = funding_total - price - fee_satoshis - miner_fee
        if change >= chain.DUST_LIMIT:
            outputs.append({'satoshis': change,
                            'locking_script': funding[0]['locking_script']})

        # **出品の入力を先頭に**（first-sat ordering。崩すと ordinal が届かない）
        inputs = ([{'txid': listing.listed_outpoint.split(':')[0],
                    'output_index': int(listing.listed_outpoint.split(':')[1]),
                    'satoshis': 1,
                    'locking_script': listing.ordlock_script_hex}]
                  + [_as_template_input(u) for u in funding])
        client_signs = [1 + i for i in range(len(funding))]

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
        'listing_input_index': LISTING_INPUT_INDEX,
        'receive_vout': ORDINAL_VOUT,
        'payout_vout': PAYOUT_VOUT,
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

    lock_raw = bytes.fromhex(row.listing.ordlock_script_hex)
    decoded = decode_ordlock(lock_raw)
    if decoded is None:
        raise MarketError('the stored listing script is not an OrdLock listing',
                          ErrorCode.INTERNAL_ERROR, 500)

    # 契約が見るのは「出力 1 が焼き込まれた payout と完全一致すること」
    payout = outputs[PAYOUT_VOUT]
    serialized_payout = build_output(int(payout['satoshis']),
                                     bytes.fromhex(payout['locking_script']))
    if serialized_payout != decoded.payout:
        raise MarketError(f'output {PAYOUT_VOUT} must be the seller payout',
                          ErrorCode.TEMPLATE_MISMATCH, 409)
    if int(outputs[ORDINAL_VOUT]['satoshis']) != 1:
        raise MarketError(f'output {ORDINAL_VOUT} must be the 1 sat ordinal',
                          ErrorCode.TEMPLATE_MISMATCH, 409)

    # 出品の入力を解く: <出力0> <出力2以降|OP_0> <preimage> OP_0（署名は要らない）
    ordinal_output = build_output(1, bytes.fromhex(outputs[ORDINAL_VOUT]['locking_script']))
    trailing = serialize_outputs(
        [(int(o['satoshis']), bytes.fromhex(o['locking_script']))
         for o in outputs[PAYOUT_VOUT + 1:]]) or None

    preimage = _purchase_preimage(tx, LISTING_INPUT_INDEX, lock_raw, inputs)
    tx.inputs[LISTING_INPUT_INDEX].unlocking_script = Script(
        purchase_unlocking_script(ordinal_output, trailing, preimage))
    return tx.hex()


def _purchase_preimage(tx, index: int, lock_raw: bytes,
                       declared: List[Dict[str, Any]]) -> bytes:
    """
    `ALL|ANYONECANPAY|FORKID` の preimage（参照実装 `purchaseListing` と同じ範囲）。

    scriptCode は **ロックスクリプト全体**（v1 は OP_CODESEPARATOR を通らない）。
    bsv は入力の `locking_script` を scriptCode に使うので、そこへ入れる。

    ⚠ hex から読み直した tx の入力は locking_script / satoshis を持たない。
    bsv の preimage は**全入力**を直列化するので、テンプレートの申告値で
    埋めてから計算する（埋め忘れると `NoneType has no attribute serialize`）。
    """
    from bsv import Script
    from bsv.constants import SIGHASH

    for position, item in enumerate(declared):
        tx_in = tx.inputs[position]
        tx_in.locking_script = Script(bytes.fromhex(item['locking_script']))
        tx_in.satoshis = int(item['satoshis'])

    tx_in = tx.inputs[index]
    tx_in.locking_script = Script(lock_raw)
    tx_in.satoshis = 1
    tx_in.sighash = SIGHASH.ALL_ANYONECANPAY_FORKID
    return tx.preimage(index)
