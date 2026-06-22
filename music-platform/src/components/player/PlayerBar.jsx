import { FaStepBackward, FaStepForward, FaPlay, FaPause } from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';

const PlayerBar = ({ onExpand }) => {
  const {
    currentTrack, isPlaying, progressPercent,
    playAudio, pauseAudio, handleNext, handlePrev,
  } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="player-bar" onClick={onExpand}>
      <img src={currentTrack.thumbnail_url} alt={currentTrack.title} className="player-cover" />
      <div className="player-info">
        <p className="player-title">{currentTrack.title}</p>
        <p className="player-artist">{currentTrack.artist}</p>
      </div>

      <div className="player-controls" onClick={(e) => e.stopPropagation()}>
        <button onClick={handlePrev} aria-label="Предыдущий"><FaStepBackward /></button>
        <button onClick={isPlaying ? pauseAudio : playAudio} aria-label="Play/Pause" className="player-play-btn">
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={handleNext} aria-label="Следующий"><FaStepForward /></button>
      </div>

      <div className="player-progress">
        <div className="player-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
};

export default PlayerBar;