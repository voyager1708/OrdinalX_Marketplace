"""
板・テンプレート・成約・監査証跡・事後ガード
（documents/Specification.md §5・§8・§9.1、S009 §7.2）。

`Listing` / `Purchase` は market DB が持つが、**最終判定はオンチェーン**。
`reconcile_listings`（5 分）が OrdLock UTXO の未使用性を確認して上書きする。
1Sat 互換にする＝外部マーケットからも買えるので、これが無いと板が嘘をつく。
"""

from __future__ import annotations

import uuid

from django.db import models

from yp_marketplace.model_defaults import current_market_env, default_fee_bps


class ListingKind(models.TextChoices):
    """§8.6: custodial ユーザーのために板を 2 本に分ける。"""

    ORDLOCK = 'ordlock', 'ordlock'      # 原子的スワップ（NC）
    PLATFORM = 'platform', 'platform'   # プラットフォーム板（予約・成約・代理購入）


class ListingStatus(models.TextChoices):
    DRAFT = 'draft', 'draft'
    PENDING = 'pending', 'pending'
    ACTIVE = 'active', 'active'
    SOLD = 'sold', 'sold'
    CANCELLED = 'cancelled', 'cancelled'
    INVALID = 'invalid', 'invalid'      # 外部での成約・直接 spend・バーン・delist


class Listing(models.Model):
    kind = models.CharField(max_length=16, choices=ListingKind.choices,
                            default=ListingKind.ORDLOCK)

    # 外部 1Sat 由来の板も載せ得るので work / edition は null 可
    work = models.ForeignKey('product.Work', on_delete=models.SET_NULL,
                             null=True, blank=True, related_name='listings')
    edition = models.ForeignKey('chain.Edition', on_delete=models.SET_NULL,
                                null=True, blank=True, related_name='listings')

    nft_origin = models.CharField(max_length=80, db_index=True)
    # OrdLock に移した出力（"txid:vout"）。reconcile がこれの未使用性を見る
    listed_outpoint = models.CharField(max_length=80, blank=True)

    seller_principal = models.PositiveBigIntegerField(db_index=True)
    seller_paymail = models.CharField(max_length=255, blank=True)

    # 売上の受取先と、キャンセル鍵（S009 §4.2「キャンセル鍵の扱い」）
    payout_script = models.CharField(max_length=512)
    cancel_pubkey = models.CharField(max_length=130, blank=True)

    # 価格は OrdLock script に埋まるので改竄不能（§14-3）
    price_satoshis = models.PositiveBigIntegerField()
    # 一次／二次で分けられるよう Listing 側に固定して持つ（§10）
    fee_bps = models.PositiveIntegerField(default=default_fee_bps)

    ordlock_script_hex = models.TextField(blank=True)
    listing_txid = models.CharField(max_length=64, blank=True)

    status = models.CharField(max_length=16, choices=ListingStatus.choices,
                              default=ListingStatus.DRAFT, db_index=True)

    market_env = models.CharField(max_length=8, default=current_market_env, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    activated_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    reconciled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'listing_listing'
        ordering = ['-created_at']
        constraints = [
            # 二重出品の防止（§5）。ordinal UTXO は 1 つしかないので
            # 2 本目は ARC が二重支払いで落とすが、板の側でも先に塞ぐ。
            models.UniqueConstraint(
                fields=['nft_origin'],
                condition=models.Q(status__in=['pending', 'active']),
                name='uniq_open_listing_per_origin',
            ),
        ]
        indexes = [
            models.Index(fields=['market_env', 'status']),
            models.Index(fields=['price_satoshis']),
        ]

    def __str__(self) -> str:
        return f'{self.nft_origin} @ {self.price_satoshis} sat ({self.status})'


class TemplateKind(models.TextChoices):
    LIST = 'list', 'list'
    BUY = 'buy', 'buy'
    CANCEL = 'cancel', 'cancel'


class TxTemplate(models.Model):
    """
    未署名テンプレート（§5）。TTL は **300 秒**（BE の NC と揃える）。

    `tx_fingerprint` は端末の意図検証（§8.4）と submit 時の同一性確認に使う。
    端末は market を信頼しないので、market 側も「発行した形以外は受けない」で対称にする。
    """

    template_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    kind = models.CharField(max_length=16, choices=TemplateKind.choices)
    principal = models.PositiveBigIntegerField(db_index=True)

    listing = models.ForeignKey(Listing, on_delete=models.CASCADE,
                                null=True, blank=True, related_name='templates')

    # BE が発行したテンプレートの ID。**放送のときに BE へ返すのはこちら**。
    # 市場の `template_id` は市場の中だけの識別子で、BE は知らない
    # （混同して市場の ID を渡し、"Template not found or expired" で
    #  出品が放送できなかった。2026-11-20 に実機で踏んだ）。
    backend_template_id = models.CharField(max_length=64, blank=True)

    unsigned_tx_hex = models.TextField()
    inputs = models.JSONField(default=list)
    outputs = models.JSONField(default=list)
    tx_fingerprint = models.CharField(max_length=64, db_index=True)

    expires_at = models.DateTimeField(db_index=True)
    consumed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'listing_tx_template'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.kind} template {self.template_id}'


