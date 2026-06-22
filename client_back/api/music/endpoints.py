from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MusicViewSet, TypeMusicViewSet, PlaylistViewSet, PlaylistMusicViewSet, ListenHistoryViewSet, FavoriteViewSet

router = DefaultRouter()

router.register('users', UserViewSet)
router.register('music', MusicViewSet)
router.register('type-music', TypeMusicViewSet)
router.register('playlist', PlaylistViewSet)
router.register('playlists', PlaylistMusicViewSet)
router.register('listenhistory', ListenHistoryViewSet)
router.register('favorite', FavoriteViewSet)


urlpatterns = [
    path('', include(router.urls)),
]

