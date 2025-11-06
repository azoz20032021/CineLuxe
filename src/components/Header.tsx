import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import SearchBar from './SearchBar';
import { useEffect, useState, useRef } from 'react';
import { FaHome, FaFilm, FaTv, FaList } from 'react-icons/fa';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const location = useLocation();
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMenuOpen(false); // Close menu on route change
    setAvatarOpen(false);
  }, [location]);

  // Close avatar menu when clicking outside
  useEffect(() => {
    function handleDoc(e: MouseEvent){
      const target = e.target as Node | null;
      if(actionsRef.current && target && !actionsRef.current.contains(target)){
        setAvatarOpen(false);
      }
      if(mobileSearchRef.current && target && !mobileSearchRef.current.contains(target)){
        // If the click occurred inside the header actions (e.g. the search-toggle button),
        // don't immediately close the mobile search panel — allow the toggle handler to run.
        if(actionsRef.current && actionsRef.current.contains(target)){
          // do nothing
        } else {
          setMobileSearchOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleDoc);
    return () => document.removeEventListener('mousedown', handleDoc);
  },[])

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
        </nav>
        <div className="header-actions" ref={actionsRef}>
          <SearchBar onSearch={() => setMobileSearchOpen(false)} />
          <button className="search-toggle" onClick={() => setMobileSearchOpen(s => !s)} aria-label="Open search">🔍</button>
          <button className="avatar" onClick={() => setAvatarOpen(s => !s)} aria-expanded={avatarOpen} aria-haspopup="true">👤</button>
          {avatarOpen && (
            <div className="avatar-menu" role="menu">
              <Link to="/profile" className="avatar-menu-item" role="menuitem">Profile</Link>
              <Link to="/my-list" className="avatar-menu-item" role="menuitem">My List</Link>
              <Link to="/" className="avatar-menu-item" role="menuitem">Sign in</Link>
            </div>
          )}
        </div>
        {mobileSearchOpen && (
          <div className="mobile-search-panel" ref={mobileSearchRef}>
            <SearchBar hideButton autoFocus onSearch={() => setMobileSearchOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
}
