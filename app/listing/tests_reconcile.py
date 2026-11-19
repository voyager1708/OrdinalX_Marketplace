"""
板とチェーンの突き合わせ（documents/Specification.md §11 `reconcile_listings`）。

押さえるのは「市場が知らないところで板が動いた」ときに正しく上書きできるか:

  - OrdLock の UTXO が生きている         → `pending` を `active` にする
  - キャンセルの形で解かれていた         → `cancelled`
  - それ以外の形で解かれていた           → `sold`（外部マーケットでの成約）
  - チェーンに痕跡が無いまま猶予を過ぎた → `invalid`
  - 照会が落ちたとき                     → **状態を動かさない**

チェーン照会は差し替える（WoC を本物で叩くテストにはしない）。代わりに
「WoC が返す形」をそのまま模して、解錠スクリプトの判定だけを本物に通す。
"""

from __future__ import annotations

from datetime import timedelta
from unittest import mock

from django.test import TestCase, override_settings
from django.utils import timezone

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
from listing.ordlock import lock as build_ordlock
from listing.ordlock import p2pkh
from listing.ordlock.script import encode_push
from listing.ordlock.unlock import cancel_unlocking_script
from listing.services import chain, reconcile_service

PRINCIPAL = 7
LISTED_TXID = 'c3' * 32
SPEND_TXID = 'd4' * 32
PRICE = 50_000


def _varint(value: int) -> bytes:
    if value < 0xfd:
        return bytes([value])
    if value <= 0xffff:
        return b'\xfd' + value.to_bytes(2, 'little')
    return b'\xfe' + value.to_bytes(4, 'little')


def _raw_spend(txid: str, vout: int, unlocking: bytes) -> str:
    """その outpoint を使う tx の生 hex（入力 1 本・出力 1 本の最小形）。"""
    raw = (b'\x01\x00\x00\x00'                       # version
           + b'\x01'                                 # 入力 1 本
           + bytes.fromhex(txid)[::-1]               # 参照 txid（内部順）
           + vout.to_bytes(4, 'little')
           + _varint(len(unlocking)) + unlocking
           + b'\xff\xff\xff\xff'                     # sequence
           + b'\x01'                                 # 出力 1 本
           + (1).to_bytes(8, 'little')
           + _varint(25) + p2pkh(bytes([0x44]) * 20)
           + b'\x00\x00\x00\x00')                    # locktime
    return raw.hex()


def _listing(status=ListingStatus.PENDING, env='dev', **kwargs):
    from bsv import PrivateKey
    from bsv.hash import hash160

    key = PrivateKey()
    pubkey = key.public_key().serialize()
    script = build_ordlock(seller_pkh=hash160(pubkey),
                           payout_script=p2pkh(bytes([0x22]) * 20),
                           price_satoshis=PRICE)
    defaults = dict(
        nft_origin='a1' * 32 + '_0',
        seller_principal=PRINCIPAL,
        payout_script=p2pkh(bytes([0x22]) * 20).hex(),
        cancel_pubkey=pubkey.hex(),
        price_satoshis=PRICE,
        ordlock_script_hex=script.hex(),
        listing_txid=LISTED_TXID,
        listed_outpoint=f'{LISTED_TXID}:0',
        status=status,
        market_env=env,
    )
    defaults.update(kwargs)
    listing = Listing.objects.create(**defaults)
    listing.seller_key = key
    return listing


def _unspent_row(txid=LISTED_TXID, vout=0, height=0, value=1):
    return {'height': height, 'tx_pos': vout, 'tx_hash': txid, 'value': value}


class ScriptHashTests(TestCase):
    def test_script_hash_matches_whatsonchain(self):
        """実測値で固定する（WoC の script hash は sha256 のバイト反転）。"""
        script = p2pkh(bytes.fromhex('203f629b92e034ab5449fa99f6856bbdb50c3338'))
        # 13wWZDg914diEzP7Ca4YadUKrJBgJH57Vu（市場の dev fee wallet）宛
        self.assertEqual(
            chain.script_hash(script),
            '73e514c1cf74051e53068bb8d5828101e525a9d80ae447bcff59959aa231f089')


