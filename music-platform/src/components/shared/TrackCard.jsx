import { FaHeart, FaRegHeart, FaPlus, FaStar, FaCheckCircle } from 'react-icons/fa';
import { usePurchase } from '../../context/PurchaseContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useHistory } from '../../context/HistoryContext';
import { usePlaylistModal } from '../../context/PlaylistModalContext';
import { usePremium } from '../../context/PremiumContext';

const TrackCard = ({ track, isActive, onPlay }) => {
  const { isPurchased, requestPurchase } = usePurchase();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToHistory } = useHistory();
  const { openAddToPlaylist } = usePlaylistModal();
  const { premium } = usePremium();

  const locked = track.is_premium && !isPurchased(track.external_id) && !premium.active;
  const favorited = isFavorite(track.external_id);

  const handleClick = () => {
    if (locked) {
      requestPurchase(track);
      return;
    }
    addToHistory(track);
    onPlay();
  };

  return (
    <div className={`track-card ${isActive ? 'active' : ''} ${locked ? 'locked' : ''}`} onClick={handleClick}>
      <div className="track-cover-wrap">
        <img src={track.thumbnail_url} alt={track.title} className="track-cover" />
        {track.is_premium && !premium.active && (
          <span className="premium-badge"><FaStar /> {track.price}</span>
        )}
        {track.is_premium && premium.active && (
          <span className="premium-badge unlocked"><FaCheckCircle /></span>
        )}
        <div className="track-card-actions">
          <button
            className={`icon-btn ${favorited ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
          >
            {favorited ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button
            className="icon-btn"
            onClick={(e) => { e.stopPropagation(); openAddToPlaylist(track); }}
          >
            <FaPlus />
          </button>
        </div>
      </div>
      <div className="track-info">
        <p className="track-title">{track.title}</p>
        <p className="track-artist">{track.artist}</p>
      </div>
    </div>
  );
};

export default TrackCard;