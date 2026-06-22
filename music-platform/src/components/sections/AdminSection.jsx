import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePremium } from '../../context/PremiumContext';
import Avatar from '../shared/Avatar';

const formatCountdown = (expiresAt) => {
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return '00:00:00';
  const totalSeconds = Math.floor(diff / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}ч ${m}м ${s}с`;
};

const AdminSection = () => {
  const { user } = useAuth();
  const { fetchAdminList, grantPremium, revokeBulk } = usePremium();

  const [permanent, setPermanent] = useState([]);
  const [temporary, setTemporary] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [addStatus, setAddStatus] = useState(null);
  const [now, setNow] = useState(Date.now());

  const loadList = useCallback(async () => {
    const data = await fetchAdminList(user.telegramId);
    setPermanent(data.permanent || []);
    setTemporary(data.temporary || []);
  }, [user, fetchAdminList]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const success = await grantPremium(newUsername.trim());
    setAddStatus(success ? 'Добавлено!' : 'Пользователь не найден');
    if (success) {
      setNewUsername('');
      loadList();
    }
  };

  const handleRevoke = async () => {
    if (selectedIds.length === 0) return;
    await revokeBulk(user.telegramId, selectedIds);
    setSelectedIds([]);
    loadList();
  };

  const sortedTemporary = [...temporary].sort(
    (a, b) => new Date(a.expires_at) - new Date(b.expires_at)
  );

  return (
    <div className="admin-section">
      <h2>Админ-панель</h2>

      <h3>Премиум навсегда</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>Аватар</th>
            <th>Username</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {permanent.map((u) => (
            <tr key={u.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(u.id)}
                  onChange={() => toggleSelect(u.id)}
                />
              </td>
              <td><Avatar username={u.username} size={36} /></td>
              <td>{u.username}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="admin-actions">
        <button onClick={() => setShowAddModal(true)}>+ Добавить</button>
        <button onClick={handleRevoke} disabled={selectedIds.length === 0}>Удалить выбранных</button>
      </div>

      <h3>Премиум по подписке</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Аватар</th>
            <th>Username</th>
            <th>Осталось</th>
          </tr>
        </thead>
        <tbody>
          {sortedTemporary.map((u) => (
            <tr key={u.id}>
              <td><Avatar username={u.username} size={36} /></td>
              <td>{u.username}</td>
              <td>{formatCountdown(u.expires_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Выдать Premium навсегда</h3>
            <form onSubmit={handleAdd}>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username пользователя"
                autoFocus
              />
              <div className="modal-actions">
                <button type="submit">Добавить</button>
                <button type="button" onClick={() => setShowAddModal(false)}>Отмена</button>
              </div>
            </form>
            {addStatus && <p>{addStatus}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSection;