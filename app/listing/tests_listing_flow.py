"""
出品（documents/Specification.md §8.2・§5・§14）。

押さえるのは 4 つ:
  - 価格と受取先が **OrdLock に焼き込まれる**（§14-3。価格は改竄不能）
  - **二重出品を塞ぐ**（§5）
  - 発行した形と違う tx は**放送しない**（market も端末を信頼しない）
  - 監査証跡が NC と同じ 4 段で残る（§14-7）
"""

from unittest import mock

from django.test import TestCase, override_settings
from django.utils import timezone

from listing.models import EventKind, Listing, ListingEvent, ListingStatus, TxTemplate
from listing.ordlock import decode as decode_ordlock
from listing.ordlock import p2pkh
from listing.services import listing_service
from yp_marketplace.api.errors import MarketError

PRINCIPAL = 2
TOKEN = 'dummy-token'
NFT_ORIGIN = 'a1' * 32 + '_0'
PAYOUT_SCRIPT = p2pkh(bytes([0x22]) * 20).hex()
PRICE = 50_000


def _cancel_pubkey() -> str:
    from bsv import PrivateKey
    return PrivateKey().public_key().hex()


def _fake_template(locking_script_hex: str) -> dict:
    """BE が返すテンプレートの形（§8.2）。"""
    return {
        'template_id': 'be-template-1',
        'unsigned_transaction_hex': '00',
        'inputs': [{'txid': 'b2' * 32, 'output_index': 0, 'satoshis': 1}],
        'outputs': [{'locking_script': locking_script_hex, 'satoshis': 1}],
        'client_signs_input_indices': [0],
    }


def _signed_tx_hex(locking_script_hex: str, satoshis: int = 1) -> str:
    """出力に OrdLock を載せた「署名済み」tx（検証の対象になる形だけ作る）。"""
    from bsv import Script, Transaction, TransactionOutput
    tx = Transaction()
    tx.add_output(TransactionOutput(
        locking_script=Script(bytes.fromhex(locking_script_hex)), satoshis=satoshis))
    return tx.hex()


@override_settings(MARKET_ENV='dev', MARKET_DEV_PRINCIPALS=[str(PRINCIPAL)],
                   BE_API_BASE_URL='http://be.invalid:8002')
class ListingDraftTests(TestCase):
    def setUp(self):
        self.cancel_pubkey = _cancel_pubkey()

    def _draft(self, **overrides):
        kwargs = dict(principal=PRINCIPAL, token=TOKEN, nft_origin=NFT_ORIGIN,
                      price_satoshis=PRICE, payout_script=PAYOUT_SCRIPT,
                      cancel_pubkey=self.cancel_pubkey)
        kwargs.update(overrides)
        with mock.patch('listing.be_client.BackendClient.nft_script_template') as be:
            be.side_effect = lambda **kw: _fake_template(kw['recipient_locking_script'])
            return listing_service.create_listing_draft(**kwargs), be

    def test_price_and_payout_are_baked_into_the_lock(self):
        data, _ = self._draft()
        decoded = decode_ordlock(bytes.fromhex(data['ordlock_script_hex']))
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded.price_satoshis, PRICE)
        self.assertEqual(decoded.payout_script.hex(), PAYOUT_SCRIPT)

    def test_seller_pkh_comes_from_the_cancel_key(self):
        from bsv.hash import hash160
        data, _ = self._draft()
        decoded = decode_ordlock(bytes.fromhex(data['ordlock_script_hex']))
        self.assertEqual(decoded.seller_pkh, hash160(bytes.fromhex(self.cancel_pubkey)))

    def test_be_is_asked_for_that_exact_script(self):
        data, be = self._draft()
        self.assertEqual(be.call_args.kwargs['recipient_locking_script'],
                         data['ordlock_script_hex'])
        self.assertEqual(be.call_args.kwargs['nft_origin'], NFT_ORIGIN)

    def test_template_and_audit_trail_are_recorded(self):
        data, _ = self._draft()
        row = TxTemplate.objects.get(template_id=data['template_id'])
        self.assertEqual(row.principal, PRINCIPAL)
        self.assertGreater(row.expires_at, timezone.now())
        self.assertEqual(row.tx_fingerprint, data['tx_fingerprint'])
        self.assertTrue(ListingEvent.objects.filter(
            kind=EventKind.TEMPLATE_ISSUED, listing_id=data['listing_id']).exists())

    def test_draft_starts_as_draft_not_active(self):
        data, _ = self._draft()
        self.assertEqual(Listing.objects.get(id=data['listing_id']).status,
                         ListingStatus.DRAFT)

    def test_double_listing_is_refused(self):
        data, _ = self._draft()
        Listing.objects.filter(id=data['listing_id']).update(status=ListingStatus.ACTIVE)
        with self.assertRaises(MarketError) as exc:
            self._draft()
        self.assertEqual(exc.exception.error_code, 'ALREADY_LISTED')

    def test_closed_listing_does_not_block_relisting(self):
        data, _ = self._draft()
        Listing.objects.filter(id=data['listing_id']).update(status=ListingStatus.CANCELLED)
        second, _ = self._draft()
        self.assertNotEqual(second['listing_id'], data['listing_id'])

    def test_rejects_bad_input(self):
        for overrides in ({'price_satoshis': 0}, {'payout_script': 'zz'},
                          {'cancel_pubkey': '00'}):
            with self.subTest(overrides=overrides):
                with self.assertRaises(MarketError):
                    self._draft(**overrides)

    @override_settings(MARKET_DEV_PRINCIPALS=[])
    def test_dev_requires_the_allowlist(self):
        """§13.3: dev の出品は本物のチェーンに出るので allowlist に限る。"""
        with self.assertRaises(MarketError) as exc:
            self._draft()
        self.assertEqual(exc.exception.error_code, 'NOT_ALLOWED_IN_DEV')


