const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <p>{message}</p>
      <div className="modal-actions">
        <button onClick={onConfirm}>Да, удалить</button>
        <button onClick={onCancel}>Отмена</button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;