"""
鍵の失効（S009 §17、Specification.md §9.1・§14-13）。

vault は market とは別 settings・別 DB で動く:

    manage.py test vault --settings=yp_marketplace_vault.settings
"""

import unittest

from django.conf import settings
from django.test import TestCase
from django.utils import timezone

if 'vault' not in settings.INSTALLED_APPS:
    # market の settings では vault は入っていない（§4・§14-13）。
    # market 側の test 実行でここを読み込むと models の import が失敗するので、
    # 境界を保ったまま丸ごとスキップする。
    raise unittest.SkipTest(
        'vault は別 settings で動かす: manage.py test vault '
        '--settings=yp_marketplace_vault.settings')

from vault.models import KeyRevocation  # noqa: E402  (上のガードより後に import する)


class KeyRevocationTests(TestCase):
    def test_revocation_is_active_until_lifted(self):
        revocation = KeyRevocation.objects.create(
            work_id=11, reason='個人データの申し立て（§9.1）', actor=1)
        self.assertTrue(revocation.is_active)

        # 解除は二人承認。片方だけでは lifted_at を立てない運用なので、
        # is_active は lifted_at の有無だけで判定する
        revocation.lifted_by_first = 1
        revocation.save(update_fields=['lifted_by_first'])
        self.assertTrue(revocation.is_active)

        revocation.lifted_by_second = 2
        revocation.lifted_at = timezone.now()
        revocation.save(update_fields=['lifted_by_second', 'lifted_at'])
        self.assertFalse(revocation.is_active)

    def test_one_revocation_per_work(self):
        from django.db import IntegrityError, transaction
        KeyRevocation.objects.create(work_id=11, reason='x', actor=1)
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                KeyRevocation.objects.create(work_id=11, reason='y', actor=1)

    def test_vault_db_holds_no_market_tables(self):
        # §14-13: 鍵と帳簿を同じ DB に置かない
        from django.db import connection
        tables = set(connection.introspection.table_names())
        self.assertFalse({'listing_listing', 'product_work', 'accounts_user'} & tables)