@override_settings(MARKET_ENV='dev', RECONCILE_BROADCAST_GRACE_MINUTES=30)
class ReconcileListingTests(TestCase):
    def _run(self, listing, unspent=None, history=None, raws=None, tx_known=False):
        with mock.patch.object(chain, 'script_unspent', return_value=unspent or []), \
             mock.patch.object(chain, 'script_history', return_value=history or []), \
             mock.patch.object(chain, 'raw_tx', side_effect=lambda t: (raws or {})[t]), \
             mock.patch.object(chain, 'tx_known', return_value=tx_known):
            return reconcile_service.reconcile_listing(listing)

    def test_unspent_utxo_activates_a_pending_listing(self):
        listing = _listing()
        outcome = self._run(listing, unspent=[_unspent_row(height=976_100)])

        listing.refresh_from_db()
        self.assertTrue(outcome.changed)
        self.assertEqual(listing.status, ListingStatus.ACTIVE)
        self.assertIsNotNone(listing.activated_at)
        self.assertIsNotNone(listing.reconciled_at)
        event = ListingEvent.objects.get(listing=listing, kind=EventKind.RECONCILED)
        self.assertEqual(event.detail['to'], 'active')
        self.assertEqual(event.detail['height'], 976_100)

    def test_unconfirmed_utxo_is_enough_to_activate(self):
        """メモリプール（height 0）でも板には出す。ARC の SEEN_ON_NETWORK と同じ扱い。"""
        listing = _listing()
        self._run(listing, unspent=[_unspent_row(height=0)])
        listing.refresh_from_db()
        self.assertEqual(listing.status, ListingStatus.ACTIVE)

    def test_active_listing_is_only_touched(self):
        listing = _listing(status=ListingStatus.ACTIVE)
        outcome = self._run(listing, unspent=[_unspent_row()])

        listing.refresh_from_db()
        self.assertFalse(outcome.changed)
        self.assertEqual(listing.status, ListingStatus.ACTIVE)
        self.assertIsNotNone(listing.reconciled_at)
        self.assertFalse(ListingEvent.objects.filter(kind=EventKind.RECONCILED).exists())

    def test_other_outpoint_on_the_same_script_does_not_count(self):
        """同じスクリプト宛の別の出力では「生きている」と言えない。"""
        listing = _listing(status=ListingStatus.ACTIVE)
        self._run(listing,
                  unspent=[_unspent_row(txid=SPEND_TXID, vout=3)],
                  history=[{'tx_hash': LISTED_TXID, 'height': 1}],
                  tx_known=True)
        listing.refresh_from_db()
        # 痕跡はあるが spender は見つからない → 据え置き
        self.assertEqual(listing.status, ListingStatus.ACTIVE)

    def test_spent_but_spender_not_indexed_yet_keeps_the_status(self):
        """
        mempool で使われた直後は script history にまだ出ない（実測で 404）。
        出品 tx が在ることだけは分かるので、**勝手に invalid にしない**。
        """
        listing = _listing(status=ListingStatus.ACTIVE)
        Listing.objects.filter(pk=listing.pk).update(
            created_at=timezone.now() - timedelta(hours=2))
        listing.refresh_from_db()

        outcome = self._run(listing, tx_known=True)
        listing.refresh_from_db()
        self.assertEqual(listing.status, ListingStatus.ACTIVE)
        self.assertEqual(outcome.reason, 'spent_by_unknown')
        self.assertFalse(outcome.changed)

    def test_cancel_unlock_closes_the_listing_as_cancelled(self):
        listing = _listing(status=ListingStatus.ACTIVE)
        unlocking = cancel_unlocking_script(b'\x30' * 71,
                                           listing.seller_key.public_key().serialize())
        outcome = self._run(
            listing,
            history=[{'tx_hash': LISTED_TXID, 'height': 10},
                     {'tx_hash': SPEND_TXID, 'height': 11}],
            raws={SPEND_TXID: _raw_spend(LISTED_TXID, 0, unlocking)})

        listing.refresh_from_db()
        self.assertEqual(listing.status, ListingStatus.CANCELLED)
        self.assertIsNotNone(listing.closed_at)
        self.assertEqual(outcome.txid, SPEND_TXID)
        event = ListingEvent.objects.get(listing=listing, kind=EventKind.RECONCILED)
        self.assertEqual(event.detail['reason'], 'cancelled_on_chain')

    def test_purchase_unlock_closes_the_listing_as_sold(self):
        """キャンセル以外の形で解けている＝買われた（外部マーケット経由を含む）。"""
        listing = _listing(status=ListingStatus.ACTIVE)
        unlocking = (encode_push(b'\x30' * 71)
                     + encode_push(listing.seller_key.public_key().serialize())
                     + b'\x00')     # purchase セレクタ
        self._run(listing,
                  history=[{'tx_hash': SPEND_TXID, 'height': 12}],
                  raws={SPEND_TXID: _raw_spend(LISTED_TXID, 0, unlocking)})

        listing.refresh_from_db()
        self.assertEqual(listing.status, ListingStatus.SOLD)
        event = ListingEvent.objects.get(listing=listing, kind=EventKind.RECONCILED)
        self.assertTrue(event.detail['external'])

    def test_sold_confirms_our_own_purchase_row(self):
        listing = _listing(status=ListingStatus.ACTIVE)
        purchase = Purchase.objects.create(listing=listing, buyer_principal=9,
                                           txid=SPEND_TXID, paid_satoshis=PRICE,
                                           status=PurchaseStatus.BROADCAST,
                                           market_env='dev')
        unlocking = encode_push(b'\x30' * 71) + b'\x00'
        self._run(listing,
                  history=[{'tx_hash': SPEND_TXID, 'height': 13}],
                  raws={SPEND_TXID: _raw_spend(LISTED_TXID, 0, unlocking)})

        purchase.refresh_from_db()
        self.assertEqual(purchase.status, PurchaseStatus.CONFIRMED)
        self.assertIsNotNone(purchase.confirmed_at)

    def test_a_spend_of_another_outpoint_is_not_our_spender(self):
        listing = _listing(status=ListingStatus.ACTIVE)
        unlocking = cancel_unlocking_script(b'\x30' * 71,
                                            listing.seller_key.public_key().serialize())
        self._run(listing,
                  history=[{'tx_hash': SPEND_TXID, 'height': 14}],
                  raws={SPEND_TXID: _raw_spend(LISTED_TXID, 1, unlocking)})
        listing.refresh_from_db()
        self.assertEqual(listing.status, ListingStatus.ACTIVE)

    def test_no_trace_within_grace_keeps_pending(self):
        listing = _listing()
        outcome = self._run(listing)

        listing.refresh_from_db()
        self.assertFalse(outcome.changed)
        self.assertEqual(listing.status, ListingStatus.PENDING)
        self.assertEqual(outcome.reason, 'awaiting_broadcast')

    def test_no_trace_past_grace_invalidates(self):
        listing = _listing()
        Listing.objects.filter(pk=listing.pk).update(
            created_at=timezone.now() - timedelta(hours=2))
        listing.refresh_from_db()

        self._run(listing)
        listing.refresh_from_db()
        self.assertEqual(listing.status, ListingStatus.INVALID)
        self.assertIsNotNone(listing.closed_at)
        event = ListingEvent.objects.get(listing=listing, kind=EventKind.RECONCILED)
        self.assertEqual(event.detail['reason'], 'listing_tx_not_found')

    def test_tx_lookup_failure_leaves_the_status_alone(self):
        listing = _listing(status=ListingStatus.ACTIVE)
        with mock.patch.object(chain, 'script_unspent', return_value=[]), \
             mock.patch.object(chain, 'script_history', return_value=[]), \
             mock.patch.object(chain, 'tx_known',
                               side_effect=RuntimeError('woc is down')):
            outcome = reconcile_service.reconcile_listing(listing)

        listing.refresh_from_db()
        self.assertEqual(outcome.error, 'RuntimeError')
        self.assertEqual(listing.status, ListingStatus.ACTIVE)

    def test_chain_failure_leaves_the_status_alone(self):
        listing = _listing(status=ListingStatus.ACTIVE)
        with mock.patch.object(chain, 'script_unspent',
                               side_effect=RuntimeError('woc is down')):
            outcome = reconcile_service.reconcile_listing(listing)

        listing.refresh_from_db()
        self.assertEqual(outcome.error, 'RuntimeError')
        self.assertFalse(outcome.changed)
        self.assertEqual(listing.status, ListingStatus.ACTIVE)
        self.assertIsNone(listing.reconciled_at)

    def test_missing_outpoint_past_grace_invalidates(self):
        listing = _listing(listed_outpoint='', ordlock_script_hex='')
        Listing.objects.filter(pk=listing.pk).update(
            created_at=timezone.now() - timedelta(hours=2))
        listing.refresh_from_db()

        reconcile_service.reconcile_listing(listing)
        listing.refresh_from_db()
        self.assertEqual(listing.status, ListingStatus.INVALID)


