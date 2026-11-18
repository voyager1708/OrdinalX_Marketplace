"""
UI キットの利用側（documents/Specification.md §15、キットの CONTRACT.md §5）。

市場はウォレットのシェル（`components/wallet-base.html`）を**プロジェクトを跨いで**
extends する。キットは利用側の URLconf を知らないので、行き先と識別子は
ここから context として供給する契約になっている。これが無いと
`NoReverseMatch` で画面全体が 500 になる。

ウォレットの実パスを文字列で持つのは契約の範囲（同一オリジンで、経路は
nginx の location 1 箇所で決まる）。ホスト名は入れない。
"""

from __future__ import annotations

from typing import Dict

from django.http import HttpRequest

# ウォレット側の実パス（キットの CONTRACT.md §5.2）。
# ウォレットの URL 名は別プロジェクトなので reverse() できない。
WALLET_PATHS = {
    'dashboard': '/view/dashboard',
    'send': '/view/send',
    'receive': '/view/recieve',
    'nfts': '/view/nft_holder',
    'profile': '/view/profile',
    'address_book': '/view/address-book',
    'logout': '/view/auth/logout',
    'nft_count': '/api/v1/nft/count',
}

# 市場の画面。nginx が /market/ をパスごと渡すので、Django 側も market/ 付き。
MARKET_PATH = '/market/'


def kit_context(request: HttpRequest) -> Dict[str, object]:
    """キットのシェルが要求する context を供給する。"""
    urls = dict(WALLET_PATHS)
    urls['market'] = MARKET_PATH

    # 認証（BE へのイントロスペクション）は Phase 1。principal が決まるまでは
    # 空文字で供給する — キットの側は「不明なら出さない」作りになっている
    # （account_type を空にするとラベルを出さない、等）。
    principal = getattr(request, 'market_principal', None)

    return {
        'kit_urls': urls,
        # 市場の画面ではボトムタブの「市場」を点灯させる（属性駆動・CONTRACT.md §5.3）
        'kit_active': 'market',
        # CONTRACT.md §5.1 の 6 変数
        'profile_picture_url': getattr(principal, 'profile_picture_url', '') or '',
        'account_type': getattr(principal, 'account_type', '') or '',
        'is_nc_account': getattr(principal, 'account_type', '') == 'non_custodial',
        'nc_username': getattr(principal, 'username', '') or '',
        'nc_paymail': getattr(principal, 'paymail', '') or '',
        'nc_user_id': str(getattr(principal, 'be_user_id', '') or ''),
    }
