from django.urls import path
from .views import SearchView, SearchAlbumsView, AlbumTracksView

urlpatterns = [
    path('', SearchView.as_view(), name='search'),
    path('albums/', SearchAlbumsView.as_view(), name='search-albums'),
    path('album/<str:browse_id>/', AlbumTracksView.as_view(), name='album-tracks'),
]