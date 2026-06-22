import {
  FaStepBackward, FaStepForward, FaPlay, FaPause,
  FaRedo, FaRandom, FaArrowRight, FaHeart, FaRegHeart,
  FaPlus, FaChevronDown,
} from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';
import { useFavorites } from '../../context/FavoritesContext';
import { usePlaylistModal } from '../../context/PlaylistModalContext';

const FullPlayer = ({ onClose }) => {
  const {
    currentTrack, isPlaying, currentTime, duration, progressPercent,
    playbackRate, playMode, playAudio, pauseAudio, handleNext, handlePrev,
    seekTo, changeSpeed, togglePlayMode, formatTime,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openAddToPlaylist } = usePlaylistModal();

  if (!currentTrack) return null;

  const favorited = isFavorite(currentTrack.external_id);

  const handleSeekClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seekTo(ratio * duration);
  };

  const modeIcon = playMode === 'normal' ? <FaArrowRight /> : playMode === 'repeat' ? <FaRedo /> : <FaRandom />;

  return (
    <div className="full-player">
      <button className="full-player-close" onClick={onClose} aria-label="Закрыть">
        <FaChevronDown />
      </button>

      <img src={currentTrack.thumbnail_url} alt={currentTrack.title} className="full-player-cover" />

      <h2 className="full-player-title">{currentTrack.title}</h2>
      <p className="full-player-artist">{currentTrack.artist}</p>

      <div className="full-player-actions">
        <button onClick={() => toggleFavorite(currentTrack)} className={favorited ? 'active' : ''}>
          {favorited ? <FaHeart /> : <FaRegHeart />}
        </button>
        <button onClick={() => openAddToPlaylist(currentTrack)}><FaPlus /> Плейлист</button>
      </div>

      <div className="full-player-progress" onClick={handleSeekClick}>
        <div className="full-player-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="full-player-time">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="full-player-controls">
        <button onClick={togglePlayMode} className={`mode-btn ${playMode}`}>{modeIcon}</button>
        <button onClick={handlePrev}><FaStepBackward /></button>
        <button className="play-pause-btn" onClick={isPlaying ? pauseAudio : playAudio}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={handleNext}><FaStepForward /></button>
        <button onClick={changeSpeed} className="speed-btn">{playbackRate}x</button>
      </div>
    </div>
  );
};

export default FullPlayer;