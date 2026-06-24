import os
import logging
import yt_dlp

logger = logging.getLogger(__name__)


def get_audio_stream_url(video_id: str):
    url = f"https://www.youtube.com/watch?v={video_id}"

    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'web'],
            }
        },
    }

    # Используем куки из переменной окружения если задан путь
    cookies_path = os.getenv('YT_COOKIES_PATH')
    if cookies_path and os.path.exists(cookies_path):
        ydl_opts['cookiefile'] = cookies_path
        logger.debug(f"Using cookies from {cookies_path}")

    # Или из переменной YT_COOKIES (содержимое файла сохраняем временно)
    yt_cookies_content = os.getenv('YT_COOKIES')
    if yt_cookies_content and not cookies_path:
        import tempfile
        tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False)
        tmp.write(yt_cookies_content)
        tmp.close()
        ydl_opts['cookiefile'] = tmp.name
        logger.debug("Using cookies from YT_COOKIES env var")

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if not info:
                raise ValueError(f"Не удалось получить информацию о видео {video_id}")
            return {
                "audio_url": info.get('url'),
                "duration": info.get('duration'),
                "title": info.get('title'),
            }
    except Exception as e:
        logger.exception(f"Stream error for video_id={video_id}")
        raise
    finally:
        # Удаляем временный файл куки если создавали
        if yt_cookies_content and not cookies_path and 'cookiefile' in ydl_opts:
            try:
                os.remove(ydl_opts['cookiefile'])
            except Exception:
                pass
