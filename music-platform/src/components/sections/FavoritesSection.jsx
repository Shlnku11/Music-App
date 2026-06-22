import { useFavorites } from '../../context/FavoritesContext';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import TrackCard from '../shared/TrackCard';

const FavoritesSection = () => {
  const { user } = useAuth();
  const { favorites, loading } = useFavorites();
  const { currentTrack, playTrack } = usePlayer();

  if (!user) {
    return <p>Войдите, чтобы видеть избранное.</p>;
  }

  if (loading) return <p>Загрузка...</p>;
  if (favorites.length === 0) return <p>В избранном пока пусто.</p>;

  return (
    <div className="track-grid">
      {favorites.map((track) => (
        <TrackCard
          key={track.external_id}
          track={track}
          isActive={currentTrack?.external_id === track.external_id}
          onPlay={() => playTrack(track, favorites)}
        />
      ))}
    </div>
  );
};

export default FavoritesSection;