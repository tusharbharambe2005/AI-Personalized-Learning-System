import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const auth = useAuth();
  const { user, isAuthenticated, logout } = auth || {};
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDrawerOpen(false);
    setDropdownOpen(false);
  };

  // Use first_name initial first, then username
  const avatarInitial = user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U';
  const avatarUrl = user?.profile?.avatar_url;

  return (
    <>
      <header className="navbar-main shadow-sm">
        <div className="navbar-inner">
          {/* Brand */}
          <Link to="/" className="brand">
            <div className="brand-mark">🎓</div>
            <span className="brand-name">Persona<span>Learn</span></span>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && (
            <nav className="navbar-nav-desktop">
              <ul className="nav-links">
                <li><NavLink to="/dashboard" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                  <i className="bi bi-grid-1x2"></i>Dashboard
                </NavLink></li>
                <li><NavLink to="/subjects" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                  <i className="bi bi-collection"></i>Subjects
                </NavLink></li>
                <li><NavLink to="/videos" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                  <i className="bi bi-play-circle"></i>Videos
                </NavLink></li>
                <li><NavLink to="/history" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                  <i className="bi bi-clock-history"></i>History
                </NavLink></li>
                {user?.profile?.is_pro && (
                  <li><NavLink to="/chatbot" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    <i className="bi bi-robot"></i>AI Tutor
                  </NavLink></li>
                )}
              </ul>
            </nav>
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <>
                {/* Pro Badge */}
                <div className="navbar-nav-desktop">
                  {user?.profile?.is_pro ? (
                    <span className="style-chip chip-example" style={{ fontSize: '0.75rem' }}>✅ Pro</span>
                  ) : user?.profile?.pro_requested ? (
                    <span className="style-chip chip-analogy" style={{ fontSize: '0.75rem' }}>⏳ Pending</span>
                  ) : (
                    <Link to="/upgrade" className="btn-primary btn-sm">⚡ Upgrade</Link>
                  )}
                </div>

                {/* Desktop Dropdown */}
                <div className="dropdown-wrapper navbar-nav-desktop" ref={dropdownRef}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="user-avatar">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="Avatar" />
                        : avatarInitial}
                    </div>
                    <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {user?.first_name || user?.username}
                    </span>
                    <i className="bi bi-chevron-down" style={{ fontSize: '.7rem', color: 'var(--text-light)' }}></i>
                  </div>
                  {dropdownOpen && (
                    <div className="pl-dropdown">
                      <div className="dd-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div className="user-avatar" style={{ width: 42, height: 42, fontSize: '1rem', flexShrink: 0 }}>
                            {avatarUrl ? <img src={avatarUrl} alt="Avatar" /> : avatarInitial}
                          </div>
                          <div>
                            <div className="dd-name">{user?.first_name} {user?.last_name}</div>
                            <div className="dd-role">@{user?.username}</div>
                            {user?.email && <div className="dd-role">{user?.email}</div>}
                          </div>
                        </div>
                        {user?.profile?.preferred_style && (
                          <div style={{ marginTop: 6 }}>
                            <span className={`style-chip chip-${user.profile.preferred_style}`} style={{ fontSize: '.65rem' }}>
                              {user.profile.preferred_style.charAt(0).toUpperCase() + user.profile.preferred_style.slice(1)} Learner
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-person-circle"></i>My Profile
                      </Link>
                      <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-grid-1x2"></i>Dashboard
                      </Link>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i>Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Hamburger */}
                <button className="hamburger-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                  <span></span><span></span><span></span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary btn-sm">Sign In</Link>
                <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isAuthenticated && (
        <>
          <div className={`mobile-nav-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
          <aside className={`mobile-nav-drawer ${drawerOpen ? 'open' : ''}`}>
            <div className="mobile-nav-header">
              <div className="brand">
                <div className="brand-mark" style={{ width: 32, height: 32 }}>🎓</div>
                <span className="brand-name">Persona<span>Learn</span></span>
              </div>
              <button className="mobile-nav-close" onClick={() => setDrawerOpen(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="mobile-nav-user">
              <div className="mobile-nav-avatar">{avatarInitial}</div>
              <div>
                <div className="mobile-nav-name">{user?.first_name} {user?.last_name || user?.username}</div>
                <div className="mobile-nav-email">{user?.email || 'Student'}</div>
              </div>
            </div>
            <nav className="mobile-nav-links">
              {[
                { to: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
                { to: '/subjects', icon: 'bi-collection', label: 'Subjects' },
                { to: '/videos', icon: 'bi-play-circle', label: 'Videos' },
                { to: '/history', icon: 'bi-clock-history', label: 'History' },
                { to: '/profile', icon: 'bi-person-circle', label: 'My Profile' },
              ].map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) => 'mobile-nav-link' + (isActive ? ' active' : '')}
                >
                  <i className={`bi ${icon}`}></i>{label}
                </NavLink>
              ))}
            </nav>
            <div className="mobile-nav-footer">
              <button className="mobile-nav-signout" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i>Sign Out
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
