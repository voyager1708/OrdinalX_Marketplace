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
TABS = 5


def shoot(browser, html_path: Path, out_dir: Path, label: str) -> dict:
    page = browser.new_page(viewport=VIEWPORT, device_scale_factor=2)
    page.goto(html_path.resolve().as_uri())
    page.wait_for_timeout(1200)             # ガウディ層の描画とフォント待ち
    page.screenshot(path=str(out_dir / f'{label}-full.png'), full_page=True)
    shots = {}
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


def compare(a_path: Path, b_path: Path, part: str) -> bool:
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
    tab = width // TABS
    differing = []
    for index in range(TABS):
        box = (index * tab, 0, (index + 1) * tab, height)
        diff = ImageChops.difference(a.crop(box), b.crop(box))
        nonzero = sum(diff.convert('L').histogram()[1:])
        print(f'  tabbar タブ{index + 1}: 差分 {nonzero} px ({nonzero / (tab * height):.2%})')
        if nonzero:
            differing.append(index + 1)
    if len(differing) <= 1:
        print(f'  tabbar: 差分はタブ {differing or "なし"} だけ'
              '（現在地の点灯なので一致とみなす）')
        return True
    print(f'  tabbar: 複数のタブが違う {differing} → シェルが一致していない')
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
    for _, part in PARTS:
        if part not in wallet or part not in market:
            print(f'{part}: 片方が撮れていない')
            ok = False
            continue
        print(f'--- {part}')
        ok = compare(wallet[part], market[part], part) and ok

    print(f'\n画像: {out_dir}')
    print('シェルは一致している' if ok else 'シェルが一致していない')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
