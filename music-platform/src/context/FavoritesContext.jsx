import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/favorites/list/?user=${user.id}`);
      const data = await res.json();
      setFavorites(data.results || []);
    } catch (e) {
      console.error('Failed to load favorites', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (externalId) => favorites.some((f) => f.external_id === externalId),
    [favorites]
  );

  const toggleFavorite = useCallback(async (track) => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/favorites/toggle/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.id, track }),
      });
      loadFavorites();
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  }, [user, loadFavorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, loading, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);