from django.contrib import admin

# Register your models here.

from .models import User, Music, TypeMusic, Favorite, ListenHistory, PlaylistMusic, Playlist

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass

@admin.register(Music)
class MusicAdmin(admin.ModelAdmin):
    pass

@admin.register(TypeMusic)
class TypeMusicAdmin(admin.ModelAdmin):
    pass

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    pass


@admin.register(ListenHistory)
class ListenHistoryAdmin(admin.ModelAdmin):
    pass

@admin.register(PlaylistMusic)
class PlaylistMusicAdmin(admin.ModelAdmin):
    pass

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    pass