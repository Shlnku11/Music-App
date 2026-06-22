from rest_framework import serializers
from main.models import User, Music, TypeMusic, Favorite, ListenHistory, PlaylistMusic, Playlist



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class MusicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Music
        fields = '__all__'


class TypeMusicSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeMusic
        fields = '__all__'


class PlaylistMusicSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistMusic
        fields = '__all__'


class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = '__all__'

class ListenHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ListenHistory
        fields = '__all__'


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = '__all__'