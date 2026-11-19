"""
OrdLock v2 の解錠（キャンセルと購入）。

参照実装（1Sat SDK `ordlockV2.ts` の `cancelListing`）いわく:

> The whole locking script is the scriptCode (the cancel branch executes
> no OP_CODESEPARATOR), so the standard P2PKH signer applies.

つまり**署名は P2PKH と同じ**で、違うのは解錠スクリプトの包み方だけ:

    <"ol2:cancel"> <sig> <pubkey> OP_1

先頭のマーカーと末尾のセレクタ（公開メソッドの番号）で「キャンセルを呼ぶ」ことを
示す。ABI の公開メソッドは `[purchase, cancel]` なので、cancel は 2 番目 → OP_1。
"""

from __future__ import annotations

from typing import Optional

from listing.ordlock.v2.artifact import CANCEL_MARKER, CODESEP_INDEX, PREFIX_HEX
from listing.ordlock.v2.script import _read_push, encode_push

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


# 購入の preimage の固定長部分（参照実装 `PREIMAGE_FIXED_LENGTH`）。
# version 4 + hashPrevouts 32 + hashSequence 32 + outpoint 36 + （scriptCode）
# + satoshis 8 + sequence 4 + hashOutputs 32 + locktime 4 + sighash 4
PREIMAGE_FIXED_LENGTH = 156

_PREFIX = bytes.fromhex(PREFIX_HEX)


def purchase_subscript(locking_script: bytes) -> Optional[bytes]:
    """
    購入の preimage に使う scriptCode。

    **OP_CODESEPARATOR より後ろ全部**（参照実装 `purchaseListing`）。契約は
    購入の枝で codeseparator を通るので、キャンセル（スクリプト全体）とは違う。
    v2 の出品でなければ None。
    """
    offset = locking_script.find(_PREFIX)
    if offset == -1:
        return None
    return locking_script[offset + CODESEP_INDEX + 1:]


def purchase_unlocking_script(preimage: bytes) -> bytes:
    """
    購入の解錠スクリプト: `<preimage> OP_0`。

    **署名は要らない**。契約は「入力 i が指す出力 i が、出品に焼き込まれた
    payout と完全一致すること」を preimage の中の hashOutputs で確かめる
    （SIGHASH_SINGLE が入力 i と出力 i を対にする）。だから買い手の鍵も
    売り手の鍵も要らず、**市場が組める**。
    """
    if len(preimage) < PREIMAGE_FIXED_LENGTH:
        raise ValueError(f'preimage is too short ({len(preimage)} bytes)')
    return encode_push(preimage) + bytes([PURCHASE_SELECTOR])


def is_purchase_unlocking_script(script: bytes) -> bool:
    """購入の形か（`<preimage> OP_0` の 2 チャンク）。"""
    if not script or script[-1] != PURCHASE_SELECTOR:
        return False
    read = _read_push(script, 0)
    if read is None:
        return False
    data, size = read
    return size == len(script) - 1 and len(data) >= PREIMAGE_FIXED_LENGTH


def estimate_purchase_unlock_length(locking_script: bytes) -> int:
    """
    購入の解錠スクリプトの長さ（参照実装 `estimatePurchaseUnlockLength`）。

    preimage は scriptCode を丸ごと含むので **解錠だけで 700 バイト近い**。
    手数料の見積もりから漏らすと ARC に "Fees are insufficient" で弾かれる
    （実機で踏んだ）。
    """
    subscript = purchase_subscript(locking_script)
    if subscript is None:
        raise ValueError('not an OrdLock v2 listing')
    preimage_len = PREIMAGE_FIXED_LENGTH + _varint_len(len(subscript)) + len(subscript)
    return len(encode_push(b'\x00' * preimage_len)) + 1      # push + セレクタ


def _varint_len(value: int) -> int:
    if value < 0xfd:
        return 1
    if value <= 0xffff:
        return 3
    if value <= 0xffffffff:
        return 5
    return 9
