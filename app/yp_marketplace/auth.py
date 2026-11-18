"""
認証（documents/Specification.md §7）。

方式は**トークン委譲 + BE へのイントロスペクション**で、BE は無改造。

    ブラウザ → FE の /auth/bff/token で BE の access token を取る
    ブラウザ → market に Authorization: Bearer <BE の access token>
    market   → BE の /api/v1/user/info に同じ Bearer を中継
               200 なら本人確定、401 ならそのまま 401

**JWT をローカル検証しない**。BE の SIMPLE_JWT は HS256 で署名鍵が SECRET_KEY
なので、market に配ると market が任意ユーザーのトークンを偽造できる（BE の
信頼境界を壊す）。将来 BE が RS256 + JWKS を出せるようになったら差し替えられる
よう、`TokenVerifier` で抽象化しておく。

⚠ 仕様との食い違い（2026-11-18 に実測）
    §7 は「200 → principal = data.id」と書いているが、**BE の
    `/api/v1/user/info` は id を返さない**（email / paymail / profile_picture /
    username / profile_picture_data だけ。FE も同じ事実に当たっている）。
    そこで principal は**同じトークンの `user_id` クレーム**から取る。
    署名は検証しない（できない）が、**有効性は BE の 200 が担保している**:
    BE はそのトークンの user_id からユーザーを引いて 200 を返したのだから、
    同じトークンの user_id は BE が認めた本人に他ならない。
    BE が id を返すようになったら、そちらを優先する（下の `_principal_id`）。
"""

from __future__ import annotations

import base64
import binascii
import json
import logging
from dataclasses import dataclass
from typing import Any, Dict, Optional

import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework import authentication

from yp_marketplace.api.errors import ErrorCode, MarketError

logger = logging.getLogger('market.auth')

# BE の読み取り EP。**固定 URL のみ**（SSRF 対策。リクエスト由来の値を混ぜない）
INTROSPECTION_PATH = '/api/v1/user/info'


class IntrospectionError(MarketError):
    error_code = ErrorCode.INTROSPECTION_FAILED
    status_code = 401


@dataclass(frozen=True)
class Principal:
    """イントロスペクションで確定した「誰か」。market はこれ以外を信じない。"""

    be_user_id: int
    username: str = ''
    paymail: str = ''
    account_type: str = ''
    profile_picture_url: str = ''

    @property
    def id(self) -> int:
        return self.be_user_id


def _jwt_payload(token: str) -> Dict[str, Any]:
    """
    JWT の payload を**検証せずに**読む。

    署名は見ない（見てはいけない。鍵を持つと BE の信頼境界を壊す）。
    ここで読んだ値を信じてよいのは、**同じトークンで BE が 200 を返したとき**だけ。
    """
    parts = token.split('.')
    if len(parts) != 3:
        return {}
    body = parts[1]
    body += '=' * (-len(body) % 4)          # base64url のパディングを戻す
    try:
        return json.loads(base64.urlsafe_b64decode(body))
    except (ValueError, binascii.Error):
        return {}


def _principal_id(info: Dict[str, Any], claims: Dict[str, Any]) -> Optional[int]:
    """principal（= BE の user id）を決める。BE が id を返すならそちらが優先。"""
    for source in (info.get('id'), claims.get('user_id')):
        if source is None:
            continue
        try:
            return int(source)
        except (TypeError, ValueError):
            continue
    return None


class TokenVerifier:
    """トークン → Principal。差し替え可能にしておく（§7 の将来の RS256 対応）。"""

    def verify(self, token: str) -> Principal:
        raise NotImplementedError


