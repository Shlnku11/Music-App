import { createContext, useContext, useState } from 'react';

const PlaylistModalContext = createContext(null);

export const PlaylistModalProvider = ({ children }) => {
  const [trackToAdd, setTrackToAdd] = useState(null);

  const openAddToPlaylist = (track) => setTrackToAdd(track);
  const closeAddToPlaylist = () => setTrackToAdd(null);

  return (
    <PlaylistModalContext.Provider value={{ trackToAdd, openAddToPlaylist, closeAddToPlaylist }}>
      {children}
    </PlaylistModalContext.Provider>
  );
};

export const usePlaylistModal = () => useContext(PlaylistModalContext);