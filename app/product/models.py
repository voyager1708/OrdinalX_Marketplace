"""
作品（documents/Specification.md §5・§9・§10、S009 §15.6・§20.1）。

真実の在り処を 3 層に分ける。**混ぜると必ず壊れる**:

| 層 | 真実 |
|---|---|
| `Work`（作品） | market DB（ここ） |
| `Edition`（各点） | **オンチェーン**（`chain.Edition` はその投影） |
| `Listing` / `Purchase` | market DB（最終判定はオンチェーン） |

`Work.status` は §9.1 の「順序」をそのまま状態にしたもの。チェーンに書くのは
`approved` 以降だけで、そこから先は不可逆。
"""

from __future__ import annotations

from django.db import models

from yp_marketplace.model_defaults import current_market_env, default_chunk_bytes

from vendor.models import FeeAbsorbedBy, FeeCollection, FeePayer  # noqa: F401  (ポリシー値の参照元)


class WorkFormat(models.TextChoices):
    IMAGE = 'image', 'image'
    PDF = 'pdf', 'pdf'
    CBZ = 'cbz', 'cbz'
    AUDIO = 'audio', 'audio'
    VIDEO = 'video', 'video'
    TEXT = 'text', 'text'
    BUNDLE = 'bundle', 'bundle'


class Rating(models.TextChoices):
    GENERAL = 'general', 'general'
    R15 = 'r15', 'r15'
    R18 = 'r18', 'r18'


class Access(models.TextChoices):
    """S013 の `access`。既定は暗号化（owner_only）で、平文公開は審査通過後のみ。"""

    PUBLIC = 'public', 'public'
    OWNER_ONLY = 'owner_only', 'owner_only'


class WorkStatus(models.TextChoices):
    # §9.1 の順序。staging/in_review までは「取り消せる」側
    DRAFT = 'draft', 'draft'
    STAGING = 'staging', 'staging'            # 暗号文を market の staging に預けた
    IN_REVIEW = 'in_review', 'in_review'      # 人手審査（R-18 / 二次創作 / 平文公開 / プレビュー）
    REJECTED = 'rejected', 'rejected'         # staging を即削除。チェーンには 1 バイトも書かない
    APPROVED = 'approved', 'approved'         # ここから不可逆
    MINTING = 'minting', 'minting'            # 限定 N 点の途中。出品はできない（S009 §15.6）
    ACTIVE = 'active', 'active'
    BLOCKED = 'blocked', 'blocked'            # 事後ガード（§9.1）


class Category(models.Model):
    """ジャンル。並びは運用で決めるので sort_order を持つ。"""

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=80, unique=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'product_category'
        ordering = ['sort_order', 'name']
        verbose_name_plural = 'categories'

    def __str__(self) -> str:
        return self.name


class Work(models.Model):
    vendor = models.ForeignKey(
        'vendor.Vendor', on_delete=models.PROTECT, related_name='works')
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='works')

    # 作成者（= BE の user id）
    creator_principal = models.PositiveBigIntegerField(db_index=True)

    title = models.CharField(max_length=300)
    author_name = models.CharField(max_length=200, blank=True)
    format = models.CharField(max_length=16, choices=WorkFormat.choices)
    rating = models.CharField(max_length=16, choices=Rating.choices, default=Rating.GENERAL)
    access = models.CharField(max_length=16, choices=Access.choices, default=Access.OWNER_ONLY)

    # 決済の正は satoshi（S009 §19）。表示通貨は別に持つ
    price_satoshis = models.PositiveBigIntegerField()
    price_currency = models.CharField(max_length=8, default='BSV')

    # 限定 N 点
    total = models.PositiveIntegerField(default=1)

    status = models.CharField(max_length=16, choices=WorkStatus.choices,
                              default=WorkStatus.DRAFT, db_index=True)

    # 本体（オンチェーン）の形。manifest 全文は chain.Manifest が持つ
    size_bytes = models.PositiveBigIntegerField(default=0)
    chunk_bytes = models.PositiveIntegerField(default=default_chunk_bytes)
    cipher = models.CharField(max_length=32, blank=True, default='AES-256-GCM')
    sha256_plain = models.CharField(max_length=64, blank=True)

    # Work 単位のポリシー上書き（空なら Vendor → env の順）
    fee_policy = models.JSONField(default=dict, blank=True)

    # 審査（§9.1）
    reviewer_principal = models.PositiveBigIntegerField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_note = models.TextField(blank=True)

    # staging の寿命管理（§9.1。却下と TTL 切れは即削除）
    staging_bytes = models.PositiveBigIntegerField(default=0)
    staging_expires_at = models.DateTimeField(null=True, blank=True)

    # §13.3 の環境分離。板の問い合わせは常にこれで絞る
    market_env = models.CharField(max_length=8, default=current_market_env, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_work'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['market_env', 'status']),
            models.Index(fields=['rating']),
        ]

    def __str__(self) -> str:
        return f'{self.title} ({self.get_status_display()})'

    @property
    def is_mintable(self) -> bool:
        """チェーンに書いてよいのは承認後だけ（§9.1）。"""
        return self.status in (WorkStatus.APPROVED, WorkStatus.MINTING)


class WorkFeeLedger(models.Model):
    """
    作成手数料の記録（§10）。

    **適用したポリシーと実費を作成時に固定する**。後からポリシーを変えても遡及しない。
    YP 分（プレビュー inscription）と market 分（本体チャンク）を分けて持つ。
    """

    work = models.OneToOneField(Work, on_delete=models.CASCADE, related_name='fee_ledger')

    # 適用時点のポリシーのスナップショット（payer / collection / absorbed_by）
    policy = models.JSONField(default=dict)

    estimated_satoshis = models.PositiveBigIntegerField(default=0)
    # 実費: YP fee wallet から出た分 / market fee wallet から出た分
    yp_satoshis = models.PositiveBigIntegerField(default=0)
    market_satoshis = models.PositiveBigIntegerField(default=0)

    # 徴収の状態（prepaid_bsv なら入金 txid、deduct_from_sale なら売上からの控除）
    collected_satoshis = models.PositiveBigIntegerField(default=0)
    collection_txid = models.CharField(max_length=64, blank=True)
    is_settled = models.BooleanField(default=False)

    # 見積りを出した時点の JPY 換算（UI の契約: 作成前に必ず出す）
    estimated_jpy = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    rate_jpy_per_bsv = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    rate_source = models.CharField(max_length=64, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_work_fee_ledger'

    def __str__(self) -> str:
        return f'fee ledger for work {self.work_id}'
