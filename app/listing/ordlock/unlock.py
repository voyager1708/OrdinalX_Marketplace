"""
OrdLock v2 の解錠（キャンセル）。

参照実装（1Sat SDK `ordlockV2.ts` の `cancelListing`）いわく:

> The whole locking script is the scriptCode (the cancel branch executes
> no OP_CODESEPARATOR), so the standard P2PKH signer applies.

つまり**署名は P2PKH と同じ**で、違うのは解錠スクリプトの包み方だけ:

    <"ol2:cancel"> <sig> <pubkey> OP_1

先頭のマーカーと末尾のセレクタ（公開メソッドの番号）で「キャンセルを呼ぶ」ことを
示す。ABI の公開メソッドは `[purchase, cancel]` なので、cancel は 2 番目 → OP_1。
"""

from __future__ import annotations

from listing.ordlock.artifact import CANCEL_MARKER
from listing.ordlock.script import encode_push

# 公開メソッドのセレクタ。purchase=0 → OP_0(0x00) / cancel=1 → OP_1(0x51)
OP_0 = 0x00
OP_1 = 0x51
PURCHASE_SELECTOR = OP_0
CANCEL_SELECTOR = OP_1

# `<marker(10B)> <sig(最大73B)> <pubkey(33B)> OP_1` の上限（参照実装と同じ数え方）
CANCEL_UNLOCK_MAX_BYTES = 1 + 10 + 1 + 73 + 1 + 33 + 1


def cancel_unlocking_script(signature: bytes, public_key: bytes) -> bytes:
    """売り手の署名と公開鍵から、キャンセルの解錠スクリプトを組む。"""
    if not signature:
        raise ValueError('signature is required')
    if len(public_key) not in (33, 65):
        raise ValueError('public key must be 33 or 65 bytes')
    return (encode_push(CANCEL_MARKER)
            + encode_push(signature)
            + encode_push(public_key)
            + bytes([CANCEL_SELECTOR]))


def is_cancel_unlocking_script(script: bytes) -> bool:
    """キャンセルの形か（マーカーで始まり、セレクタで終わる 4 チャンク）。"""
    expected_head = encode_push(CANCEL_MARKER)
    return (script.startswith(expected_head)
            and len(script) > len(expected_head) + 2
            and script[-1] == CANCEL_SELECTOR)
