"""
出品（documents/Specification.md §8.2・§5）。

出品とは「**ordinal を OrdLock へ移す 1 tx**」。market は未署名テンプレートを
作って返すだけで、**鍵には触らない**（§14-1）。署名は端末、放送は BE。

    draft  … OrdLock を組む → BE にテンプレートを作らせる → 控えを残して返す
    submit … 署名済み tx を受けて、テンプレートと**同じ形か**を確かめてから放送

監査証跡は NC と同じ 4 段（発行 / 署名受領 / 検証 / 送信結果。§14-7）。
これが無いと、端末と market のどちらが落としたのか後から分からない。
"""

from __future__ import annotations

import hashlib
import json
import logging
from datetime import timedelta
from typing import Any, Dict, Optional

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from listing.be_client import BackendClient
from listing.models import (
    EventKind,
    Listing,
    ListingEvent,
    ListingKind,
    ListingStatus,
    TemplateKind,
    TxTemplate,
)
from listing.ordlock import decode as decode_ordlock
from listing.ordlock import lock as build_ordlock
from yp_marketplace.api.errors import (
    AlreadyListedError,
    ErrorCode,
    ForbiddenError,
    InvalidRequestError,
    MarketError,
    NotFoundError,
    TemplateExpiredError,
)

logger = logging.getLogger('market.listing')
audit = logging.getLogger('market.audit')


def _hash160(raw: bytes) -> bytes:
    from bsv.hash import hash160
    return hash160(raw)


def tx_fingerprint(inputs: Any, outputs: Any) -> str:
    """
    テンプレートの同一性。

    **BE と端末（キットの `txFingerprint`）と同じ正準形**を使う:
    `{"inputs":[{txid,vout,sats}],"outputs":[{sats,lock}]}` の SHA-256。
    3 者で式が違うと「同じ名前で中身が違う指紋」になり、突き合わせが
    意味を失う（BE: `compute_tx_fingerprint` / キット: `nc-send.js`）。
    """
    canonical = json.dumps(
        {
            'inputs': [
                {
                    'txid': i.get('txid'),
                    'vout': int(i.get('output_index') or 0),
                    'sats': int(i.get('satoshis') or 0),
                }
                for i in (inputs or [])
            ],
            'outputs': [
                {
                    'sats': int(o.get('satoshis') or 0),
                    'lock': str(o.get('locking_script')
                                or o.get('locking_script_hex') or '').lower(),
                }
                for o in (outputs or [])
            ],
        },
        separators=(',', ':'),
    )
    return hashlib.sha256(canonical.encode('utf-8')).hexdigest()


def _assert_allowed_in_dev(principal: int) -> None:
    """
    §13.3: BE の暫定本番と開発が同じ DB を見ているので、dev の出品は
    allowlist に限る。**本物のチェーンに出て、本物の手数料が出る**ため。
    """
    if settings.MARKET_ENV != 'dev':
        return
    allowed = {str(p) for p in settings.MARKET_DEV_PRINCIPALS}
    if str(principal) not in allowed:
        raise MarketError(
            'listing is limited to allow-listed principals in this environment',
            ErrorCode.NOT_ALLOWED_IN_DEV, 403)


def create_listing_draft(*, principal: int, token: str, nft_origin: str,
                         price_satoshis: int, payout_script: str,
                         cancel_pubkey: str, seller_paymail: str = '') -> Dict[str, Any]:
    """出品の未署名テンプレートを作る。"""
    _assert_allowed_in_dev(principal)

    if price_satoshis <= 0:
        raise InvalidRequestError('price_satoshis must be positive')
    try:
        payout_raw = bytes.fromhex(payout_script)
        cancel_raw = bytes.fromhex(cancel_pubkey)
    except ValueError:
        raise InvalidRequestError('payout_script and cancel_pubkey must be hex') from None
    if len(cancel_raw) not in (33, 65):
        raise InvalidRequestError('cancel_pubkey must be a 33- or 65-byte public key')
    if not payout_raw:
        raise InvalidRequestError('payout_script must not be empty')

    # 価格と受取先を**ロックに焼き込む**（§14-3。これで価格は改竄不能になる）
    locking_script = build_ordlock(
        seller_pkh=_hash160(cancel_raw),
        payout_script=payout_raw,
        price_satoshis=price_satoshis,
    )

    with transaction.atomic():
        # 二重出品。ordinal UTXO は 1 つしかないので最終的には ARC が落とすが、
        # 板の側で先に塞ぐ（§5）。部分一意インデックスと二重の守り。
        open_listing = (Listing.objects
                        .select_for_update()
                        .filter(nft_origin=nft_origin,
                                status__in=[ListingStatus.PENDING, ListingStatus.ACTIVE])
                        .first())
        if open_listing is not None:
            raise AlreadyListedError('this nft is already on the board')

        template = BackendClient(token).nft_script_template(
            nft_origin=nft_origin,
            recipient_locking_script=locking_script.hex(),
        )

        inputs = template.get('inputs') or []
        outputs = template.get('outputs') or []
        fingerprint = tx_fingerprint(inputs, outputs)

        try:
            listing = Listing.objects.create(
                kind=ListingKind.ORDLOCK,
                nft_origin=nft_origin,
                seller_principal=principal,
                seller_paymail=seller_paymail,
                payout_script=payout_script,
                cancel_pubkey=cancel_pubkey,
                price_satoshis=price_satoshis,
                ordlock_script_hex=locking_script.hex(),
                status=ListingStatus.DRAFT,
            )
        except IntegrityError:
            raise AlreadyListedError('this nft is already on the board') from None

        row = TxTemplate.objects.create(
            kind=TemplateKind.LIST,
            principal=principal,
            listing=listing,
            unsigned_tx_hex=template.get('unsigned_transaction_hex') or '',
            inputs=inputs,
            outputs=outputs,
            tx_fingerprint=fingerprint,
            expires_at=timezone.now() + timedelta(seconds=settings.TX_TEMPLATE_TTL_SECONDS),
        )

        ListingEvent.objects.create(
            listing=listing, template=row, kind=EventKind.TEMPLATE_ISSUED,
            principal=principal, detail={'nft_origin': nft_origin,
                                         'price_satoshis': price_satoshis})

    audit.info('TEMPLATE_ISSUED listing=%s template=%s principal=%s',
               listing.id, row.template_id, principal)

    # 端末が検証できるように、BE のテンプレートをそのまま渡す（§8.4）。
    # 端末は自分で OrdLock を組み直して**完全一致**を確かめてから署名する。
    # 手数料は **script で強制されない**（§14-4）。だから「いくら取るか」を
    # 告知し、端末に計算し直させる（キットの `assertAnnouncedFee`）。
    fee_satoshis = price_satoshis * listing.fee_bps // 10_000

    return {
        'listing_id': listing.id,
        'template_id': str(row.template_id),
        'tx_fingerprint': fingerprint,
        'ordlock_script_hex': locking_script.hex(),
        'price_satoshis': price_satoshis,
        'fee_bps': listing.fee_bps,
        'fee_satoshis': fee_satoshis,
        'expires_at': row.expires_at.isoformat(),
        'template': template,
    }


