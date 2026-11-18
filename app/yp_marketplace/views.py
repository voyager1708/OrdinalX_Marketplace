"""
市場の画面（documents/Specification.md §16 の P0-6）。

UI は版を固定した UI キットのシェルの上に描く。市場は認証主体を持たないので
（§7）、ログインを要求せず**公開一覧として**出す。誰の画面かが決まるのは
Phase 1 のイントロスペクション以降で、それまで識別子は空のまま供給される
（キットは「不明なら出さない」作りなので、空でも崩れない）。
"""

from django.views.generic import TemplateView


class MarketIndexView(TemplateView):
    """`/market/` — 板の入口。集客のためログイン前でも見せる（§6）。"""

    template_name = 'market/index.html'
