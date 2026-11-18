"""板の公開 EP（documents/Specification.md §6）。実パスは /market/api/v1/...。"""

from django.urls import path

from listing import views

urlpatterns = [
    path('listings', views.ListingListAPIView.as_view(), name='listings'),
    path('listings/<int:listing_id>', views.ListingDetailAPIView.as_view(), name='listing-detail'),
    path('nft/<str:origin>/thumb', views.NftThumbAPIView.as_view(), name='nft-thumb'),
    path('stats', views.StatsAPIView.as_view(), name='stats'),
]
