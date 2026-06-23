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


      <input
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        onChange={(e) => seekTo(Number(e.target.value))}
        className="full-player-slider"
      />


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