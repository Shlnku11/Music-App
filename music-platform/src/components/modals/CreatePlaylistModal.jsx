import { useState } from 'react';
import { usePlaylists } from '../../context/PlaylistsContext';

const CreatePlaylistModal = ({ onClose }) => {
  const { createPlaylist } = usePlaylists();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Новый плейлист</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название плейлиста"
            autoFocus
          />
          <div className="modal-actions">
            <button type="submit">Создать</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;