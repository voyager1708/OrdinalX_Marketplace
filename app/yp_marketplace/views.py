"""
市場の画面（documents/Specification.md §16 の P0-6、Phase 1 で板に繋いだ）。

UI は版を固定した UI キットのシェルの上に描く。市場は認証主体を持たないので
（§7）、板はログインを要求せず**公開一覧として**出す。

画面の作法はウォレットに揃える（S012 §8.1）: 骨組みを先に返し、中身は HTMX が
フラグメントを取りに来る。板は BE への往復を含まないが、将来サムネや
チェーン照会が入ると遅くなるので、最初からこの形にしておく。
"""

from django.conf import settings
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


class MarketSellView(TemplateView):
    """
    `/market/sell` — 出品の画面（§8.2）。

    ログインは **JS が判定する**（市場は認証主体を持たない。§7）。サーバ側で
    弾かないのは、板と同じシェルを出してから案内に差し替えるほうが、
    サインインの往復で画面が真っ白にならないため。

    手数料率だけは画面に出す必要があるので context で渡す。**端末は署名の前に
    draft の告知額を計算し直す**（§14-4）ので、ここの値は表示専用。
    """

    template_name = 'market/sell.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['fee_bps'] = settings.MARKET_FEE_BPS
        context['fee_percent'] = settings.MARKET_FEE_BPS / 100
        return context


class MarketMineView(TemplateView):
    """`/market/mine` — 自分の出品と取り下げ（§8.3）。"""

    template_name = 'market/mine.html'


class MarketBuyView(TemplateView):
    """
    `/market/listing/<id>` — 1 件の詳細と購入（§8.3）。

    板と同じく**ログイン前でも見せる**（集客のため。§6）。購入を押した時点で
    JS がサインインを確かめる。出品が見えない（blocklist・env 違い）ときは 404。
    """

    template_name = 'market/buy.html'

    def get_context_data(self, **kwargs):
        from django.http import Http404

        from listing.queries import visible_listings

        context = super().get_context_data(**kwargs)
        listing = visible_listings(status='').filter(id=kwargs['listing_id']).first()
        if listing is None:
            raise Http404('listing not found')
        context['listing'] = listing
        context['fee_percent'] = listing.fee_bps / 100
        return context
