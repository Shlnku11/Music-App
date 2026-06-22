from django.urls import path
from .views import HistoryView, ClearHistoryView

urlpatterns = [
    path('', HistoryView.as_view(), name='history'),
    path('clear/', ClearHistoryView.as_view(), name='history-clear'),
]