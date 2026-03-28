import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) { navigate(from, { replace: true }); return null; }

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-card__header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="var(--color-ink)"/>
              <path d="M7 10h14M7 14h10M7 18h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__sub">Sign in to your Shopr account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email" name="email" type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required autoFocus autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">
              Password
              <a href="#" className="form-field__link">Forgot password?</a>
            </label>
            <input
              id="password" name="password" type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full auth-submit${loading ? ' loading' : ''}`}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        

        <p className="auth-card__footer">
          Don't have an account?{' '}
          <Link to="/signup">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
