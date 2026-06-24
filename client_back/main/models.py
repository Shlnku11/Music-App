import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.contrib.auth.models import User

class User(AbstractUser):
    telegram_id = models.BigIntegerField(unique=True, null=True, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    stars = models.PositiveIntegerField(default=0)
    listen_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"


class TypeMusic(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Жанр"
        verbose_name_plural = "Жанры"


class Music(models.Model):
    SOURCE_CHOICES = [
        ('youtube', 'YouTube Music'),
        ('itunes', 'iTunes'),
    ]

    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='youtube')
    external_id = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    thumbnail_url = models.URLField(blank=True, null=True)
    duration_seconds = models.PositiveIntegerField(blank=True, null=True)
    type_music = models.ForeignKey(TypeMusic, on_delete=models.SET_NULL, null=True, blank=True, related_name="musics")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Музыка"
        verbose_name_plural = "Музыка"
        unique_together = ("source", "external_id")


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    music = models.ForeignKey(Music, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Избранное"
        verbose_name_plural = "Избранное"
        unique_together = ("user", "music")


class Playlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="playlists")
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Плейлист"
        verbose_name_plural = "Плейлисты"


class PlaylistMusic(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="tracks")
    music = models.ForeignKey(Music, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Музыка в плейлисте"
        verbose_name_plural = "Музыка в плейлистах"


class ListenHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    music = models.ForeignKey(Music, on_delete=models.CASCADE)
    listened_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "История прослушивания"
        verbose_name_plural = "История прослушиваний"



class LoginSession(models.Model):
    session_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    telegram_id = models.BigIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

class LoginSession(models.Model):
    session_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    telegram_id = models.BigIntegerField(null=True, blank=True)
    telegram_username = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
class PremiumAccess(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='premium_access')
    granted_by_admin = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_active(self):
        if self.granted_by_admin:
            return True
        if not self.expires_at:
            return False
        from django.utils import timezone
        return self.expires_at > timezone.now()
    
class TrackPurchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    music = models.ForeignKey(Music, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'music')
        
class PremiumAccess(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    end_date = models.DateTimeField()

    def is_active(self):
        return self.end_date > timezone.now()

class TrackPurchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    track_id = models.CharField(max_length=255)
    purchased_at = models.DateTimeField(auto_now_add=True)
    