"""
市場の画面（documents/Specification.md §16 の P0-6、Phase 1 で板に繋いだ）。

UI は版を固定した UI キットのシェルの上に描く。市場は認証主体を持たないので
（§7）、板はログインを要求せず**公開一覧として**出す。

画面の作法はウォレットに揃える（S012 §8.1）: 骨組みを先に返し、中身は HTMX が
フラグメントを取りに来る。板は BE への往復を含まないが、将来サムネや
チェーン照会が入ると遅くなるので、最初からこの形にしておく。
"""

from django.views.generic import TemplateView

from listing.queries import sorted_listings, visible_listings

PAGE_SIZE = 24


class MarketIndexView(TemplateView):
    """`/market/` — 板の入口。集客のためログイン前でも見せる（§6）。"""

    template_name = 'market/index.html'


class MarketBoardFragmentView(TemplateView):
    """
    板の中身（HTMX が取りに来るフラグメント）。

    問い合わせは `listing.queries` を通す。view が自分で filter を書くと
    MARKET_ENV の絞り込みか blocklist のどちらかが必ず抜ける。
    """

    template_name = 'market/partials/board.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        sort = self.request.GET.get('sort') or 'new'
        listings = list(sorted_listings(visible_listings(), sort)[:PAGE_SIZE])
        context.update({
            'listings': listings,
            'sort': sort,
            'is_empty': not listings,
        })
        return context