@override_settings(MARKET_ENV='dev')
class ReconcileBatchTests(TestCase):
    def test_batch_skips_other_environments_and_closed_listings(self):
        mine = _listing()
        _listing(env='prod', nft_origin='b2' * 32 + '_0')
        _listing(status=ListingStatus.SOLD, nft_origin='c3' * 32 + '_0')

        with mock.patch.object(chain, 'script_unspent',
                               return_value=[_unspent_row()]) as unspent:
            summary = reconcile_service.reconcile_listings()

        self.assertEqual(summary.checked, 1)
        self.assertEqual(unspent.call_count, 1)
        mine.refresh_from_db()
        self.assertEqual(mine.status, ListingStatus.ACTIVE)

    def test_listing_ids_override_the_filters(self):
        other = _listing(env='prod')
        with mock.patch.object(chain, 'script_unspent', return_value=[_unspent_row()]):
            summary = reconcile_service.reconcile_listings(listing_ids=[other.pk])
        self.assertEqual(summary.checked, 1)
        other.refresh_from_db()
        self.assertEqual(other.status, ListingStatus.ACTIVE)

    def test_least_recently_checked_goes_first(self):
        fresh = _listing(status=ListingStatus.ACTIVE, reconciled_at=timezone.now())
        stale = _listing(status=ListingStatus.ACTIVE, nft_origin='d4' * 32 + '_0')

        with mock.patch.object(chain, 'script_unspent', return_value=[]),              mock.patch.object(chain, 'script_history', return_value=[]):
            summary = reconcile_service.reconcile_listings(limit=1)

        self.assertEqual([o.listing_id for o in summary.outcomes], [stale.pk])
        self.assertNotEqual(summary.outcomes[0].listing_id, fresh.pk)


