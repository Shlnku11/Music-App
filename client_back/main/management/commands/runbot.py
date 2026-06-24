import os
import time
import requests
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from main.models import LoginSession, User, PremiumAccess

TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
API_URL = f"https://api.telegram.org/bot{TOKEN}"


class Command(BaseCommand):
    help = 'Запускает long-polling Telegram-бота'

    def handle(self, *args, **options):
        self.stdout.write("Бот запущен, слушаю обновления...")
        offset = 0

        while True:
            try:
                resp = requests.get(
                    f"{API_URL}/getUpdates",
                    params={"offset": offset, "timeout": 30},
                    timeout=35,
                )
                data = resp.json()

                for update in data.get("result", []):
                    offset = update["update_id"] + 1

                    if "pre_checkout_query" in update:
                        query_id = update["pre_checkout_query"]["id"]
                        requests.post(f"{API_URL}/answerPreCheckoutQuery", data={
                            "pre_checkout_query_id": query_id,
                            "ok": True,
                        })
                        continue

                    message = update.get("message")
                    if not message:
                        continue

                    if "successful_payment" in message:
                        payload = message["successful_payment"]["invoice_payload"]
                        parts = payload.split(":")

                        if parts[0] == "sub":
                            user = User.objects.filter(id=int(parts[1])).first()
                            if user:
                                access = PremiumAccess.objects.filter(user=user).first()
                                base_time = timezone.now()
                                if access and access.expires_at and access.expires_at > base_time:
                                    base_time = access.expires_at
                                new_expiry = base_time + timedelta(days=30)
                                PremiumAccess.objects.update_or_create(
                                    user=user,
                                    defaults={'granted_by_admin': False, 'expires_at': new_expiry},
                                )
                                requests.post(f"{API_URL}/sendMessage", data={
                                    "chat_id": message["from"]["id"],
                                    "text": "Оплата прошла успешно! Premium активирован на 30 дней.",
                                })

                        elif parts[0] in ("track", "download"):
                            from main.models import Music, TrackPurchase
                            user = User.objects.filter(id=int(parts[1])).first()
                            if user:
                                music, _ = Music.objects.get_or_create(
                                    source='youtube',
                                    external_id=parts[2],
                                    defaults={
                                        'title': parts[3] if len(parts) > 3 else '',
                                        'artist': parts[4] if len(parts) > 4 else '',
                                        'thumbnail_url': parts[5] if len(parts) > 5 else None,
                                        'duration_seconds': int(parts[6]) if len(parts) > 6 and parts[6].isdigit() else None,
                                    },
                                )
                                TrackPurchase.objects.get_or_create(user=user, music=music)

                                # Логика отправки файла, если это был запрос на скачивание
                                if parts[0] == "download":
                                    from search.services.download_client import download_audio_file
                                    import os as os_mod
                                    try:
                                        filepath, _ = download_audio_file(parts[2])
                                        with open(filepath, 'rb') as f:
                                            requests.post(f"{API_URL}/sendAudio", data={
                                                "chat_id": message["from"]["id"],
                                                "title": music.title,
                                                "performer": music.artist,
                                            }, files={"audio": f})
                                        os_mod.remove(filepath)
                                    except Exception as e:
                                        requests.post(f"{API_URL}/sendMessage", data={
                                            "chat_id": message["from"]["id"],
                                            "text": f"Ошибка скачивания: {str(e)}",
                                        })
                                else:
                                    # Обычная покупка трека в коллекцию без скачивания в чат
                                    requests.post(f"{API_URL}/sendMessage", data={
                                        "chat_id": message["from"]["id"],
                                        "text": f"Трек '{music.title}' куплен и разблокирован!",
                                    })
                        continue

                    text = message.get("text", "")
                    chat_id = message["from"]["id"]
                    from_user = message["from"]
                    username = from_user.get("username") or from_user.get("first_name") or f"user_{chat_id}"

                    if text.startswith("/start"):
                        parts = text.split(maxsplit=1)
                        if len(parts) == 2:
                            token = parts[1].strip()
                            session = LoginSession.objects.filter(session_token=token).first()
                            if session:
                                session.telegram_id = chat_id
                                session.telegram_username = username
                                session.status = 'confirmed'
                                session.save()
                                requests.post(f"{API_URL}/sendMessage", data={
                                    "chat_id": chat_id,
                                    "text": "Вход подтверждён! Возвращайся на сайт.",
                                    "reply_markup": '{"inline_keyboard":[[{"text":"Открыть сайт","url":"https://shlnku11.github.io/music-platform"}]]}',
                                })
                            else:
                                requests.post(f"{API_URL}/sendMessage", data={
                                    "chat_id": chat_id,
                                    "text": "Сессия не найдена или устарела.",
                                })
                        else:
                            requests.post(f"{API_URL}/sendMessage", data={
                                "chat_id": chat_id,
                                "text": "Привет! Открой этого бота через кнопку входа на сайте.",
                            })

            except Exception as e:
                self.stdout.write(f"Ошибка: {e}")
                time.sleep(5)