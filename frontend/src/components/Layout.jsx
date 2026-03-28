import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import './Layout.css';

function SearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        ref={inputRef}
        type="search"
        placeholder="Search products, brands, categories…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button type="button" className="search-close" onClick={onClose} aria-label="Close search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </form>
  );
}

export default function Layout() {
  const { totalItems } = useCart();
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/products?category=clothing', label: 'Clothing' },
    { to: '/products?category=accessories', label: 'Accessories' },
    { to: '/products?featured=true', label: 'Featured' },
  ];

  return (
    <div className="site-wrapper">
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <span>Free shipping on orders over $75 — </span>
        <Link to="/products">Shop Now →</Link>
      </div>

      {/* Navbar */}
      <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">
          {/* Mobile: Hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>

          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="var(--color-ink)"/>
              <path d="M7 10h14M7 14h10M7 18h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Shopr</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar__nav">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="navbar__actions">
            <button
              className="navbar__icon-btn"
              onClick={() => setSearchOpen(s => !s)}
              aria-label="Search"
            >
              {searchOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              )}
            </button>

            <button className="navbar__icon-btn" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {isLoggedIn ? (
              <div className="navbar__user-menu">
                {isAdmin && (
                  <Link to="/admin" className="navbar__auth-link">Admin</Link>
                )}
                <span className="navbar__user-name">{user?.full_name || 'Account'}</span>
                <button className="navbar__auth-link" onClick={logout}>Logout</button>
              </div>
            ) : (
              <div className="navbar__auth-actions">
                <Link to="/login" className="navbar__auth-link">Sign in</Link>
                <Link to="/signup" className="navbar__auth-link navbar__auth-link--primary">Sign up</Link>
              </div>
            )}

            <Link to="/cart" className="navbar__cart-btn" aria-label={`Cart: ${totalItems} items`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {totalItems > 0 && (
                <span className="navbar__cart-count">{totalItems}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="navbar__search-overlay">
            <div className="container">
              <SearchBar onClose={() => setSearchOpen(false)} />
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div className={`mobile-menu${mobileMenuOpen ? ' mobile-menu--open' : ''}`}>
        <div className="mobile-menu__header">
          <Link to="/" className="navbar__logo" onClick={() => setMobileMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="var(--color-ink)"/>
              <path d="M7 10h14M7 14h10M7 18h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Shopr</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav className="mobile-menu__nav">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `mobile-menu__link${isActive ? ' active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mobile-menu__footer">
          {!isLoggedIn ? (
            <div className="mobile-menu__auth-links">
              <Link to="/login" className="btn btn-outline btn-full" onClick={() => setMobileMenuOpen(false)}>
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-full" onClick={() => setMobileMenuOpen(false)}>
                Sign up
              </Link>
            </div>
          ) : (
            <button className="btn btn-outline btn-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>
              Logout
            </button>
          )}
          <Link to="/cart" className="btn btn-outline btn-full" onClick={() => setMobileMenuOpen(false)}>
            View Cart {totalItems > 0 && `(${totalItems})`}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <Link to="/" className="navbar__logo footer__logo">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="6" fill="white"/>
                  <path d="M7 10h14M7 14h10M7 18h6" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Shopr</span>
              </Link>
              <p>Curated essentials for the modern lifestyle. Quality you can feel, style you can see.</p>
              <div className="footer__social">
                {['instagram', 'twitter', 'facebook', 'pinterest'].map(s => (
                  <a key={s} href="#" aria-label={s} className="footer__social-link">
                    <div className="social-icon-placeholder" />
                  </a>
                ))}
              </div>
            </div>

            <div className="footer__col">
              <h4 className="label">Shop</h4>
              <ul>
                {['New Arrivals', 'Best Sellers', 'Sale', 'Clothing', 'Footwear', 'Accessories'].map(item => (
                  <li key={item}><Link to="/products">{item}</Link></li>
                ))}
              </ul>
            </div>

            <div className="footer__col">
              <h4 className="label">Help</h4>
              <ul>
                {['FAQs', 'Shipping & Returns', 'Size Guide', 'Track My Order', 'Contact Us'].map(item => (
                  <li key={item}><a href="#">{item}</a></li>
                ))}
              </ul>
            </div>

            <div className="footer__col">
              <h4 className="label">Newsletter</h4>
              <p>Get 10% off your first order when you sign up.</p>
              <form className="footer__subscribe" onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="your@email.com" />
                <button type="submit" className="btn btn-accent btn-sm">Join</button>
              </form>
            </div>
          </div>

          <div className="footer__bottom">
            <p>© 2025 Shopr. All rights reserved.</p>
            <div className="footer__legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}