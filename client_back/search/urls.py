from django.urls import path
from .views import SearchView, SearchAlbumsView, AlbumTracksView, StreamView

urlpatterns = [
    path('', SearchView.as_view(), name='search'),
    path('albums/', SearchAlbumsView.as_view(), name='search-albums'),
    path('album/<str:browse_id>/', AlbumTracksView.as_view(), name='album-tracks'),
    path('stream/<str:external_id>/', StreamView.as_view(), name='stream'),
]