"""
公開 EP（documents/Specification.md §6・§9.1・§13.3）。

押さえるのは 3 つ:
  - エンベロープが BE の NC と同形（FE の unwrap() がそのまま通る）
  - **MARKET_ENV で絞られている**（dev の検証で作った出品が本番の板に出ない）
  - **運営 blocklist が効いている**（一覧・詳細・サムネのすべてで止まる）
"""

from unittest import mock

from django.test import TestCase, override_settings
from django.urls import reverse

from listing.models import (
    BlockedContent,
    BlockedKind,
    Listing,
    ListingStatus,
    Purchase,
    PurchaseStatus,
)


def make_listing(**overrides):
    fields = {
        'nft_origin': 'a' * 64 + '_0',
        'seller_principal': 2,
        'payout_script': '76a914' + '00' * 20 + '88ac',
        'price_satoshis': 50_000,
        'status': ListingStatus.ACTIVE,
        'market_env': 'dev',
    }
    fields.update(overrides)
    return Listing.objects.create(**fields)


class ListingListTests(TestCase):
    def test_envelope_is_the_nc_shape(self):
        make_listing()
        body = self.client.get(reverse('market:listings')).json()
        self.assertEqual(body['status'], 'success')
        self.assertIn('listings', body['data'])

    def test_public_without_a_token(self):
        # 集客のためログイン前でも見せる（§6）
        self.assertEqual(self.client.get(reverse('market:listings')).status_code, 200)

    def test_only_active_by_default(self):
        make_listing(nft_origin='x' * 64 + '_0')
        make_listing(nft_origin='y' * 64 + '_0', status=ListingStatus.SOLD)
        rows = self.client.get(reverse('market:listings')).json()['data']['listings']
        self.assertEqual([row['status'] for row in rows], ['active'])

    def test_other_env_is_invisible(self):
        """§13.3: BE の dev と暫定本番が同じ DB を見ているので env で絞る。"""
        make_listing(nft_origin='p' * 64 + '_0', market_env='prod')
        rows = self.client.get(reverse('market:listings')).json()['data']['listings']
        self.assertEqual(rows, [])

    def test_blocked_origin_disappears(self):
        listing = make_listing()
        BlockedContent.objects.create(kind=BlockedKind.NFT_ORIGIN, value=listing.nft_origin,
                                      reason='申し立て（§9.1）')
        rows = self.client.get(reverse('market:listings')).json()['data']['listings']
        self.assertEqual(rows, [])

    def test_sort_by_price(self):
        make_listing(nft_origin='c' * 64 + '_0', price_satoshis=300)
        make_listing(nft_origin='b' * 64 + '_0', price_satoshis=100)
        make_listing(nft_origin='d' * 64 + '_0', price_satoshis=200)
        rows = self.client.get(reverse('market:listings'), {'sort': 'price'}).json()['data']['listings']
        self.assertEqual([row['price_satoshis'] for row in rows], [100, 200, 300])

    def test_cursor_walks_the_whole_board_without_repeats(self):
        for index in range(5):
            make_listing(nft_origin=f'{index}' * 64 + '_0', price_satoshis=100 * (index + 1))

        seen, cursor = [], None
        for _ in range(5):
            params = {'sort': 'price', 'limit': 2}
            if cursor:
                params['cursor'] = cursor
            data = self.client.get(reverse('market:listings'), params).json()['data']
            seen += [row['id'] for row in data['listings']]
            cursor = data['next_cursor']
            if not cursor:
                break
        self.assertEqual(len(seen), 5, f'取りこぼしか重複がある: {seen}')
        self.assertEqual(len(set(seen)), 5)

    def test_bad_input_is_an_error_envelope(self):
        for params, code in (
            ({'status': 'nonsense'}, 'INVALID_REQUEST'),
            ({'limit': 'abc'}, 'INVALID_REQUEST'),
            ({'cursor': '!!!'}, 'INVALID_REQUEST'),
        ):
            with self.subTest(params=params):
                response = self.client.get(reverse('market:listings'), params)
                self.assertEqual(response.status_code, 400)
                self.assertEqual(response.json()['error']['code'], code)


class ListingDetailTests(TestCase):
    def test_detail_returns_the_row(self):
        listing = make_listing()
        body = self.client.get(reverse('market:listing-detail', args=[listing.id])).json()
        self.assertEqual(body['data']['listing']['nft_origin'], listing.nft_origin)

    def test_blocked_is_not_found_rather_than_forbidden(self):
        # 存在そのものを漏らさない（§9.1）
        listing = make_listing()
        BlockedContent.objects.create(kind=BlockedKind.NFT_ORIGIN, value=listing.nft_origin)
        response = self.client.get(reverse('market:listing-detail', args=[listing.id]))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['error']['code'], 'NOT_FOUND')

    def test_other_env_is_not_found(self):
        listing = make_listing(market_env='prod')
        self.assertEqual(
            self.client.get(reverse('market:listing-detail', args=[listing.id])).status_code, 404)


