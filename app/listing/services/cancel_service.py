"""
出品の取り下げ（documents/Specification.md §8.3）。

キャンセルは **market が自分で組む**。BE は OrdLock の UTXO を知らないので
（出品時に `external` で記帳を飛ばしている）テンプレートを作れない。

    draft  … ordinal を売り手へ戻す tx を組み、売り手が署名する材料を返す
    submit … 署名を受けて解錠スクリプトを組み、手数料を足して ARC へ出す

手数料は**市場の fee wallet** が持つ（§10）。売り手の署名は
`SIGHASH_ALL | ANYONECANPAY` なので、署名後に市場が自分の入力を足せる。
"""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any, Dict

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from listing.models import (
    EventKind,
    Listing,
    ListingEvent,
    ListingStatus,
    TemplateKind,
    TxTemplate,
)
from listing.ordlock import decode as decode_ordlock
from listing.ordlock.unlock import cancel_unlocking_script
from listing.services import chain
from listing.services.listing_service import tx_fingerprint
from yp_marketplace.api.errors import (
    ErrorCode,
    InvalidRequestError,
    MarketError,
    NotFoundError,
    TemplateExpiredError,
)

logger = logging.getLogger('market.cancel')
audit = logging.getLogger('market.audit')

# 売り手が署名する範囲。ALL は出力を固定し、ANYONECANPAY は
# **署名の後から市場が手数料入力を足せる**ようにする（参照実装と同じ）
CANCEL_SIGHASH = 'ALL|ANYONECANPAY|FORKID'

CANCELLABLE = (ListingStatus.PENDING, ListingStatus.ACTIVE)


def _load_listing(listing_id: int, principal: int) -> Listing:
    listing = Listing.objects.filter(id=listing_id,
                                     market_env=settings.MARKET_ENV).first()
    if listing is None:
        raise NotFoundError('listing not found')
    if listing.seller_principal != principal:
        # 他人の出品は取り下げられない。存在は漏らさない
        raise NotFoundError('listing not found')
    if listing.status not in CANCELLABLE:
        raise MarketError(f'this listing is {listing.status} and cannot be cancelled',
                          ErrorCode.LISTING_NOT_ACTIVE, 409)
    if not listing.listed_outpoint:
        raise MarketError('this listing has no on-chain outpoint yet',
                          ErrorCode.LISTING_NOT_ACTIVE, 409)
    return listing


def create_cancel_draft(*, principal: int, listing_id: int,
                        receive_script: str) -> Dict[str, Any]:
    """ordinal を売り手へ戻す未署名 tx を組む。"""
    listing = _load_listing(listing_id, principal)

    try:
        receive_raw = bytes.fromhex(receive_script)
    except ValueError:
        raise InvalidRequestError('receive_script must be hex') from None
    if not receive_raw:
        raise InvalidRequestError('receive_script must not be empty')

    lock_raw = bytes.fromhex(listing.ordlock_script_hex)
    if decode_ordlock(lock_raw) is None:
        raise MarketError('the stored listing script is not an OrdLock v2 listing',
                          ErrorCode.INTERNAL_ERROR, 500)

    txid, _, vout = listing.listed_outpoint.partition(':')
    outputs = [{'locking_script': receive_raw.hex(), 'satoshis': 1}]
    inputs = [{'txid': txid, 'output_index': int(vout), 'satoshis': 1}]

    row = TxTemplate.objects.create(
        kind=TemplateKind.CANCEL,
        principal=principal,
        listing=listing,
        unsigned_tx_hex='',          # 署名材料は下の sighash で渡す
        inputs=inputs,
        outputs=outputs,
        tx_fingerprint=tx_fingerprint(inputs, outputs),
        expires_at=timezone.now() + timedelta(seconds=settings.TX_TEMPLATE_TTL_SECONDS),
    )
    ListingEvent.objects.create(listing=listing, template=row,
                                kind=EventKind.TEMPLATE_ISSUED, principal=principal,
                                detail={'kind': 'cancel'})
    audit.info('TEMPLATE_ISSUED(cancel) listing=%s template=%s', listing.id, row.template_id)

    return {
        'listing_id': listing.id,
        'template_id': str(row.template_id),
        'tx_fingerprint': row.tx_fingerprint,
        # 端末はこの 3 つで自分で組み直し、署名する（§8.4）
        'ordlock_script_hex': listing.ordlock_script_hex,
        'input': inputs[0],
        'output': outputs[0],
        'sighash': CANCEL_SIGHASH,
        'expires_at': row.expires_at.isoformat(),
    }


