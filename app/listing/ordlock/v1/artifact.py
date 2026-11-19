"""
OrdLock **v1** のスクリプト定数（S018 の決定）。

**ここは書き換えない。** 1Sat Ordinals の OrdLock v1 そのもので、1 バイトでも
違うと出品が外部の 1Sat マーケットから見えなくなるか、最悪ロックが解けなくなる。

出どころ: b-open-io/1sat-sdk の packages/types/src/constants.ts の
ORD_LOCK_PREFIX / ORD_LOCK_SUFFIX（参照実装は packages/templates/src/ordlock/ordlock.ts）。
完全性は SHA-256 で照合する（下の *_SHA256。listing/tests_ordlock_v1.py が毎回見る）。

**なぜ v1 なのか**: 後継の v2（OrdLockV2Batch）は購入の枝が OP_2MUL を必ず実行し、
BSV ではこの命令が無効のままなので **購入 tx が ARC に受理されない**（S018・実機確認）。
v1 のスクリプトには無効な命令が無い。v1 の lock() が止まっているのは**ライブラリの
方針**（OPL-4690）であってチェーンの制約ではないので、定数を vendor して自前で組む。

構成（参照実装のテスト ordlock.test.ts の v1Lock と同じ）::

    locking script = PREFIX || push(売り手 PKH 20B) || push(payOutput) || SUFFIX
    payOutput      = 8 バイト LE の satoshi || varint || 支払い先の script
"""

# 102 バイト。売り手 PKH の push より前（どの出品でも同一なので認識に使える）
PREFIX_HEX = (
    '2097dfd76851bf465e8f715593b217714858bbe9570ff3bd5e33840a34e20ff0262102'
    'ba79df5f8ae7604a9830f03c7933028186aede0675a16f025dc4f8be8eec0382201008'
    'ce7480da41702918d1ec8e6849ba32b4d65b1e40dc669c31a1e6306b266c0000'
)

# 702 バイト。payOutput の push より後ろ
SUFFIX_HEX = (
    '615179547a75537a537a537a0079537a75527a527a7575615579008763567901c16151'
    '7957795779210ac407f0e4bd44bfc207355a778b046225a7068fc59ee7eda43ad905aa'
    'dbffc800206c266b30e6a1319c66dc401e5bd6b432ba49688eecd118297041da8074ce'
    '081059795679615679aa0079610079517f517f517f517f517f517f517f517f517f517f'
    '517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f51'
    '7f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e'
    '7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01'
    '007e81517a75615779567956795679567961537956795479577995939521414136d08c'
    '5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff0051795179615179'
    '5179970079009f63007952799367007968517a75517a75517a7561527a75517a517951'
    '795296a0630079527994527a75517a6853798277527982775379012080517f517f517f'
    '517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f51'
    '7f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e'
    '7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c'
    '7e7c7e7c7e7c7e7c7e7c7e7c7e01205279947f7754537993527993013051797e527e54'
    '797e58797e527e53797e52797e57797e0079517a75517a75517a75517a75517a75517a'
    '75517a75517a75517a75517a75517a75517a75517a756100795779ac517a75517a7551'
    '7a75517a75517a75517a75517a75517a75517a7561517a75517a756169587951797e58'
    '797eaa577961007982775179517958947f7551790128947f77517a75517a7561877777'
    '7777777777777767557951876351795779a9876957795779ac77777777777777776700'
    '6868'
)

PREFIX = bytes.fromhex(PREFIX_HEX)
SUFFIX = bytes.fromhex(SUFFIX_HEX)

PREFIX_SHA256 = '86b0f291096403ced87b8256a0575475143f5ed94646ad5e1f4fdf704c88679e'
SUFFIX_SHA256 = 'a208540ae84c8c389126731c9e69958a778e0bde2c2b4cbb4c1e3fe11973a1ad'

# 分岐のセレクタ（解錠スクリプトの末尾）。参照実装:
#   取り下げ = <sig> <pubkey> OP_1 / 購入 = <out0> <残りの出力|OP_0> <preimage> OP_0
CANCEL_SELECTOR = 0x51      # OP_1
PURCHASE_SELECTOR = 0x00    # OP_0
