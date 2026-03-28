import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './AuthPages.css';

function Field({ id, label, type = 'text', placeholder, extra, form, errors, handleChange }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id} name={id} type={type}
        placeholder={placeholder}
        value={form[id]}
        onChange={handleChange}
        className={errors[id] ? 'invalid' : ''}
        autoComplete={type === 'password' ? 'new-password' : id}
      />
      {errors[id] && <span className="field-error">{errors[id]}</span>}
      {extra}
    </div>
  );
}

export default function SignupPage() {
  const { signup, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ email:'', username:'', full_name:'', password:'', confirm:'' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState('');

  if (isLoggedIn) { navigate('/', { replace: true }); return null; }

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
    setApiErr('');
  };

  const validate = () => {
    const e = {};
    if (!form.email.includes('@'))          e.email     = 'Enter a valid email';
    if (form.username.length < 3)           e.username  = 'At least 3 characters';
    if (!form.full_name.trim())             e.full_name = 'Required';
    if (form.password.length < 8)           e.password  = 'At least 8 characters';
    if (form.password !== form.confirm)     e.confirm   = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await signup(form.email, form.username, form.full_name, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card auth-card--wide">
        <div className="auth-card__header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="var(--color-ink)"/>
              <path d="M7 10h14M7 14h10M7 18h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__sub">Join Shopr — free forever</p>
        </div>

        {apiErr && (
          <div className="auth-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {apiErr}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <Field id="full_name" label="Full name" placeholder="Jane Smith" form={form} errors={errors} handleChange={handleChange} />
            <Field id="username" label="Username" placeholder="janedoe" form={form} errors={errors} handleChange={handleChange} />
          </div>
          <Field id="email" label="Email address" type="email" placeholder="you@example.com" form={form} errors={errors} handleChange={handleChange} />
          <div className="form-row">
            <Field id="password" label="Password" type="password" placeholder="Min 8 characters" form={form} errors={errors} handleChange={handleChange} />
            <Field id="confirm" label="Confirm password" type="password" placeholder="Repeat password" form={form} errors={errors} handleChange={handleChange} />
          </div>

          <p className="auth-terms">
            By creating an account you agree to our{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>

          <button
            type="submit"
            className={`btn btn-primary btn-full auth-submit${loading ? ' loading' : ''}`}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : null}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
