"""
板の問い合わせ（documents/Specification.md §6・§9.1・§13.3）。

ここに集めるのは **2 つの絞り込みを 1 箇所に閉じ込める**ため:

1. `market_env` … BE の暫定本番と開発が同じ DB を見ているので、板は必ず
   env で絞る（§13.3「1 つの設定値と 1 つのクエリ絞り込みに閉じ込め、
   ロジックに散らさない」）
2. 運営 blocklist … 一覧・検索・詳細・サムネ・parts[] の返却を止める（§9.1）

view が自分で `Listing.objects.filter(...)` を書き始めたら、この 2 つの
どちらかが必ず抜ける。
"""

from __future__ import annotations

from django.conf import settings
from django.db.models import QuerySet

from listing.models import BlockedContent, BlockedKind, Listing, ListingStatus


def blocked_origins() -> set[str]:
    """運営が止めた nft_origin（§9.1）。"""
    return set(
        BlockedContent.objects.filter(kind=BlockedKind.NFT_ORIGIN)
        .values_list('value', flat=True)
    )


def visible_listings(status: str = ListingStatus.ACTIVE) -> QuerySet[Listing]:
    """
    外に出してよい板。**公開 EP はこれ以外を使わない。**

    - env で絞る（dev の検証で作った出品が本番の板に出ない）
    - blocklist に当たるものを外す
    """
    queryset = Listing.objects.filter(market_env=settings.MARKET_ENV)
    if status:
        queryset = queryset.filter(status=status)
    blocked = blocked_origins()
    if blocked:
        queryset = queryset.exclude(nft_origin__in=blocked)
    return queryset.select_related('work', 'edition')


SORTS = {
    # 新着（既定）。created_at が同じときのために id も見る
    'new': ('-created_at', '-id'),
    'price': ('price_satoshis', 'id'),
    'price_desc': ('-price_satoshis', '-id'),
}


def sorted_listings(queryset: QuerySet[Listing], sort: str = 'new') -> QuerySet[Listing]:
    return queryset.order_by(*SORTS.get(sort, SORTS['new']))
