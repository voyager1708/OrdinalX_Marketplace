"""
オンチェーンの投影（documents/Specification.md §5・§9、S009 §15.1・§15.5・§20.1）。

ここにあるものは**すべて写し**で、真実はチェーン側にある。`reconcile` が
突き合わせて上書きするので、market DB を信じて判断を変えない。

構造（S009 §15.1）:

    作品 NFT 1 件（プレビュー + マニフェスト）  ← これが売買される実体
      + 本体チャンク tx K 本（OP_FALSE OP_RETURN・4 MB/tx・市場の fee wallet が払う）
"""

from __future__ import annotations

from django.db import models

from yp_marketplace.model_defaults import default_chunk_bytes


class Ownership(models.TextChoices):
    """S009 §15.6: 所有状態。"""

    MINTING = 'minting', 'minting'
    OWNED = 'owned', 'owned'
    BURNED = 'burned', 'burned'


class SaleState(models.TextChoices):
    """S009 §15.6: 販売状態。所有状態と 2 軸で持つ（混ぜない）。"""

    NONE = 'none', 'none'
    LISTED = 'listed', 'listed'
    SOLD = 'sold', 'sold'


class Edition(models.Model):
    """
    各点（1 sat ordinal 1 個 = 1 点）。

    `serial` / `total` / `comment` は親の `subTypeData` に入っていて
    **オンチェーンで不変**。ここは表示と検索のための写し。
    """

    work = models.ForeignKey('product.Work', on_delete=models.CASCADE, related_name='editions')

    # チェーン上の同一性はこれ。market DB の id で外に出さない（§13.4-2）
    nft_origin = models.CharField(max_length=80, unique=True)
    txid = models.CharField(max_length=64, blank=True)
    vout = models.PositiveIntegerField(null=True, blank=True)

    serial = models.PositiveIntegerField()
    total = models.PositiveIntegerField()
    # BE が検証する表示名。`#10/30` を含める（改竄できない表示名になる）
    name = models.CharField(max_length=200, blank=True)
    # 上限 200 文字（S009 §16）
    comment = models.CharField(max_length=200, blank=True)

    ownership = models.CharField(max_length=16, choices=Ownership.choices,
                                 default=Ownership.MINTING)
    sale = models.CharField(max_length=16, choices=SaleState.choices, default=SaleState.NONE)
    # 直近に確認できた所有者（= BE の user id）。転売で変わるので投影でしかない
    owner_principal = models.PositiveBigIntegerField(null=True, blank=True, db_index=True)

    # 「コレクション親と同じ作成者の鍵から出ているか」の判定結果（S009 §16）。
    # プロトコルは serial の正当性を強制しないので、market がバッジで示す。
    is_canonical = models.BooleanField(default=False)

    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chain_edition'
        ordering = ['work_id', 'serial']
        constraints = [
            models.UniqueConstraint(fields=['work', 'serial'], name='uniq_edition_serial_per_work'),
        ]
        indexes = [
            models.Index(fields=['sale']),
        ]

    def __str__(self) -> str:
        return f'{self.nft_origin} #{self.serial}/{self.total}'


class PartStatus(models.TextChoices):
    PENDING = 'pending', 'pending'
    BROADCAST = 'broadcast', 'broadcast'
    CONFIRMED = 'confirmed', 'confirmed'
    FAILED = 'failed', 'failed'


class ContentPart(models.Model):
    """
    本体チャンクの所在（S009 §15.1）。

    `(txid, vout, bytes, sha256)` が `parts[]` の 1 要素そのもの。これが
    「市場が消えても作品は残る」ことの実体なので、列を増やしても
    **この 4 つの意味は変えない**。
    """

    work = models.ForeignKey('product.Work', on_delete=models.CASCADE, related_name='parts')
    index = models.PositiveIntegerField(help_text='0 始まり。AAD にもこの番号が入る')

    txid = models.CharField(max_length=64, blank=True)
    vout = models.PositiveIntegerField(default=0)
    bytes = models.PositiveIntegerField(default=default_chunk_bytes)
    sha256 = models.CharField(max_length=64, blank=True, help_text='暗号文チャンクの sha256')

    status = models.CharField(max_length=16, choices=PartStatus.choices,
                              default=PartStatus.PENDING, db_index=True)
    attempts = models.PositiveIntegerField(default=0)
    last_error = models.TextField(blank=True)
    broadcast_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chain_content_part'
        ordering = ['work_id', 'index']
        constraints = [
            models.UniqueConstraint(fields=['work', 'index'], name='uniq_part_index_per_work'),
        ]

    def __str__(self) -> str:
        return f'work {self.work_id} part {self.index}'


