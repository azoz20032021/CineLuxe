import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import SearchBar from './SearchBar';
import { useEffect, useState } from 'react';
import { FaHome, FaFilm, FaTv, FaList } from 'react-icons/fa';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false); // Close menu on route change
  }, [location]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">🎬 CineLuxe</Link>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link"><FaHome /> Home</Link>
          <Link to="/movies" className="nav-link"><FaFilm /> Movies</Link>
          <Link to="/tv-shows" className="nav-link"><FaTv /> TV Shows</Link>
          <Link to="/my-list" className="nav-link"><FaList /> My List</Link>
          {/* Profile inside the hamburger menu (shown on small screens) */}
          <Link to="/profile" className="nav-link nav-profile">👤 Profile</Link>
        </nav>
        <div className="header-actions">
          <SearchBar />
          <button className="avatar">👤</button>
        </div>
      </div>
    </header>
  );
}
