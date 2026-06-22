from django.urls import path
from .views import TelegramAuthView, ToggleFavoriteView, FavoriteListView

urlpatterns = [
    path('telegram/', TelegramAuthView.as_view(), name='telegram-auth'),
]