"""
出品と取り下げの画面（documents/Specification.md §8.2・§8.3、Phase 2）。

見るのは「画面が開くか」と、**端末が署名するための部品が揃っているか**。
鍵は端末にしか無いので、画面が JS を読み落としていると「押しても何も起きない」
という形で壊れる（ウォレット側で踏んだ事故）。だから読み込みまで機械で押さえる。

submodule（UI キット）やビルド成果物が無いチェックアウトではスキップする。
"""

import unittest
from pathlib import Path

from django.conf import settings
from django.test import SimpleTestCase, override_settings
from django.urls import reverse

KIT_DIR = Path(settings.WALLET_KIT_DIR)
HAS_KIT = (KIT_DIR / 'templates/components/wallet-base.html').exists()
STATIC_JS = Path(settings.BASE_DIR) / 'static/js'

skip_without_kit = unittest.skipUnless(
    HAS_KIT, f'UI キットが無い（git submodule update --init してから）: {KIT_DIR}')


@skip_without_kit
class SellPageTests(SimpleTestCase):
    def setUp(self):
        self.html = self.client.get(reverse('sell')).content.decode()

    def test_page_is_served(self):
        self.assertEqual(self.client.get(reverse('sell')).status_code, 200)

    def test_uses_the_kit_shell(self):
        # 失敗時に HTML 全体を吐かないよう、真偽だけを見る（シェルは 20KB 超）
        self.assertTrue('s006-tabbar' in self.html, 'キットのシェルを使っていない')
        self.assertTrue('data-active="market"' in self.html,
                        'ボトムタブの市場が点いていない')

    def test_it_loads_the_signing_core(self):
        """
        鍵は端末の IndexedDB にある。この 5 本のどれかが抜けると、
        出品ボタンが無反応になる（サーバ側のエラーにもならない）。
        """
        for script in ('nc-wallet', 'nc-send', 'nc-listing',
                       'market-sign', 'market-sell'):
            self.assertTrue(f'js/{script}' in self.html,
                            f'{script} を読んでいない')

    def test_it_has_the_hooks_the_controller_reads(self):
        for hook in ('sell-nfts', 'sell-price', 'sell-submit', 'sell-status',
                     'sell-error', 'sell-done', 'sell-txid', 'sell-signin',
                     'market-unlock', 'market-unlock-password'):
            self.assertTrue(f'id="{hook}"' in self.html, f'{hook} が無い')

    @override_settings(MARKET_FEE_BPS=250)
    def test_it_shows_the_fee_rate_and_hands_it_to_the_device(self):
        html = self.client.get(reverse('sell')).content.decode()
        self.assertTrue('2.5' in html, '手数料率を画面に出していない')
        self.assertTrue('data-fee-bps="250"' in html, '端末に手数料率を渡していない')

    def test_it_says_the_price_is_baked_into_the_lock(self):
        """価格が変えられないことは**出品の前に**伝える（§14-3）。"""
        self.assertTrue('焼き込まれる' in self.html, '価格が固定される旨の説明が無い')


@skip_without_kit
class MinePageTests(SimpleTestCase):
    def setUp(self):
        self.html = self.client.get(reverse('mine')).content.decode()

    def test_page_is_served(self):
        self.assertEqual(self.client.get(reverse('mine')).status_code, 200)

    def test_it_loads_what_cancelling_needs(self):
        # 取り下げは OrdLock を解く署名が要る（nc-send は使わない）
        for script in ('nc-wallet', 'nc-listing', 'market-sign', 'market-mine'):
            self.assertTrue(f'js/{script}' in self.html,
                            f'{script} を読んでいない')

    def test_it_has_the_hooks_the_controller_reads(self):
        for hook in ('mine-list', 'mine-status', 'mine-error', 'mine-signin',
                     'market-unlock'):
            self.assertTrue(f'id="{hook}"' in self.html, f'{hook} が無い')

    def test_the_board_links_to_both_pages(self):
        board = self.client.get(reverse('index')).content.decode()
        self.assertTrue(reverse('sell') in board, '板から出品へ行けない')
        self.assertTrue(reverse('mine') in board, '板から自分の出品へ行けない')


class BuiltAssetTests(SimpleTestCase):
    """
    画面が参照する JS が**ビルドされているか**。

    キットは app/ の外（vendor の submodule）にあるので、esbuild の
    `nodePaths` を落とすと署名コアだけが静かに欠ける。
    """

    @unittest.skipUnless(STATIC_JS.exists(), 'static/js が無い（npm run build）')
    def test_the_signing_core_is_built(self):
        for name in ('nc-wallet.js', 'nc-send.js', 'nc-listing.js',
                     'market-sign.js', 'market-sell.js', 'market-mine.js'):
            path = STATIC_JS / name
            self.assertTrue(path.exists(), f'{name} がビルドされていない')
            self.assertGreater(path.stat().st_size, 500, f'{name} が小さすぎる')

    @unittest.skipUnless((STATIC_JS / 'nc-listing.js').exists(), 'ビルドが無い')
    def test_the_kit_exposes_the_listing_api_to_pages(self):
        bundled = (STATIC_JS / 'nc-listing.js').read_text()
        # 画面は window.NcListing 経由で使う（暗号は市場に持たない）。
        # assertIn は落ちるとバンドル全体を吐くので、真偽だけを見る
        self.assertTrue('NcListing' in bundled,
                        'キットが window.NcListing を出していない（kit のバージョン）')
        self.assertTrue('SINGLE|ANYONECANPAY|FORKID' in bundled,
                        '取り下げの署名範囲がバンドルに無い')
        self.assertTrue('signCancel' in bundled, 'signCancel がバンドルに無い')
