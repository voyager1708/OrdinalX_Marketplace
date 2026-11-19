"""
OrdLock v2 の locking script を組み立てる／読み戻す。

参照実装（1Sat SDK の `packages/templates/src/ordlock/ordlockV2.ts` と
`runar/slots.ts`）と**バイト単位で同じ**であることが契約。ズレると:

  - 外部の 1Sat マーケットから出品が見えなくなる（prefix が一致しない）
  - 最悪、誰もロックを解けない（資産が永久に動かせない）

テスト `listing/tests_ordlock.py` が参照実装の公式ベクタと突き合わせている。
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Sequence

from listing.ordlock.v2.artifact import PREFIX_HEX, SLOTS, TEMPLATE_HEX

TEMPLATE = bytes.fromhex(TEMPLATE_HEX)
PREFIX = bytes.fromhex(PREFIX_HEX)

# 支払い出力の satoshi は 8 バイト LE（BSV の出力の素の形）
SATOSHIS_BYTES = 8


def encode_push(data: bytes) -> bytes:
    """最小 push（参照実装 `encodePush` と同じ規則）。空は OP_0 の 1 バイト。"""
    n = len(data)
    if n == 0:
        return b'\x00'
    if n <= 0x4b:
        return bytes([n]) + data
    if n <= 0xff:
        return b'\x4c' + bytes([n]) + data
    if n <= 0xffff:
        return b'\x4d' + n.to_bytes(2, 'little') + data
    return b'\x4e' + n.to_bytes(4, 'little') + data


def _read_push(raw: bytes, offset: int) -> Optional[tuple[bytes, int]]:
    """`offset` にある push を 1 つ読む。push でなければ None。"""
    if offset >= len(raw):
        return None
    op = raw[offset]
    if op == 0x00:
        return b'', 1
    if 0x01 <= op <= 0x4b:
        size, header = op, 1
    elif op == 0x4c:
        size, header = raw[offset + 1], 2
    elif op == 0x4d:
        size, header = int.from_bytes(raw[offset + 1:offset + 3], 'little'), 3
    elif op == 0x4e:
        size, header = int.from_bytes(raw[offset + 1:offset + 5], 'little'), 5
    else:
        return None
    start = offset + header
    if start + size > len(raw):
        return None
    return raw[start:start + size], header + size


def _varint(value: int) -> bytes:
    if value < 0xfd:
        return bytes([value])
    if value <= 0xffff:
        return b'\xfd' + value.to_bytes(2, 'little')
    if value <= 0xffffffff:
        return b'\xfe' + value.to_bytes(4, 'little')
    return b'\xff' + value.to_bytes(8, 'little')


def build_output(satoshis: int, locking_script: bytes) -> bytes:
    """直列化した取引出力（8 バイト LE || varint || script）。"""
    if satoshis < 0:
        raise ValueError('satoshis must not be negative')
    return (satoshis.to_bytes(SATOSHIS_BYTES, 'little')
            + _varint(len(locking_script)) + locking_script)


def p2pkh(pubkey_hash: bytes) -> bytes:
    """OP_DUP OP_HASH160 <20> OP_EQUALVERIFY OP_CHECKSIG。"""
    if len(pubkey_hash) != 20:
        raise ValueError('pubkey hash must be 20 bytes')
    return b'\x76\xa9\x14' + pubkey_hash + b'\x88\xac'


def fill_slots(template: bytes, slots: Sequence[dict], args: Sequence[bytes]) -> bytes:
    """
    テンプレートの OP_0 プレースホルダを、引数の最小 push で置き換える
    （参照実装 `fillSlots` と同じ）。
    """
    out = bytearray()
    cursor = 0
    for slot in sorted(slots, key=lambda s: s['byte_offset']):
        offset = slot['byte_offset']
        if template[offset] != 0x00:
            raise ValueError(f'slot at byte {offset} is not an OP_0 placeholder')
        out += template[cursor:offset]
        out += encode_push(args[slot['param_index']])
        cursor = offset + 1          # プレースホルダを飛ばす
    out += template[cursor:]
    return bytes(out)


def lock_raw(seller_pkh: bytes, payout: bytes) -> bytes:
    """生の constructor 引数から locking script を作る。"""
    if len(seller_pkh) != 20:
        raise ValueError('seller PKH must be 20 bytes')
    if len(payout) < 9:
        raise ValueError('payout output too short')
    return fill_slots(TEMPLATE, SLOTS, [seller_pkh, payout])


def lock(seller_pkh: bytes, payout_script: bytes, price_satoshis: int) -> bytes:
    """
    出品の locking script。

    `seller_pkh` … キャンセルできる鍵の hash160
    `payout_script` … 売上の受取先（P2PKH とは限らない）
    `price_satoshis` … 支払い出力の額。**ここがロックに焼き込まれる価格**
    """
    return lock_raw(seller_pkh, build_output(price_satoshis, payout_script))


@dataclass(frozen=True)
class OrdLockListing:
    """読み戻した出品。`payout` は直列化した出力そのもの。"""

    seller_pkh: bytes
    price_satoshis: int
    payout: bytes
    offset: int
    end: int

    @property
    def payout_script(self) -> bytes:
        """支払い先の locking script（8 バイトの額と varint を外したもの）。"""
        raw = self.payout
        length = raw[SATOSHIS_BYTES]
        if length < 0xfd:
            return raw[SATOSHIS_BYTES + 1:SATOSHIS_BYTES + 1 + length]
        if length == 0xfd:
            size = int.from_bytes(raw[9:11], 'little')
            return raw[11:11 + size]
        if length == 0xfe:
            size = int.from_bytes(raw[9:13], 'little')
            return raw[13:13 + size]
        size = int.from_bytes(raw[9:17], 'little')
        return raw[17:17 + size]


def decode(script: bytes) -> Optional[OrdLockListing]:
    """
    locking script から出品を読み戻す。v2 でなければ None。

    契約の後ろに続くデータ（MAP など）は許す — 参照実装も許しており、
    出品に metadata を足す運用があるため。
    """
    offset = script.find(PREFIX)
    if offset == -1:
        return None

    cursor = offset
    template_cursor = 0
    args: dict[int, bytes] = {}
    for slot in sorted(SLOTS, key=lambda s: s['byte_offset']):
        boundary = slot['byte_offset']
        span = boundary - template_cursor
        if script[cursor:cursor + span] != TEMPLATE[template_cursor:boundary]:
            return None                      # テンプレートと食い違う
        cursor += span
        read = _read_push(script, cursor)
        if read is None:
            return None
        data, size = read
        args[slot['param_index']] = data
        cursor += size
        template_cursor = boundary + 1

    tail = len(TEMPLATE) - template_cursor
    if script[cursor:cursor + tail] != TEMPLATE[template_cursor:]:
        return None
    cursor += tail

    seller_pkh = args.get(0, b'')
    payout = args.get(1, b'')
    if len(seller_pkh) != 20 or len(payout) < 9:
        return None

    return OrdLockListing(
        seller_pkh=seller_pkh,
        price_satoshis=int.from_bytes(payout[:SATOSHIS_BYTES], 'little'),
        payout=payout,
        offset=offset,
        end=cursor,
    )


def is_ordlock_v2(script: bytes) -> bool:
    return decode(script) is not None


# =============================================================================
# 購入時の出力配置（Spike 0 ④ の答え）
# =============================================================================
# v2 は支払い出力を **位置で** 検証する: 出品の入力 i に対して **出力 i** が
# 焼き込まれた payout と**バイト単位で一致**していなければならない
# （SIGHASH_SINGLE|ANYONECANPAY が入力 i と出力 i を結び付ける）。
#
# そのため**まとめ買いはできる**（契約名も OrdLockV2Batch）が、出力の並びは
# 自由ではない:
#
#   出力 0..m-1   … 前払い入力 m 本ぶんの枠。1 枠が釣り（Σ前払い − Σ payout）で、
#                   残りは 0 sat の OP_FALSE OP_RETURN の詰め物
#   出力 m..m+n-1 … 各出品の payout（出品の入力と同じ番号に来るように）
#   出力 m+n..    … 買い手の受け取り（各 1 sat。first-sat 順で ordinal が乗る）
#
#   入力は 前払い m 本 → 出品 n 本 → 手数料ぶん（**出品より後ろ**）
#   釣りの出力は上の受け取りより**後ろ**（sat の並びがずれるため）
#
# v1 は payout を**出力 0 固定**で見ていたので、1 取引に出品 1 件しか載らなかった。

FILLER_SCRIPT = b'\x00\x6a'          # OP_FALSE OP_RETURN（0 sat の詰め物）


@dataclass(frozen=True)
class PurchasePlan:
    """まとめ買いの出力配置。`outputs` は (satoshis, script) の並び。"""

    outputs: list[tuple[int, bytes]]
    cushion_vout: Optional[int]
    filler_vouts: list[int]
    payout_vouts: list[int]
    receive_vouts: list[int]
    cushion_satoshis: int


def plan_purchase(front_satoshis: Sequence[int],
                  listings: Sequence[bytes],
                  receive_scripts: Sequence[bytes],
                  cushion_script: bytes) -> PurchasePlan:
    """
    まとめ買いの出力を、v2 が要求する並びで組む（参照実装 `planPurchase` と同じ）。

    `front_satoshis` … 前払い入力の額。合計が payout の合計以上であること
    `listings`       … 出品の locking script（入力に入れるのと同じ順）
    `receive_scripts`… 買い手の受け取り先（出品と 1 対 1）
    """
    front_count = len(front_satoshis)
    listing_count = len(listings)
    if front_count < 1:
        raise ValueError('at least one front funding input is required')
    if listing_count < 1:
        raise ValueError('at least one listing is required')
    if len(receive_scripts) != listing_count:
        raise ValueError('one receive output per listing')

    payouts = []
    for script in listings:
        decoded = decode(script)
        if decoded is None:
            raise ValueError('input is not an OrdLock v2 listing')
        payouts.append(decoded)

    total_payout = sum(row.price_satoshis for row in payouts)
    front_total = sum(front_satoshis)
    if front_total < total_payout:
        raise ValueError(
            f'front funding {front_total} does not cover payouts {total_payout}')
    cushion = front_total - total_payout

    outputs: list[tuple[int, bytes]] = []
    filler_vouts: list[int] = []
    cushion_vout: Optional[int] = None
    for index in range(front_count):
        if index == 0 and cushion > 0:
            cushion_vout = len(outputs)
            outputs.append((cushion, cushion_script))
        else:
            filler_vouts.append(len(outputs))
            outputs.append((0, FILLER_SCRIPT))

    payout_vouts: list[int] = []
    for row in payouts:
        payout_vouts.append(len(outputs))
        outputs.append((row.price_satoshis, row.payout_script))

    receive_vouts: list[int] = []
    for script in receive_scripts:
        receive_vouts.append(len(outputs))
        outputs.append((1, script))        # ordinal は 1 sat

    return PurchasePlan(outputs=outputs, cushion_vout=cushion_vout,
                        filler_vouts=filler_vouts, payout_vouts=payout_vouts,
                        receive_vouts=receive_vouts, cushion_satoshis=cushion)