class MintKind(models.TextChoices):
    PARTS = 'parts', 'parts'      # (A) 本体チャンクの放送（market の fee wallet）
    PARENT = 'parent', 'parent'   # (B) 親 = プレビュー + マニフェスト（既存 NC 経路）
    CHILD = 'child', 'child'      # (C) 子 = serial 1..N（既存 NC 経路）


class MintStatus(models.TextChoices):
    PENDING = 'pending', 'pending'
    PREPARED = 'prepared', 'prepared'
    SUBMITTED = 'submitted', 'submitted'
    ACKED = 'acked', 'acked'
    FAILED = 'failed', 'failed'


class MintJob(models.Model):
    """
    限定 N 点の逐次作成を**冪等**にする（S009 §15.5）。

    `ack` 済みは増えない。中断したら同じ work を再開する。
    (A) は (B)(C) より先（親の `subTypeData` に `parts[]` を埋める必要がある）。
    """

    work = models.ForeignKey('product.Work', on_delete=models.CASCADE, related_name='mint_jobs')
    kind = models.CharField(max_length=16, choices=MintKind.choices)
    serial = models.PositiveIntegerField(null=True, blank=True,
                                         help_text='child のときだけ。parent/parts は null')

    status = models.CharField(max_length=16, choices=MintStatus.choices,
                              default=MintStatus.PENDING, db_index=True)
    txid = models.CharField(max_length=64, blank=True)
    nft_origin = models.CharField(max_length=80, blank=True)
    attempts = models.PositiveIntegerField(default=0)
    last_error = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chain_mint_job'
        ordering = ['work_id', 'kind', 'serial']
        constraints = [
            # 同じ (work, kind, serial) は 1 本だけ = ack の二重計上が起きない
            models.UniqueConstraint(fields=['work', 'kind', 'serial'],
                                    name='uniq_mint_job_per_work_kind_serial'),
        ]

    def __str__(self) -> str:
        suffix = f' #{self.serial}' if self.serial is not None else ''
        return f'work {self.work_id} {self.kind}{suffix} ({self.status})'


class Manifest(models.Model):
    """
    作品マニフェスト `ordinalx.work/1`（S009 §20.1）の**写し**。

    全文は作品 NFT の `subTypeData` に入っていて、そちらが正。ここに持つのは
    検索と再構成のためで、`sha256` で改竄を検知できるようにしておく
    （market が差し替えてもオンチェーンと突き合わせれば分かる）。
    """

    work = models.OneToOneField('product.Work', on_delete=models.CASCADE,
                                related_name='manifest')
    spec = models.CharField(max_length=32, default='ordinalx.work/1')
    # 親 NFT の origin。放送前は空
    nft_origin = models.CharField(max_length=80, blank=True)
    json = models.JSONField(default=dict)
    sha256 = models.CharField(max_length=64, blank=True)
    is_onchain = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chain_manifest'

    def __str__(self) -> str:
        return f'manifest for work {self.work_id} ({self.spec})'


class NftCache(models.Model):
    """
    サムネイルのキャッシュ（S009 §7.5、§5・§14-6）。

    - 長辺 512px WebP・1 件 50 KB 上限・**再エンコードして**から入れる
      （ユーザー投稿由来なので content-type のホワイトリストと合わせて効かせる）
    - **総量上限と LRU を最初から**。`/mnt/extra` の空きが僅かなので、
      上限を後から足すのでは間に合わない
    - BE は /media を配信しないので、バイト列は DB に持って API から出す
    """

    nft_origin = models.CharField(max_length=80, unique=True)
    name = models.CharField(max_length=200, blank=True)
    content_type = models.CharField(max_length=64, blank=True)

    thumb = models.BinaryField(null=True, blank=True, editable=False)
    thumb_bytes = models.PositiveIntegerField(default=0)

    fetched_at = models.DateTimeField(null=True, blank=True)
    # LRU の基準。参照のたびに更新する
    last_used_at = models.DateTimeField(null=True, blank=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chain_nft_cache'

    def __str__(self) -> str:
        return self.nft_origin
