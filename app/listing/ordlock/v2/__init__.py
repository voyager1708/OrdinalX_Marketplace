"""
OrdLock **v2**（`OrdLockV2Batch`）。**参照のため残す**（S018）。

出品と取り下げは通るが、**購入は通らない**: 購入の枝が `OP_2MUL` を必ず実行し、
BSV ではこの命令が無効のままなので ARC が 461 で拒否する（実機確認）。
市場が使うのは `listing.ordlock.v1`。契約が直れば、まとめ買いができる分こちらが有利。
"""

from listing.ordlock.v2.script import (
    OrdLockListing,
    PurchasePlan,
    build_output,
    decode,
    encode_push,
    is_ordlock_v2,
    lock,
    lock_raw,
    p2pkh,
    plan_purchase,
)

__all__ = [
    'OrdLockListing', 'PurchasePlan', 'build_output', 'decode', 'encode_push',
    'is_ordlock_v2', 'lock', 'lock_raw', 'p2pkh', 'plan_purchase',
]
