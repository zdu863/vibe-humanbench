import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import './Header.css';

function Header() {
  const { user, logout } = useUser();
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-content container">
        <Link to="/" className="logo">
          <span className="logo-icon icon icon-brain"></span>
          <span className="logo-text">Human Benchmark</span>
        </Link>
        
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/leaderboard" 
            className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
          >
            Leaderboard
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            Profile
          </Link>
        </nav>
        
        <div className="user-section">
          <div className="user-avatar"></div>
          <span className="username">{user?.username}</span>
          <button onClick={logout} className="btn-logout">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
