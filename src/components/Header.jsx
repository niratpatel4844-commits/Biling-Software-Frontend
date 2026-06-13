import { useState } from 'react';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header({ collapsed }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className={`header ${collapsed ? 'collapsed' : ''}`}>
      <div className="header-search">
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search anything... (Ctrl+K)" />
      </div>
      <div className="header-actions">
        <button className="header-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="header-btn" title="Notifications">
          <Bell size={18} />
          <span className="badge"></span>
        </button>
        <div className="dropdown">
          <div className="user-menu" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="user-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.full_name || 'Admin'}</span>
              <span className="user-role">{user?.is_superadmin ? 'Super Admin' : 'Admin'}</span>
            </div>
          </div>
          {showUserMenu && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => setShowUserMenu(false)}>Profile</div>
              <div className="dropdown-item" onClick={() => setShowUserMenu(false)}>Settings</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item" onClick={logout} style={{ color: 'var(--danger)' }}>Logout</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
