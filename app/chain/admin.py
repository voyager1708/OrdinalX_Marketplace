from django.contrib import admin

from chain.models import ContentPart, Edition, Manifest, MintJob, NftCache


@admin.register(Edition)
class EditionAdmin(admin.ModelAdmin):
    list_display = ('nft_origin', 'work', 'serial', 'total', 'ownership', 'sale',
                    'owner_principal', 'is_canonical', 'last_synced_at')
    list_filter = ('ownership', 'sale', 'is_canonical')
    search_fields = ('nft_origin', 'txid', 'name')


@admin.register(ContentPart)
class ContentPartAdmin(admin.ModelAdmin):
    list_display = ('work', 'index', 'txid', 'bytes', 'status', 'attempts', 'broadcast_at')
    list_filter = ('status',)
    search_fields = ('txid', 'sha256')


@admin.register(MintJob)
class MintJobAdmin(admin.ModelAdmin):
    list_display = ('work', 'kind', 'serial', 'status', 'txid', 'attempts', 'updated_at')
    list_filter = ('kind', 'status')
    search_fields = ('txid', 'nft_origin')


@admin.register(Manifest)
class ManifestAdmin(admin.ModelAdmin):
    list_display = ('work', 'spec', 'nft_origin', 'is_onchain', 'updated_at')
    list_filter = ('spec', 'is_onchain')
    search_fields = ('nft_origin', 'sha256')


@admin.register(NftCache)
class NftCacheAdmin(admin.ModelAdmin):
    list_display = ('nft_origin', 'name', 'content_type', 'thumb_bytes',
                    'fetched_at', 'last_used_at')
    search_fields = ('nft_origin', 'name')
    # バイト列は admin から触らない
    exclude = ('thumb',)
