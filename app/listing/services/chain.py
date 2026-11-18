"""
チェーンへの出入り（documents/Specification.md §11・§12）。

市場が自分で tx を出す経路はキャンセルと本体チャンクの 2 つで、どちらも
**市場の fee wallet が払う**（§10）。鍵は env だけから読み、コードにも DB にも
埋めない（§12）。
"""

from __future__ import annotations

import json
import logging
import math
import time
from typing import Any, Dict, List, Optional

import requests
from django.conf import settings

from yp_marketplace.api.errors import ErrorCode, MarketError, UpstreamError

logger = logging.getLogger('market.chain')

WOC_BASE = 'https://api.whatsonchain.com/v1/bsv/main'
# WoC の公開 API は素で叩くと 429 が返る
WOC_RETRIES = 5
WOC_BACKOFF_SECONDS = 6

FEE_PER_KB = 100          # ARC の miningFee（実測: 100 sat / 1000 bytes）
DUST_LIMIT = 135


class FeeWalletError(MarketError):
    error_code = ErrorCode.FEE_WALLET_INSUFFICIENT
    status_code = 503


def fee_wallet_key():
    """市場の fee wallet（§12。鍵は env だけから）。"""
    from bsv import PrivateKey

    wif = (getattr(settings, 'MARKET_FEE_WALLET_WIF', '') or '').strip()
    if not wif:
        raise FeeWalletError('MARKET_FEE_WALLET_WIF is not configured')
    return PrivateKey(wif)


def _woc(path: str) -> requests.Response:
    last = None
    for attempt in range(WOC_RETRIES):
        last = requests.get(f'{WOC_BASE}{path}', timeout=60)
        if last.status_code != 429:
            return last
        time.sleep(WOC_BACKOFF_SECONDS * (attempt + 1))
    raise UpstreamError('WhatsOnChain keeps returning 429')


def fee_utxos(address: str) -> List[Dict[str, Any]]:
    response = _woc(f'/address/{address}/unspent')
    if response.status_code >= 400:
        raise UpstreamError(f'could not list utxos (HTTP {response.status_code})')
    return sorted(response.json(), key=lambda row: row['value'])


def raw_tx(txid: str) -> str:
    response = _woc(f'/tx/{txid}/hex')
    if response.status_code >= 400:
        raise UpstreamError(f'could not fetch tx {txid[:12]}… (HTTP {response.status_code})')
    return response.text.strip()


def pick_fee_utxo(address: str, needed_satoshis: int) -> Dict[str, Any]:
    """手数料を賄える UTXO を 1 本選ぶ。足りなければ **503 で止める**（§10）。"""
    rows = fee_utxos(address)
    chosen = next((row for row in rows if row['value'] >= needed_satoshis), None)
    if chosen is None:
        biggest = rows[-1]['value'] if rows else 0
        raise FeeWalletError(
            f'market fee wallet cannot cover {needed_satoshis} sat '
            f'(largest utxo {biggest} sat). Top it up before retrying.')
    return chosen


def estimate_fee(size_bytes: int) -> int:
    return math.ceil(size_bytes / 1000) * FEE_PER_KB


def broadcast(raw_hex: str) -> str:
    """ARC へ出す。受理されなければ理由ごと失敗させる。"""
    arc_url = (settings.ARC_URL or '').strip()
    if not arc_url:
        raise UpstreamError('ARC_URL is not configured')

    headers = {'Content-Type': 'application/json'}
    token = (settings.ARC_TOKEN or '').strip()
    if token:
        headers['Authorization'] = f'Bearer {token}'

    try:
        response = requests.post(f'{arc_url.rstrip("/")}/v1/tx', headers=headers,
                                 data=json.dumps({'rawTx': raw_hex}), timeout=180)
    except requests.RequestException as exc:
        logger.warning('ARC unreachable: %s', exc.__class__.__name__)
        raise UpstreamError('could not reach ARC') from None

    try:
        body = response.json()
    except ValueError:
        body = {}

    if response.status_code >= 300:
        detail = body.get('detail') or body.get('title') or f'HTTP {response.status_code}'
        raise MarketError(f'ARC refused the transaction: {detail}',
                          ErrorCode.BROADCAST_FAILED, 502)

    txid = body.get('txid')
    if not txid:
        raise MarketError('ARC accepted the transaction but returned no txid',
                          ErrorCode.BROADCAST_FAILED, 502)
    logger.info('ARC accepted %s (%s)', txid[:16], body.get('txStatus'))
    return txid
