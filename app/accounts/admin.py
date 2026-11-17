from django.contrib import admin

from accounts.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    # 投影なので編集はしない（BE が正）。審査者ロールと有効/無効だけ運用で触る。
    list_display = ('username', 'be_user_id', 'paymail', 'account_type',
                    'is_reviewer', 'is_staff', 'last_introspected_at')
    list_filter = ('account_type', 'is_reviewer', 'is_staff', 'is_active')
    search_fields = ('username', 'paymail', 'be_user_id')
    readonly_fields = ('be_user_id', 'username', 'paymail', 'account_type',
                       'email', 'last_introspected_at', 'date_joined', 'last_login')
