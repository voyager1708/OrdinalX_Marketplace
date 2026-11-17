from django.contrib import admin

from listing.models import (
    BlockedContent,
    Listing,
    ListingEvent,
    Purchase,
    SettlementJob,
    TakedownRequest,
    TxTemplate,
)


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('nft_origin', 'kind', 'status', 'price_satoshis', 'fee_bps',
                    'seller_principal', 'market_env', 'created_at', 'reconciled_at')
    list_filter = ('kind', 'status', 'market_env')
    search_fields = ('nft_origin', 'listing_txid', 'seller_paymail', 'seller_principal')


@admin.register(TxTemplate)
class TxTemplateAdmin(admin.ModelAdmin):
    list_display = ('template_id', 'kind', 'principal', 'expires_at', 'consumed_at')
    list_filter = ('kind',)
    search_fields = ('template_id', 'tx_fingerprint', 'principal')


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'buyer_principal', 'paid_satoshis', 'fee_satoshis',
                    'status', 'txid', 'market_env', 'created_at', 'confirmed_at')
    list_filter = ('status', 'market_env')
    search_fields = ('txid', 'buyer_principal')


@admin.register(SettlementJob)
class SettlementJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'kind', 'state', 'purchase', 'txid', 'attempts', 'next_attempt_at')
    list_filter = ('kind', 'state')
    search_fields = ('txid',)


@admin.register(ListingEvent)
class ListingEventAdmin(admin.ModelAdmin):
    list_display = ('kind', 'listing', 'purchase', 'principal', 'txid', 'created_at')
    list_filter = ('kind',)
    search_fields = ('txid', 'principal')
    # 監査証跡は書き換えない
    readonly_fields = tuple(f.name for f in ListingEvent._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(TakedownRequest)
class TakedownRequestAdmin(admin.ModelAdmin):
    list_display = ('target_value', 'kind', 'state', 'claimant',
                    'received_at', 'sla_due_at', 'decided_at')
    list_filter = ('kind', 'state')
    search_fields = ('target_value', 'claimant')


@admin.register(BlockedContent)
class BlockedContentAdmin(admin.ModelAdmin):
    list_display = ('kind', 'value', 'actor', 'created_at')
    list_filter = ('kind',)
    search_fields = ('value',)
