from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.ytmusic_client import search_tracks, enrich_with_view_counts, search_albums, get_album_tracks
from .services.stream_client import get_audio_stream_url


class SearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '').strip()

        if not query:
            return Response({"error": "Параметр 'q' обязателен"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            results = search_tracks(query)
            results = enrich_with_view_counts(results)
        except Exception as e:
            return Response({"error": f"Ошибка поиска: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({"results": results})
    
class SearchAlbumsView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({"error": "Параметр 'q' обязателен"}, status=400)

        try:
            results = search_albums(query)
        except Exception as e:
            return Response({"error": f"Ошибка поиска: {str(e)}"}, status=502)

        return Response({"results": results})


class AlbumTracksView(APIView):
    def get(self, request, browse_id):
        try:
            results = get_album_tracks(browse_id)
            results = enrich_with_view_counts(results)
        except Exception as e:
            return Response({"error": f"Ошибка: {str(e)}"}, status=502)

        return Response({"results": results})

class StreamView(APIView):
    def get(self, request, external_id):
        try:
            data = get_audio_stream_url(external_id)
        except Exception as e:
            return Response({"error": f"Не удалось получить поток: {str(e)}"}, status=502)

        return Response(data)