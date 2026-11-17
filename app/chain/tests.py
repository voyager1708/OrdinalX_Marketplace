"""
オンチェーン投影の冪等性（documents/Specification.md §5、S009 §15.5）。

限定 N 点の作成は中断・再開する前提なので、`ack` が二重に数えられないことを
DB の制約で保証する。
"""

from django.db import IntegrityError, transaction
from django.test import TestCase

from chain.models import MintJob, MintKind
from product.models import Access, Work, WorkFormat
from vendor.models import Vendor


class MintJobIdempotencyTests(TestCase):
    def setUp(self):
        vendor = Vendor.objects.create(name='テストサークル', slug='test-circle',
                                       owner_principal=2)
        self.work = Work.objects.create(
            vendor=vendor, creator_principal=2, title='限定 30 点の本',
            format=WorkFormat.PDF, access=Access.OWNER_ONLY,
            price_satoshis=100_000, total=30)

    def test_same_work_kind_serial_cannot_be_queued_twice(self):
        MintJob.objects.create(work=self.work, kind=MintKind.CHILD, serial=10)
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                MintJob.objects.create(work=self.work, kind=MintKind.CHILD, serial=10)

    def test_different_serials_are_separate_jobs(self):
        for serial in range(1, 4):
            MintJob.objects.create(work=self.work, kind=MintKind.CHILD, serial=serial)
        self.assertEqual(self.work.mint_jobs.count(), 3)

    def test_work_is_not_mintable_before_approval(self):
        # §9.1: チェーンに書くのは承認後だけ
        self.assertFalse(self.work.is_mintable)
