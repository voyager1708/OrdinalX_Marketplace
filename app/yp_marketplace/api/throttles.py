"""
throttle（documents/Specification.md §6）。

BE の NC に合わせて **draft は緩め・submit は厳しめ**。rate は settings の
DEFAULT_THROTTLE_RATES 側にだけ書く（値を 2 箇所に持たない）。
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class MarketPublicRateThrottle(AnonRateThrottle):
    """公開 EP（一覧・詳細・stats）。未認証でも叩ける（§6）。"""

    scope = 'market_public'


class MarketThumbRateThrottle(AnonRateThrottle):
    """サムネイル。一覧 1 画面で複数回叩かれるので公開 EP より緩い。"""

    scope = 'market_thumb'


class MarketDraftRateThrottle(UserRateThrottle):
    """未署名テンプレートの発行（BE の nc_template 相当）。"""

    scope = 'market_draft'


class MarketSubmitRateThrottle(UserRateThrottle):
    """署名済み tx の受領と放送（BE の nc_broadcast 相当）。厳しめ。"""

    scope = 'market_submit'


class MarketMintRateThrottle(UserRateThrottle):
    """限定 N 点の逐次作成（mint/next・mint/ack）。N 回叩かれる前提。"""

    scope = 'market_mint'


class MarketContentRateThrottle(UserRateThrottle):
    """本体（暗号文）のストリーム。1 回が重いので絞る。"""

    scope = 'market_content'


class MarketTakedownRateThrottle(AnonRateThrottle):
    """申し立ての受付（§9.1）。濫用を抑えるため時間単位で絞る。"""

    scope = 'market_takedown'
