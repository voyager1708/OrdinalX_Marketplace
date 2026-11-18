"""
公開 EP の表現（documents/Specification.md §6）。

**外に出す列を明示する**。モデルをそのまま返すと、あとから足した内部用の列
（staging の寸法や審査のメモ）が黙って外に出る。
"""

from rest_framework import serializers

from listing.models import Listing


class ListingSerializer(serializers.ModelSerializer):
    """板の 1 行。一覧と詳細で同じ形を返す（FE が分岐しないで済む）。"""

    work_title = serializers.CharField(source='work.title', default='', read_only=True)
    vendor_name = serializers.CharField(source='work.vendor.name', default='', read_only=True)
    rating = serializers.CharField(source='work.rating', default='', read_only=True)
    serial = serializers.IntegerField(source='edition.serial', default=None, read_only=True)
    total = serializers.IntegerField(source='edition.total', default=None, read_only=True)

    class Meta:
        model = Listing
        fields = (
            'id', 'kind', 'status',
            'nft_origin', 'listed_outpoint', 'listing_txid',
            'price_satoshis', 'fee_bps',
            'seller_paymail',
            'work_title', 'vendor_name', 'rating', 'serial', 'total',
            'created_at', 'activated_at',
        )
        read_only_fields = fields


class StatsSerializer(serializers.Serializer):
    """`/stats`。数えるのは**見えている板**だけ（§9.1 の blocklist 適用後）。"""

    active_listings = serializers.IntegerField()
    total_volume_satoshis = serializers.IntegerField()
    sold_count = serializers.IntegerField()
    floor_price_satoshis = serializers.IntegerField(allow_null=True)