class PurchaseStatus(models.TextChoices):
    PENDING = 'pending', 'pending'          # draft 発行済み（TTL 3 分の予約）
    BROADCAST = 'broadcast', 'broadcast'
    CONFIRMED = 'confirmed', 'confirmed'
    FAILED = 'failed', 'failed'
    REFUNDED = 'refunded', 'refunded'


class Purchase(models.Model):
    """
    成約（§5、S009 §7.2.1）。

    **成約時の JPY 換算とレートを保存する**（領収書・会計用）。あとから
    レートを引き直すと金額が変わってしまうので、確定時点の値を固定する。
    """

    listing = models.ForeignKey(Listing, on_delete=models.PROTECT, related_name='purchases')
    buyer_principal = models.PositiveBigIntegerField(db_index=True)
    template = models.ForeignKey(TxTemplate, on_delete=models.SET_NULL,
                                 null=True, blank=True, related_name='purchases')

    # 同じ tx を 2 回数えない（冪等の要）
    txid = models.CharField(max_length=64, blank=True, null=True, unique=True)

    paid_satoshis = models.PositiveBigIntegerField()
    fee_satoshis = models.PositiveBigIntegerField(default=0)

    price_jpy = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    rate_jpy_per_bsv = models.DecimalField(max_digits=14, decimal_places=2,
                                           null=True, blank=True)
    rate_source = models.CharField(max_length=64, blank=True)
    rate_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=16, choices=PurchaseStatus.choices,
                              default=PurchaseStatus.PENDING, db_index=True)

    market_env = models.CharField(max_length=8, default=current_market_env, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'listing_purchase'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['market_env', 'status']),
        ]

    def __str__(self) -> str:
        return f'purchase of listing {self.listing_id} by {self.buyer_principal}'


class SettlementKind(models.TextChoices):
    PLATFORM_DELIVERY = 'platform_delivery', 'platform_delivery'
    PROXY_PURCHASE = 'proxy_purchase', 'proxy_purchase'
    REFUND = 'refund', 'refund'


class SettlementState(models.TextChoices):
    """非原子的経路の状態機械（§8.6・§11）。遷移は `advance_settlements` が進める。"""

    QUEUED = 'queued', 'queued'
    RESERVED = 'reserved', 'reserved'
    PAID = 'paid', 'paid'
    DELIVERING = 'delivering', 'delivering'
    DELIVERED = 'delivered', 'delivered'
    REFUNDING = 'refunding', 'refunding'
    REFUNDED = 'refunded', 'refunded'
    FAILED = 'failed', 'failed'


class SettlementJob(models.Model):
    """
    プラットフォーム板・代理購入の決済ジョブ（§5・§8.6）。

    **冪等**で、`txid` は一意。引き渡し失敗時の返金は**ジョブで管理し
    手作業にしない**（§14-8）。
    """

    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE,
                                 null=True, blank=True, related_name='settlement_jobs')
    listing = models.ForeignKey(Listing, on_delete=models.SET_NULL,
                                null=True, blank=True, related_name='settlement_jobs')

    kind = models.CharField(max_length=24, choices=SettlementKind.choices)
    state = models.CharField(max_length=16, choices=SettlementState.choices,
                             default=SettlementState.QUEUED, db_index=True)

    txid = models.CharField(max_length=64, blank=True, null=True, unique=True)
    attempts = models.PositiveIntegerField(default=0)
    last_error = models.TextField(blank=True)
    next_attempt_at = models.DateTimeField(null=True, blank=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'listing_settlement_job'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.kind} job ({self.state})'


