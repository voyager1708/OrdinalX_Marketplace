"""
板のダミーデータを入れる（Phase 1 は「書き込みなし・ダミーデータ可」）。

**dev でしか動かさない**。本番の板に作り物が出ると、オンチェーンの実体が
無い行を売り買いしようとする事故になる。

    manage.py seed_market --count 8
    manage.py seed_market --clear
"""

import hashlib
import random

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from chain.models import Edition, Ownership, SaleState
from listing.models import Listing, ListingStatus
from product.models import Access, Rating, Work, WorkFormat, WorkStatus
from vendor.models import Vendor

TITLES = [
    ('夏の記録', '写真集'), ('海の底から', '画集'), ('月と窯', '作品集'),
    ('石の庭', '写真集'), ('灯のある台所', '画集'), ('旅の断片', '写真集'),
    ('うたの余白', '詩集'), ('窓の記憶', '画集'),
]


def _clear(vendor) -> int:
    """見本データを消す。Work を消せば Edition と Listing も連れていく。"""
    removed = Listing.objects.filter(market_env='dev',
                                     seller_paymail='seed@spv.buxbit.net').delete()[0]
    removed += Work.objects.filter(vendor=vendor).delete()[0]
    return removed


class Command(BaseCommand):
    help = 'dev の板にダミーの出品を入れる（Phase 1 の UI 確認用）'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=6)
        parser.add_argument('--clear', action='store_true', help='ダミーを消すだけ')

    def handle(self, *args, **options):
        if settings.MARKET_ENV != 'dev':
            raise CommandError(
                f'MARKET_ENV={settings.MARKET_ENV} では実行しない。'
                'ダミーの出品が本物の板に出ると、オンチェーンの実体が無い行を'
                '売り買いしようとする事故になる')

        vendor, _ = Vendor.objects.get_or_create(
            slug='seed-circle', defaults={'name': 'シード工房', 'owner_principal': 2})

        if options['clear']:
            self.stdout.write(f'ダミーを削除した（{_clear(vendor)} 行）')
            return

        # 入れ直しは**必ず消してから**。reconcile_listings（§11）が見本データを
        # invalid に落とす（スクリプトもチェーン上の痕跡も無いので突き合わせられない）。
        # つまり seed は何度も打ち直すことになるのに、Edition.nft_origin は一意なので
        # 消さずに入れると 2 回目が IntegrityError で落ちる。
        _clear(vendor)

        random.seed(20261118)
        created = 0
        for index in range(options['count']):
            title, kind = TITLES[index % len(TITLES)]
            work = Work.objects.create(
                vendor=vendor, creator_principal=2, title=f'{title}（{kind}）',
                author_name='シード作家', format=WorkFormat.IMAGE,
                rating=Rating.GENERAL, access=Access.OWNER_ONLY,
                price_satoshis=random.choice([30_000, 50_000, 120_000, 480_000]),
                total=30, status=WorkStatus.ACTIVE, market_env='dev')

            origin = hashlib.sha256(f'seed-{index}'.encode()).hexdigest() + '_0'
            edition = Edition.objects.create(
                work=work, nft_origin=origin, serial=index + 1, total=30,
                name=f'{title} #{index + 1}/30', ownership=Ownership.OWNED,
                sale=SaleState.LISTED, owner_principal=2)

            Listing.objects.create(
                work=work, edition=edition, nft_origin=origin,
                listed_outpoint=f'{origin[:64]}:0',
                seller_principal=2, seller_paymail='seed@spv.buxbit.net',
                payout_script='76a914' + '11' * 20 + '88ac',
                price_satoshis=work.price_satoshis,
                status=ListingStatus.ACTIVE, market_env='dev',
                activated_at=timezone.now())
            created += 1

        self.stdout.write(f'ダミーの出品を {created} 件入れた（MARKET_ENV=dev）')
