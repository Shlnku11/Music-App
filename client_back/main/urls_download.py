from django.urls import path
from .views import DownloadTrackView

urlpatterns = [
    path('', DownloadTrackView.as_view(), name='download-track'),
]