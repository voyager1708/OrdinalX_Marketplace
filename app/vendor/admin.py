from django.contrib import admin

from vendor.models import Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'owner_principal', 'paymail',
                    'is_identity_verified', 'is_suspended', 'created_at')
    list_filter = ('is_identity_verified', 'is_suspended')
    search_fields = ('name', 'slug', 'paymail', 'owner_principal')
    prepopulated_fields = {'slug': ('name',)}
