import { FaStepBackward, FaStepForward, FaPlay, FaPause, FaHeart, FaRegHeart } from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';
import { useFavorites } from '../../context/FavoritesContext';
import MiniMenu from './MiniMenu';

const PlayerBar = ({ onExpand }) => {
  const {
    currentTrack, isPlaying, currentTime, duration,
    playAudio, pauseAudio, handleNext, handlePrev, seekTo,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!currentTrack) return null;

  const favorited = isFavorite(currentTrack.external_id);

  return (
    <div className="player-bar-wrap">
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        onChange={(e) => seekTo(Number(e.target.value))}
        className="player-slider"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="player-bar" onClick={onExpand}>
        <img src={currentTrack.thumbnail_url} alt={currentTrack.title} className="player-cover" />
        <div className="player-info">
          <p className="player-title">{currentTrack.title}</p>
          <p className="player-artist">{currentTrack.artist}</p>
        </div>

        <div className="player-controls" onClick={(e) => e.stopPropagation()}>
          <button
            className={`icon-btn ${favorited ? 'active' : ''}`}
            onClick={() => toggleFavorite(currentTrack)}
          >
            {favorited ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button onClick={handlePrev}><FaStepBackward /></button>
          <button onClick={isPlaying ? pauseAudio : playAudio} className="player-play-btn">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={handleNext}><FaStepForward /></button>
          <MiniMenu />
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;