"""
モデルの既定値を env から取るための callable。

`default=settings.MARKET_ENV` のように**値**を書くと、makemigrations が
その時点の文字列を migration に焼き込み、環境ごとに「変更が検出されました」と
言われる。callable にしておけば migration には関数参照だけが入る。
"""

from django.conf import settings


def current_market_env() -> str:
    """§13.3 の環境分離。板の問い合わせは常にこれで絞る。"""
    return settings.MARKET_ENV


def default_chunk_bytes() -> int:
    """本体チャンクの大きさ（§9。既定 4 MB/tx）。"""
    return settings.WORK_CHUNK_BYTES


def default_fee_bps() -> int:
    """市場手数料（§10。既定 250 = 2.5%）。Listing に固定して持つ。"""
    return settings.MARKET_FEE_BPS
