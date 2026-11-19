"""
OrdLock **v1**（S018 の決定で、市場の決済ロックはこちら）。

押さえるのは 3 つ:
  - 参照実装と**バイト一致**すること（1 バイトでも違うと外部の 1Sat マーケットから
    見えなくなるか、最悪ロックが解けなくなる）
  - 定数が差し替えられていないこと（SHA-256）
  - **無効オペコードを含まない**こと（v2 はここで落ちた。S018）

ベクタ `testdata/ordlock_v1_listing_vector.hex` は参照実装
（`@bsv/sdk` ＋ 1sat-sdk の定数）で生成した 860 バイト。素材は
cancel pkh = 0x11×20 / pay pkh = 0x22×20 / price = 1000。
"""

from pathlib import Path

from django.conf import settings
from django.test import SimpleTestCase

from listing.ordlock.v1 import artifact
from listing.ordlock.v1 import decode, is_ordlock_v1, lock, lock_raw
from listing.ordlock.v1.unlock import (
    cancel_unlocking_script,
    estimate_purchase_unlock_length,
    is_cancel_unlocking_script,
    is_purchase_unlocking_script,
    purchase_unlocking_script,
    serialize_outputs,
)
from listing.ordlock.v2.script import build_output, p2pkh

VECTOR = (Path(settings.BASE_DIR) / 'listing/testdata/ordlock_v1_listing_vector.hex'
          ).read_text().strip()

SELLER_PKH = bytes([0x11]) * 20
PAY_PKH = bytes([0x22]) * 20
PRICE = 1000

# BSV で無効のままの命令。v2 の購入の枝はここで落ちた（S018）
DISABLED = {0x62: 'OP_VER', 0x65: 'OP_VERIF', 0x66: 'OP_VERNOTIF',
            0x8d: 'OP_2MUL', 0x8e: 'OP_2DIV'}


def _disabled_opcodes(script: bytes):
    """push データを読み飛ばしながら無効オペコードを探す。"""
    found, i = [], 0
    while i < len(script):
        op = script[i]
        if op <= 0x4b:
            i += 1 + op
        elif op == 0x4c:
            i += 2 + script[i + 1]
        elif op == 0x4d:
            i += 3 + int.from_bytes(script[i + 1:i + 3], 'little')
        elif op == 0x4e:
            i += 5 + int.from_bytes(script[i + 1:i + 5], 'little')
        else:
            if op in DISABLED:
                found.append((i, DISABLED[op]))
            i += 1
    return found


class ArtifactTests(SimpleTestCase):
    def test_constants_are_the_official_ones(self):
        import hashlib

        self.assertEqual(len(artifact.PREFIX), 102)
        self.assertEqual(len(artifact.SUFFIX), 702)
        self.assertEqual(hashlib.sha256(artifact.PREFIX).hexdigest(),
                         artifact.PREFIX_SHA256)
        self.assertEqual(hashlib.sha256(artifact.SUFFIX).hexdigest(),
                         artifact.SUFFIX_SHA256)

    def test_the_script_has_no_disabled_opcodes(self):
        """
        **v2 を捨てた理由がここ**（S018）。v2 の購入の枝は OP_2MUL を必ず実行し、
        ARC が 461 で拒否する。v1 にそれが無いことを毎回確かめる。
        """
        script = lock(SELLER_PKH, p2pkh(PAY_PKH), PRICE)
        self.assertEqual(_disabled_opcodes(script), [])