@override_settings(MARKET_ENV='dev', TX_TEMPLATE_RETENTION_HOURS=72)
class ExpireTemplatesTests(TestCase):
    def _template(self, listing, expires_at, consumed=False):
        row = TxTemplate.objects.create(
            kind=TemplateKind.LIST, principal=PRINCIPAL, listing=listing,
            unsigned_tx_hex='00', inputs=[], outputs=[],
            tx_fingerprint='ab' * 32, expires_at=expires_at,
            consumed_at=timezone.now() if consumed else None)
        return row

    def _run(self):
        from io import StringIO

        from django.core.management import call_command
        out = StringIO()
        call_command('expire_templates', stdout=out)
        return out.getvalue()

    def test_old_unconsumed_templates_are_deleted_and_consumed_ones_kept(self):
        listing = _listing(status=ListingStatus.ACTIVE)
        old = self._template(listing, timezone.now() - timedelta(days=5))
        kept = self._template(listing, timezone.now() - timedelta(days=5), consumed=True)
        fresh = self._template(listing, timezone.now() + timedelta(minutes=5))

        output = self._run()
        self.assertIn('templates_deleted=1', output)
        self.assertFalse(TxTemplate.objects.filter(pk=old.pk).exists())
        self.assertTrue(TxTemplate.objects.filter(pk=kept.pk).exists())
        self.assertTrue(TxTemplate.objects.filter(pk=fresh.pk).exists())

    def test_abandoned_draft_listing_is_retired(self):
        listing = _listing(status=ListingStatus.DRAFT)
        Listing.objects.filter(pk=listing.pk).update(
            created_at=timezone.now() - timedelta(days=5))
        self._template(listing, timezone.now() - timedelta(days=5))

        output = self._run()
        listing.refresh_from_db()
        self.assertIn('drafts_retired=1', output)
        self.assertEqual(listing.status, ListingStatus.INVALID)
        self.assertEqual(
            ListingEvent.objects.get(listing=listing).detail['reason'],
            'template_expired')

    def test_a_draft_with_a_live_template_is_left_alone(self):
        listing = _listing(status=ListingStatus.DRAFT)
        Listing.objects.filter(pk=listing.pk).update(
            created_at=timezone.now() - timedelta(days=5))
        self._template(listing, timezone.now() + timedelta(minutes=5))

        self._run()
        listing.refresh_from_db()
        self.assertEqual(listing.status, ListingStatus.DRAFT)
