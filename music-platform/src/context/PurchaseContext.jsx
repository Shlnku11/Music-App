import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const PurchaseContext = createContext(null);

const STORAGE_KEY = 'eleve_purchased_tracks';

const loadPurchased = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

export const PurchaseProvider = ({ children }) => {
  const { isTelegram, user } = useAuth();
  const [purchasedIds, setPurchasedIds] = useState(loadPurchased);
  const [pendingTrack, setPendingTrack] = useState(null);
  const [showBrowserModal, setShowBrowserModal] = useState(false);

  const isPurchased = useCallback(
    (externalId) => purchasedIds.includes(externalId),
    [purchasedIds]
  );

  const markPurchased = (externalId) => {
    setPurchasedIds((prev) => {
      const updated = [...new Set([...prev, externalId])];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const requestPurchase = useCallback((track) => {
    if (isPurchased(track.external_id)) return true;

    if (isTelegram && window.Telegram?.WebApp?.openInvoice) {
      setPendingTrack(track);
      window.Telegram.WebApp.openInvoice(track.invoice_url, (status) => {
        if (status === 'paid') {
          markPurchased(track.external_id);
        }
        setPendingTrack(null);
      });
      return false;
    }

    if (!user) {
      return false;
    }

    setPendingTrack(track);
    setShowBrowserModal(true);
    return false;
  }, [isTelegram, user, isPurchased]);

  const confirmBrowserPurchase = () => {
    if (pendingTrack) markPurchased(pendingTrack.external_id);
    setShowBrowserModal(false);
    setPendingTrack(null);
  };

  const cancelBrowserPurchase = () => {
    setShowBrowserModal(false);
    setPendingTrack(null);
  };

  return (
    <PurchaseContext.Provider
      value={{
        isPurchased,
        requestPurchase,
        showBrowserModal,
        pendingTrack,
        confirmBrowserPurchase,
        cancelBrowserPurchase,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => useContext(PurchaseContext);