class EventKind(models.TextChoices):
    """
    監査証跡（§14-7）。NC と同じ 4 段 ＋ `SETTLE-*`。

    「発行 / 署名受領 / 検証 / 送信結果」を必ず残す。これが無いと
    端末と market のどちらが落としたのか後から分からない。
    """

    TEMPLATE_ISSUED = 'TEMPLATE_ISSUED', 'TEMPLATE_ISSUED'
    SIGNED_RECEIVED = 'SIGNED_RECEIVED', 'SIGNED_RECEIVED'
    VERIFY_OK = 'VERIFY_OK', 'VERIFY_OK'
    VERIFY_FAIL = 'VERIFY_FAIL', 'VERIFY_FAIL'
    BROADCAST_OK = 'BROADCAST_OK', 'BROADCAST_OK'
    BROADCAST_FAIL = 'BROADCAST_FAIL', 'BROADCAST_FAIL'
    RECONCILED = 'RECONCILED', 'RECONCILED'
    SETTLE_QUEUED = 'SETTLE_QUEUED', 'SETTLE_QUEUED'
    SETTLE_PAID = 'SETTLE_PAID', 'SETTLE_PAID'
    SETTLE_DELIVERED = 'SETTLE_DELIVERED', 'SETTLE_DELIVERED'
    SETTLE_REFUNDED = 'SETTLE_REFUNDED', 'SETTLE_REFUNDED'
    SETTLE_FAILED = 'SETTLE_FAILED', 'SETTLE_FAILED'
    DELISTED = 'DELISTED', 'DELISTED'


class ListingEvent(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE,
                                null=True, blank=True, related_name='events')
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE,
                                 null=True, blank=True, related_name='events')
    template = models.ForeignKey(TxTemplate, on_delete=models.SET_NULL,
                                 null=True, blank=True, related_name='events')

    kind = models.CharField(max_length=24, choices=EventKind.choices, db_index=True)
    principal = models.PositiveBigIntegerField(null=True, blank=True)
    txid = models.CharField(max_length=64, blank=True)
    # トークンは入れない（§14-5。jti の先頭 8 文字まで）
    detail = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'listing_listing_event'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.kind} @ {self.created_at:%Y-%m-%d %H:%M:%S}'


class TakedownKind(models.TextChoices):
    COPYRIGHT = 'copyright', 'copyright'
    PERSONAL_DATA = 'personal_data', 'personal_data'
    LEAK = 'leak', 'leak'
    OTHER = 'other', 'other'


class TakedownState(models.TextChoices):
    RECEIVED = 'received', 'received'
    PROVISIONAL_DELISTED = 'provisional_delisted', 'provisional_delisted'
    UPHELD = 'upheld', 'upheld'
    REJECTED = 'rejected', 'rejected'


class TakedownRequest(models.Model):
    """
    申し立ての受付と判断（§9.1）。**暫定 delist まで既定 24 時間**の SLA。

    チェーンからは消せないので、ここで残すのは「いつ受け、何を判断したか」。
    できないことの表明は S009 §20.3。
    """

    claimant = models.CharField(max_length=200, help_text='申立人（名義）')
    claimant_contact = models.CharField(max_length=255, blank=True)

    # 対象はチェーン上のキーで指す（§13.4-2）
    target_kind = models.CharField(max_length=16, help_text='nft_origin | txid | sha256')
    target_value = models.CharField(max_length=128, db_index=True)
    work = models.ForeignKey('product.Work', on_delete=models.SET_NULL,
                             null=True, blank=True, related_name='takedowns')

    kind = models.CharField(max_length=16, choices=TakedownKind.choices)
    body = models.TextField(blank=True)

    state = models.CharField(max_length=24, choices=TakedownState.choices,
                             default=TakedownState.RECEIVED, db_index=True)
    received_at = models.DateTimeField(auto_now_add=True)
    # received_at + TAKEDOWN_PROVISIONAL_SLA_HOURS
    sla_due_at = models.DateTimeField(null=True, blank=True, db_index=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    decision = models.TextField(blank=True)
    decided_by = models.PositiveBigIntegerField(null=True, blank=True)

    class Meta:
        db_table = 'listing_takedown_request'
        ordering = ['-received_at']

    def __str__(self) -> str:
        return f'{self.kind} on {self.target_value} ({self.state})'


class BlockedKind(models.TextChoices):
    NFT_ORIGIN = 'nft_origin', 'nft_origin'
    TXID = 'txid', 'txid'
    SHA256 = 'sha256', 'sha256'


class BlockedContent(models.Model):
    """
    運営 blocklist（§9.1）。

    一覧・検索・詳細・サムネ・`parts[]` の返却を止める。利用者ごとの
    `HiddenNFT`（FE 側）とは**別**の、運営スコープのもの。
    """

    kind = models.CharField(max_length=16, choices=BlockedKind.choices)
    value = models.CharField(max_length=128)
    reason = models.TextField(blank=True)
    # 誰が入れたか（運営の principal）
    actor = models.PositiveBigIntegerField(null=True, blank=True)
    takedown = models.ForeignKey(TakedownRequest, on_delete=models.SET_NULL,
                                 null=True, blank=True, related_name='blocks')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'listing_blocked_content'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['kind', 'value'], name='uniq_blocked_kind_value'),
        ]

    def __str__(self) -> str:
        return f'{self.kind}={self.value}'
