import { FaHome, FaSearch, FaHeart, FaUser, FaUserShield } from 'react-icons/fa';
import { usePremium } from '../../context/PremiumContext';

const BASE_TABS = [
  { id: 'home', label: 'Главная', icon: <FaHome /> },
  { id: 'search', label: 'Поиск', icon: <FaSearch /> },
  { id: 'favorites', label: 'Избранное', icon: <FaHeart /> },
  { id: 'profile', label: 'Профиль', icon: <FaUser /> },
];

const Navigation = ({ activeTab, setActiveTab }) => {
  const { isAdmin } = usePremium();
  const tabs = isAdmin
    ? [...BASE_TABS, { id: 'admin', label: 'Админ', icon: <FaUserShield /> }]
    : BASE_TABS;

  return (
    <nav className="app-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;