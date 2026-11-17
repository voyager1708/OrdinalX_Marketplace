"""
market のエラーコード（documents/Specification.md §6）。

BE の `NonCustodialError` と同じ作法: 例外がコードと HTTP status を自分で持ち、
view は `from_exception()` に渡すだけ。文字列をその場で書かないのは、
FE が code で分岐する（message は表示用）ため。
"""

from __future__ import annotations

from typing import Optional


class ErrorCode:
    """FE が分岐に使う安定した識別子。文字列リテラルを view に散らさない。"""

    # 入力
    INVALID_REQUEST = 'INVALID_REQUEST'
    MISSING_PARAMETER = 'MISSING_PARAMETER'
    NOT_FOUND = 'NOT_FOUND'

    # 認証・認可（§7）
    UNAUTHENTICATED = 'UNAUTHENTICATED'
    INTROSPECTION_FAILED = 'INTROSPECTION_FAILED'
    FORBIDDEN = 'FORBIDDEN'
    # dev 環境で作成・出品が allowlist に無い principal（§13.3）
    NOT_ALLOWED_IN_DEV = 'NOT_ALLOWED_IN_DEV'

    # テンプレート（§5・BE の NC と同じ TTL 300 秒）
    TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND'
    TEMPLATE_EXPIRED = 'TEMPLATE_EXPIRED'
    TEMPLATE_ALREADY_CONSUMED = 'TEMPLATE_ALREADY_CONSUMED'
    TEMPLATE_MISMATCH = 'TEMPLATE_MISMATCH'

    # 出品・購入（§5 の競合制御）
    ALREADY_LISTED = 'ALREADY_LISTED'
    LISTING_NOT_ACTIVE = 'LISTING_NOT_ACTIVE'
    NOT_OWNER = 'NOT_OWNER'
    PURCHASE_IN_PROGRESS = 'PURCHASE_IN_PROGRESS'
    PRICE_MISMATCH = 'PRICE_MISMATCH'

    # 作成（§9）
    WORK_NOT_FOUND = 'WORK_NOT_FOUND'
    WORK_NOT_MINTABLE = 'WORK_NOT_MINTABLE'
    MANIFEST_INVALID = 'MANIFEST_INVALID'
    CONTENT_TOO_LARGE = 'CONTENT_TOO_LARGE'
    STAGING_FULL = 'STAGING_FULL'
    APPROVAL_REQUIRED = 'APPROVAL_REQUIRED'

    # 事後ガード（§9.1）
    CONTENT_BLOCKED = 'CONTENT_BLOCKED'
    KEY_REVOKED = 'KEY_REVOKED'

    # チェーン・手数料
    BROADCAST_FAILED = 'BROADCAST_FAILED'
    FEE_WALLET_INSUFFICIENT = 'FEE_WALLET_INSUFFICIENT'
    FEE_LIMIT_EXCEEDED = 'FEE_LIMIT_EXCEEDED'

    # 共通
    RATE_LIMITED = 'RATE_LIMITED'
    UPSTREAM_ERROR = 'UPSTREAM_ERROR'
    INTERNAL_ERROR = 'INTERNAL_ERROR'


class MarketError(Exception):
    """market のサービス層の基底例外。コードと HTTP status を自分で運ぶ。"""

    error_code = ErrorCode.INTERNAL_ERROR
    status_code = 400

    def __init__(
        self,
        message: str = '',
        error_code: Optional[str] = None,
        status_code: Optional[int] = None,
    ):
        super().__init__(message or (error_code or self.error_code))
        if error_code:
            self.error_code = error_code
        if status_code:
            self.status_code = status_code


class InvalidRequestError(MarketError):
    error_code = ErrorCode.INVALID_REQUEST
    status_code = 400


class NotFoundError(MarketError):
    error_code = ErrorCode.NOT_FOUND
    status_code = 404


class UnauthenticatedError(MarketError):
    error_code = ErrorCode.UNAUTHENTICATED
    status_code = 401


class ForbiddenError(MarketError):
    error_code = ErrorCode.FORBIDDEN
    status_code = 403


class TemplateExpiredError(MarketError):
    error_code = ErrorCode.TEMPLATE_EXPIRED
    status_code = 410


class AlreadyListedError(MarketError):
    error_code = ErrorCode.ALREADY_LISTED
    status_code = 409


class PurchaseInProgressError(MarketError):
    """二重購入。負けた側には即リトライ可を返す（§5）。"""

    error_code = ErrorCode.PURCHASE_IN_PROGRESS
    status_code = 409


class ContentBlockedError(MarketError):
    """運営 blocklist に当たった（§9.1）。一覧・詳細・サムネ・parts[] を止める。"""

    error_code = ErrorCode.CONTENT_BLOCKED
    status_code = 451


class UpstreamError(MarketError):
    """BE / ARC / WoC の失敗。market 自身のバグと区別して返す。"""

    error_code = ErrorCode.UPSTREAM_ERROR
    status_code = 502
