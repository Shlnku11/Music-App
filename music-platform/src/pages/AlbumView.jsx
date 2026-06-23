import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import TrackCard from '../components/shared/TrackCard';

const API_URL = import.meta.env.VITE_API_URL;

const AlbumView = ({ album, onClose }) => {
  const { currentTrack, playTrack } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/search/album/${album.browse_id}/`);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        setTracks(data.results || []);
      } catch (e) {
        console.error('Failed to load album tracks', e);
        setError('Не удалось загрузить треки альбома.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [album.browse_id]);

  return (
    <div className="album-view">
      <button onClick={onClose}>← Назад</button>

      <div className="album-header">
        <img src={album.thumbnail_url} alt={album.title} className="album-view-cover" />
        <div>
          <h2>{album.title}</h2>
          <p>{album.artist}</p>
          {album.year && <p>{album.year}</p>}
        </div>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="track-grid-2col">
          {tracks.map((track) => (
            <TrackCard
              key={track.external_id}
              track={track}
              isActive={currentTrack?.external_id === track.external_id}
              onPlay={() => playTrack(track, tracks)}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default AlbumView;