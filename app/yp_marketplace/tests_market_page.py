"""
市場の 1 画面（documents/Specification.md §16 の P0-6）。

完了条件は「`/market/` が開き、`wallet-base.html` を extends し、s006 の骨格
クラスだけで描けて**ガウディの見た目になっている**」こと。見た目そのものは
screenshot 比較で見るが、そこに至る前に機械で押さえられるものはここで押さえる。

submodule（UI キット）を取っていないチェックアウトでは丸ごとスキップする。
"""

import re
import unittest
from pathlib import Path
from urllib.parse import unquote

from django.conf import settings
from django.contrib.staticfiles import finders
from django.test import SimpleTestCase
from django.urls import reverse

KIT_DIR = Path(settings.WALLET_KIT_DIR)
HAS_KIT = (KIT_DIR / 'templates/components/wallet-base.html').exists()
BUILT_CSS = Path(settings.BASE_DIR) / 'static/css/app.css'

skip_without_kit = unittest.skipUnless(
    HAS_KIT, f'UI キットが無い（git submodule update --init してから）: {KIT_DIR}')
skip_without_build = unittest.skipUnless(
    BUILT_CSS.exists(), 'static/css/app.css が無い（app/ で npm run build してから）')


@skip_without_kit
class MarketIndexTests(SimpleTestCase):
    def setUp(self):
        self.html = self.client.get(reverse('index')).content.decode()

    def test_page_is_served(self):
        # 集客のためログイン前でも見せる（§6）
        self.assertEqual(self.client.get(reverse('index')).status_code, 200)

    def test_uses_the_kit_shell(self):
        # シェルのヘッダ・サイドバー・ボトムタブが付いていること
        for marker in ('app-header', 'app-sidebar', 's006-tabbar'):
            self.assertIn(marker, self.html, f'{marker} が無い（シェルを extends していない）')

    def test_market_tab_is_active(self):
        self.assertIn('data-active="market"', self.html)

    def test_wallet_links_come_from_kit_urls(self):
        # 別プロジェクトの URL 名は引けないので、行き先は kit_urls から来る
        self.assertIn('href="/view/dashboard"', self.html)

    def test_kit_js_paths_are_on_the_body(self):
        # セッション切れの行き先（CONTRACT.md §5.4）
        self.assertIn('data-kit-signin="/view/auth/signin"', self.html)
        self.assertIn('data-kit-logout="/auth/bff/logout"', self.html)

    def test_no_service_worker_is_registered(self):
        # §13.2: 市場は SW を登録しない（ウォレットのルートスコープ SW に乗る）
        self.assertNotIn('serviceWorker', self.html)
        self.assertNotIn('manifest.webmanifest', self.html)
        self.assertNotIn('js/pwa.js', self.html)

    def test_every_static_reference_resolves(self):
        """
        シェルは 18 個ほどの静的資産を読む。1 つ欠けても「見た目が違う」に
        なるので、staticfiles finder で全部引けることを確かめる
        （キットの CONTRACT.md §7 の表がここで効く）。
        """
        refs = sorted(set(re.findall(r'(?:href|src)="/market-static/([^"?]+)', self.html)))
        self.assertGreater(len(refs), 10, '静的参照が少なすぎる（シェルが描けていない）')
        missing = [r for r in refs if not finders.find(unquote(r))]
        self.assertEqual(missing, [], f'解決できない静的資産がある: {missing}')

    def test_body_uses_only_skeleton_and_skin_classes(self):
        """
        画面の中身は s006 の骨格クラスとガウディのスキンだけで書く
        （§15「市場の private CSS はレイアウトの都合だけ」）。
        market- で始まる独自クラスを作っていないこと。
        """
        page = (Path(settings.BASE_DIR) / 'templates/market/index.html').read_text()
        own = {c for c in re.findall(r'class="([^"]+)"', page)
               for c in c.split() if c.startswith('market-')}
        self.assertEqual(own, set(), f'市場固有のクラスを作っている: {own}')


@skip_without_kit
@skip_without_build
class BuiltCssTests(SimpleTestCase):
    """
    Tailwind は preset の content をマージしない（CONTRACT.md §6.1）。
    展開を忘れるとキットのクラスだけ purge され、HTML は正しいのに
    CSS だけが静かに壊れる。ビルド済み CSS の側で押さえる。
    """

    def test_skeleton_skin_and_kit_utilities_survive_purge(self):
        css = BUILT_CSS.read_text()
        for selector in ('.s006-card', '.s006-tabbar', '.s006-empty__icon',
                         '.gaudi-mosaic', '.z-0'):
            self.assertIn(selector, css, f'{selector} が purge されている')

    def test_config_spreads_the_preset_content(self):
        config = (Path(settings.BASE_DIR) / 'tailwind.config.js').read_text()
        self.assertIn('...kit.content', config)
