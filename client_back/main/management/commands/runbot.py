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
                        user = User.objects.filter(id=int(payload)).first()
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
                                    "reply_markup": '{"inline_keyboard":[[{"text":"Открыть сайт","url":"http://localhost:5173"}]]}',
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