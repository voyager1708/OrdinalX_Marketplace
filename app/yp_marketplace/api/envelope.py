"""
エンベロープの生成（documents/Specification.md §6）。

view はここだけを通して返す。dict を直に組むと BE の NC と形がずれ、
FE の `unwrap()` が落ちる。
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from rest_framework import status as http_status
from rest_framework.response import Response

from yp_marketplace.api.errors import ErrorCode, MarketError


def success(data: Optional[Dict[str, Any]] = None,
            status_code: int = http_status.HTTP_200_OK) -> Response:
    return Response({'status': 'success', 'data': data if data is not None else {}},
                    status=status_code)


def error(message: str,
          error_code: str = ErrorCode.INTERNAL_ERROR,
          status_code: int = 400) -> Response:
    return Response(
        {
            'status': 'error',
            'error': {'code': error_code, 'message': message},
        },
        status=status_code,
    )


def from_exception(exc: MarketError) -> Response:
    return error(str(exc), exc.error_code, exc.status_code)