@override_settings(MARKET_ENV='dev', MARKET_DEV_PRINCIPALS=[str(PRINCIPAL)],
                   BE_API_BASE_URL='http://be.invalid:8002')
class ListingSubmitTests(TestCase):
    def setUp(self):
        self.cancel_pubkey = _cancel_pubkey()
        with mock.patch('listing.be_client.BackendClient.nft_script_template') as be:
            be.side_effect = lambda **kw: _fake_template(kw['recipient_locking_script'])
            self.draft = listing_service.create_listing_draft(
                principal=PRINCIPAL, token=TOKEN, nft_origin=NFT_ORIGIN,
                price_satoshis=PRICE, payout_script=PAYOUT_SCRIPT,
                cancel_pubkey=self.cancel_pubkey)
        self.script_hex = self.draft['ordlock_script_hex']

    def _submit(self, signed_hex, broadcast_result=None, broadcast_error=None):
        target = 'listing.be_client.BackendClient.broadcast'
        with mock.patch(target) as bc:
            if broadcast_error:
                bc.side_effect = broadcast_error
            else:
                bc.return_value = broadcast_result or {'txid': 'c3' * 32}
            return listing_service.submit_listing(
                principal=PRINCIPAL, token=TOKEN,
                template_id=self.draft['template_id'],
                signed_transaction_hex=signed_hex), bc

    def test_happy_path_moves_to_pending_and_records_the_outpoint(self):
        result, bc = self._submit(_signed_tx_hex(self.script_hex))
        self.assertEqual(result['status'], ListingStatus.PENDING)
        self.assertTrue(result['listed_outpoint'].endswith(':0'))
        self.assertTrue(bc.called)

        listing = Listing.objects.get(id=self.draft['listing_id'])
        self.assertEqual(listing.listing_txid, result['txid'])

    def test_audit_trail_has_the_four_stages(self):
        self._submit(_signed_tx_hex(self.script_hex))
        kinds = set(ListingEvent.objects
                    .filter(listing_id=self.draft['listing_id'])
                    .values_list('kind', flat=True))
        self.assertEqual(kinds, {EventKind.TEMPLATE_ISSUED, EventKind.SIGNED_RECEIVED,
                                 EventKind.VERIFY_OK, EventKind.BROADCAST_OK})

    def test_refuses_a_tx_that_moves_the_ordinal_elsewhere(self):
        """**ここが要**。別スクリプト宛の tx を放送させられない。"""
        other = p2pkh(bytes([0x99]) * 20).hex()
        with self.assertRaises(MarketError):
            self._submit(_signed_tx_hex(other))
        self.assertTrue(ListingEvent.objects.filter(
            kind=EventKind.VERIFY_FAIL, listing_id=self.draft['listing_id']).exists())

    def test_refuses_when_the_ordlock_output_is_not_one_satoshi(self):
        with self.assertRaises(MarketError):
            self._submit(_signed_tx_hex(self.script_hex, satoshis=2))

    def test_template_cannot_be_used_twice(self):
        self._submit(_signed_tx_hex(self.script_hex))
        with self.assertRaises(MarketError) as exc:
            self._submit(_signed_tx_hex(self.script_hex))
        self.assertEqual(exc.exception.error_code, 'TEMPLATE_ALREADY_CONSUMED')

    def test_expired_template_is_refused(self):
        TxTemplate.objects.filter(template_id=self.draft['template_id']).update(
            expires_at=timezone.now() - timezone.timedelta(seconds=1)
            if hasattr(timezone, 'timedelta') else timezone.now())
        with self.assertRaises(MarketError) as exc:
            self._submit(_signed_tx_hex(self.script_hex))
        self.assertEqual(exc.exception.error_code, 'TEMPLATE_EXPIRED')

    def test_another_principal_cannot_submit(self):
        with self.assertRaises(MarketError) as exc:
            listing_service.submit_listing(
                principal=999, token=TOKEN, template_id=self.draft['template_id'],
                signed_transaction_hex=_signed_tx_hex(self.script_hex))
        self.assertEqual(exc.exception.error_code, 'NOT_FOUND')

    def test_broadcast_failure_is_recorded_and_listing_stays_draft(self):
        from yp_marketplace.api.errors import UpstreamError
        with self.assertRaises(MarketError):
            self._submit(_signed_tx_hex(self.script_hex),
                         broadcast_error=UpstreamError('ARC refused'))
        listing = Listing.objects.get(id=self.draft['listing_id'])
        self.assertEqual(listing.status, ListingStatus.DRAFT)
        self.assertTrue(ListingEvent.objects.filter(
            kind=EventKind.BROADCAST_FAIL, listing_id=listing.id).exists())


