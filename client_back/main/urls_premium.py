from django.urls import path
from .views import GrantPremiumView, PremiumStatusView, SubscribePremiumView, AdminPremiumListView, RevokePremiumBulkView, CreateInvoiceView

urlpatterns = [
    path('grant/', GrantPremiumView.as_view(), name='premium-grant'),
    path('status/', PremiumStatusView.as_view(), name='premium-status'),
    path('subscribe/', SubscribePremiumView.as_view(), name='premium-subscribe'),
    path('admin-list/', AdminPremiumListView.as_view(), name='premium-admin-list'),
    path('revoke-bulk/', RevokePremiumBulkView.as_view(), name='premium-revoke-bulk'),
    path('create-invoice/', CreateInvoiceView.as_view(), name='premium-create-invoice'),
]