import { useEffect, useState } from 'react';
import { usePlaylists } from '../context/PlaylistsContext';
import { usePlayer } from '../context/PlayerContext';
import TrackCard from '../components/shared/TrackCard';

const PlaylistView = ({ playlist, onClose }) => {
  const { getPlaylistTracks, removeTrackFromPlaylist } = usePlaylists();
  const { currentTrack, playTrack } = usePlayer();
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getPlaylistTracks(playlist.id);
      setTracks(data);
    };
    load();
  }, [playlist.id, getPlaylistTracks]);

  const handleRemove = async (externalId) => {
    await removeTrackFromPlaylist(playlist.id, externalId);
    setTracks((prev) => prev.filter((t) => t.external_id !== externalId));
  };

  return (
    <div className="playlist-view">
      <button onClick={onClose}>← Назад</button>
      <h2>{playlist.name}</h2>

      {tracks.length === 0 && <p>В этом плейлисте пока пусто.</p>}

      <div className="track-list">
        {tracks.map((track) => (
          <div key={track.external_id} className="playlist-track-row">
            <TrackCard
              track={track}
              isActive={currentTrack?.external_id === track.external_id}
              onPlay={() => playTrack(track, tracks)}
            />
            <button onClick={() => handleRemove(track.external_id)}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistView;