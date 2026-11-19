"""
OrdLock **v2**（参照のため残す。S018 で決済ロックは v1 に移った）。

v2 のスクリプト自体は公式ベクタとの一致を見続ける（契約が直れば
まとめ買いができるので使える）。市場が使う v1 は `tests_ordlock_v1.py`。

**参照実装とバイト単位で同じ**であることが契約。ズレると、出品が外部の 1Sat
マーケットから見えなくなるか、最悪ロックが解けなくなる（資産が永久に動かない）。

突き合わせの相手は 1Sat SDK の公式ベクタ
（`packages/templates/src/ordlock/ordlockV2.test.ts` の VECTOR_HEX。Go の
harness が出した `runar/artifacts/v2_listing_vector.hex`）を testdata に置いたもの。
"""

import hashlib
from pathlib import Path

from django.test import SimpleTestCase

from listing.ordlock.v2 import decode, is_ordlock_v2, lock, p2pkh, plan_purchase
from listing.ordlock.v2.artifact import PREFIX_HEX, TEMPLATE_HEX, TEMPLATE_SHA256

VECTOR = bytes.fromhex(
    (Path(__file__).resolve().parent / 'testdata/ordlock_v2_listing_vector.hex')
    .read_text().strip())
SELLER_PKH = bytes([0x11]) * 20
PAY_PKH = bytes([0x22]) * 20
PRICE = 1000


class ArtifactTests(SimpleTestCase):
    """テンプレートは**書き換えない**。壊れていないことを毎回確かめる。"""

    def test_template_is_the_vendored_artifact(self):
        raw = bytes.fromhex(TEMPLATE_HEX)
        self.assertEqual(len(raw), 472)
        self.assertEqual(hashlib.sha256(raw).hexdigest(), TEMPLATE_SHA256)

    def test_prefix_is_the_bytes_before_the_first_slot(self):
        self.assertEqual(len(bytes.fromhex(PREFIX_HEX)), 436)
        self.assertTrue(VECTOR.startswith(bytes.fromhex(PREFIX_HEX)))


class LockTests(SimpleTestCase):
    def test_lock_matches_the_official_vector_byte_for_byte(self):
        built = lock(seller_pkh=SELLER_PKH, payout_script=p2pkh(PAY_PKH),
                     price_satoshis=PRICE)
        self.assertEqual(built.hex(), VECTOR.hex())
        self.assertEqual(len(built), 526)

    def test_decode_is_the_inverse_of_lock(self):
        listing = decode(VECTOR)
        self.assertIsNotNone(listing)
        self.assertEqual(listing.seller_pkh, SELLER_PKH)
        self.assertEqual(listing.price_satoshis, PRICE)
        self.assertEqual(listing.payout_script, p2pkh(PAY_PKH))
        self.assertEqual((listing.offset, listing.end), (0, 526))

    def test_price_is_baked_into_the_lock(self):
        """§14-3: 価格は script に埋まるので改竄できない。"""
        cheap = lock(SELLER_PKH, p2pkh(PAY_PKH), 1)
        dear = lock(SELLER_PKH, p2pkh(PAY_PKH), 10_000_000)
        self.assertNotEqual(cheap, dear)
        self.assertEqual(decode(cheap).price_satoshis, 1)
        self.assertEqual(decode(dear).price_satoshis, 10_000_000)

    def test_payout_script_need_not_be_p2pkh(self):
        # 受取先は P2PKH とは限らない（§5 は payout_script を生で持つ）
        odd = b'\x6a\x04dead'
        listing = decode(lock(SELLER_PKH, odd, 42))
        self.assertEqual(listing.payout_script, odd)

    def test_decode_tolerates_trailing_data(self):
        # 契約の後ろに MAP などが続く出品がある（参照実装も許している）
        listing = decode(VECTOR + bytes.fromhex('006a0474657374'))
        self.assertIsNotNone(listing)
        self.assertEqual(listing.end, 526)

    def test_other_scripts_are_not_v2(self):
        self.assertFalse(is_ordlock_v2(p2pkh(PAY_PKH)))
        self.assertFalse(is_ordlock_v2(b''))
        self.assertIsNone(decode(VECTOR[:400]))

    def test_rejects_malformed_constructor_args(self):
        for seller, payout_script in ((b'\x11' * 19, p2pkh(PAY_PKH)),
                                      (b'\x11' * 21, p2pkh(PAY_PKH))):
            with self.subTest(seller=len(seller)):
                with self.assertRaises(ValueError):
                    lock(seller, payout_script, PRICE)


class BatchPurchaseLayoutTests(SimpleTestCase):
    """
    Spike 0 ④: v2 は payout を **位置で** 見る（出品の入力 i ↔ 出力 i）。
    なので**まとめ買いはできる**が、出力の並びが決まる。
    """

    def setUp(self):
        self.first = lock(bytes([0x01]) * 20, p2pkh(bytes([0x02]) * 20), 1000)
        self.second = lock(bytes([0x03]) * 20, p2pkh(bytes([0x04]) * 20), 2500)
        self.receive = p2pkh(bytes([0x09]) * 20)
        self.cushion = p2pkh(bytes([0x08]) * 20)

    def test_payout_sits_at_the_listing_input_index(self):
        plan = plan_purchase([4000], [self.first, self.second],
                             [self.receive, self.receive], self.cushion)
        # 前払い 1 本 → 出力 0 が釣り、出品の入力 1,2 に対して出力 1,2 が payout
        self.assertEqual(plan.payout_vouts, [1, 2])
        self.assertEqual(plan.outputs[1][0], 1000)
        self.assertEqual(plan.outputs[2][0], 2500)

    def test_cushion_is_the_change_of_the_front_funding(self):
        plan = plan_purchase([4000], [self.first], [self.receive], self.cushion)
        self.assertEqual(plan.cushion_satoshis, 3000)
        self.assertEqual(plan.outputs[0], (3000, self.cushion))

    def test_extra_front_inputs_reserve_filler_slots(self):
        # 前払いが 3 本なら先頭 3 枠。釣りが 1 枠、残りは 0 sat の OP_FALSE OP_RETURN
        plan = plan_purchase([1000, 2000, 1000], [self.first], [self.receive],
                             self.cushion)
        self.assertEqual(plan.filler_vouts, [1, 2])
        for vout in plan.filler_vouts:
            self.assertEqual(plan.outputs[vout], (0, b'\x00\x6a'))
        self.assertEqual(plan.payout_vouts, [3])

    def test_receives_carry_exactly_one_satoshi(self):
        plan = plan_purchase([4000], [self.first, self.second],
                             [self.receive, self.receive], self.cushion)
        for vout in plan.receive_vouts:
            self.assertEqual(plan.outputs[vout][0], 1, 'ordinal は 1 sat')

    def test_front_funding_must_cover_the_payouts(self):
        with self.assertRaises(ValueError):
            plan_purchase([100], [self.first], [self.receive], self.cushion)

    def test_one_receive_per_listing(self):
        with self.assertRaises(ValueError):
            plan_purchase([4000], [self.first, self.second], [self.receive],
                          self.cushion)
