import os
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User, Music, Favorite, Playlist, PlaylistMusic, ListenHistory, LoginSession
from .serializers import UserSerializer
from datetime import timedelta
from django.utils import timezone
from .models import PremiumAccess, TrackPurchase
import requests as http_requests
import os as os_module
from search.services.download_client import download_audio_file

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"


ADMIN_TELEGRAM_ID = 8412123085


class TelegramAuthView(APIView):
    def post(self, request):
        telegram_id = request.data.get('telegram_id')
        username = request.data.get('username', f'user_{telegram_id}')

        if not telegram_id:
            return Response({"error": "telegram_id обязателен"}, status=400)

        user, created = User.objects.get_or_create(
            telegram_id=telegram_id,
            defaults={'username': username},
        )

        return Response(UserSerializer(user).data)

class ToggleFavoriteView(APIView):
    def post(self, request):
        user_id = request.data.get('user')
        track = request.data.get('track', {})
        external_id = track.get('external_id')

        if not user_id or not external_id:
            return Response({"error": "user и track.external_id обязательны"}, status=400)

        music, _ = Music.objects.get_or_create(
            source='youtube',
            external_id=external_id,
            defaults={
                'title': track.get('title', ''),
                'artist': track.get('artist', ''),
                'thumbnail_url': track.get('thumbnail_url'),
                'duration_seconds': track.get('duration_seconds'),
            },
        )

        favorite = Favorite.objects.filter(user_id=user_id, music=music).first()

        if favorite:
            favorite.delete()
            return Response({"favorited": False})

        Favorite.objects.create(user_id=user_id, music=music)
        return Response({"favorited": True})


class FavoriteListView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user')
        if not user_id:
            return Response({"error": "user обязателен"}, status=400)

        favorites = Favorite.objects.filter(user_id=user_id).select_related('music')
        results = [
            {
                "favorite_id": f.id,
                "external_id": f.music.external_id,
                "title": f.music.title,
                "artist": f.music.artist,
                "thumbnail_url": f.music.thumbnail_url,
                "duration_seconds": f.music.duration_seconds,
            }
            for f in favorites
        ]
        return Response({"results": results})

        from .models import Playlist, PlaylistMusic, ListenHistory


def get_or_create_music(track):
    music, _ = Music.objects.get_or_create(
        source='youtube',
        external_id=track.get('external_id'),
        defaults={
            'title': track.get('title', ''),
            'artist': track.get('artist', ''),
            'thumbnail_url': track.get('thumbnail_url'),
            'duration_seconds': track.get('duration_seconds'),
        },
    )
    return music


class PlaylistListCreateView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user')
        if not user_id:
            return Response({"error": "user обязателен"}, status=400)

        playlists = Playlist.objects.filter(user_id=user_id)
        results = [
            {"id": p.id, "name": p.name, "track_count": p.tracks.count()}
            for p in playlists
        ]
        return Response({"results": results})

    def post(self, request):
        user_id = request.data.get('user')
        name = request.data.get('name', '').strip()

        if not user_id or not name:
            return Response({"error": "user и name обязательны"}, status=400)

        playlist = Playlist.objects.create(user_id=user_id, name=name)
        return Response({"id": playlist.id, "name": playlist.name, "track_count": 0})


class PlaylistDetailView(APIView):
    def get(self, request, playlist_id):
        tracks = PlaylistMusic.objects.filter(playlist_id=playlist_id).select_related('music')
        results = [
            {
                "playlist_music_id": pm.id,
                "external_id": pm.music.external_id,
                "title": pm.music.title,
                "artist": pm.music.artist,
                "thumbnail_url": pm.music.thumbnail_url,
                "duration_seconds": pm.music.duration_seconds,
            }
            for pm in tracks
        ]
        return Response({"results": results})

    def delete(self, request, playlist_id):
        Playlist.objects.filter(id=playlist_id).delete()
        return Response({"deleted": True})


class PlaylistAddTrackView(APIView):
    def post(self, request, playlist_id):
        track = request.data.get('track', {})
        if not track.get('external_id'):
            return Response({"error": "track.external_id обязателен"}, status=400)

        music = get_or_create_music(track)

        exists = PlaylistMusic.objects.filter(playlist_id=playlist_id, music=music).exists()
        if not exists:
            PlaylistMusic.objects.create(playlist_id=playlist_id, music=music)

        return Response({"added": True})


