"""
DRF の例外を market のエンベロープに揃える（documents/Specification.md §6・§15）。

view が拾い損ねた例外や、DRF が自分で返す 401/403/404/405/429 も
`{"status":"error","error":{"code","message"}}` で出す。FE の `unwrap()` は
status キーだけを見るので、ここが抜けると「成功でも失敗でもない JSON」が届く。
"""

from __future__ import annotations

import logging

from django.core.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import exceptions
from rest_framework.views import exception_handler as drf_exception_handler

from yp_marketplace.api.errors import ErrorCode, MarketError

logger = logging.getLogger('market.api')

# DRF の例外 → market のエラーコード
_DRF_CODE_MAP = {
    exceptions.ParseError: ErrorCode.INVALID_REQUEST,
    exceptions.ValidationError: ErrorCode.INVALID_REQUEST,
    exceptions.AuthenticationFailed: ErrorCode.UNAUTHENTICATED,
    exceptions.NotAuthenticated: ErrorCode.UNAUTHENTICATED,
    exceptions.PermissionDenied: ErrorCode.FORBIDDEN,
    exceptions.NotFound: ErrorCode.NOT_FOUND,
    exceptions.MethodNotAllowed: ErrorCode.INVALID_REQUEST,
    exceptions.NotAcceptable: ErrorCode.INVALID_REQUEST,
    exceptions.UnsupportedMediaType: ErrorCode.INVALID_REQUEST,
    exceptions.Throttled: ErrorCode.RATE_LIMITED,
}


def _message_from(detail) -> str:
    """DRF の detail（str / list / dict / ErrorDetail）を 1 行の message にする。"""
    if isinstance(detail, dict):
        parts = []
        for key, value in detail.items():
            parts.append(f'{key}: {_message_from(value)}')
        return '; '.join(parts)
    if isinstance(detail, (list, tuple)):
        return '; '.join(_message_from(v) for v in detail)
    return str(detail)


def exception_handler(exc, context):
    # サービス層の例外はコードと status を自分で持っている
    if isinstance(exc, MarketError):
        from yp_marketplace.api.envelope import from_exception
        return from_exception(exc)

    # Django 側の例外は DRF が APIException に翻訳してくれる
    if isinstance(exc, Http404):
        exc = exceptions.NotFound()
    elif isinstance(exc, PermissionDenied):
        exc = exceptions.PermissionDenied()

    response = drf_exception_handler(exc, context)
    if response is None:
        # 想定外の例外。詳細はログに残し、外には INTERNAL_ERROR だけ返す
        # （スタックやパスを本文に出さない）。
        # exc_info に例外を渡す（except 節の外なので logger.exception では何も出ない）
        logger.error('unhandled exception in %s', context.get('view'), exc_info=exc)
        from yp_marketplace.api.envelope import error
        return error('internal server error', ErrorCode.INTERNAL_ERROR, 500)

    error_code = ErrorCode.INTERNAL_ERROR
    for exc_class, code in _DRF_CODE_MAP.items():
        if isinstance(exc, exc_class):
            error_code = code
            break

    message = _message_from(getattr(exc, 'detail', None) or str(exc))
    response.data = {
        'status': 'error',
        'error': {'code': error_code, 'message': message},
    }
    return response
