r"""
OrdLock v1 の解錠（取り下げと購入）。

v2 との違いはここに集約される:

|          | v1                                   | v2                       |
|----------|--------------------------------------|--------------------------|
| 取り下げ | `<sig> <pubkey> OP_1`                | `<"ol2:cancel"> <sig> <pubkey> OP_1` |
| 購入     | `<出力0> <出力2以降\|OP_0> <preimage> OP_0` | `<preimage> OP_0`  |
| 購入の範囲 | `ALL\|ANYONECANPAY\|FORKID`         | `SINGLE\|ANYONECANPAY\|FORKID` |
| 出力の縛り | 出力 **0 = 買い手の ordinal / 1 = 売り手への払い**（位置固定） | 入力 i ↔ 出力 i |
| まとめ買い | できない（1 tx 1 件）               | できる                    |
| scriptCode | ロックスクリプト全体                 | OP_CODESEPARATOR より後ろ |

**購入に署名は要らない**のは v1 も同じ。契約は渡された preimage が本当にこの tx の
ものかを確かめ、その中の hashOutputs と「出力 0・出力 1・残りの出力」の直列化が
噛み合うかを見る。だから買い手の鍵も売り手の鍵も要らず、**市場が組める**。

参照実装: b-open-io/1sat-sdk `packages/templates/src/ordlock/ordlock.ts` の
`cancelListing` / `purchaseListing`。
"""

from __future__ import annotations

from typing import Optional, Sequence

from listing.ordlock.v1.artifact import CANCEL_SELECTOR, PURCHASE_SELECTOR
from listing.ordlock.v2.script import _read_push, build_output, encode_push

# preimage の固定長部分（version 4 + hashPrevouts 32 + hashSequence 32 +
# outpoint 36 + satoshis 8 + sequence 4 + hashOutputs 32 + locktime 4 + sighash 4）
PREIMAGE_FIXED_LENGTH = 156

# `<sig(最大73B)> <pubkey(33B)> OP_1`
CANCEL_UNLOCK_MAX_BYTES = 1 + 73 + 1 + 33 + 1


def cancel_unlocking_script(signature: bytes, public_key: bytes) -> bytes:
    """売り手の署名と公開鍵から、取り下げの解錠スクリプトを組む。"""
    if not signature:
        raise ValueError('signature is required')
    if len(public_key) not in (33, 65):
        raise ValueError('public key must be 33 or 65 bytes')
    return encode_push(signature) + encode_push(public_key) + bytes([CANCEL_SELECTOR])


def is_cancel_unlocking_script(script: bytes) -> bool:
    """取り下げの形か（`<sig> <pubkey> OP_1` の 3 チャンク）。"""
    if not script or script[-1] != CANCEL_SELECTOR:
        return False
    read = _read_push(script, 0)
    if read is None:
        return False
    signature, size = read
    read = _read_push(script, size)
    if read is None:
        return False
    public_key, size2 = read
    return (size + size2 == len(script) - 1
            and len(public_key) in (33, 65)
            and len(signature) >= 8)


def purchase_unlocking_script(ordinal_output: bytes,
                              trailing_outputs: Optional[bytes],
                              preimage: bytes) -> bytes:
    """
    購入の解錠スクリプト: `<出力0> <出力2以降 | OP_0> <preimage> OP_0`。

    `ordinal_output`   … **出力 0**（買い手が受け取る 1 sat）の直列化
    `trailing_outputs` … **出力 2 以降**を連結した直列化。無ければ None → OP_0
    `preimage`         … `ALL|ANYONECANPAY|FORKID` の preimage

    出力 1（売り手への払い）は渡さない。ロックの中に焼き込まれているものを
    契約が自分で使う＝**価格は改竄できない**。
    """
    if len(ordinal_output) < 9:
        raise ValueError('ordinal output is too short')
    if len(preimage) < PREIMAGE_FIXED_LENGTH:
        raise ValueError(f'preimage is too short ({len(preimage)} bytes)')

    script = encode_push(ordinal_output)
    if trailing_outputs:
        script += encode_push(trailing_outputs)
    else:
        script += bytes([0x00])          # OP_0（「残りは無い」）
    return script + encode_push(preimage) + bytes([PURCHASE_SELECTOR])


def serialize_outputs(outputs: Sequence[tuple[int, bytes]]) -> bytes:
    """`(satoshis, script)` の並びを連結して直列化する（出力 2 以降用）。"""
    return b''.join(build_output(sats, script) for sats, script in outputs)


def is_purchase_unlocking_script(script: bytes) -> bool:
    """購入の形か（4 チャンクで末尾が OP_0）。"""
    if not script or script[-1] != PURCHASE_SELECTOR:
        return False
    cursor = 0
    chunks = 0
    while cursor < len(script) - 1:
        if script[cursor] == 0x00:       # OP_0（残りの出力が無いとき）
            cursor += 1
            chunks += 1
            continue
        read = _read_push(script, cursor)
        if read is None:
            return False
        _, size = read
        cursor += size
        chunks += 1
    return chunks == 3 and cursor == len(script) - 1


def estimate_purchase_unlock_length(locking_script: bytes,
                                    trailing_outputs_bytes: int = 0) -> int:
    """
    購入の解錠スクリプトの長さの見積もり。

    preimage は scriptCode（= ロックスクリプト全体）を丸ごと含むので、
    **解錠だけで 1 KB 近い**。見積もりから漏らすと ARC が
    "Fees are insufficient" で弾く（v2 で踏んだ）。
    """
    preimage_len = (PREIMAGE_FIXED_LENGTH + _varint_len(len(locking_script))
                    + len(locking_script))
    ordinal_out = 8 + 1 + 25              # 1 sat の P2PKH を想定
    size = len(encode_push(b'\x00' * ordinal_out))
    size += (len(encode_push(b'\x00' * trailing_outputs_bytes))
             if trailing_outputs_bytes else 1)
    size += len(encode_push(b'\x00' * preimage_len)) + 1
    return size


def _varint_len(value: int) -> int:
    if value < 0xfd:
        return 1
    if value <= 0xffff:
        return 3
    if value <= 0xffffffff:
        return 5
    return 9