class PlaylistRemoveTrackView(APIView):
    def post(self, request, playlist_id):
        external_id = request.data.get('external_id')
        PlaylistMusic.objects.filter(
            playlist_id=playlist_id,
            music__external_id=external_id,
        ).delete()
        return Response({"removed": True})


class HistoryView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user')
        if not user_id:
            return Response({"error": "user обязателен"}, status=400)

        history = ListenHistory.objects.filter(user_id=user_id).select_related('music').order_by('-listened_at')[:50]
        seen = set()
        results = []
        for h in history:
            if h.music.external_id in seen:
                continue
            seen.add(h.music.external_id)
            results.append({
                "external_id": h.music.external_id,
                "title": h.music.title,
                "artist": h.music.artist,
                "thumbnail_url": h.music.thumbnail_url,
                "duration_seconds": h.music.duration_seconds,
                "listened_at": h.listened_at,
            })
        return Response({"results": results})

    def post(self, request):
        user_id = request.data.get('user')
        track = request.data.get('track', {})

        if not user_id or not track.get('external_id'):
            return Response({"error": "user и track.external_id обязательны"}, status=400)

        music = get_or_create_music(track)
        ListenHistory.objects.create(user_id=user_id, music=music)
        return Response({"added": True})

from .models import LoginSession


class StartBrowserLoginView(APIView):
    def post(self, request):
        session = LoginSession.objects.create()
        bot_username = os.getenv('TELEGRAM_BOT_USERNAME', 'EleveMusicBot')
        bot_link = f"https://t.me/{bot_username}?start={session.session_token}"
        return Response({
            "session_token": str(session.session_token),
            "bot_link": bot_link,
        })


class CheckBrowserLoginView(APIView):
    def get(self, request, token):
        session = LoginSession.objects.filter(session_token=token).first()

        if not session:
            return Response({"error": "Сессия не найдена"}, status=404)

        if session.status != 'confirmed' or not session.telegram_id:
            return Response({"status": "pending"})

        user, created = User.objects.get_or_create(
            telegram_id=session.telegram_id,
            defaults={'username': session.telegram_username or f'user_{session.telegram_id}'},
        )

        return Response({
            "status": "confirmed",
            "user": UserSerializer(user).data,
        })
        

class GrantPremiumView(APIView):
    def post(self, request):
        admin_telegram_id = request.data.get('admin_telegram_id')
        if str(admin_telegram_id) != str(ADMIN_TELEGRAM_ID):
            return Response({"error": "Нет прав"}, status=403)

        target_username = request.data.get('username', '').strip()
        if not target_username:
            return Response({"error": "username обязателен"}, status=400)

        target_user = User.objects.filter(username__iexact=target_username.strip()).first()
        if not target_user:
            return Response({"error": "Пользователь не найден"}, status=404)

        access, _ = PremiumAccess.objects.update_or_create(
            user=target_user,
            defaults={'granted_by_admin': True, 'expires_at': None},
        )

        return Response({"granted": True, "username": target_user.username})


class PremiumStatusView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user')
        if not user_id:
            return Response({"error": "user обязателен"}, status=400)

        access = PremiumAccess.objects.filter(user_id=user_id).first()

        if not access or not access.is_active():
            return Response({"active": False})

        return Response({
            "active": True,
            "granted_by_admin": access.granted_by_admin,
            "expires_at": access.expires_at,
        })


class SubscribePremiumView(APIView):
    def post(self, request):
        user_id = request.data.get('user')
        if not user_id:
            return Response({"error": "user обязателен"}, status=400)

        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"error": "Пользователь не найден"}, status=404)

        access = PremiumAccess.objects.filter(user=user).first()

        base_time = timezone.now()
        if access and access.expires_at and access.expires_at > base_time:
            base_time = access.expires_at

        new_expiry = base_time + timedelta(days=30)

        access, _ = PremiumAccess.objects.update_or_create(
            user=user,
            defaults={'granted_by_admin': False, 'expires_at': new_expiry},
        )

        return Response({"active": True, "expires_at": access.expires_at})
    
