import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const HistoryContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export const HistoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/history/?user=${user.id}`);
      const data = await res.json();
      setHistory(data.results || []);
    } catch (e) {
      console.error('Failed to load history', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addToHistory = useCallback(async (track) => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/history/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.id, track }),
      });
      loadHistory();
    } catch (e) {
      console.error('Failed to add to history', e);
    }
  }, [user, loadHistory]);

  const clearHistory = useCallback(async () => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/history/clear/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.id }),
      });
      setHistory([]);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  }, [user]);

  return (
    <HistoryContext.Provider value={{ history, loading, addToHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => useContext(HistoryContext);