def _load_template(template_id: str, principal: int, kind: str) -> TxTemplate:
    row = TxTemplate.objects.filter(template_id=template_id, kind=kind).first()
    if row is None:
        raise NotFoundError('template not found')
    if row.principal != principal:
        # 他人のテンプレートには触らせない（存在は漏らさない）
        raise NotFoundError('template not found')
    if row.consumed_at is not None:
        raise MarketError('this template was already used',
                          ErrorCode.TEMPLATE_ALREADY_CONSUMED, 409)
    if row.expires_at <= timezone.now():
        raise TemplateExpiredError('this template has expired; request a new one')
    return row


def submit_listing(*, principal: int, token: str, template_id: str,
                   signed_transaction_hex: str) -> Dict[str, Any]:
    """署名済み tx を受け取り、検証してから BE に放送させる。"""
    row = _load_template(template_id, principal, TemplateKind.LIST)
    listing = row.listing
    if listing is None:
        raise NotFoundError('listing not found for this template')

    ListingEvent.objects.create(listing=listing, template=row,
                                kind=EventKind.SIGNED_RECEIVED, principal=principal)
    audit.info('SIGNED_RECEIVED listing=%s template=%s', listing.id, row.template_id)

    # 発行した形と同じかを見る。market が自分で出したテンプレート以外は放送しない
    # （端末が market を信頼しないのと対称に、market も端末を信頼しない）。
    try:
        verified = _verify_signed_tx(row, signed_transaction_hex)
    except MarketError as exc:
        ListingEvent.objects.create(listing=listing, template=row,
                                    kind=EventKind.VERIFY_FAIL, principal=principal,
                                    detail={'reason': str(exc)})
        audit.warning('VERIFY_FAIL listing=%s template=%s reason=%s',
                      listing.id, row.template_id, exc)
        raise

    ListingEvent.objects.create(listing=listing, template=row,
                                kind=EventKind.VERIFY_OK, principal=principal)

    try:
        result = BackendClient(token).broadcast(str(row.template_id), signed_transaction_hex)
    except MarketError as exc:
        ListingEvent.objects.create(listing=listing, template=row,
                                    kind=EventKind.BROADCAST_FAIL, principal=principal,
                                    detail={'reason': str(exc)})
        audit.warning('BROADCAST_FAIL listing=%s template=%s', listing.id, row.template_id)
        raise

    txid = (result or {}).get('txid') or verified['txid']

    with transaction.atomic():
        row.consumed_at = timezone.now()
        row.save(update_fields=['consumed_at'])

        listing.listing_txid = txid
        listing.listed_outpoint = f'{txid}:{verified["ordlock_vout"]}'
        # 放送しただけでは「売れる」とは言えない。reconcile が UTXO の
        # 未使用性を確かめるまでは pending（§5 の状態遷移）。
        listing.status = ListingStatus.PENDING
        listing.save(update_fields=['listing_txid', 'listed_outpoint', 'status'])

        ListingEvent.objects.create(listing=listing, template=row,
                                    kind=EventKind.BROADCAST_OK, principal=principal,
                                    txid=txid)

    audit.info('BROADCAST_OK listing=%s txid=%s', listing.id, txid)
    return {'listing_id': listing.id, 'status': listing.status,
            'txid': txid, 'listed_outpoint': listing.listed_outpoint}


def _verify_signed_tx(row: TxTemplate, signed_transaction_hex: str) -> Dict[str, Any]:
    """
    署名済み tx が、出したテンプレートと**同じ形**かを確かめる。

    見るのは「出力に、焼き込んだ OrdLock が 1 sat で載っているか」。
    ここを省くと、**別のスクリプトへ ordinal を移す tx を放送させられる**。
    """
    from bsv import Transaction as BsvTransaction

    try:
        tx = BsvTransaction.from_hex(signed_transaction_hex)
    except Exception:
        raise InvalidRequestError('signed_transaction_hex is not a transaction') from None

    expected = (row.listing.ordlock_script_hex or '').lower()
    for vout, output in enumerate(tx.outputs):
        script_hex = output.locking_script.hex().lower()
        if script_hex == expected and output.satoshis == 1:
            return {'txid': tx.txid(), 'ordlock_vout': vout}

    raise InvalidRequestError(
        'the signed transaction does not move the ordinal to the listed OrdLock script')
