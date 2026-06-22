import os
import requests
from ytmusicapi import YTMusic

_yt = YTMusic()


def search_tracks(query: str, limit: int = 20):
    """
    Ищет треки на YouTube Music по текстовому запросу.
    Возвращает список нормализованных словарей.
    """
    results = _yt.search(query, filter="songs", limit=limit)
    return [_normalize(item) for item in results]


def get_track_by_id(video_id: str):
    """Получить детали трека по videoId (для лайков/плейлистов/истории)."""
    info = _yt.get_song(video_id)
    video_details = info.get("videoDetails", {})
    return {
        "external_id": video_id,
        "title": video_details.get("title", ""),
        "artist": video_details.get("author", ""),
        "thumbnail_url": _best_thumbnail(video_details.get("thumbnail", {}).get("thumbnails", [])),
        "duration_seconds": int(video_details.get("lengthSeconds", 0)) if video_details.get("lengthSeconds") else None,
    }


def _normalize(item: dict):
    artists = item.get("artists") or []
    artist_name = ", ".join(a.get("name", "") for a in artists if a.get("name"))
    thumbnails = item.get("thumbnails") or []

    return {
        "external_id": item.get("videoId"),
        "title": item.get("title", ""),
        "artist": artist_name,
        "thumbnail_url": _best_thumbnail(thumbnails),
        "duration_seconds": _parse_duration(item.get("duration")),
    }


def _best_thumbnail(thumbnails: list):
    if not thumbnails:
        return None
    return thumbnails[-1].get("url")  # последняя — самая большая


def _parse_duration(duration_str):
    if not duration_str:
        return None
    parts = duration_str.split(":")
    try:
        parts = [int(p) for p in parts]
    except ValueError:
        return None
    seconds = 0
    for p in parts:
        seconds = seconds * 60 + p
    return seconds

    import os
import requests

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
PREMIUM_THRESHOLD = 50_000_000


def enrich_with_view_counts(tracks):
    ids = [t["external_id"] for t in tracks if t.get("external_id")]
    if not ids or not YOUTUBE_API_KEY:
        for t in tracks:
            t["view_count"] = 0
            t["is_premium"] = False
            t["price"] = 0
        return tracks

    view_counts = {}
    for i in range(0, len(ids), 50):
        batch = ids[i:i + 50]
        resp = requests.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={
                "part": "statistics",
                "id": ",".join(batch),
                "key": YOUTUBE_API_KEY,
            },
            timeout=10,
        )
        data = resp.json()
        for item in data.get("items", []):
            view_counts[item["id"]] = int(item["statistics"].get("viewCount", 0))

    for t in tracks:
        count = view_counts.get(t["external_id"], 0)
        t["view_count"] = count
        t["is_premium"] = count >= PREMIUM_THRESHOLD
        t["price"] = 1 if count >= PREMIUM_THRESHOLD else 0

    return tracks

def search_albums(query: str, limit: int = 20):
    results = _yt.search(query, filter="albums", limit=limit)
    return [_normalize_album(item) for item in results]


def get_album_tracks(browse_id: str):
    album = _yt.get_album(browse_id)
    tracks = album.get("tracks", [])
    artist_name = album.get("artists", [{}])[0].get("name", "")

    return [
        {
            "external_id": t.get("videoId"),
            "title": t.get("title", ""),
            "artist": artist_name,
            "thumbnail_url": _best_thumbnail(album.get("thumbnails", [])),
            "duration_seconds": _parse_duration(t.get("duration")),
        }
        for t in tracks if t.get("videoId")
    ]


def _normalize_album(item: dict):
    artists = item.get("artists") or []
    artist_name = ", ".join(a.get("name", "") for a in artists if a.get("name"))
    thumbnails = item.get("thumbnails") or []

    return {
        "browse_id": item.get("browseId"),
        "title": item.get("title", ""),
        "artist": artist_name,
        "thumbnail_url": _best_thumbnail(thumbnails),
        "year": item.get("year"),
    }