class StatsTests(TestCase):
    def test_counts_only_visible_rows(self):
        make_listing(nft_origin='e' * 64 + '_0', price_satoshis=100)
        make_listing(nft_origin='f' * 64 + '_0', price_satoshis=400)
        blocked = make_listing(nft_origin='g' * 64 + '_0', price_satoshis=10)
        BlockedContent.objects.create(kind=BlockedKind.NFT_ORIGIN, value=blocked.nft_origin)

        sold = make_listing(nft_origin='h' * 64 + '_0', status=ListingStatus.SOLD)
        Purchase.objects.create(listing=sold, buyer_principal=3, paid_satoshis=777,
                                status=PurchaseStatus.CONFIRMED, market_env='dev', txid='t' * 64)

        data = self.client.get(reverse('market:stats')).json()['data']
        self.assertEqual(data['active_listings'], 2)
        self.assertEqual(data['floor_price_satoshis'], 100, 'blocklist の行が floor に出ている')
        self.assertEqual(data['sold_count'], 1)
        self.assertEqual(data['total_volume_satoshis'], 777)


class ThumbTests(TestCase):
    def test_missing_thumb_is_an_error_envelope(self):
        response = self.client.get(reverse('market:nft-thumb', args=['z' * 64 + '_0']))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['error']['code'], 'NOT_FOUND')

    def test_thumb_is_served_as_bytes_and_marks_lru(self):
        from chain.models import NftCache
        row = NftCache.objects.create(nft_origin='k' * 64 + '_0', thumb=b'\x00\x01',
                                      thumb_bytes=2, content_type='image/webp')
        response = self.client.get(reverse('market:nft-thumb', args=[row.nft_origin]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'image/webp')
        self.assertEqual(response.content, b'\x00\x01')
        row.refresh_from_db()
        self.assertIsNotNone(row.last_used_at, 'LRU の基準が更新されていない')

    def test_blocked_thumb_is_not_served(self):
        from chain.models import NftCache
        row = NftCache.objects.create(nft_origin='m' * 64 + '_0', thumb=b'\x00', thumb_bytes=1)
        BlockedContent.objects.create(kind=BlockedKind.NFT_ORIGIN, value=row.nft_origin)
        self.assertEqual(
            self.client.get(reverse('market:nft-thumb', args=[row.nft_origin])).status_code, 404)


@override_settings(MARKET_ENV='dev')
class MyNftsAPITests(TestCase):
    """
    出品できる手持ちの NFT（§6）。市場は所有を持たないので BE の一覧を中継し、
    板の都合（出品中・運営 blocklist）だけを足す。
    """

    URL = '/market/api/v1/me/nfts'

    def _rows(self):
        return [
            {'nft_origin': 'aa' * 32 + '_0', 'name': '出せるもの',
             'content_type': 'image/png', 'current_nft_location': 'cc' * 32 + '_0'},
            {'nft_origin': 'bb' * 32 + '_0', 'name': '出品中のもの',
             'content_type': 'image/png', 'current_nft_location': 'dd' * 32 + '_0'},
            {'nft_origin': 'ee' * 32 + '_0', 'name': '止められたもの',
             'content_type': 'image/png', 'current_nft_location': 'ff' * 32 + '_0'},
        ]

    def test_it_requires_authentication(self):
        response = self.client.get(self.URL)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()['error']['code'], 'UNAUTHENTICATED')

    def test_it_marks_what_is_already_listed_and_hides_blocked(self):
        from listing.models import BlockedContent, BlockedKind, Listing, ListingStatus

        rows = self._rows()
        Listing.objects.create(nft_origin=rows[1]['nft_origin'], seller_principal=2,
                               payout_script='00', price_satoshis=1,
                               status=ListingStatus.ACTIVE, market_env='dev')
        BlockedContent.objects.create(kind=BlockedKind.NFT_ORIGIN,
                                      value=rows[2]['nft_origin'], reason='test')

        with mock.patch('listing.be_client.BackendClient.list_nfts', return_value=rows):
            data = self._get_authenticated()

        origins = {n['nft_origin']: n for n in data['nfts']}
        self.assertEqual(len(origins), 2, '運営が止めたものは候補に出さない')
        self.assertFalse(origins[rows[0]['nft_origin']]['listed'])
        self.assertTrue(origins[rows[1]['nft_origin']]['listed'])

    def _get_authenticated(self):
        """認証は差し替え点（`set_verifier`）から入れる。BE は叩かない。"""
        from yp_marketplace.auth import Principal, TokenVerifier, set_verifier

        class _Stub(TokenVerifier):
            def verify(self, token):
                return Principal(be_user_id=2, username='seller')

        set_verifier(_Stub())
        try:
            response = self.client.get(self.URL, HTTP_AUTHORIZATION='Bearer t')
        finally:
            set_verifier(None)
        self.assertEqual(response.status_code, 200, response.content[:300])
        return response.json()['data']
