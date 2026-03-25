import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getUser, isLoggedIn } from '../services/auth';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const user = getUser();
  const role = user?.role?.toLowerCase();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Medivoice
      </Link>
      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        {loggedIn && (
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            {role === 'admin' && (
              <li>
                <Link to="/users">Users</Link>
              </li>
            )}
            {(role === 'doctor' || role === 'receptionist') && (
              <li>
                <Link to="/patients">Patients</Link>
              </li>
            )}
          </>
        )}
        {!loggedIn && (
          <>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </>
        )}
      </ul>

      {loggedIn && user && (
        <div className="navbar-profile" ref={containerRef}>
          <button
            type="button"
            className="profile-button"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="profile-icon">👤</span>
          </button>
          {menuOpen && (
            <div className="profile-menu">
              <div className="profile-menu__item">
                <div className="profile-menu__label">Name</div>
                <div className="profile-menu__value">{user.username}</div>
              </div>
              <div className="profile-menu__item">
                <div className="profile-menu__label">Email</div>
                <div className="profile-menu__value">{user.email}</div>
              </div>
              <div className="profile-menu__item">
                <div className="profile-menu__label">Role</div>
                <div className="profile-menu__value">{user.role}</div>
              </div>
              <button type="button" className="profile-menu__logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
