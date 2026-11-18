"""
UI キットを跨いで使えること（documents/Specification.md §15、キットの CONTRACT.md）。

市場が「ウォレットのシェルを別プロセスから extends する」という形は、
テンプレートの中に 1 つでもウォレット固有の `{% url %}` が残っていると
`NoReverseMatch` で**画面全体が 500** になる。そこを押さえるのがこのテスト。

submodule を取っていないチェックアウト（`git submodule update --init` 前）では
丸ごとスキップする。
"""

import unittest

from django.conf import settings
from django.template import Context, Template
from django.test import RequestFactory, SimpleTestCase

from yp_marketplace.kit import WALLET_PATHS, kit_context

KIT_DIR = settings.WALLET_KIT_DIR
HAS_KIT = (KIT_DIR / 'templates/components/wallet-base.html').exists()

skip_without_kit = unittest.skipUnless(
    HAS_KIT, f'UI キットが無い（git submodule update --init してから）: {KIT_DIR}')


class KitContextTests(SimpleTestCase):
    def test_supplies_every_contract_key(self):
        ctx = kit_context(RequestFactory().get('/market/'))
        # CONTRACT.md §5.2 の行き先
        assert set(ctx['kit_urls']) == set(WALLET_PATHS) | {'market'}
        for key, value in ctx['kit_urls'].items():
            assert value.startswith('/'), f'{key} が実パスでない: {value}'
            assert '://' not in value, f'{key} にホスト名が入っている: {value}'
        # CONTRACT.md §5.1 の 6 変数（Phase 1 まで値は空でも、キーは必ずある）
        for key in ('profile_picture_url', 'account_type', 'is_nc_account',
                    'nc_username', 'nc_paymail', 'nc_user_id'):
            assert key in ctx, f'{key} を供給していない'

    def test_market_tab_is_active_on_market_pages(self):
        assert kit_context(RequestFactory().get('/market/'))['kit_active'] == 'market'


@skip_without_kit
class KitShellRendersInMarketTests(SimpleTestCase):
    """キットのシェルが市場の Django でそのまま描けること。"""

    def _render(self):
        request = RequestFactory().get('/market/')
        template = Template(
            '{% extends "components/wallet-base.html" %}'
            '{% block body %}<body><main id="market-probe">ok</main></body>{% endblock %}'
        )
        return template.render(Context(kit_context(request)))

    def test_shell_renders_without_reverse_errors(self):
        html = self._render()
        assert 'market-probe' in html

    def test_shell_points_at_the_wallet_paths_we_supplied(self):
        html = self._render()
        for key in ('dashboard', 'send', 'receive', 'nfts', 'profile'):
            assert f'href="{WALLET_PATHS[key]}"' in html, f'{key} の行き先が出ていない'

    def test_bottom_tabs_marks_the_market_tab(self):
        assert 'data-active="market"' in self._render()

    def test_identity_attributes_are_present(self):
        # 端末内鍵を引く識別子の供給元はシェルの body 1 箇所（CONTRACT.md §1）
        html = self._render()
        for attr in ('data-nc-username', 'data-nc-paymail', 'data-nc-userid'):
            assert attr in html
