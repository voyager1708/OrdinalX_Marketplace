#!/usr/bin/env python
"""
ウォレットと市場で**シェルが一致している**ことを screenshot で確かめる
（Specification.md §15「見た目」、S012 §8.1「見た目の食い違いは選択ではなくバグ」）。

比較するのはシェル（ヘッダとボトムタブ）だけで、カードの中身は別物なので見ない。
ボトムタブは「いまいる画面」のタブだけが点くので、**点灯しているタブを除いて**
一致することを見る。

playwright が要るのでウォレット側の venv で動かす:

    # 1. 市場側の HTML（市場の venv）
    /mnt/extra/venv_marketplace/bin/python app/manage.py render_shell \
        --settings=yp_marketplace.settings_test -o /tmp/market.html

    # 2. ウォレット側の HTML（ウォレットの作法。test Client → file:// 書き換え）
    #    → /tmp/wallet.html

    # 3. 比較（ウォレット側の venv。chromium 入り）
    /mnt/extra/venv/bin/python tools/shell_diff.py /tmp/wallet.html /tmp/market.html
"""

import sys
from pathlib import Path

from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

VIEWPORT = {'width': 390, 'height': 844}   # ボトムタブは lg 未満でだけ出る
PARTS = (('header.app-header', 'header'), ('nav.s006-tabbar', 'tabbar'))
TAB_ITEM = '.s006-tabbar__item'


def shoot(browser, html_path: Path, out_dir: Path, label: str) -> dict:
    page = browser.new_page(viewport=VIEWPORT, device_scale_factor=2)
    page.goto(html_path.resolve().as_uri())
    page.wait_for_timeout(1200)             # ガウディ層の描画とフォント待ち
    page.screenshot(path=str(out_dir / f'{label}-full.png'), full_page=True)
    # タブ数も現在地も決め打ちにしない（ナビの拡張点で増え、点くタブは画面で違う）
    items = page.query_selector_all(TAB_ITEM)
    active = [i for i, el in enumerate(items)
              if 'is-active' in (el.get_attribute('class') or '')]
    shots = {'tab_count': len(items), 'active': active}
    for selector, part in PARTS:
        element = page.query_selector(selector)
        if element is None:
            print(f'{label}: {selector} が無い（シェルが描けていない）')
            continue
        path = out_dir / f'{label}-{part}.png'
        element.screenshot(path=str(path))
        shots[part] = path
    page.close()
    return shots


def compare(a_path: Path, b_path: Path, part: str, tabs: int = 0,
            allowed: set = frozenset()) -> bool:
    a = Image.open(a_path).convert('RGB')
    b = Image.open(b_path).convert('RGB')
    if a.size != b.size:
        print(f'  {part}: 寸法が違う（{a.size} vs {b.size}）→ シェルが一致していない')
        return False

    if part != 'tabbar':
        diff = ImageChops.difference(a, b)
        nonzero = sum(diff.convert('L').histogram()[1:])
        total = a.size[0] * a.size[1]
        print(f'  {part}: 差分 {nonzero}/{total} = {nonzero / total:.2%}')
        return nonzero == 0

    # タブバーは「いまいる画面」のタブだけ見え方が違う。タブごとに見て、
    # 差分があるのが 1 つ以内なら一致とみなす。
    width, height = a.size
    tab = width // tabs
    differing = []
    for index in range(tabs):
        box = (index * tab, 0, (index + 1) * tab, height)
        diff = ImageChops.difference(a.crop(box), b.crop(box))
        nonzero = sum(diff.convert('L').histogram()[1:])
        print(f'  tabbar タブ{index + 1}: 差分 {nonzero} px ({nonzero / (tab * height):.2%})')
        if nonzero:
            differing.append(index + 1)
    unexpected = [index for index in differing if index - 1 not in allowed]
    if not unexpected:
        print(f'  tabbar: 差分はタブ {differing or "なし"} だけで、'
              'どちらも「そのページの現在地」→ シェルは一致している')
        return True
    print(f'  tabbar: 現在地で説明できない差分がタブ {unexpected} にある'
          ' → シェルが一致していない')
    return False


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    wallet_html, market_html = Path(sys.argv[1]), Path(sys.argv[2])
    out_dir = Path(sys.argv[3]) if len(sys.argv) > 3 else Path('/tmp/shell-diff')
    out_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        wallet = shoot(browser, wallet_html, out_dir, 'wallet')
        market = shoot(browser, market_html, out_dir, 'market')
        browser.close()

    ok = True
    tabs = wallet.get('tab_count', 0)
    if tabs != market.get('tab_count', 0):
        print(f'タブの数が違う（wallet {tabs} / market {market.get("tab_count")}）'
              ' → ナビの拡張点が片方にしか効いていない')
        ok = False
    # 点灯しているタブは画面ごとに違って**当たり前**なので、その位置だけ差分を許す
    allowed = set(wallet.get('active', [])) | set(market.get('active', []))
    print(f'タブ数: {tabs} / 現在地: wallet={wallet.get("active")} market={market.get("active")}')

    for _, part in PARTS:
        if part not in wallet or part not in market:
            print(f'{part}: 片方が撮れていない')
            ok = False
            continue
        print(f'--- {part}')
        ok = compare(wallet[part], market[part], part, tabs, allowed) and ok

    print(f'\n画像: {out_dir}')
    print('シェルは一致している' if ok else 'シェルが一致していない')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
