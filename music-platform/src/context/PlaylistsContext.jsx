import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const PlaylistsContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export const PlaylistsProvider = ({ children }) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPlaylists = useCallback(async () => {
    if (!user) {
      setPlaylists([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/playlists/?user=${user.id}`);
      const data = await res.json();
      setPlaylists(data.results || []);
    } catch (e) {
      console.error('Failed to load playlists', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const createPlaylist = useCallback(async (name) => {
    if (!user || !name.trim()) return;
    try {
      await fetch(`${API_URL}/playlists/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.id, name: name.trim() }),
      });
      loadPlaylists();
    } catch (e) {
      console.error('Failed to create playlist', e);
    }
  }, [user, loadPlaylists]);

  const deletePlaylist = useCallback(async (playlistId) => {
    try {
      await fetch(`${API_URL}/playlists/${playlistId}/`, { method: 'DELETE' });
      loadPlaylists();
    } catch (e) {
      console.error('Failed to delete playlist', e);
    }
  }, [loadPlaylists]);

  const getPlaylistTracks = useCallback(async (playlistId) => {
    try {
      const res = await fetch(`${API_URL}/playlists/${playlistId}/`);
      const data = await res.json();
      return data.results || [];
    } catch (e) {
      console.error('Failed to load playlist tracks', e);
      return [];
    }
  }, []);

  const addTrackToPlaylist = useCallback(async (playlistId, track) => {
    try {
      await fetch(`${API_URL}/playlists/${playlistId}/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track }),
      });
      loadPlaylists();
    } catch (e) {
      console.error('Failed to add track to playlist', e);
    }
  }, [loadPlaylists]);

  const removeTrackFromPlaylist = useCallback(async (playlistId, externalId) => {
    try {
      await fetch(`${API_URL}/playlists/${playlistId}/remove/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ external_id: externalId }),
      });
      loadPlaylists();
    } catch (e) {
      console.error('Failed to remove track from playlist', e);
    }
  }, [loadPlaylists]);

  return (
    <PlaylistsContext.Provider
      value={{
        playlists,
        loading,
        createPlaylist,
        deletePlaylist,
        getPlaylistTracks,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
      }}
    >
      {children}
    </PlaylistsContext.Provider>
  );
};

export const usePlaylists = () => useContext(PlaylistsContext);