class LockTests(SimpleTestCase):
    def test_matches_the_official_vector_byte_for_byte(self):
        self.assertEqual(lock(SELLER_PKH, p2pkh(PAY_PKH), PRICE).hex(), VECTOR)
        self.assertEqual(len(VECTOR) // 2, 860)

    def test_price_and_payout_are_baked_in(self):
        script = lock(SELLER_PKH, p2pkh(PAY_PKH), PRICE)
        listing = decode(script)
        self.assertEqual(listing.price_satoshis, PRICE)
        self.assertEqual(listing.seller_pkh, SELLER_PKH)
        self.assertEqual(listing.payout_script, p2pkh(PAY_PKH))
        self.assertEqual(listing.payout, build_output(PRICE, p2pkh(PAY_PKH)))

    def test_a_different_price_changes_the_script(self):
        self.assertNotEqual(lock(SELLER_PKH, p2pkh(PAY_PKH), PRICE),
                            lock(SELLER_PKH, p2pkh(PAY_PKH), PRICE + 1))

    def test_payout_may_be_any_script(self):
        """支払い先は P2PKH とは限らない（契約は直列化した出力を見るだけ）。"""
        weird = bytes([0x51])                      # OP_1
        listing = decode(lock(SELLER_PKH, weird, PRICE))
        self.assertEqual(listing.payout_script, weird)

    def test_recognises_only_v1(self):
        self.assertTrue(is_ordlock_v1(lock(SELLER_PKH, p2pkh(PAY_PKH), PRICE)))
        self.assertFalse(is_ordlock_v1(p2pkh(PAY_PKH)))

    def test_rejects_malformed_arguments(self):
        with self.assertRaises(ValueError):
            lock_raw(b'\x11' * 19, build_output(PRICE, p2pkh(PAY_PKH)))
        with self.assertRaises(ValueError):
            lock_raw(SELLER_PKH, b'\x00')

    def test_decode_ignores_data_around_the_lock(self):
        """前後に MAP などが付いていても読める（参照実装も許している）。"""
        script = lock(SELLER_PKH, p2pkh(PAY_PKH), PRICE)
        listing = decode(b'\x6a\x04dead' + script)
        self.assertIsNotNone(listing)
        self.assertEqual(listing.price_satoshis, PRICE)

    def test_decode_returns_none_for_other_scripts(self):
        self.assertIsNone(decode(p2pkh(PAY_PKH)))


class UnlockTests(SimpleTestCase):
    def test_cancel_shape(self):
        script = cancel_unlocking_script(b'\x30' * 71, b'\x02' + b'\x11' * 32)
        self.assertTrue(is_cancel_unlocking_script(script))
        self.assertEqual(script[-1], artifact.CANCEL_SELECTOR)
        # v2 と違い **マーカーは無い**
        self.assertNotIn(b'ol2:cancel', script)

    def test_cancel_rejects_malformed_keys(self):
        with self.assertRaises(ValueError):
            cancel_unlocking_script(b'\x30', b'\x02' * 10)

    def test_purchase_shape_without_trailing_outputs(self):
        ordinal = build_output(1, p2pkh(PAY_PKH))
        script = purchase_unlocking_script(ordinal, None, b'\x00' * 900)
        self.assertTrue(is_purchase_unlocking_script(script))
        self.assertEqual(script[-1], artifact.PURCHASE_SELECTOR)
        self.assertFalse(is_cancel_unlocking_script(script))

    def test_purchase_shape_with_trailing_outputs(self):
        ordinal = build_output(1, p2pkh(PAY_PKH))
        trailing = serialize_outputs([(2500, p2pkh(PAY_PKH)), (900, p2pkh(SELLER_PKH))])
        script = purchase_unlocking_script(ordinal, trailing, b'\x00' * 900)
        self.assertTrue(is_purchase_unlocking_script(script))

    def test_purchase_rejects_a_short_preimage(self):
        with self.assertRaises(ValueError):
            purchase_unlocking_script(build_output(1, p2pkh(PAY_PKH)), None, b'\x00' * 10)

    def test_the_unlock_length_estimate_covers_the_preimage(self):
        """
        preimage は scriptCode（ロック全体 860B）を丸ごと含む。見積もりから
        漏らすと ARC が "Fees are insufficient" で弾く（v2 で踏んだ）。
        """
        script = lock(SELLER_PKH, p2pkh(PAY_PKH), PRICE)
        estimate = estimate_purchase_unlock_length(script)
        self.assertGreater(estimate, len(script))
        actual = purchase_unlocking_script(
            build_output(1, p2pkh(PAY_PKH)), None,
            b'\x00' * (156 + 3 + len(script)))
        self.assertEqual(estimate, len(actual))
