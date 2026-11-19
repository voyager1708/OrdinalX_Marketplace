"""
OrdLock v1 の組み立てと読み取り（S018）。

    locking script = PREFIX || push(売り手 PKH) || push(payOutput) || SUFFIX

「誰に・いくら払うか」が **payOutput としてロックの中に焼き込まれる**ので、
価格は改竄できない（Specification.md §14-3）。市場手数料は script では
強制されないので、端末が告知額と突き合わせる（§14-4）。

v2 との違いは `unlock.py` の冒頭にまとめてある。
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from listing.ordlock.v1.artifact import PREFIX, SUFFIX
# 押し込み・出力の直列化・P2PKH は版に依らないので v2 のものを使い回す
from listing.ordlock.v2.script import (
    SATOSHIS_BYTES,
    _read_push,
    build_output,
    encode_push,
    p2pkh,
)

__all__ = ['OrdLockV1Listing', 'decode', 'is_ordlock_v1', 'lock', 'lock_raw']


def lock_raw(seller_pkh: bytes, payout: bytes) -> bytes:
    """生の引数から locking script を作る（`payout` は直列化した出力）。"""
    if len(seller_pkh) != 20:
        raise ValueError('seller PKH must be 20 bytes')
    if len(payout) < 9:
        raise ValueError('payout output too short')
    return PREFIX + encode_push(seller_pkh) + encode_push(payout) + SUFFIX


def lock(seller_pkh: bytes, payout_script: bytes, price_satoshis: int) -> bytes:
    """
    出品の locking script。

    `seller_pkh` … 取り下げできる鍵の hash160
    `payout_script` … 売上の受取先（P2PKH とは限らない）
    `price_satoshis` … 支払い出力の額。**ここがロックに焼き込まれる価格**
    """
    return lock_raw(seller_pkh, build_output(price_satoshis, payout_script))


@dataclass(frozen=True)
class OrdLockV1Listing:
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


def decode(script: bytes) -> Optional[OrdLockV1Listing]:
    """
    locking script から出品を読み戻す。v1 でなければ None。

    参照実装 `OrdLock.decode` と同じ読み方: PREFIX と SUFFIX に挟まれた部分を
    2 つの push（売り手 PKH と payOutput）として読む。前後に別のデータが
    付いていても拾える（参照実装も許している）。
    """
    start = script.find(PREFIX)
    if start == -1:
        return None
    body_start = start + len(PREFIX)
    suffix_at = script.find(SUFFIX, body_start)
    if suffix_at == -1:
        return None

    cursor = body_start
    read = _read_push(script, cursor)
    if read is None:
        return None
    seller_pkh, size = read
    cursor += size

    read = _read_push(script, cursor)
    if read is None:
        return None
    payout, size = read
    cursor += size

    if cursor != suffix_at or len(seller_pkh) != 20 or len(payout) < 9:
        return None

    price = int.from_bytes(payout[:SATOSHIS_BYTES], 'little')
    return OrdLockV1Listing(seller_pkh=seller_pkh, price_satoshis=price,
                            payout=payout, offset=start,
                            end=suffix_at + len(SUFFIX))


def is_ordlock_v1(script: bytes) -> bool:
    """v1 の出品か（PREFIX で判定。どの出品でも同一）。"""
    return script.find(PREFIX) != -1
