"""
購入（documents/Specification.md §8.3、S018 で **OrdLock v1**）。

押さえるのは 5 つ:
  - 出力の並びが v1 の形（**0 = 買い手の ordinal / 1 = 売り手への払い**）
  - 出品の入力が**先頭**にあること（first-sat ordering。崩すと ordinal が届かない）
  - 署名させるのは**買い手の入力だけ**
  - 受取先が **BE の知っているアドレス**であること（知らないと成約後に
    NFT が買い手のウォレットから消える）
  - 予約（TTL 3 分）が二重購入を塞ぐこと
"""

from unittest import mock

from django.test import TestCase, override_settings

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
from listing.ordlock import lock as build_ordlock
from listing.ordlock import p2pkh
from listing.services import purchase_service
from yp_marketplace.api.errors import MarketError

BUYER = 11
SELLER = 2
PRICE = 60_000
SELLER_PKH = bytes([0x11]) * 20
BUYER_PKH = bytes([0x33]) * 20
LISTED_TXID = 'c3' * 32


def _listing(status=ListingStatus.ACTIVE):
    payout = p2pkh(SELLER_PKH)
    script = build_ordlock(seller_pkh=SELLER_PKH, payout_script=payout,
                           price_satoshis=PRICE)
    return Listing.objects.create(
        nft_origin='a1' * 32 + '_0', seller_principal=SELLER,
        payout_script=payout.hex(), cancel_pubkey='02' + '11' * 32,
        price_satoshis=PRICE, ordlock_script_hex=script.hex(),
        listing_txid=LISTED_TXID, listed_outpoint=f'{LISTED_TXID}:0',
        status=status, market_env='dev')


def _utxos(satoshis=200_000):
    return {'utxos': [{
        'txid': 'd4' * 32, 'output_index': 0, 'satoshis': satoshis,
        'address': '1BuyerAddress', 'locking_script': p2pkh(BUYER_PKH).hex(),
        'derivation_path': {'path': 'm/1/0', 'change': 1, 'change_index': 0},
    }]}


def _draft(listing, receive=None, utxos=None, addresses=None):
    from bsv.utils import address_to_public_key_hash  # noqa: F401 (import 可能性の確認)

    receive_script = receive or p2pkh(BUYER_PKH).hex()
    patches = [
        mock.patch('listing.be_client.BackendClient.list_utxos',
                   return_value=utxos or _utxos()),
        mock.patch('listing.services.purchase_service'
                   '._assert_be_knows_the_receive_address',
                   side_effect=(addresses if addresses else lambda *a, **k: None)),
    ]
    for patch in patches:
        patch.start()
    try:
        return purchase_service.create_purchase_draft(
            principal=BUYER, token='t', listing_id=listing.id,
            receive_script=receive_script)
    finally:
        for patch in patches:
            patch.stop()


@override_settings(MARKET_ENV='dev', MARKET_FEE_BPS=250,
                   MARKET_FEE_WALLET_ADDRESS='13wWZDg914diEzP7Ca4YadUKrJBgJH57Vu')
