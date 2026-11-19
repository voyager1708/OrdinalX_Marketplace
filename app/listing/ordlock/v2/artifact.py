"""
OrdLock v2 のコンパイル済みテンプレート（Spike 0 ②の素材）。

**ここは書き換えない。** Rúnar コンパイラの出力そのもので、1 バイトでも違うと
出品が外部の 1Sat マーケットから見えなくなる（prefix が一致しなくなる）か、
最悪ロックが解けなくなる。

出どころ: b-open-io/1sat-sdk の
`packages/types/src/contracts/OrdLockV2Batch.json`（contractName
`OrdLockV2Batch` / compilerVersion `1.0.0-rc.1-go` / build 2026-09-12）。
完全性は SHA-256 で照合する（下の TEMPLATE_SHA256。参照実装のテストと同じ値）。
"""

# 472 バイト。constructor のスロット位置に OP_0 のプレースホルダが入っている
TEMPLATE_HEX = (
    '76009c637576ab76aa517f517f517f517f517f517f517f517f517f517f517f517f517f51'
    '7f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c'
    '7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c'
    '7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01007e8100011f80517e93'
    '21414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff007d97'
    '785296789f527952798d9495937776927f76927f76927f76927f76927f76927f76927f76'
    '927f76927f76927f76927f76927f76927f76927f76927f76927f76927f76927f76927f76'
    '927f76927f76927f76927f76927f76927f76927f76927f76927f76927f76927f76927f7c'
    '7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c'
    '7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e827c7e23022079be667ef9'
    'dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798027c7e827c7e01307c'
    '7e01c37e2102b405d7f0322a89d0f9f3a98e6f938fdc1c969a8d1382a2bf66a71ae74a1e'
    '83b0ad6900aa7c820128947f7701207f758767519d7b0a6f6c323a63616e63656c8876a9'
    '0088ac68'
)

TEMPLATE_SHA256 = '629c4c60d1ab45d087cae67eefecdad91dc453b58f1ba757a0363194ff05a8b7'

# constructor のスロット（artifact の constructorSlots そのまま）。
#   paramIndex 0 = seller（20 バイトの PKH。キャンセルできる鍵）
#   paramIndex 1 = payOutput（直列化した支払い出力）
SLOTS = (
    {'param_index': 1, 'byte_offset': 436},
    {'param_index': 0, 'byte_offset': 468},
)

# 認識用の prefix（最初のスロットより前）。どの出品でも同一なので、
# これで「v2 の出品かどうか」を判定できる
PREFIX_HEX = TEMPLATE_HEX[:436 * 2]

# キャンセルの unlock が先頭に積むマーカー（ASCII "ol2:cancel"）
# OP_CODESEPARATOR の位置（購入の枝の中、2 つのスロットより前）。
# 購入の preimage の scriptCode は **ここより後ろ全部**（参照実装 `purchaseListing`）。
# 参照実装の artifact の `codeSeparatorIndex` と同じ値。
CODESEP_INDEX = 6

CANCEL_MARKER = bytes.fromhex('6f6c323a63616e63656c')
