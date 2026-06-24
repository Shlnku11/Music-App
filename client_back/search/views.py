import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.ytmusic_client import search_tracks, enrich_with_view_counts, search_albums, get_album_tracks
from .services.stream_client import get_audio_stream_url

logger = logging.getLogger(__name__)


class SearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '').strip()

        if not query:
            return Response({"error": "Параметр 'q' обязателен"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            results = search_tracks(query)
            results = enrich_with_view_counts(results)
        except Exception as e:
            logger.exception(f"Search error: query={query!r}")
            # Возвращаем пустой список вместо 500 — сайт не ломается
            return Response({"results": [], "warning": "Поиск временно недоступен"}, status=200)

        return Response({"results": results})


class SearchAlbumsView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({"error": "Параметр 'q' обязателен"}, status=400)

        try:
            results = search_albums(query)
        except Exception as e:
            logger.exception(f"SearchAlbums error: query={query!r}")
            return Response({"results": [], "warning": "Поиск альбомов временно недоступен"}, status=200)

        return Response({"results": results})


class AlbumTracksView(APIView):
    def get(self, request, browse_id):
        try:
            results = get_album_tracks(browse_id)
            results = enrich_with_view_counts(results)
        except Exception as e:
            logger.exception(f"AlbumTracks error: browse_id={browse_id}")
            return Response({"error": "Не удалось загрузить треки альбома"}, status=502)

        return Response({"results": results})


class StreamView(APIView):
    def get(self, request, external_id):
        try:
            data = get_audio_stream_url(external_id)
        except Exception as e:
            logger.exception(f"Stream error: external_id={external_id}")
            return Response({"error": f"Не удалось получить поток: {str(e)}"}, status=502)

        return Response(data)
