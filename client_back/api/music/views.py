from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from .serializers import UserSerializer, MusicSerializer, TypeMusicSerializer, PlaylistMusicSerializer, PlaylistSerializer, ListenHistorySerializer, FavoriteSerializer
from  main.models import User, Music, TypeMusic, Favorite, ListenHistory, PlaylistMusic, Playlist

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class TypeMusicViewSet(ModelViewSet):
    queryset = TypeMusic.objects.all()
    serializer_class = TypeMusicSerializer


class MusicViewSet(ModelViewSet):
    queryset = Music.objects.all()
    serializer_class = MusicSerializer


class PlaylistMusicViewSet(ModelViewSet):
    queryset = PlaylistMusic.objects.all()
    serializer_class = PlaylistMusicSerializer

class PlaylistViewSet(ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer


class ListenHistoryViewSet(ModelViewSet):
    queryset = ListenHistory.objects.all()
    serializer_class = ListenHistorySerializer


class FavoriteViewSet(ModelViewSet):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
