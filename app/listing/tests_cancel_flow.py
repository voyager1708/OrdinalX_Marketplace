"""
出品の取り下げ（documents/Specification.md §8.3）。

キャンセルは market が自分で組む（BE は OrdLock の UTXO を知らない）。
押さえるのは 4 つ:
  - 他人の出品は取り下げられない
  - **売り手の鍵でしか解錠しない**（ロックに焼き込まれた PKH と突き合わせる）
  - 解錠スクリプトが参照実装の形（`<marker> <sig> <pubkey> OP_1`）
  - 手数料は**市場の fee wallet** が持ち、足りなければ 503 で止まる
"""

from unittest import mock

from django.test import TestCase, override_settings
from django.utils import timezone

from listing.models import (
    EventKind,
    Listing,
    ListingEvent,
    ListingStatus,
    TemplateKind,
    TxTemplate,
)
from listing.ordlock import lock as build_ordlock
from listing.ordlock import p2pkh
from listing.ordlock.unlock import CANCEL_SELECTOR, is_cancel_unlocking_script
from listing.services import cancel_service
from yp_marketplace.api.errors import MarketError

PRINCIPAL = 2
LISTED_TXID = 'c3' * 32
PRICE = 50_000


def _seller_key():
    from bsv import PrivateKey
    return PrivateKey()


def _listing(seller_key, status=ListingStatus.ACTIVE, principal=PRINCIPAL):
    from bsv.hash import hash160
    pubkey = seller_key.public_key().serialize()
    script = build_ordlock(seller_pkh=hash160(pubkey),
                           payout_script=p2pkh(bytes([0x22]) * 20),
                           price_satoshis=PRICE)
    return Listing.objects.create(
        nft_origin='a1' * 32 + '_0',
        seller_principal=principal,
        payout_script=p2pkh(bytes([0x22]) * 20).hex(),
        cancel_pubkey=pubkey.hex(),
        price_satoshis=PRICE,
        ordlock_script_hex=script.hex(),
        listing_txid=LISTED_TXID,
        listed_outpoint=f'{LISTED_TXID}:0',
        status=status,
        market_env='dev',
    )


@override_settings(MARKET_ENV='dev')
class CancelDraftTests(TestCase):
    def setUp(self):
        self.key = _seller_key()
        self.listing = _listing(self.key)
        self.receive = p2pkh(bytes([0x33]) * 20).hex()

    def test_draft_returns_the_signing_material(self):
        data = cancel_service.create_cancel_draft(
            principal=PRINCIPAL, listing_id=self.listing.id,
            receive_script=self.receive)
        self.assertEqual(data['ordlock_script_hex'], self.listing.ordlock_script_hex)
        self.assertEqual(data['input']['txid'], LISTED_TXID)
        self.assertEqual(data['output']['locking_script'], self.receive)
        self.assertIn('ANYONECANPAY', data['sighash'])
        self.assertTrue(TxTemplate.objects.filter(
            template_id=data['template_id'], kind=TemplateKind.CANCEL).exists())

    def test_someone_elses_listing_is_not_found(self):
        with self.assertRaises(MarketError) as exc:
            cancel_service.create_cancel_draft(
                principal=999, listing_id=self.listing.id, receive_script=self.receive)
        self.assertEqual(exc.exception.error_code, 'NOT_FOUND')

    def test_closed_listing_cannot_be_cancelled(self):
        Listing.objects.filter(id=self.listing.id).update(status=ListingStatus.SOLD)
        with self.assertRaises(MarketError) as exc:
            cancel_service.create_cancel_draft(
                principal=PRINCIPAL, listing_id=self.listing.id,
                receive_script=self.receive)
        self.assertEqual(exc.exception.error_code, 'LISTING_NOT_ACTIVE')

    def test_requires_hex_receive_script(self):
        with self.assertRaises(MarketError):
            cancel_service.create_cancel_draft(
                principal=PRINCIPAL, listing_id=self.listing.id, receive_script='zz')


