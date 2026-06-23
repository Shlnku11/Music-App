import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const PurchaseContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export const PurchaseProvider = ({ children }) => {
  const { user } = useAuth();
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [checkingIds, setCheckingIds] = useState([]);

  const isPurchased = useCallback(
    (externalId) => purchasedIds.includes(externalId),
    [purchasedIds]
  );

  const checkPurchase = useCallback(async (externalId) => {
    if (!user || checkingIds.includes(externalId)) return;
    setCheckingIds((prev) => [...prev, externalId]);
    try {
      const res = await fetch(`${API_URL}/premium/check-purchase/?user=${user.id}&external_id=${externalId}`);
      const data = await res.json();
      if (data.purchased) {
        setPurchasedIds((prev) => [...new Set([...prev, externalId])]);
      }
    } catch (e) {
      console.error('Failed to check purchase', e);
    }
  }, [user, checkingIds]);

  const requestPurchase = useCallback(async (track) => {
    if (!user) return false;
    if (isPurchased(track.external_id)) return true;

    try {
      await fetch(`${API_URL}/premium/create-invoice/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.id, type: 'track', track }),
      });
      return false;
    } catch (e) {
      console.error('Failed to request purchase', e);
      return false;
    }
  }, [user, isPurchased]);

  return (
    <PurchaseContext.Provider value={{ isPurchased, requestPurchase, checkPurchase }}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => useContext(PurchaseContext);