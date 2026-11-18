"""
BE への読み書き（documents/Specification.md §3・§8.2）。

market は **BE の DB に触らない**。叩くのは BE の API だけで、結線は
`BE_API_BASE_URL` 1 本に閉じる（docker のネットワーク名・コンテナ名・IP を
コードに書かない。§13.4-5）。

利用者の Bearer トークンを**そのまま中継する**。market は BE に対して
「その利用者の代理」として振る舞うので、market 自身の資格情報は持たない。
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional

import requests
from django.conf import settings

from yp_marketplace.api.errors import ErrorCode, MarketError, UpstreamError

logger = logging.getLogger('market.be')

NFT_TEMPLATE_PATH = '/api/v1/nc/nft/template/'
BROADCAST_PATH = '/api/v1/nc/transaction/broadcast/'
USER_NFTS_PATH = '/api/v1/user/nfts/info'

TIMEOUT_SECONDS = 30
# 放送は ARC の応答待ちが入る。BE 側は ARC_CALLBACK_URL が未設定だと
# 同期ポーリングで 60 秒超かかることがある（BE で踏んだ罠）
BROADCAST_TIMEOUT_SECONDS = 180


class BackendClient:
    """BE の NC API を叩く。応答のエンベロープは BE の NC と同形。"""

    def __init__(self, token: str):
        self.token = token
        base = (settings.BE_API_BASE_URL or '').rstrip('/')
        if not base:
            raise UpstreamError('BE_API_BASE_URL is not configured')
        self.base = base

    # -- 読み取り -------------------------------------------------------
    def list_nfts(self) -> Any:
        """利用者が持つ NFT の一覧（所有確認の速い経路。§7）。"""
        return self._get(USER_NFTS_PATH)

    # -- テンプレート ---------------------------------------------------
    def nft_script_template(self, nft_origin: str, recipient_locking_script: str,
                            fee_rate_satoshi_per_kb: Optional[int] = None) -> Dict[str, Any]:
        """
        ordinal を**任意のロックスクリプト**へ移す未署名テンプレート（S010）。

        出品はこれで OrdLock へ移す。BE はスクリプトの意味を判定しないので、
        **正しい OrdLock かどうかは端末が検証する**（§8.4）。
        """
        payload: Dict[str, Any] = {
            'nft_origin': nft_origin,
            'recipient_locking_script': recipient_locking_script,
        }
        if fee_rate_satoshi_per_kb:
            payload['fee_rate_satoshi_per_kb'] = fee_rate_satoshi_per_kb
        return self._post(NFT_TEMPLATE_PATH, payload)

    # -- 放送 -----------------------------------------------------------
    def broadcast(self, template_id: str, signed_transaction_hex: str) -> Dict[str, Any]:
        return self._post(BROADCAST_PATH, {
            'template_id': template_id,
            'signed_transaction_hex': signed_transaction_hex,
        }, timeout=BROADCAST_TIMEOUT_SECONDS)

    # -- 下回り ---------------------------------------------------------
    def _headers(self) -> Dict[str, str]:
        return {'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'}

    def _get(self, path: str) -> Any:
        return self._handle(lambda: requests.get(
            f'{self.base}{path}', headers=self._headers(), timeout=TIMEOUT_SECONDS), path)

    def _post(self, path: str, payload: Dict[str, Any],
              timeout: int = TIMEOUT_SECONDS) -> Any:
        return self._handle(lambda: requests.post(
            f'{self.base}{path}', headers=self._headers(), json=payload, timeout=timeout), path)

    def _handle(self, call, path: str) -> Any:
        try:
            response = call()
        except requests.RequestException as exc:
            # トークンはログに書かない（§14-5）
            logger.warning('BE %s unreachable: %s', path, exc.__class__.__name__)
            raise UpstreamError('could not reach the backend') from None

        if response.status_code == 401:
            raise MarketError('the backend rejected the token',
                              ErrorCode.UNAUTHENTICATED, 401)

        try:
            body = response.json()
        except ValueError:
            logger.warning('BE %s returned a non-JSON body (status=%s)',
                           path, response.status_code)
            raise UpstreamError('the backend returned a non-JSON body') from None

        # BE の NC は {"status": "...", "data"|"error": {...}}
        if isinstance(body, dict) and body.get('status') == 'error':
            err = body.get('error') or {}
            raise UpstreamError(
                f"backend refused: {err.get('message') or 'unknown error'} "
                f"({err.get('code') or '-'})")
        if response.status_code >= 400:
            raise UpstreamError(f'backend returned HTTP {response.status_code}')

        if isinstance(body, dict) and 'data' in body:
            return body['data']
        return body
