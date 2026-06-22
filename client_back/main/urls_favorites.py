from django.urls import path
from .views import ToggleFavoriteView, FavoriteListView

urlpatterns = [
    path('toggle/', ToggleFavoriteView.as_view(), name='favorite-toggle'),
    path('list/', FavoriteListView.as_view(), name='favorite-list'),
]