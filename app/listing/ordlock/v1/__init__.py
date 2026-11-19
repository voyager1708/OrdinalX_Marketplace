"""
OrdLock **v1**（S018 の決定。市場はこちらで出品する）。

v2 と違い、購入の枝に無効オペコードが無いので **実際に買える**。代わりに
1 tx に 1 件で、出力 0 と 1 の位置が固定される（`unlock.py` の説明）。
"""

from listing.ordlock.v1.script import (
    OrdLockV1Listing,
    decode,
    is_ordlock_v1,
    lock,
    lock_raw,
)
from listing.ordlock.v1.unlock import (
    cancel_unlocking_script,
    is_cancel_unlocking_script,
    is_purchase_unlocking_script,
    purchase_unlocking_script,
)

__all__ = [
    'OrdLockV1Listing', 'decode', 'is_ordlock_v1', 'lock', 'lock_raw',
    'cancel_unlocking_script', 'is_cancel_unlocking_script',
    'is_purchase_unlocking_script', 'purchase_unlocking_script',
]
