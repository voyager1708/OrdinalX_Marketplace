"""
板とチェーンの突き合わせ（documents/Specification.md §11 `reconcile_listings`）。

market DB の `Listing.status` は**チェーンの影**にすぎない。1Sat 互換にする＝
同じ OrdLock 出力を外部マーケットからも買えるし、売り手が自分の端末から
直接 spend することもできる。だから「市場が知らないところで板が動く」のが
正常系で、それを拾わないと板は嘘をつく。

判定はひとつの問いに還元できる:

    その出品の OrdLock 出力は、まだ未使用か？

- 未使用で、まだ `pending`      → `active`（板に出す）
- 未使用で、すでに `active`     → そのまま（`reconciled_at` だけ進める）
- 使用済み → 使った tx の解錠スクリプトを見て `cancelled` / `sold` に分ける
- チェーンに痕跡が無いまま猶予を過ぎた → `invalid`（放送が通らなかった）

**この worker が `Listing` の状態機械の唯一の持ち主**。遷移を増やすときも
ここに足す（複数の worker が同じ列を書くと、どちらが正かが決められない）。
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Any, Dict, List, Optional

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from listing.models import (
    EventKind,
    Listing,
    ListingEvent,
    ListingStatus,
    Purchase,
    PurchaseStatus,
)
from listing.ordlock.unlock import is_cancel_unlocking_script
from listing.services import chain

logger = logging.getLogger('market.reconcile')

# 突き合わせる状態（終端に落ちたものは二度と見ない）
OPEN_STATUSES = (ListingStatus.PENDING, ListingStatus.ACTIVE)


@dataclass
class Outcome:
    """1 件の結果。worker のログと戻り値のため。"""

    listing_id: int
    before: str
    after: str
    reason: str = ''
    txid: str = ''
    changed: bool = False
    error: str = ''


@dataclass
class Summary:
    checked: int = 0
    changed: int = 0
    errors: int = 0
    outcomes: List[Outcome] = field(default_factory=list)

    def add(self, outcome: Outcome) -> None:
        self.checked += 1
        if outcome.error:
            self.errors += 1
        elif outcome.changed:
            self.changed += 1
        self.outcomes.append(outcome)

    def counts(self) -> Dict[str, int]:
        tally: Dict[str, int] = {}
        for outcome in self.outcomes:
            key = outcome.error and 'error' or (outcome.changed and outcome.after or 'unchanged')
            tally[key] = tally.get(key, 0) + 1
        return tally


def _grace() -> timedelta:
    return timedelta(minutes=getattr(settings, 'RECONCILE_BROADCAST_GRACE_MINUTES', 30))


def _outpoint(listing: Listing) -> Optional[tuple[str, int]]:
    if not listing.listed_outpoint:
        return None
    txid, _, vout = listing.listed_outpoint.partition(':')
    if not txid or not vout.isdigit():
        return None
    return txid, int(vout)


def _is_unspent(rows: List[Dict[str, Any]], txid: str, vout: int) -> Optional[Dict[str, Any]]:
    for row in rows:
        if row.get('tx_hash') == txid and int(row.get('tx_pos', -1)) == vout:
            return row
    return None


def _find_spender(locking_script: bytes, txid: str, vout: int) -> Optional[Dict[str, Any]]:
    """
    その出力を使った tx を探す。

    script history には「作った tx」と「使った tx」の両方が載る。前者を除いて
    入力を覗き、該当 outpoint を参照しているものが spender。
    """
    from bsv import Transaction

    for row in chain.script_history(locking_script):
        candidate = row.get('tx_hash')
        if not candidate or candidate == txid:
            continue
        try:
            parsed = Transaction.from_hex(chain.raw_tx(candidate))
        except Exception as exc:          # noqa: BLE001 — 1 件の破損で全体を止めない
            logger.warning('could not parse %s…: %s', candidate[:12], exc.__class__.__name__)
            continue
        for tx_in in parsed.inputs:
            if tx_in.source_txid == txid and tx_in.source_output_index == vout:
                unlocking = tx_in.unlocking_script
                raw = unlocking.serialize() if unlocking is not None else b''
                return {'txid': candidate, 'height': row.get('height') or 0,
                        'unlocking_script': raw}
    return None


def _close_matching_purchase(spend_txid: str) -> None:
    """自前の購入 tx が確定していたら合わせて閉じる（Phase 3 の成約と噛み合わせる）。"""
    purchase = Purchase.objects.filter(txid=spend_txid).first()
    if purchase and purchase.status != PurchaseStatus.CONFIRMED:
        purchase.status = PurchaseStatus.CONFIRMED
        purchase.confirmed_at = timezone.now()
        purchase.save(update_fields=['status', 'confirmed_at'])


def _apply(listing: Listing, status: str, reason: str, txid: str = '',
           detail: Optional[Dict[str, Any]] = None) -> Outcome:
    """状態を 1 つ進めて RECONCILED を残す。板の更新と証跡は必ず同じ tx で。"""
    before = listing.status
    now = timezone.now()
    fields = ['status', 'reconciled_at']

    listing.status = status
    listing.reconciled_at = now
    if status == ListingStatus.ACTIVE and listing.activated_at is None:
        listing.activated_at = now
        fields.append('activated_at')
    if status in (ListingStatus.SOLD, ListingStatus.CANCELLED, ListingStatus.INVALID):
        listing.closed_at = now
        fields.append('closed_at')
    with transaction.atomic():
        listing.save(update_fields=fields)
        ListingEvent.objects.create(
            listing=listing, kind=EventKind.RECONCILED, txid=txid,
            detail={'from': before, 'to': status, 'reason': reason, **(detail or {})})
        if status == ListingStatus.SOLD and txid:
            _close_matching_purchase(txid)

    logger.info('listing %s: %s → %s (%s)', listing.pk, before, status, reason)
    return Outcome(listing_id=listing.pk, before=before, after=status,
                   reason=reason, txid=txid, changed=True)


def _touch(listing: Listing, reason: str) -> Outcome:
    """状態は変わらないが「見た」ことは残す。"""
    listing.reconciled_at = timezone.now()
    listing.save(update_fields=['reconciled_at'])
    return Outcome(listing_id=listing.pk, before=listing.status,
                   after=listing.status, reason=reason)


def reconcile_listing(listing: Listing) -> Outcome:
    """1 件を突き合わせる。例外は投げずに Outcome に包む（worker を止めないため）。"""
    outpoint = _outpoint(listing)
    if outpoint is None or not listing.ordlock_script_hex:
        # submit は outpoint と script を必ず一緒に入れるので、片方だけ欠けた行は
        # 突き合わせようが無い（seed した見本データもここに来る）。猶予を過ぎたら
        # 板から外す。
        reason = 'no_outpoint' if outpoint is None else 'no_ordlock_script'
        if timezone.now() - listing.created_at > _grace():
            return _apply(listing, ListingStatus.INVALID, reason)
        return _touch(listing, 'awaiting_outpoint')

    txid, vout = outpoint
    locking_script = bytes.fromhex(listing.ordlock_script_hex)

    try:
        unspent = chain.script_unspent(locking_script)
    except Exception as exc:                   # noqa: BLE001
        logger.warning('listing %s: chain lookup failed (%s)', listing.pk,
                       exc.__class__.__name__)
        return Outcome(listing_id=listing.pk, before=listing.status,
                       after=listing.status, error=exc.__class__.__name__)

    alive = _is_unspent(unspent, txid, vout)
    if alive is not None:
        height = int(alive.get('height') or 0)
        if listing.status == ListingStatus.PENDING:
            return _apply(listing, ListingStatus.ACTIVE, 'utxo_unspent', txid,
                          {'height': height, 'satoshis': alive.get('value')})
        return _touch(listing, 'utxo_unspent')

    # 未使用で無い。使われたのか、そもそも載っていないのか。
    try:
        spender = _find_spender(locking_script, txid, vout)
    except Exception as exc:                    # noqa: BLE001
        logger.warning('listing %s: spender lookup failed (%s)', listing.pk,
                       exc.__class__.__name__)
        return Outcome(listing_id=listing.pk, before=listing.status,
                       after=listing.status, error=exc.__class__.__name__)

    if spender is None:
        # 未使用でもなく、使った tx も見つからない。2 つの場合がある。
        try:
            exists = chain.tx_known(txid)
        except Exception as exc:                # noqa: BLE001
            return Outcome(listing_id=listing.pk, before=listing.status,
                           after=listing.status, error=exc.__class__.__name__)

        if exists:
            # 出品 tx は在る。つまり**直前に使われた**（mempool の purchase は
            # script history にまだ出ない。実測で 404）か、索引が遅れている。
            # どちらにせよ**板の状態は動かさない**。採掘されれば次の周で spender が
            # 見つかり、sold / cancelled に落ち着く。
            return _touch(listing, 'spent_by_unknown')

        # 出品 tx 自体をチェーンも mempool も知らない＝放送が通らなかった。
        # ARC が受理していても採掘されずに落ちることはある（§11）。
        if timezone.now() - listing.created_at > _grace():
            return _apply(listing, ListingStatus.INVALID, 'listing_tx_not_found')
        return _touch(listing, 'awaiting_broadcast')

    if is_cancel_unlocking_script(spender['unlocking_script']):
        return _apply(listing, ListingStatus.CANCELLED, 'cancelled_on_chain',
                      spender['txid'], {'height': spender['height']})

    # キャンセル以外で解けている＝誰かが買った（外部マーケット経由を含む）。
    return _apply(listing, ListingStatus.SOLD, 'purchased_on_chain',
                  spender['txid'], {'height': spender['height'], 'external': True})


def reconcile_listings(limit: Optional[int] = None,
                       listing_ids: Optional[List[int]] = None) -> Summary:
    """
    開いている板をまとめて突き合わせる。

    env で絞る（`visible_listings` と同じ理由。dev の検証で作った出品を
    本番の worker が触らない）。
    """
    queryset = Listing.objects.filter(market_env=settings.MARKET_ENV,
                                      status__in=OPEN_STATUSES)
    if listing_ids:
        queryset = Listing.objects.filter(pk__in=listing_ids)
    # 久しく見ていないものから（reconciled_at が null＝一度も見ていない）
    queryset = queryset.order_by('reconciled_at', 'pk')
    if limit is None:
        limit = getattr(settings, 'RECONCILE_BATCH_SIZE', 200)
    if limit:
        queryset = queryset[:limit]

    summary = Summary()
    for listing in list(queryset):
        summary.add(reconcile_listing(listing))
    return summary
