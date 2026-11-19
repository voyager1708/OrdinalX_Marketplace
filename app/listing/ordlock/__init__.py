"""
決済ロック（documents/Specification.md §8.1、S018）。

**出品は v1 で作る。** 後継の v2（`OrdLockV2Batch`）は購入の枝が `OP_2MUL` を
必ず実行し、BSV ではこの命令が無効のままなので **購入 tx が ARC に受理されない**
（S018・実機確認）。出品と取り下げは v2 でも通るが、買えない板に意味は無い。

- `listing.ordlock.v1` … 市場が使う版。`lock` / `decode` / 解錠
- `listing.ordlock.v2` … 参照のため残す。契約が直れば使える（まとめ買いができる）

この階層の名前（`lock` / `decode` など）は **v1 を指す**。版を跨ぐ比較をするときだけ
`v1` / `v2` を明示して import すること。
"""

from listing.ordlock.v1 import (
    OrdLockV1Listing,
    cancel_unlocking_script,
    decode,
    is_cancel_unlocking_script,
    is_ordlock_v1,
    is_purchase_unlocking_script,
    lock,
    lock_raw,
    purchase_unlocking_script,
)
from listing.ordlock.v2.script import build_output, encode_push, p2pkh

__all__ = [
    'OrdLockV1Listing', 'build_output', 'cancel_unlocking_script', 'decode',
    'encode_push', 'is_cancel_unlocking_script', 'is_ordlock_v1',
    'is_purchase_unlocking_script', 'lock', 'lock_raw', 'p2pkh',
    'purchase_unlocking_script',
]
