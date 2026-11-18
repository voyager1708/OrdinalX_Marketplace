"""
market-web の URL（documents/Specification.md §6・§13.1）。

fe-nginx は `location /market/` を **パスを落とさずに** proxy_pass するので、
Django 側も `market/` 付きで受ける。実パスは `/market/api/v1/...`。
開発の runserver :8100 でも同じパスで叩けるのが狙い（経路差を作らない）。

`accounts` のログイン・登録・パスワード再設定は**作らない**（§7）。
認証主体は BE 1 つだけ。例外は admin で、露出先は ADMIN_URL + nginx で遮断する。
"""

from django.conf import settings
from django.contrib import admin
from django.urls import path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from yp_marketplace.views import MarketIndexView

_admin_url = settings.ADMIN_URL if settings.ADMIN_URL.endswith('/') else settings.ADMIN_URL + '/'

urlpatterns = [
    path(_admin_url, admin.site.urls),

    path('market/api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('market/api/v1/schema/swagger-ui/',
         SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('market/api/v1/schema/redoc/',
         SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # 市場の画面。API より後に置く（/market/ の prefix が API と重なるため、
    # 先に置くと longest prefix ではなく定義順で拾ってしまう）
    path('market/', MarketIndexView.as_view(), name='index'),
]

# 板・作品・購入の API（§6）は Phase 1 以降でここに足す。
# Phase 0 の時点では URL を予約せず、view と一緒に入れる。