@override_settings(MARKET_ENV='dev', MARKET_DEV_PRINCIPALS=[str(PRINCIPAL)],
                   BE_API_BASE_URL='http://be.invalid:8002', MARKET_FEE_BPS=250)
class AnnouncedFeeTests(TestCase):
    """
    手数料は **script で強制されない**（§14-4）。だから draft で「いくら取るか」を
    告知し、端末が計算し直す（キットの `assertAnnouncedFee`）。告知が無いと
    端末は突き合わせる相手を失う。
    """

    def _draft(self, price=PRICE):
        with mock.patch('listing.be_client.BackendClient.nft_script_template') as be:
            be.side_effect = lambda **kw: _fake_template(kw['recipient_locking_script'])
            return listing_service.create_listing_draft(
                principal=PRINCIPAL, token=TOKEN, nft_origin=NFT_ORIGIN,
                price_satoshis=price, payout_script=PAYOUT_SCRIPT,
                cancel_pubkey=_cancel_pubkey())

    def test_the_draft_announces_the_fee(self):
        data = self._draft()
        self.assertEqual(data['fee_bps'], 250)
        self.assertEqual(data['fee_satoshis'], PRICE * 250 // 10_000)
        self.assertEqual(data['price_satoshis'], PRICE)

    def test_the_announced_fee_rounds_down_like_the_kit(self):
        """端末は `Math.floor(price * bps / 10000)`。Python 側も切り捨てで揃える。"""
        data = self._draft(price=1_111)
        self.assertEqual(data['fee_satoshis'], 1_111 * 250 // 10_000)


@override_settings(MARKET_ENV='dev', MARKET_DEV_PRINCIPALS=[str(PRINCIPAL)],
                   BE_API_BASE_URL='http://be.invalid:8002')
class BackendTemplateIdTests(TestCase):
    """
    放送で BE へ返すのは **BE が発行した ID**（S009 §8.2）。

    市場の `template_id` は市場の中だけの識別子で、BE は知らない。取り違えると
    BE が "Template not found or expired" を返し、**出品が一切放送できない**
    （2026-11-20 に本番で踏んだ。4 段階の証跡は VERIFY_OK まで進んで落ちる）。
    """

    def setUp(self):
        self.cancel_pubkey = _cancel_pubkey()

    def _draft(self):
        with mock.patch('listing.be_client.BackendClient.nft_script_template') as be:
            be.side_effect = lambda **kw: _fake_template(kw['recipient_locking_script'])
            return listing_service.create_listing_draft(
                principal=PRINCIPAL, token=TOKEN, nft_origin=NFT_ORIGIN,
                price_satoshis=PRICE, payout_script=PAYOUT_SCRIPT,
                cancel_pubkey=self.cancel_pubkey)

    def test_the_backend_id_is_recorded_at_draft(self):
        data = self._draft()
        row = TxTemplate.objects.get(template_id=data['template_id'])
        self.assertEqual(row.backend_template_id, 'be-template-1')
        self.assertNotEqual(row.backend_template_id, str(row.template_id))

    def test_submit_sends_the_backend_id_not_ours(self):
        data = self._draft()
        row = TxTemplate.objects.get(template_id=data['template_id'])
        signed = _signed_tx_hex(data['ordlock_script_hex'])

        with mock.patch('listing.be_client.BackendClient.broadcast') as bc:
            bc.return_value = {'txid': 'ab' * 32}
            listing_service.submit_listing(
                principal=PRINCIPAL, token=TOKEN,
                template_id=data['template_id'], signed_transaction_hex=signed)

        sent = bc.call_args[0][0]
        self.assertEqual(sent, 'be-template-1', 'BE へ市場の ID を渡している')
        self.assertNotEqual(sent, str(row.template_id))

    def test_a_draft_without_the_backend_id_is_refused(self):
        """古い行（BE の ID を控える前のもの）は作り直させる。"""
        data = self._draft()
        TxTemplate.objects.filter(template_id=data['template_id']).update(
            backend_template_id='')
        signed = _signed_tx_hex(data['ordlock_script_hex'])

        with mock.patch('listing.be_client.BackendClient.broadcast') as bc, \
             self.assertRaises(MarketError):
            listing_service.submit_listing(
                principal=PRINCIPAL, token=TOKEN,
                template_id=data['template_id'], signed_transaction_hex=signed)
        self.assertFalse(bc.called, '控えが無いのに BE を叩いている')
