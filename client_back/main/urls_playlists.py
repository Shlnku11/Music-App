from django.urls import path
from .views import PlaylistListCreateView, PlaylistDetailView, PlaylistAddTrackView, PlaylistRemoveTrackView

urlpatterns = [
    path('', PlaylistListCreateView.as_view(), name='playlist-list-create'),
    path('<int:playlist_id>/', PlaylistDetailView.as_view(), name='playlist-detail'),
    path('<int:playlist_id>/add/', PlaylistAddTrackView.as_view(), name='playlist-add'),
    path('<int:playlist_id>/remove/', PlaylistRemoveTrackView.as_view(), name='playlist-remove'),
]