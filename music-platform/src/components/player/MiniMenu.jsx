import { useState } from 'react';
import { FaEllipsisV, FaListUl, FaPlus, FaTrash, FaDownload } from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';
import { usePlaylists } from '../../context/PlaylistsContext';
import { usePlaylistModal } from '../../context/PlaylistModalContext';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const MiniMenu = () => {
  const { currentTrack } = usePlayer();
  const { user } = useAuth();
  const { playlists, removeTrackFromPlaylist } = usePlaylists();
  const { openAddToPlaylist } = usePlaylistModal();
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!currentTrack) return null;

  const isInAnyPlaylist = playlists.some((pl) => pl.tracks?.some?.((t) => t.external_id === currentTrack.external_id));

  const handleDownload = async () => {
    if (!user) return;
    setDownloading(true);
    try {
      await fetch(`${API_URL}/premium/create-invoice/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.id, type: 'download', track: currentTrack }),
      });
    } catch (e) {
      console.error('Download invoice failed', e);
    } finally {
      setDownloading(false);
      setOpen(false);
    }
  };

  return (
    <div className="mini-menu-wrap">
      <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        <FaEllipsisV />
      </button>

      {open && (
        <div className="mini-menu-popup" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openAddToPlaylist(currentTrack)}>
            <FaPlus /> Добавить в плейлист
          </button>
          <button onClick={handleDownload} disabled={downloading}>
            <FaDownload /> {downloading ? 'Отправка...' : 'Скачать'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MiniMenu;