class PurchaseDraftTests(TestCase):
    def test_the_output_order_follows_v1(self):
        """0 = 買い手の ordinal / 1 = 売り手への払い（位置が固定）。"""
        listing = _listing()
        draft = _draft(listing)
        outputs = draft['template']['outputs']

        self.assertEqual(outputs[0]['satoshis'], 1)
        self.assertEqual(outputs[0]['locking_script'], p2pkh(BUYER_PKH).hex())
        self.assertEqual(outputs[1]['satoshis'], PRICE)
        self.assertEqual(outputs[1]['locking_script'], p2pkh(SELLER_PKH).hex())
        self.assertEqual(draft['receive_vout'], 0)
        self.assertEqual(draft['payout_vout'], 1)

    def test_the_payout_matches_what_is_baked_into_the_lock(self):
        listing = _listing()
        draft = _draft(listing)
        decoded = decode_ordlock(bytes.fromhex(listing.ordlock_script_hex))
        payout = draft['template']['outputs'][1]
        self.assertEqual(payout['locking_script'], decoded.payout_script.hex())
        self.assertEqual(payout['satoshis'], decoded.price_satoshis)

    def test_the_listing_input_comes_first_and_is_not_signed_by_the_buyer(self):
        """first-sat ordering。ここを崩すと ordinal が買い手に届かない。"""
        listing = _listing()
        draft = _draft(listing)
        inputs = draft['template']['inputs']

        self.assertEqual(inputs[0]['txid'], LISTED_TXID)
        self.assertEqual(inputs[0]['satoshis'], 1)
        self.assertEqual(draft['listing_input_index'], 0)
        self.assertNotIn(0, draft['template']['client_signs_input_indices'])
        self.assertEqual(draft['template']['client_signs_input_indices'],
                         list(range(1, len(inputs))))

    def test_the_market_fee_is_announced_and_charged(self):
        listing = _listing()
        draft = _draft(listing)
        self.assertEqual(draft['fee_bps'], 250)
        self.assertEqual(draft['fee_satoshis'], PRICE * 250 // 10_000)
        fee_output = draft['template']['outputs'][2]
        self.assertEqual(fee_output['satoshis'], draft['fee_satoshis'])

    def test_the_buyer_pays_the_miner_fee(self):
        listing = _listing()
        draft = _draft(listing)
        total_in = sum(i['satoshis'] for i in draft['template']['inputs'])
        total_out = sum(o['satoshis'] for o in draft['template']['outputs'])
        self.assertEqual(total_in - total_out, draft['miner_fee_satoshis'])
        self.assertGreater(draft['miner_fee_satoshis'], 0)

    def test_a_reservation_blocks_a_second_buyer(self):
        """§5: Purchase(pending) は TTL 3 分の予約。"""
        listing = _listing()
        _draft(listing)
        with self.assertRaises(MarketError) as exc:
            _draft(listing)
        self.assertEqual(exc.exception.error_code, 'PURCHASE_IN_PROGRESS')

    def test_a_closed_listing_cannot_be_bought(self):
        listing = _listing(status=ListingStatus.SOLD)
        with self.assertRaises(MarketError) as exc:
            _draft(listing)
        self.assertEqual(exc.exception.error_code, 'LISTING_NOT_ACTIVE')

    def test_not_enough_balance_is_refused(self):
        listing = _listing()
        with self.assertRaises(MarketError):
            _draft(listing, utxos=_utxos(satoshis=1_000))

    def test_the_audit_trail_starts_at_the_draft(self):
        listing = _listing()
        draft = _draft(listing)
        event = ListingEvent.objects.get(listing=listing,
                                         kind=EventKind.TEMPLATE_ISSUED)
        self.assertEqual(event.detail['kind'], 'buy')
        self.assertTrue(TxTemplate.objects.filter(
            template_id=draft['template_id'], kind=TemplateKind.BUY).exists())
        self.assertTrue(Purchase.objects.filter(
            listing=listing, buyer_principal=BUYER,
            status=PurchaseStatus.PENDING).exists())


@override_settings(MARKET_ENV='dev')
class ReceiveAddressTests(TestCase):
    """
    §8.3 の警告: 受取先が **BE の知らないアドレス**だと、成約後に BE が
    NFT を再紐付けできず**買い手のウォレットから消える**。だから先に止める。
    """

    def _check(self, addresses, receive):
        client = mock.Mock()
        client.nft_legacy_addresses.return_value = {'Address': addresses}
        purchase_service._assert_be_knows_the_receive_address(client, receive)

    def test_a_known_address_passes(self):
        from bsv.utils import address_to_public_key_hash
        address = '13wWZDg914diEzP7Ca4YadUKrJBgJH57Vu'
        self._check([address], p2pkh(address_to_public_key_hash(address)))

    def test_an_unknown_address_is_refused(self):
        with self.assertRaises(MarketError) as exc:
            self._check(['13wWZDg914diEzP7Ca4YadUKrJBgJH57Vu'], p2pkh(BUYER_PKH))
        self.assertIn('would disappear', str(exc.exception))

    def test_a_non_p2pkh_script_is_refused(self):
        with self.assertRaises(MarketError):
            self._check(['13wWZDg914diEzP7Ca4YadUKrJBgJH57Vu'], b'\x51')
