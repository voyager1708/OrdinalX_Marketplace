"""
公開 EP（documents/Specification.md §6）。

Phase 1 は **書き込みなし**。出品・購入（draft / submit）は Phase 2 で、
端末の意図検証（§8.4）と一緒に入れる。

エンベロープは BE の NC と同形。view は `yp_marketplace.api` の
success/error だけを通して返す（dict を直に組むと FE の unwrap() が落ちる）。
"""

from __future__ import annotations

import base64
from datetime import datetime, timezone

from django.db.models import Min, Sum
from django.http import HttpResponse
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from chain.models import NftCache
from listing.models import Listing, ListingStatus, PurchaseStatus
from listing.queries import blocked_origins, sorted_listings, visible_listings
from listing.serializers import ListingSerializer, StatsSerializer
from yp_marketplace.api import ErrorCode, error, success
from yp_marketplace.api.throttles import MarketPublicRateThrottle, MarketThumbRateThrottle

DEFAULT_PAGE_SIZE = 24
MAX_PAGE_SIZE = 100


def _encode_cursor(listing: Listing, sort: str) -> str:
    """
    カーソルは「最後に返した行の並び順の値 + id」。offset を使わない
    （板は出品と成約で動くので、offset だと行が飛んだり重複したりする）。
    """
    key = listing.created_at.isoformat() if sort == 'new' else str(listing.price_satoshis)
    raw = f'{key}|{listing.id}'.encode()
    return base64.urlsafe_b64encode(raw).decode().rstrip('=')


def _decode_cursor(cursor: str) -> tuple[str, int] | None:
    try:
        padded = cursor + '=' * (-len(cursor) % 4)
        key, _, raw_id = base64.urlsafe_b64decode(padded).decode().rpartition('|')
        return key, int(raw_id)
    except (ValueError, UnicodeDecodeError):
        return None


class PublicAPIView(APIView):
    """公開 EP の共通設定。集客のため**ログイン前でも見せる**（§6）。"""

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [MarketPublicRateThrottle]


class ListingListAPIView(PublicAPIView):
    @extend_schema(
        summary='板の一覧',
        description='出品中の NFT を返す。ログイン不要。'
                    'MARKET_ENV と運営 blocklist で絞った結果だけが出る。',
        tags=['market'],
        parameters=[
            OpenApiParameter('status', str, description='既定は active'),
            OpenApiParameter('sort', str, description='new（既定）| price | price_desc'),
            OpenApiParameter('cursor', str, description='前回の応答の next_cursor'),
            OpenApiParameter('limit', int, description=f'既定 {DEFAULT_PAGE_SIZE}・最大 {MAX_PAGE_SIZE}'),
        ],
    )
    def get(self, request):
        status = request.query_params.get('status') or ListingStatus.ACTIVE
        if status not in ListingStatus.values:
            return error(f'unknown status: {status}', ErrorCode.INVALID_REQUEST, 400)

        sort = request.query_params.get('sort') or 'new'
        try:
            limit = min(int(request.query_params.get('limit') or DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
        except ValueError:
            return error('limit must be an integer', ErrorCode.INVALID_REQUEST, 400)
        if limit < 1:
            return error('limit must be positive', ErrorCode.INVALID_REQUEST, 400)

        queryset = sorted_listings(visible_listings(status), sort)

        cursor = request.query_params.get('cursor')
        if cursor:
            decoded = _decode_cursor(cursor)
            if decoded is None:
                return error('malformed cursor', ErrorCode.INVALID_REQUEST, 400)
            key, last_id = decoded
            if sort == 'new':
                try:
                    moment = datetime.fromisoformat(key)
                except ValueError:
                    return error('malformed cursor', ErrorCode.INVALID_REQUEST, 400)
                if moment.tzinfo is None:
                    moment = moment.replace(tzinfo=timezone.utc)
                queryset = queryset.filter(created_at__lte=moment).exclude(id__gte=last_id,
                                                                          created_at=moment)
            else:
                queryset = queryset.filter(price_satoshis__gte=key).exclude(
                    id__lte=last_id, price_satoshis=key)

        rows = list(queryset[:limit + 1])
        has_more = len(rows) > limit
        rows = rows[:limit]

        return success({
            'listings': ListingSerializer(rows, many=True).data,
            'next_cursor': _encode_cursor(rows[-1], sort) if (has_more and rows) else None,
        })


class ListingDetailAPIView(PublicAPIView):
    @extend_schema(summary='板の 1 件', tags=['market'])
    def get(self, request, listing_id: int):
        listing = visible_listings(status='').filter(id=listing_id).first()
        if listing is None:
            # blocklist に当たったものも「無い」として扱う（存在を漏らさない）
            return error('listing not found', ErrorCode.NOT_FOUND, 404)
        return success({'listing': ListingSerializer(listing).data})


class NftThumbAPIView(PublicAPIView):
    """
    サムネイル（§7.5・§14-6）。

    バイト列は DB に持つ（BE と違って /media を配らない）。運営 blocklist に
    当たるものは**サムネも返さない**。
    """

    throttle_classes = [MarketThumbRateThrottle]

    @extend_schema(summary='NFT のサムネイル', tags=['market'])
    def get(self, request, origin: str):
        if origin in blocked_origins():
            return error('not found', ErrorCode.NOT_FOUND, 404)

        cache_row = NftCache.objects.filter(nft_origin=origin).first()
        if cache_row is None or not cache_row.thumb:
            return error('no thumbnail for this nft', ErrorCode.NOT_FOUND, 404)

        # LRU の基準（§5「総量上限と LRU を最初から」）
        NftCache.objects.filter(pk=cache_row.pk).update(last_used_at=_now())

        return HttpResponse(bytes(cache_row.thumb),
                            content_type=cache_row.content_type or 'image/webp')


def _now():
    from django.utils import timezone as dj_timezone
    return dj_timezone.now()


class StatsAPIView(PublicAPIView):
    @extend_schema(summary='板の統計', tags=['market'], responses=StatsSerializer)
    def get(self, request):
        from listing.models import Purchase

        active = visible_listings()
        confirmed = Purchase.objects.filter(
            market_env=_market_env(), status=PurchaseStatus.CONFIRMED)

        data = {
            'active_listings': active.count(),
            'total_volume_satoshis': confirmed.aggregate(total=Sum('paid_satoshis'))['total'] or 0,
            'sold_count': confirmed.count(),
            'floor_price_satoshis': active.aggregate(floor=Min('price_satoshis'))['floor'],
        }
        return success(StatsSerializer(data).data)


def _market_env() -> str:
    from django.conf import settings
    return settings.MARKET_ENV
