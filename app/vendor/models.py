"""
サークル／作家（documents/Specification.md §5・§10）。

手数料の負担ポリシーは **グローバル（env）→ Vendor → Work** の順で
**狭いものが勝つ**。ここに持つのはサークル単位の上書きだけ。
"""

from __future__ import annotations

from django.db import models


class FeePayer(models.TextChoices):
    CREATOR = 'creator', 'creator'
    PLATFORM = 'platform', 'platform'


class FeeCollection(models.TextChoices):
    PREPAID_BSV = 'prepaid_bsv', 'prepaid_bsv'
    PREPAID_FIAT = 'prepaid_fiat', 'prepaid_fiat'
    DEDUCT_FROM_SALE = 'deduct_from_sale', 'deduct_from_sale'
    NONE = 'none', 'none'


class FeeAbsorbedBy(models.TextChoices):
    YP = 'yp', 'yp'
    MARKET = 'market', 'market'


class Vendor(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=80, unique=True)

    # 代表者（= BE の user id）。User への FK は張らない（§13.4-2）
    owner_principal = models.PositiveBigIntegerField(db_index=True)

    # 売上の受取先。paymail 解決は market では行わず BE の既存 EP に委ねる（§13.4-3）
    paymail = models.CharField(max_length=255, blank=True)
    # OrdLock の payout 出力に入る locking script（hex）。端末が表示額と照合する（§14-3）
    payout_script = models.CharField(max_length=512, blank=True)

    # {"payer": ..., "collection": ..., "absorbed_by": ...}。空なら env の既定
    fee_policy = models.JSONField(default=dict, blank=True)

    # 身元確認（§9.1「平文公開と大型作成に身元確認を条件化」）
    is_identity_verified = models.BooleanField(default=False)
    is_suspended = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendor_vendor'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name
