"""
TTL 切れテンプレートの掃除（documents/Specification.md §11、1 分間隔）。

    python manage.py expire_templates [--quiet]

TTL 自体は submit が見ている（`TemplateExpiredError`）ので、これは**掃除**:

- 使われないまま期限が切れたテンプレートを、保持期間を過ぎたら消す
  （未署名 tx hex は行あたり数 KB になる。溜め続ける理由が無い）
- 署名が返って来なかった `draft` の板を `invalid` に落とす
  （`draft` のままでは出品者の一覧に幽霊が残る）

消すのは**未消費**のものだけ。消費済みは成約の証跡なので残す（§14-7）。
"""

from __future__ import annotations

from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from listing.models import EventKind, Listing, ListingEvent, ListingStatus, TxTemplate


class Command(BaseCommand):
    help = 'Delete abandoned tx templates and retire stale draft listings.'

    def add_arguments(self, parser) -> None:
        parser.add_argument('--quiet', action='store_true', help='何も無ければ黙る')

    def handle(self, *args, **options) -> None:
        now = timezone.now()
        retention = timedelta(hours=getattr(settings, 'TX_TEMPLATE_RETENTION_HOURS', 72))

        stale = TxTemplate.objects.filter(consumed_at__isnull=True,
                                          expires_at__lt=now - retention)
        deleted = stale.count()
        if deleted:
            stale.delete()

        # 期限切れのテンプレートしか持たない draft は、もう署名が返って来ない。
        drafts = (Listing.objects.filter(market_env=settings.MARKET_ENV,
                                         status=ListingStatus.DRAFT,
                                         created_at__lt=now - retention)
                  .exclude(templates__expires_at__gte=now))
        retired = 0
        for listing in list(drafts):
            with transaction.atomic():
                listing.status = ListingStatus.INVALID
                listing.closed_at = now
                listing.save(update_fields=['status', 'closed_at'])
                ListingEvent.objects.create(
                    listing=listing, kind=EventKind.RECONCILED,
                    detail={'from': ListingStatus.DRAFT.value,
                            'to': ListingStatus.INVALID.value,
                            'reason': 'template_expired'})
            retired += 1

        if options['quiet'] and not deleted and not retired:
            return
        self.stdout.write(f'templates_deleted={deleted} drafts_retired={retired}')
