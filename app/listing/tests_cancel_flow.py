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
from listing.ordlock.v1.artifact import CANCEL_SELECTOR
from listing.ordlock.v1.unlock import is_cancel_unlocking_script
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
        self.assertEqual(data['sighash'], 'SINGLE|ANYONECANPAY|FORKID')
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
        from listing.ordlock.v1.unlock import cancel_unlocking_script
        script = cancel_unlocking_script(b'\x30' * 71, b'\x02' + b'\x11' * 32)
        self.assertTrue(is_cancel_unlocking_script(script))
        self.assertEqual(script[-1], CANCEL_SELECTOR)
        # v1 は `<sig> <pubkey> OP_1`。**v2 のようなマーカーは無い**（S018）
        self.assertEqual(script[0], 71)
        self.assertNotIn(b'ol2:cancel', script)

    def test_rejects_malformed_key(self):
        from listing.ordlock.v1.unlock import cancel_unlocking_script
        with self.assertRaises(ValueError):
            cancel_unlocking_script(b'\x30', b'\x02' * 10)


@override_settings(MARKET_ENV='dev')
class CancelTxShapeTests(TestCase):
    """
    署名範囲と tx の形が噛み合っていること。

    市場は**売り手が署名した後に**お釣りの出力を足す（手数料は市場持ち）。
    だから売り手の署名は `SINGLE|ANYONECANPAY` でなければならず、SINGLE が
    効くためには **ordinal の入力と戻りの出力がどちらも 0 番**である必要がある。

    `_assemble_cancel_tx` は既存テストでは丸ごとモックされていて、中の形は
    一度も見られていなかった（実際 `tx.fee()` が元 tx を要求して落ちていた）。
    ここで本物を組ませる。
    """

    def setUp(self):
        from bsv import Script, Transaction, TransactionOutput

        self.key = _seller_key()
        self.listing = _listing(self.key)

        # 出品 tx（OrdLock 出力 1 sat）。チェーンから引いてくる形を模す
        self.listed = Transaction()
        self.listed.add_output(TransactionOutput(
            locking_script=Script(bytes.fromhex(self.listing.ordlock_script_hex)),
            satoshis=1))
        self.listing.listed_outpoint = f'{self.listed.txid()}:0'
        self.listing.save(update_fields=['listed_outpoint'])

        self.receive = p2pkh(bytes([0x33]) * 20).hex()
        self.draft = cancel_service.create_cancel_draft(
            principal=PRINCIPAL, listing_id=self.listing.id,
            receive_script=self.receive)

    def _assemble(self):
        from bsv import P2PKH, PrivateKey, Transaction, TransactionOutput

        fee_key = PrivateKey()
        funding = Transaction()
        funding.add_output(TransactionOutput(
            locking_script=P2PKH().lock(fee_key.address()), satoshis=200_000))
        raws = {funding.txid(): funding.hex(), self.listed.txid(): self.listed.hex()}

        row = TxTemplate.objects.get(template_id=self.draft['template_id'])
        with mock.patch('listing.services.chain.fee_wallet_key', return_value=fee_key), \
             mock.patch('listing.services.chain.pick_fee_utxo',
                        return_value={'tx_hash': funding.txid(), 'tx_pos': 0,
                                      'value': 200_000}), \
             mock.patch('listing.services.chain.raw_tx', side_effect=lambda t: raws[t]):
            raw = cancel_service._assemble_cancel_tx(
                self.listing, row, b'\x30' * 71,
                self.key.public_key().serialize())
        return Transaction.from_hex(raw)

    def test_the_sighash_is_single_anyonecanpay(self):
        self.assertEqual(self.draft['sighash'], 'SINGLE|ANYONECANPAY|FORKID')

    def test_ordinal_input_and_return_output_are_both_first(self):
        tx = self._assemble()
        self.assertEqual(tx.inputs[0].source_txid, self.listed.txid())
        self.assertEqual(tx.inputs[0].source_output_index, 0)
        self.assertEqual(tx.outputs[0].locking_script.serialize().hex(), self.receive)
        self.assertEqual(tx.outputs[0].satoshis, 1)

    def test_market_appends_its_own_input_and_change(self):
        """これがあるので ALL では署名できない（端末はお釣りを知り得ない）。"""
        tx = self._assemble()
        self.assertEqual(len(tx.inputs), 2)
        self.assertEqual(len(tx.outputs), 2)
        self.assertGreater(tx.outputs[1].satoshis, 0)

    def test_the_seller_input_carries_the_cancel_unlock(self):
        tx = self._assemble()
        self.assertTrue(is_cancel_unlocking_script(
            tx.inputs[0].unlocking_script.serialize()))

    def test_a_mismatched_listing_tx_is_refused(self):
        """WoC が別の tx を返したら、黙って別物を解こうとせず止める。"""
        from bsv import P2PKH, PrivateKey, Transaction, TransactionOutput

        fee_key = PrivateKey()
        funding = Transaction()
        funding.add_output(TransactionOutput(
            locking_script=P2PKH().lock(fee_key.address()), satoshis=200_000))
        row = TxTemplate.objects.get(template_id=self.draft['template_id'])

        with mock.patch('listing.services.chain.fee_wallet_key', return_value=fee_key), \
             mock.patch('listing.services.chain.pick_fee_utxo',
                        return_value={'tx_hash': funding.txid(), 'tx_pos': 0,
                                      'value': 200_000}), \
             mock.patch('listing.services.chain.raw_tx', return_value=funding.hex()), \
             self.assertRaises(MarketError):
            cancel_service._assemble_cancel_tx(
                self.listing, row, b'\x30' * 71,
                self.key.public_key().serialize())