def submit_cancel(*, principal: int, template_id: str, signature_hex: str,
                  public_key_hex: str) -> Dict[str, Any]:
    """売り手の署名を受けて解錠し、手数料を足して ARC へ出す。"""
    row = TxTemplate.objects.filter(template_id=template_id,
                                    kind=TemplateKind.CANCEL).first()
    if row is None or row.principal != principal:
        raise NotFoundError('template not found')
    if row.consumed_at is not None:
        raise MarketError('this template was already used',
                          ErrorCode.TEMPLATE_ALREADY_CONSUMED, 409)
    if row.expires_at <= timezone.now():
        raise TemplateExpiredError('this template has expired; request a new one')

    listing = row.listing
    ListingEvent.objects.create(listing=listing, template=row,
                                kind=EventKind.SIGNED_RECEIVED, principal=principal)

    try:
        signature = bytes.fromhex(signature_hex)
        public_key = bytes.fromhex(public_key_hex)
    except ValueError:
        raise InvalidRequestError('signature and public key must be hex') from None

    # 署名した鍵が、ロックに焼き込まれた売り手の鍵かを確かめる。
    # ここを省くと、他人の署名でも解錠を試みて ARC に弾かれるだけの tx を出す。
    from bsv.hash import hash160
    decoded = decode_ordlock(bytes.fromhex(listing.ordlock_script_hex))
    if hash160(public_key) != decoded.seller_pkh:
        ListingEvent.objects.create(listing=listing, template=row,
                                    kind=EventKind.VERIFY_FAIL, principal=principal,
                                    detail={'reason': 'public key is not the seller key'})
        raise MarketError('this key cannot cancel the listing',
                          ErrorCode.NOT_OWNER, 403)

    ListingEvent.objects.create(listing=listing, template=row,
                                kind=EventKind.VERIFY_OK, principal=principal)

    raw_hex = _assemble_cancel_tx(listing, row, signature, public_key)

    try:
        txid = chain.broadcast(raw_hex)
    except MarketError as exc:
        ListingEvent.objects.create(listing=listing, template=row,
                                    kind=EventKind.BROADCAST_FAIL, principal=principal,
                                    detail={'reason': str(exc)})
        audit.warning('BROADCAST_FAIL(cancel) listing=%s', listing.id)
        raise

    with transaction.atomic():
        row.consumed_at = timezone.now()
        row.save(update_fields=['consumed_at'])
        listing.status = ListingStatus.CANCELLED
        listing.closed_at = timezone.now()
        listing.save(update_fields=['status', 'closed_at'])
        ListingEvent.objects.create(listing=listing, template=row,
                                    kind=EventKind.BROADCAST_OK, principal=principal,
                                    txid=txid, detail={'kind': 'cancel'})

    audit.info('BROADCAST_OK(cancel) listing=%s txid=%s', listing.id, txid)
    return {'listing_id': listing.id, 'status': listing.status, 'txid': txid}


def _assemble_cancel_tx(listing: Listing, row: TxTemplate,
                        signature: bytes, public_key: bytes) -> str:
    """解錠スクリプトを組み、市場の手数料入力を足して署名した生 tx を返す。"""
    from bsv import P2PKH, Script, Transaction, TransactionInput, TransactionOutput

    key = chain.fee_wallet_key()
    fee_address = key.address()

    listed_txid = row.inputs[0]['txid']
    listed_vout = int(row.inputs[0]['output_index'])
    receive_script = bytes.fromhex(row.outputs[0]['locking_script'])

    # 解錠は <marker> <sig> <pubkey> OP_1（参照実装と同じ）
    unlocking = Script(cancel_unlocking_script(signature, public_key))

    # 手数料は市場持ち。入力 1 本 + お釣り 1 本ぶんを見込んで選ぶ
    rough_size = 400 + len(unlocking.serialize())
    needed = chain.estimate_fee(rough_size) + chain.DUST_LIMIT
    fee_utxo = chain.pick_fee_utxo(fee_address, needed)
    fee_source = Transaction.from_hex(chain.raw_tx(fee_utxo['tx_hash']))

    tx = Transaction()
    tx.add_input(TransactionInput(
        source_txid=listed_txid,
        source_output_index=listed_vout,
        unlocking_script=unlocking,
    ))
    tx.add_input(TransactionInput(
        source_transaction=fee_source,
        source_output_index=fee_utxo['tx_pos'],
        unlocking_script_template=P2PKH().unlock(key),
    ))
    tx.add_output(TransactionOutput(
        locking_script=Script(receive_script), satoshis=1))
    tx.add_output(TransactionOutput(
        locking_script=P2PKH().lock(fee_address), change=True))

    from bsv.fee_models import SatoshisPerKilobyte
    tx.fee(SatoshisPerKilobyte(chain.FEE_PER_KB))
    tx.sign()        # 市場の入力だけが署名される（売り手の入力は解錠済み）
    return tx.hex()
