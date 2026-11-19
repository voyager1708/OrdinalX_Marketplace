"""
板とチェーンの突き合わせ（documents/Specification.md §11、5 分間隔）。

    python manage.py reconcile_listings [--limit N] [--listing-id N ...] [--quiet]

`market_env` で絞るので、**同じ DB に dev と本番が混ざっていても互いを触らない**。
逆に `seed_market` で入れた見本データは（スクリプトもチェーン上の痕跡も無いので）
猶予を過ぎると `invalid` に落ちる。dev で板の見た目を見るときは seed し直す。

cron から回す。終了コードは**照会に失敗しても 0**（WoC の一時的な 429 で
cron のメールが飛び続けるのを避ける）。状態の遷移はすべて `RECONCILED`
イベントに残るので、取りこぼしは後から追える。
"""

from __future__ import annotations

from django.core.management.base import BaseCommand

from listing.services.reconcile_service import reconcile_listings


class Command(BaseCommand):
    help = 'Check every open listing against the chain and move its status.'

    def add_arguments(self, parser) -> None:
        parser.add_argument('--limit', type=int, default=None,
                            help='1 回で見る件数（既定 RECONCILE_BATCH_SIZE）')
        parser.add_argument('--listing-id', type=int, action='append', dest='listing_ids',
                            help='この id だけを見る（env と状態の絞り込みを外す）')
        parser.add_argument('--quiet', action='store_true', help='変化が無ければ黙る')

    def handle(self, *args, **options) -> None:
        summary = reconcile_listings(limit=options['limit'],
                                     listing_ids=options.get('listing_ids'))

        if options['quiet'] and not summary.changed and not summary.errors:
            return

        self.stdout.write(f'checked={summary.checked} changed={summary.changed} '
                          f'errors={summary.errors} {summary.counts()}')
        for outcome in summary.outcomes:
            if outcome.error:
                self.stderr.write(f'  listing {outcome.listing_id}: {outcome.error}')
            elif outcome.changed:
                self.stdout.write(f'  listing {outcome.listing_id}: '
                                  f'{outcome.before} → {outcome.after} ({outcome.reason})'
                                  + (f' {outcome.txid[:16]}…' if outcome.txid else ''))
