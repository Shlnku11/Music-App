import os
import uuid
import yt_dlp

TMP_DIR = "/tmp/downloads"
os.makedirs(TMP_DIR, exist_ok=True)


def download_audio_file(video_id: str):
    url = f"https://www.youtube.com/watch?v={video_id}"
    filename = f"{uuid.uuid4()}.mp3"
    filepath = os.path.join(TMP_DIR, filename)

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': filepath.replace('.mp3', ''),
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
        'extractor_args': {'youtube': {'player_client': ['android', 'web']}},
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    return filepath, info.get('title', 'track')