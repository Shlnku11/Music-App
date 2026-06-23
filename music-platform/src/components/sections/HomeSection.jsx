import { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { useHistory } from '../../context/HistoryContext';
import TrackCard from '../shared/TrackCard';
import AlbumCard from '../shared/AlbumCard';
import AlbumView from '../../pages/AlbumView';

const API_URL = import.meta.env.VITE_API_URL;

const HomeSection = () => {
  const { currentTrack, playTrack } = usePlayer();
  const { history } = useHistory();
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [premiumTracks, setPremiumTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const recentArtist = history[0]?.artist;
        const recQuery = recentArtist ? `${recentArtist} radio` : 'top hits 2026';

        const [tracksRes, albumsRes, recRes, premiumRes] = await Promise.all([
          fetch(`${API_URL}/search/?q=${encodeURIComponent('billboard hot 100 hits')}`),
          fetch(`${API_URL}/search/albums/?q=${encodeURIComponent('top albums 2026')}`),
          fetch(`${API_URL}/search/?q=${encodeURIComponent(recQuery)}`),
          fetch(`${API_URL}/search/?q=${encodeURIComponent('most viewed music videos all time')}`),
        ]);

        if (!tracksRes.ok || !albumsRes.ok || !recRes.ok || !premiumRes.ok) throw new Error('API error');

        setTracks((await tracksRes.json()).results || []);
        setAlbums((await albumsRes.json()).results || []);
        setRecommended((await recRes.json()).results || []);

        const premiumData = (await premiumRes.json()).results || [];
        setPremiumTracks(premiumData.filter((t) => t.is_premium));
      } catch (e) {
        console.error('Failed to load home data', e);
        setError('Не удалось загрузить данные. Проверь, что бэкенд запущен.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (selectedAlbum) {
    return <AlbumView album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />;
  }

  if (loading) return <div className="loading-state">Загрузка...</div>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="home-section">
      {recommended.length > 0 && (
        <section className="home-row">
          <h2>Рекомендуем тебе</h2>
          <div className="horizontal-scroll">
            {recommended.map((track) => (
              <div className="scroll-item" key={track.external_id}>
                <TrackCard
                  track={track}
                  isActive={currentTrack?.external_id === track.external_id}
                  onPlay={() => playTrack(track, recommended)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="home-row">
        <h2>Популярное</h2>
        <div className="horizontal-scroll">
          {tracks.map((track) => (
            <div className="scroll-item" key={track.external_id}>
              <TrackCard
                track={track}
                isActive={currentTrack?.external_id === track.external_id}
                onPlay={() => playTrack(track, tracks)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="home-row">
        <h2>Самые прослушиваемые альбомы</h2>
        <div className="horizontal-scroll">
          {albums.map((album) => (
            <div className="scroll-item" key={album.browse_id}>
              <AlbumCard album={album} onClick={() => setSelectedAlbum(album)} />
            </div>
          ))}
        </div>
      </section>

      {premiumTracks.length > 0 && (
        <section className="home-row">
          <h2>Премиум</h2>
          <div className="horizontal-scroll">
            {premiumTracks.map((track) => (
              <div className="scroll-item" key={track.external_id}>
                <TrackCard
                  track={track}
                  isActive={currentTrack?.external_id === track.external_id}
                  onPlay={() => playTrack(track, premiumTracks)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomeSection;