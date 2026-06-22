import { usePlaylists } from '../../context/PlaylistsContext';
import { usePlaylistModal } from '../../context/PlaylistModalContext';

const PlaylistSelectModal = ({ onCreateNew }) => {
  const { playlists, addTrackToPlaylist } = usePlaylists();
  const { trackToAdd, closeAddToPlaylist } = usePlaylistModal();

  if (!trackToAdd) return null;

  const handleSelect = (playlistId) => {
    addTrackToPlaylist(playlistId, trackToAdd);
    closeAddToPlaylist();
  };

  return (
    <div className="modal-overlay" onClick={closeAddToPlaylist}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Добавить в плейлист</h3>

        {playlists.length === 0 && <p>У тебя пока нет плейлистов.</p>}

        <ul className="playlist-select-list">
          {playlists.map((pl) => (
            <li key={pl.id} onClick={() => handleSelect(pl.id)}>
              {pl.name} ({pl.track_count})
            </li>
          ))}
        </ul>

        <button onClick={onCreateNew}>+ Новый плейлист</button>
        <button onClick={closeAddToPlaylist}>Закрыть</button>
      </div>
    </div>
  );
};

export default PlaylistSelectModal;