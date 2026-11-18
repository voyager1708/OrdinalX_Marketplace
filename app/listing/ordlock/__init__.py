"""
OrdLock v2 の組み立てと読み取り（documents/Specification.md §8.1、Spike 0 ②④）。

**v1 ではなく v2 を使う。** 参照実装 `js-1sat-ord` は 2026-09-11 の 0.1.92 で
**v1 の出品作成を無効化**して引退し（既存の出品のキャンセルと購入だけ残る）、
維持されているのは後継の 1Sat SDK の `OrdLockV2Batch`。仕様 §8.1 が参照実装と
して挙げている v1 のままでは、**新しい出品を作る手段が公式にはもう無い**。

構成（参照実装 `OrdLockV2.lock` と同じ）:

    locking script = fillSlots(テンプレート, [seller PKH, payOutput])
    payOutput      = 8 バイト LE の satoshi || varint || 支払い先の script

「誰に・いくら払うか」が**ロックの中に焼き込まれる**ので、価格は改竄できない
（§14-3）。市場手数料は script では強制されないので、端末が告知額と突き合わせる
（§14-4）。
"""

from listing.ordlock.script import (
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
