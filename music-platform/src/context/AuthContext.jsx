import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = 'eleve_user';

const loadStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadStoredUser);
  const [isTelegram, setIsTelegram] = useState(false);
  const [browserLoginLink, setBrowserLoginLink] = useState(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      if (!(window.Telegram && window.Telegram.WebApp)) return;

      const tg = window.Telegram.WebApp;
      tg.ready();

      const userData = tg.initDataUnsafe?.user;
      if (!userData) return;

      setIsTelegram(true);

      try {
        const res = await fetch(`${API_URL}/auth/telegram/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_id: userData.id,
            username: userData.username || userData.first_name || `user_${userData.id}`,
          }),
        });
        const backendUser = await res.json();

        setUser({
          id: backendUser.id,
          telegramId: backendUser.telegram_id,
          username: backendUser.username,
          stars: backendUser.stars,
          photoUrl: userData.photo_url || null,
        });
      } catch (e) {
        console.error('Telegram auth failed', e);
      }
    };

    init();
  }, []);

  const startBrowserLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/browser/start/`, { method: 'POST' });
      const data = await res.json();
      setBrowserLoginLink(data.bot_link);

      pollingRef.current = setInterval(async () => {
        const checkRes = await fetch(`${API_URL}/auth/browser/check/${data.session_token}/`);
        const checkData = await checkRes.json();

        if (checkData.status === 'confirmed') {
          clearInterval(pollingRef.current);
          setUser({
            id: checkData.user.id,
            telegramId: checkData.user.telegram_id,
            username: checkData.user.username,
            stars: checkData.user.stars,
            photoUrl: null,
          });
          setBrowserLoginLink(null);
        }
      }, 2000);

      return data.bot_link;
    } catch (e) {
      console.error('Failed to start browser login', e);
      return null;
    }
  };

  useEffect(() => {
    return () => clearInterval(pollingRef.current);
  }, []);

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isTelegram, browserLoginLink, startBrowserLogin, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);