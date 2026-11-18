"""
bsv-sdk と C 拡張（documents/Specification.md §2・§13.1）。

BE と**同じ git 版**（feature/c-extension-phase0 @ 575dd29）を使う。PyPI 版を
混ぜない。C 拡張が入らないと **エラーを出さずに pure-Python へ落ちる**ので、
「正しく動くが遅い」状態に気づけない（BE で実際に踏んだ）。
"""

import importlib.util

from django.test import SimpleTestCase


class BsvSdkTests(SimpleTestCase):
    def test_sdk_is_importable(self):
        import bsv  # noqa: F401

    def test_native_extension_is_in_use(self):
        """
        C 拡張が効いていること。コンテナでは Dockerfile が
        `BSV_REQUIRE_NATIVE=1` でビルドしており、開発 venv にも同じ git 版を
        入れる（手順は requirements.txt のコメント）。
        """
        spec = importlib.util.find_spec('_bsv_native')
        self.assertIsNotNone(
            spec,
            'bsv-sdk の C 拡張が無い。pure-Python にフォールバックしており'
            '「正しく動くが遅い」状態。次で入れ直す:\n'
            '  pip install "git+https://github.com/bsv-blockchain/py-sdk.git@575dd29"')

    def test_sdk_is_not_pinned_in_requirements(self):
        """
        requirements.txt に bsv-sdk を書くと PyPI 版が勝って C 拡張が入らない。
        入れ場所は Dockerfile（コンテナ）と手動（開発 venv）だけ。
        """
        from pathlib import Path
        from django.conf import settings
        requirements = (Path(settings.BASE_DIR).parent / 'requirements.txt').read_text()
        pinned = [line for line in requirements.splitlines()
                  if line.strip() and not line.strip().startswith('#')
                  and 'bsv' in line.lower()]
        self.assertEqual(pinned, [], f'requirements.txt に bsv-sdk がある: {pinned}')
