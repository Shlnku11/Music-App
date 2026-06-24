import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const PremiumContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;
const ADMIN_TELEGRAM_ID = import.meta.env.VITE_ADMIN_TELEGRAM_ID || '8412123085';

export const PremiumProvider = ({ children }) => {
  const { user } = useAuth();
  const [premium, setPremium] = useState({ active: false });

  const loadStatus = useCallback(async () => {
    if (!user) {
      setPremium({ active: false });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/premium/status/?user=${user.id}`);
      const data = await res.json();
      setPremium(data);
    } catch (e) {
      console.error('Failed to load premium status', e);
    }
  }, [user]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, [user, loadStatus]);

  const subscribe = async () => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/premium/subscribe/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.id }),
      });
      loadStatus();
    } catch (e) {
      console.error('Failed to subscribe', e);
    }
  };

  const grantPremium = async (username) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_URL}/premium/grant/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_telegram_id: user.telegramId, username }),
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to grant premium', e);
      return false;
    }
  };

  const fetchAdminList = async (adminTelegramId) => {
    try {
      const res = await fetch(`${API_URL}/premium/admin-list/?admin_telegram_id=${adminTelegramId}`);
      return await res.json();
    } catch (e) {
      console.error('Failed to fetch admin list', e);
      return { permanent: [], temporary: [] };
    }
  };

  const revokeBulk = async (adminTelegramId, userIds) => {
    try {
      await fetch(`${API_URL}/premium/revoke-bulk/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_telegram_id: adminTelegramId, user_ids: userIds }),
      });
      return true;
    } catch (e) {
      console.error('Failed to revoke', e);
      return false;
    }
  };

  const isAdmin = user?.telegramId?.toString() === ADMIN_TELEGRAM_ID;

  const createInvoice = async () => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_URL}/premium/create-invoice/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.id }),
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to create invoice', e);
      return false;
    }
  };

  return (
    <PremiumContext.Provider value={{ premium, subscribe, grantPremium, isAdmin, createInvoice, fetchAdminList, revokeBulk }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => useContext(PremiumContext);