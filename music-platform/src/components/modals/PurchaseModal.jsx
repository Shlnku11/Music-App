import { usePurchase } from '../../context/PurchaseContext';

const PurchaseModal = () => {
  const { showBrowserModal, pendingTrack, confirmBrowserPurchase, cancelBrowserPurchase } = usePurchase();

  if (!showBrowserModal || !pendingTrack) return null;

  return (
    <div className="modal-overlay" onClick={cancelBrowserPurchase}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Купить трек</h3>
        <p>{pendingTrack.title} — {pendingTrack.artist}</p>
        <p>Цена: {pendingTrack.price} ⭐</p>
        <div className="modal-actions">
          <button onClick={confirmBrowserPurchase}>Купить</button>
          <button onClick={cancelBrowserPurchase}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;