class AdminPremiumListView(APIView):
    def get(self, request):
        admin_telegram_id = request.query_params.get('admin_telegram_id')
        if str(admin_telegram_id) != str(ADMIN_TELEGRAM_ID):
            return Response({"error": "Нет прав"}, status=403)

        permanent = PremiumAccess.objects.filter(granted_by_admin=True).select_related('user')
        temporary = PremiumAccess.objects.filter(
            granted_by_admin=False,
            expires_at__gt=timezone.now(),
        ).select_related('user').order_by('expires_at')

        return Response({
            "permanent": [
                {"id": a.user.id, "username": a.user.username}
                for a in permanent
            ],
            "temporary": [
                {"id": a.user.id, "username": a.user.username, "expires_at": a.expires_at}
                for a in temporary
            ],
        })


class RevokePremiumBulkView(APIView):
    def post(self, request):
        admin_telegram_id = request.data.get('admin_telegram_id')
        if str(admin_telegram_id) != str(ADMIN_TELEGRAM_ID):
            return Response({"error": "Нет прав"}, status=403)

        user_ids = request.data.get('user_ids', [])
        PremiumAccess.objects.filter(user_id__in=user_ids, granted_by_admin=True).delete()

        return Response({"revoked": True, "count": len(user_ids)})
    
class CreateInvoiceView(APIView):
    def post(self, request):
        user_id = request.data.get('user')
        purchase_type = request.data.get('type', 'subscription')
        track = request.data.get('track')

        if not user_id:
            return Response({"error": "user обязателен"}, status=400)

        user = User.objects.filter(id=user_id).first()
        if not user or not user.telegram_id:
            return Response({"error": "У пользователя нет привязанного Telegram"}, status=400)

        if purchase_type == 'track':
            if not track or not track.get('external_id'):
                return Response({"error": "track обязателен"}, status=400)

            payload = f"track:{user.id}:{track['external_id']}:{track.get('title','')}:{track.get('artist','')}:{track.get('thumbnail_url','')}:{track.get('duration_seconds',0)}"
            title = f"{track.get('title', 'Трек')}"
            description = f"Покупка трека: {track.get('artist', '')}"
            amount = track.get('price', 1)
        else:
            payload = f"sub:{user.id}"
            title = "Premium на 30 дней"
            description = "Доступ ко всем платным трекам на месяц"
            amount = 100

        resp = http_requests.post(f"{TELEGRAM_API_URL}/sendInvoice", data={
            "chat_id": user.telegram_id,
            "title": title,
            "description": description,
            "payload": payload,
            "currency": "XTR",
            "prices": f'[{{"label":"{title}","amount":{amount}}}]',
        })

        if resp.status_code != 200:
            return Response({"error": "Не удалось отправить инвойс", "details": resp.text}, status=502)

        return Response({"sent": True})
    
class ClearHistoryView(APIView):
    def post(self, request):
        user_id = request.data.get('user')
        if not user_id:
            return Response({"error": "user обязателен"}, status=400)
        ListenHistory.objects.filter(user_id=user_id).delete()
        return Response({"cleared": True})
    
class CheckTrackPurchaseView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user')
        external_id = request.query_params.get('external_id')
        if not user_id or not external_id:
            return Response({"purchased": False})

        exists = TrackPurchase.objects.filter(
            user_id=user_id,
            music__external_id=external_id,
        ).exists()

        return Response({"purchased": exists})

class DownloadTrackView(APIView):
    def post(self, request):
        user_id = request.data.get('user')
        track = request.data.get('track', {})
        external_id = track.get('external_id')

        if not user_id or not external_id:
            return Response({"error": "user и track.external_id обязательны"}, status=400)

        user = User.objects.filter(id=user_id).first()
        if not user or not user.telegram_id:
            return Response({"error": "Нет привязанного Telegram"}, status=400)

        try:
            filepath, title = download_audio_file(external_id)
        except Exception as e:
            return Response({"error": f"Ошибка скачивания: {str(e)}"}, status=502)

        try:
            with open(filepath, 'rb') as f:
                http_requests.post(
                    f"{TELEGRAM_API_URL}/sendAudio",
                    data={
                        "chat_id": user.telegram_id,
                        "title": track.get('title', title),
                        "performer": track.get('artist', ''),
                    },
                    files={"audio": f},
                )
        finally:
            if os_module.path.exists(filepath):
                os_module.remove(filepath)

        return Response({"sent": True})