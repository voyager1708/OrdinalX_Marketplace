from django.contrib import admin

from product.models import Category, Work, WorkFeeLedger


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'sort_order')
    prepopulated_fields = {'slug': ('name',)}


class WorkFeeLedgerInline(admin.StackedInline):
    model = WorkFeeLedger
    extra = 0
    # 固定した記録なので admin から書き換えない（§10「後からポリシーを変えても遡及しない」）
    readonly_fields = ('policy', 'estimated_satoshis', 'yp_satoshis', 'market_satoshis',
                       'collected_satoshis', 'collection_txid', 'estimated_jpy',
                       'rate_jpy_per_bsv', 'rate_source', 'created_at', 'updated_at')


@admin.register(Work)
class WorkAdmin(admin.ModelAdmin):
    list_display = ('title', 'vendor', 'status', 'rating', 'access',
                    'price_satoshis', 'total', 'market_env', 'created_at')
    list_filter = ('status', 'rating', 'access', 'format', 'market_env')
    search_fields = ('title', 'author_name', 'creator_principal')
    inlines = [WorkFeeLedgerInline]
