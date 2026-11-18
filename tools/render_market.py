#!/usr/bin/env python
"""
市場の画面を、静的参照を `file://` に書き換えて 1 枚の HTML に書き出す。

screenshot 比較（Specification.md §15「見た目」）の入力を作るためのもの。
常駐サーバを立てずに撮れるので、ウォレット側で確立している
「test Client でレンダー → file:// 書き換え → playwright」の作法に合わせている。

    /mnt/extra/venv_marketplace/bin/python tools/render_market.py /tmp/market.html
"""

import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote

APP_DIR = Path(__file__).resolve().parent.parent / 'app'
sys.path.insert(0, str(APP_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yp_marketplace.settings_test')

import django  # noqa: E402

django.setup()

from django.conf import settings  # noqa: E402
from django.contrib.staticfiles import finders  # noqa: E402
from django.test import Client  # noqa: E402


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    out = Path(sys.argv[1])
    path = sys.argv[2] if len(sys.argv) > 2 else '/market/'

    response = Client().get(path)
    if response.status_code != 200:
        print(f'{path} が {response.status_code} を返した'
              '（settings_test の ALLOWED_HOSTS に testserver が要る）')
        return 1

    html = response.content.decode()
    missing = []

    def to_file_url(match):
        rel = unquote(match.group(1))
        found = finders.find(rel)
        if not found:
            missing.append(rel)
            return match.group(0)
        return f'file://{found}'

    static_url = settings.STATIC_URL.rstrip('/')
    html = re.sub(rf'{re.escape(static_url)}/([^"?]+)', to_file_url, html)
    out.write_text(html)
    print(f'{path} → {out}（{len(html)} bytes）')

    if missing:
        # 1 つ欠けても「見た目が違う」になるので黙って通さない
        print('解決できない静的資産がある: ' + ', '.join(sorted(set(missing))))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
