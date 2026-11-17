"""
CK（コンテンツ鍵）の保管と所有権判定（S009 §17.1、Specification.md §9.1・§14-13）。

**vault は market とは別プロセス・別 DB・別鍵**で動く。分ける理由は信頼境界ではなく
**依存の同居を断つこと**（S009 §17.2.1）。vault は暗号文を持たない（チェーンにある）。

> ⚠ マスター鍵と CK ストアを失うと、**すべての暗号化作品が永久に復号不能**になる。
> 暗号文はチェーン上にあって消せないのに誰も読めない状態になるので、
> **vault の DB のバックアップは market の DB より優先度が高い**。

market の DB とは別なので、ここから market のモデルへ FK は張らない。
参照は `work_id` / `nft_origin` / `principal` のスカラだけで閉じる（§13.4-2）。
"""

from __future__ import annotations

from django.db import models


class SealedKey(models.Model):
    """
    ブラウザが生成した CK を、鍵サービスの公開鍵へ ECIES で封じて預けたもの。

    平文の CK は**どこにも保存しない**。再封（所有者の公開鍵へ封じ直す）だけを行う。
    """

    # market 側の Work.id（別 DB なので FK は張らない）
    work_id = models.PositiveBigIntegerField(db_index=True)
    # 親（コレクション）の origin。所有権判定の起点
    nft_origin = models.CharField(max_length=80, blank=True, db_index=True)

    cipher = models.CharField(max_length=32, default='AES-256-GCM')
    # ECIES で封じた CK。master 鍵の識別子だけを持ち、鍵そのものは env から
    sealed_ck = models.BinaryField(editable=False)
    sealed_with_key_id = models.CharField(max_length=64)

    created_by_principal = models.PositiveBigIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vault_sealed_key'
        constraints = [
            models.UniqueConstraint(fields=['work_id'], name='uniq_sealed_key_per_work'),
        ]

    def __str__(self) -> str:
        return f'sealed CK for work {self.work_id}'


class ReleaseReason(models.TextChoices):
    OWNER = 'owner', 'owner'          # 現在の所有者（転売で権利が移る）
    REVIEWER = 'reviewer', 'reviewer'  # 審査者（§9.1。所有権判定の例外）
    CREATOR = 'creator', 'creator'


class KeyRelease(models.Model):
    """
    鍵解放の監査ログ（§9.1「誰がいつどの作品を開いたかを vault の監査ログに残す」）。

    審査者の閲覧は所有権判定の例外なので、**必ず残す**。
    """

    work_id = models.PositiveBigIntegerField(db_index=True)
    nft_origin = models.CharField(max_length=80, blank=True)
    principal = models.PositiveBigIntegerField(db_index=True)
    reason = models.CharField(max_length=16, choices=ReleaseReason.choices)

    # 所有確認の根拠（BE の /user/nfts/info の結果など）。鍵もトークンも入れない
    evidence = models.JSONField(default=dict, blank=True)
    granted = models.BooleanField(default=False)
    denied_code = models.CharField(max_length=32, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'vault_key_release'
        ordering = ['-created_at']

    def __str__(self) -> str:
        verb = 'granted' if self.granted else f'denied({self.denied_code})'
        return f'work {self.work_id} → {self.principal}: {verb}'


class KeyRevocation(models.Model):
    """
    CK の恒久失効（§9.1）。暗号化作品の kill switch。

    以後 CK の再封を拒否する。暗号文はチェーンに残るが**誰も新たに読めない**。
    **失効は遡及しない**（既に復号した人の手元の平文は止められない。DRM ではない）。
    解除は**二人承認**。
    """

    work_id = models.PositiveBigIntegerField(unique=True)
    reason = models.TextField()
    actor = models.PositiveBigIntegerField(help_text='失効させた運営の principal')
    created_at = models.DateTimeField(auto_now_add=True)

    # 解除（二人承認。1 人だけでは lifted_at を立てない）
    lifted_at = models.DateTimeField(null=True, blank=True)
    lifted_by_first = models.PositiveBigIntegerField(null=True, blank=True)
    lifted_by_second = models.PositiveBigIntegerField(null=True, blank=True)
    lift_reason = models.TextField(blank=True)

    class Meta:
        db_table = 'vault_key_revocation'
        ordering = ['-created_at']

    def __str__(self) -> str:
        state = 'lifted' if self.lifted_at else 'active'
        return f'revocation of work {self.work_id} ({state})'

    @property
    def is_active(self) -> bool:
        return self.lifted_at is None


class AgeVerification(models.Model):
    """
    年齢確認の記録（S009 §20.2）。

    **市場の帳簿と分離して vault 側に持つ**。R-18 の表示はこれを通った
    principal の明示的オプトイン後だけ。
    """

    principal = models.PositiveBigIntegerField(unique=True)
    verified_at = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=32, blank=True)
    # 生年月日や書類は持たない。確認したという事実だけを残す
    note = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'vault_age_verification'

    def __str__(self) -> str:
        return f'age verified: {self.principal}'
