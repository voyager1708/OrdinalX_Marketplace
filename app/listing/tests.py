"""
板の競合制御（documents/Specification.md §5）。

二重出品は DB の部分一意インデックスで塞ぐ。ordinal UTXO は 1 つしかないので
最終的には ARC が二重支払いで落とすが、板が 2 本見えている時間を作らない。
"""

from django.db import IntegrityError, transaction
from django.test import TestCase

from listing.models import Listing, ListingStatus


def _make_listing(**overrides):
    fields = {
        'nft_origin': 'a' * 64 + '_0',
        'seller_principal': 2,
        'payout_script': '76a914' + '00' * 20 + '88ac',
        'price_satoshis': 50_000,
        'status': ListingStatus.ACTIVE,
    }
    fields.update(overrides)
    return Listing.objects.create(**fields)


class DoubleListingTests(TestCase):
    def test_second_open_listing_for_same_origin_is_rejected(self):
        _make_listing()
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                _make_listing(status=ListingStatus.PENDING)

    def test_relisting_after_cancel_is_allowed(self):
        first = _make_listing()
        first.status = ListingStatus.CANCELLED
        first.save(update_fields=['status'])
        # 取り下げた後は同じ ordinal を出し直せる
        second = _make_listing()
        self.assertEqual(Listing.objects.filter(nft_origin=first.nft_origin).count(), 2)
        self.assertEqual(second.status, ListingStatus.ACTIVE)

    def test_closed_listings_do_not_block_each_other(self):
        # sold / cancelled / invalid は何本あっても制約に当たらない（履歴として残る）
        for status in (ListingStatus.SOLD, ListingStatus.CANCELLED, ListingStatus.INVALID):
            _make_listing(status=status)
        self.assertEqual(Listing.objects.count(), 3)

    def test_fee_bps_defaults_from_settings(self):
        # §10: 一次／二次で分けられるよう Listing 側に固定して持つ
        with self.settings(MARKET_FEE_BPS=250):
            self.assertEqual(_make_listing().fee_bps, 250)

    def test_market_env_is_stamped(self):
        # §13.3: 板の問い合わせを常に env で絞れるよう、行に env を持たせる
        with self.settings(MARKET_ENV='dev'):
            self.assertEqual(_make_listing().market_env, 'dev')