@override_settings(MARKET_ENV='dev')
class CancelSubmitTests(TestCase):
    def setUp(self):
        self.key = _seller_key()
        self.listing = _listing(self.key)
        self.receive = p2pkh(bytes([0x33]) * 20).hex()
        self.draft = cancel_service.create_cancel_draft(
            principal=PRINCIPAL, listing_id=self.listing.id,
            receive_script=self.receive)

    def _submit(self, key=None, assemble=None, broadcast_txid='d4' * 32):
        signer = key or self.key
        signature = b'\x30' + b'\x44' + b'\x02' * 68      # DER の形だけ持つダミー
        patches = mock.patch.multiple(
            'listing.services.cancel_service',
            _assemble_cancel_tx=assemble or mock.Mock(return_value='00'),
        )
        with patches, mock.patch('listing.services.chain.broadcast',
                                 return_value=broadcast_txid) as bc:
            result = cancel_service.submit_cancel(
                principal=PRINCIPAL, template_id=self.draft['template_id'],
                signature_hex=signature.hex(),
                public_key_hex=signer.public_key().serialize().hex())
            return result, bc

    def test_happy_path_closes_the_listing(self):
        result, bc = self._submit()
        self.assertEqual(result['status'], ListingStatus.CANCELLED)
        self.assertTrue(bc.called)
        listing = Listing.objects.get(id=self.listing.id)
        self.assertEqual(listing.status, ListingStatus.CANCELLED)
        self.assertIsNotNone(listing.closed_at)

    def test_audit_trail_has_the_four_stages(self):
        self._submit()
        kinds = set(ListingEvent.objects.filter(listing=self.listing)
                    .values_list('kind', flat=True))
        self.assertEqual(kinds, {EventKind.TEMPLATE_ISSUED, EventKind.SIGNED_RECEIVED,
                                 EventKind.VERIFY_OK, EventKind.BROADCAST_OK})

    def test_a_different_key_cannot_cancel(self):
        """ロックに焼き込まれた売り手の鍵でなければ解錠を試みない。"""
        with self.assertRaises(MarketError) as exc:
            self._submit(key=_seller_key())
        self.assertEqual(exc.exception.error_code, 'NOT_OWNER')
        self.assertTrue(ListingEvent.objects.filter(
            listing=self.listing, kind=EventKind.VERIFY_FAIL).exists())

    def test_template_cannot_be_used_twice(self):
        self._submit()
        with self.assertRaises(MarketError) as exc:
            self._submit()
        self.assertEqual(exc.exception.error_code, 'TEMPLATE_ALREADY_CONSUMED')

    def test_broadcast_failure_leaves_the_listing_open(self):
        from yp_marketplace.api.errors import MarketError as ME
        with mock.patch('listing.services.cancel_service._assemble_cancel_tx',
                        return_value='00'), \
             mock.patch('listing.services.chain.broadcast',
                        side_effect=ME('ARC refused')):
            with self.assertRaises(ME):
                cancel_service.submit_cancel(
                    principal=PRINCIPAL, template_id=self.draft['template_id'],
                    signature_hex='3044' + '02' * 68,
                    public_key_hex=self.key.public_key().serialize().hex())
        self.assertEqual(Listing.objects.get(id=self.listing.id).status,
                         ListingStatus.ACTIVE)
        self.assertTrue(ListingEvent.objects.filter(
            listing=self.listing, kind=EventKind.BROADCAST_FAIL).exists())


class CancelUnlockShapeTests(TestCase):
    """参照実装（1Sat SDK）の形と一致すること。"""

    def test_unlocking_script_shape(self):
        from listing.ordlock.unlock import cancel_unlocking_script
        script = cancel_unlocking_script(b'\x30' * 71, b'\x02' + b'\x11' * 32)
        self.assertTrue(is_cancel_unlocking_script(script))
        self.assertEqual(script[-1], CANCEL_SELECTOR)
        # 先頭は "ol2:cancel" の push（長さ 1 バイト + 10 バイト）
        self.assertEqual(script[:11].hex(), '0a' + b'ol2:cancel'.hex())

    def test_rejects_malformed_key(self):
        from listing.ordlock.unlock import cancel_unlocking_script
        with self.assertRaises(ValueError):
            cancel_unlocking_script(b'\x30', b'\x02' * 10)
