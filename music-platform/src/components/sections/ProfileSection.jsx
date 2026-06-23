import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlaylists } from '../../context/PlaylistsContext';
import { useHistory } from '../../context/HistoryContext';
import { usePremium } from '../../context/PremiumContext';
import CreatePlaylistModal from '../modals/CreatePlaylistModal';
import ConfirmModal from '../modals/ConfirmModal';
import PlaylistView from '../../pages/PlaylistView';
import Avatar from '../shared/Avatar';
import { usePlayer } from '../../context/PlayerContext';
import TrackCard from '../shared/TrackCard';

const ProfileSection = () => {
  const { user, isTelegram, browserLoginLink, startBrowserLogin, logout } = useAuth();
  const { playlists, deletePlaylist } = usePlaylists();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [viewedPlaylist, setViewedPlaylist] = useState(null);

  const [confirmLogout, setConfirmLogout] = useState(false);

  const { premium, subscribe, isAdmin, createInvoice } = usePremium();
  const [invoiceSent, setInvoiceSent] = useState(false);

  const { history, clearHistory } = useHistory();
  const { currentTrack, playTrack } = usePlayer();
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);

  const handleLoginClick = async () => {
    const link = await startBrowserLogin();
    if (link) window.open(link, '_blank');
  };

  const formatExpiry = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleBuyClick = async () => {
    const success = await createInvoice();
    setInvoiceSent(success);
  };

  if (!user) {
    return (
      <div className="profile-guest">
        <p>Войдите, чтобы видеть свой профиль, плейлисты и историю.</p>
        <button className="login-btn" onClick={handleLoginClick}>
          Войти через Telegram
        </button>
        {browserLoginLink && (
          <p>
            Ждём подтверждения в Telegram...{' '}
            <a href={browserLoginLink} target="_blank" rel="noopener noreferrer">
              Открыть бота
            </a>
          </p>
        )}
      </div>
    );
  }

  if (viewedPlaylist) {
    return <PlaylistView playlist={viewedPlaylist} onClose={() => setViewedPlaylist(null)} />;
  }

  return (
    <div className="profile-section">
      <Avatar src={user.photoUrl} username={user.username} size={80} />
      <h2 className="profile-username">{user.username}</h2>
      <p className="profile-stars">⭐ {user.stars ?? 0}</p>
      <p className="profile-source">{isTelegram ? 'Вход через Telegram' : 'Вход через браузер'}</p>
      <button className="logout-btn" onClick={() => setConfirmLogout(true)}>Выйти ✕</button>

      <section className="profile-premium">
        {premium.active ? (
          <div className="premium-badge-large">
            <span>⭐ Premium</span>
            {!premium.granted_by_admin && premium.expires_at && (
              <p>Действует до {formatExpiry(premium.expires_at)}</p>
            )}
            {premium.granted_by_admin && <p>Бессрочный доступ</p>}
          </div>
        ) : (
          <div className="premium-offer">
            <h3>Premium на месяц</h3>
            <p>Слушай все платные треки бесплатно 30 дней</p>
            <button className="premium-buy-btn" onClick={handleBuyClick}>⭐ 100 — Купить</button>
            {invoiceSent && <p>Открой Telegram — там придёт счёт на оплату.</p>}
          </div>
        )}
      </section>

      <section className="profile-playlists">
        <div className="section-header">
          <h3>Плейлисты</h3>
          <button onClick={() => setShowCreateModal(true)}>+ Создать</button>
        </div>
        {playlists.length === 0 && <p>Плейлистов пока нет.</p>}
        <ul>
          {playlists.map((pl) => (
            <li key={pl.id}>
              <span onClick={() => setViewedPlaylist(pl)}>{pl.name} ({pl.track_count})</span>
              <button onClick={() => setConfirmDeleteId(pl.id)}>✕</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="profile-history">
        <div className="section-header">
          <h3>История прослушиваний</h3>
          {history.length > 0 && (
            <button onClick={() => setConfirmClearHistory(true)}>Очистить</button>
          )}
        </div>
        {history.length === 0 && <p>Пока ничего не слушал.</p>}
        <div className="horizontal-scroll">
          {history.map((track) => (
            <div className="scroll-item" key={track.external_id}>
              <TrackCard
                track={track}
                isActive={currentTrack?.external_id === track.external_id}
                onPlay={() => playTrack(track, history)}
              />
            </div>
          ))}
        </div>
      </section>
      {confirmClearHistory && (
        <ConfirmModal
          message="Очистить всю историю прослушиваний?"
          onConfirm={() => { clearHistory(); setConfirmClearHistory(false); }}
          onCancel={() => setConfirmClearHistory(false)}
        />
      )}

      {showCreateModal && <CreatePlaylistModal onClose={() => setShowCreateModal(false)} />}

      {confirmDeleteId && (
        <ConfirmModal
          message="Удалить этот плейлист?"
          onConfirm={() => {
            deletePlaylist(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {confirmLogout && (
        <ConfirmModal
          message="Вы уверены, что хотите выйти из аккаунта?"
          onConfirm={() => {
            logout();
            setConfirmLogout(false);
          }}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
    </div>
  );
};

export default ProfileSection;