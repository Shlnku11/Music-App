from django.contrib import admin
from .models import User, Music, TypeMusic, Favorite, ListenHistory, PlaylistMusic, Playlist
from .models import PremiumAccess


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'telegram_id', 'stars', 'is_premium_active')
    search_fields = ('username', 'telegram_id')
    list_filter = ('is_active',)

    def is_premium_active(self, obj):
        access = PremiumAccess.objects.filter(user=obj).first()
        if access:
            return access.is_active()
        return False
    is_premium_active.short_description = 'Premium'
    is_premium_active.boolean = True


@admin.register(PremiumAccess)
class PremiumAccessAdmin(admin.ModelAdmin):
    list_display = ('user', 'user_telegram_id', 'granted_by_admin', 'expires_at', 'is_active_display')
    search_fields = ('user__username', 'user__telegram_id')
    list_filter = ('granted_by_admin',)
    actions = ['grant_permanent_premium', 'revoke_premium']

    def user_telegram_id(self, obj):
        return obj.user.telegram_id
    user_telegram_id.short_description = 'Telegram ID'

    def is_active_display(self, obj):
        return obj.is_active()
    is_active_display.short_description = 'Активен'
    is_active_display.boolean = True

    def grant_permanent_premium(self, request, queryset):
        queryset.update(granted_by_admin=True, expires_at=None)
        self.message_user(request, "Постоянный премиум выдан.")
    grant_permanent_premium.short_description = "Выдать постоянный премиум"

    def revoke_premium(self, request, queryset):
        queryset.delete()
        self.message_user(request, "Премиум отозван.")
    revoke_premium.short_description = "Отозвать премиум"


@admin.register(Music)
class MusicAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'artist', 'source', 'external_id')
    search_fields = ('title', 'artist', 'external_id')


@admin.register(TypeMusic)
class TypeMusicAdmin(admin.ModelAdmin):
    pass


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'music', 'created_at')
    search_fields = ('user__username',)


@admin.register(ListenHistory)
class ListenHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'music', 'listened_at')
    list_filter = ('listened_at',)


@admin.register(PlaylistMusic)
class PlaylistMusicAdmin(admin.ModelAdmin):
    pass


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user')
    search_fields = ('name', 'user__username')
