import { useState } from 'react';
import Header from './components/shared/Header';
import Navigation from './components/shared/Navigation';
import HomeSection from './components/sections/HomeSection';
import SearchSection from './components/sections/SearchSection';
import FavoritesSection from './components/sections/FavoritesSection';
import ProfileSection from './components/sections/ProfileSection';
import PlayerBar from './components/player/PlayerBar';
import FullPlayer from './components/player/FullPlayer';
import PurchaseModal from './components/modals/PurchaseModal';
import PlaylistSelectModal from './components/modals/PlaylistSelectModal';
import CreatePlaylistModal from './components/modals/CreatePlaylistModal';
import AdminSection from './components/sections/AdminSection';
import "./styles/App.css"

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="app-container">
      <Header />

      <main>
        {activeTab === 'home' && <HomeSection />}
        {activeTab === 'search' && <SearchSection />}
        {activeTab === 'favorites' && <FavoritesSection />}
        {activeTab === 'profile' && <ProfileSection />}
        {activeTab === 'admin' && <AdminSection />}
      </main>

      <PlayerBar onExpand={() => setShowFullPlayer(true)} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {showFullPlayer && <FullPlayer onClose={() => setShowFullPlayer(false)} />}

      <PurchaseModal />
      <PlaylistSelectModal onCreateNew={() => setShowCreateModal(true)} />
      {showCreateModal && <CreatePlaylistModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}

export default App;