class BEIntrospectionVerifier(TokenVerifier):
    """BE の読み取り EP に中継して本人を確定する。"""

    timeout_seconds = 10

    def verify(self, token: str) -> Principal:
        claims = _jwt_payload(token)
        jti = str(claims.get('jti') or '')
        exp = str(claims.get('exp') or '')

        # (jti, exp) 単位でキャッシュする（§7。既定 60 秒）。
        # トークンそのものはキーにしない（キャッシュに秘密を置かないため）。
        cache_key = f'market:introspect:{jti}:{exp}' if jti else None
        if cache_key:
            cached = cache.get(cache_key)
            if cached is not None:
                return Principal(**cached)

        info = self._introspect(token, jti)
        principal_id = _principal_id(info, claims)
        if principal_id is None:
            # BE は本人と認めたが、どの id かが分からない状態。黙って通さない。
            logger.warning('introspection ok but no principal id (jti=%s)', jti[:8])
            raise IntrospectionError('could not determine the principal')

        principal = Principal(
            be_user_id=principal_id,
            username=str(info.get('username') or ''),
            paymail=str(info.get('paymail') or ''),
            # BE の user/info は account_type を返さない。空＝不明のまま扱う
            # （キットは不明ならラベルを出さない作りになっている）
            account_type=str(info.get('account_type') or ''),
            profile_picture_url=str(info.get('profile_picture') or ''),
        )

        if cache_key:
            cache.set(cache_key, principal.__dict__,
                      settings.BE_INTROSPECTION_CACHE_SECONDS)
        return principal

    def _introspect(self, token: str, jti: str) -> Dict[str, Any]:
        base = (settings.BE_API_BASE_URL or '').rstrip('/')
        if not base:
            raise IntrospectionError('BE_API_BASE_URL is not configured')

        try:
            response = requests.get(
                f'{base}{INTROSPECTION_PATH}',
                headers={'Authorization': f'Bearer {token}'},
                timeout=self.timeout_seconds,
            )
        except requests.RequestException as exc:
            # トークンはログに書かない（§14-5。出すのは jti の先頭 8 文字だけ）
            logger.warning('introspection failed (jti=%s): %s', jti[:8], exc.__class__.__name__)
            raise IntrospectionError('could not reach the backend') from None

        if response.status_code == 401:
            raise IntrospectionError('the token was rejected by the backend')
        if response.status_code != 200:
            logger.warning('introspection status=%s (jti=%s)', response.status_code, jti[:8])
            raise IntrospectionError('the backend did not accept the token')

        try:
            data = response.json()
        except ValueError:
            raise IntrospectionError('the backend returned a non-JSON body') from None

        # BE は {…} をそのまま返す（NC のエンベロープではない）が、
        # 将来どちらでも読めるようにしておく
        if isinstance(data, dict) and 'data' in data and isinstance(data['data'], dict):
            data = data['data']
        if isinstance(data, list):
            data = data[0] if data else {}
        return data if isinstance(data, dict) else {}


_verifier: Optional[TokenVerifier] = None


def get_verifier() -> TokenVerifier:
    global _verifier
    if _verifier is None:
        _verifier = BEIntrospectionVerifier()
    return _verifier


def set_verifier(verifier: Optional[TokenVerifier]) -> None:
    """テストと、将来の差し替え（RS256 + JWKS）のための注入点。"""
    global _verifier
    _verifier = verifier


class BearerIntrospectionAuthentication(authentication.BaseAuthentication):
    """
    DRF の認証クラス。`Authorization: Bearer <BE の access token>` を受ける。

    成功すると `request.user` は accounts の**投影**（BE が正）になり、
    `request.auth` は Principal になる。認証を要求しない EP（公開一覧など）は
    ヘッダが無ければ素通りする。
    """

    keyword = 'Bearer'

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).split()
        if not header or header[0].lower() != self.keyword.lower().encode():
            return None
        if len(header) != 2:
            raise IntrospectionError('malformed Authorization header')

        token = header[1].decode()
        principal = get_verifier().verify(token)

        from accounts.models import User
        user = User.objects.upsert_projection(
            be_user_id=principal.be_user_id,
            username=principal.username or f'be:{principal.be_user_id}',
            paymail=principal.paymail,
            account_type=principal.account_type,
        )
        request.market_principal = principal
        return (user, principal)

    def authenticate_header(self, request):
        return self.keyword
