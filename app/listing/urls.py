"""板の公開 EP（documents/Specification.md §6）。実パスは /market/api/v1/...。"""

from django.urls import path

from listing import views

urlpatterns = [
    path('listings', views.ListingListAPIView.as_view(), name='listings'),
    path('listings/<int:listing_id>', views.ListingDetailAPIView.as_view(), name='listing-detail'),
    path('nft/<str:origin>/thumb', views.NftThumbAPIView.as_view(), name='nft-thumb'),
    path('stats', views.StatsAPIView.as_view(), name='stats'),

    # 出品（認証必須・§6）。Phase 2
    path('listings/draft', views.ListingDraftAPIView.as_view(), name='listing-draft'),
    path('listings/submit', views.ListingSubmitAPIView.as_view(), name='listing-submit'),
    path('listings/<int:listing_id>/cancel/draft',
         views.ListingCancelDraftAPIView.as_view(), name='cancel-draft'),
    path('listings/<int:listing_id>/cancel/submit',
         views.ListingCancelSubmitAPIView.as_view(), name='cancel-submit'),
    path('me/listings', views.MyListingsAPIView.as_view(), name='my-listings'),
]
