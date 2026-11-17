"""
market の API 共通層。

エンベロープは BE の Non-Custodial API と同形（documents/Specification.md §6）:

    成功: {"status": "success", "data": {...}}
    失敗: {"status": "error", "error": {"code": "...", "message": "..."}}

FE の `unwrap()` がそのまま使えることが契約なので、**失敗も必ずこの形で返す**。
DRF が自前で返す 401/403/404/429/500 も exception_handler で同じ形に揃える。
"""

from yp_marketplace.api.envelope import error, from_exception, success
from yp_marketplace.api.errors import ErrorCode, MarketError

__all__ = ['success', 'error', 'from_exception', 'MarketError', 'ErrorCode']
