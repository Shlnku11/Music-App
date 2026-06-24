import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext(null);

// Используйте VITE_API_URL в .env:
// VITE_API_URL=https://music-app-1-3qn0.onrender.com/api
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
  const [authError, setAuthError] = useState(null);
  const pollingRef = useRef(null);

  // Сохраняем пользователя в localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Автоматическая авторизация через Telegram WebApp
  useEffect(() => {
    const init = async () => {
      // Проверяем, открыто ли приложение внутри Telegram
      if (!(window.Telegram && window.Telegram.WebApp)) {
        return; // Обычный браузер — показываем кнопку входа
      }

      const tg = window.Telegram.WebApp;
      tg.ready();

      const userData = tg.initDataUnsafe?.user;
      if (!userData) return;

      // Мы точно в Telegram — скрываем кнопку входа
      setIsTelegram(true);

      // Если уже авторизованы — пропускаем
      if (user) return;

      try {
        const res = await fetch(`${API_URL}/auth/telegram/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_id: userData.id,
            username: userData.username || userData.first_name || `user_${userData.id}`,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const backendUser = await res.json();

        setUser({
          id: backendUser.id,
          telegramId: backendUser.telegram_id,
          username: backendUser.username,
          stars: backendUser.stars,
          photoUrl: userData.photo_url || null,
        });
      } catch (e) {
        console.error('Telegram auth failed:', e);
        setAuthError('Не удалось авторизоваться. Попробуйте перезапустить приложение.');
      }
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Логин через браузер (QR/ссылка на бота)
  const startBrowserLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/browser/start/`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setBrowserLoginLink(data.bot_link);

      // Опрашиваем статус каждые 2 секунды
      pollingRef.current = setInterval(async () => {
        try {
          const checkRes = await fetch(`${API_URL}/auth/browser/check/${data.session_token}/`);
          if (!checkRes.ok) return;

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
        } catch (e) {
          // Тихо игнорируем ошибки polling — они не критичны
          console.warn('Polling check failed:', e);
        }
      }, 2000);

      return data.bot_link;
    } catch (e) {
      console.error('Failed to start browser login:', e);
      setAuthError('Не удалось начать авторизацию. Проверьте соединение.');
      return null;
    }
  };

  // Очищаем polling при размонтировании
  useEffect(() => {
    return () => clearInterval(pollingRef.current);
  }, []);

  const logout = () => {
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isTelegram,
      browserLoginLink,
      authError,
      startBrowserLogin,
      setUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
