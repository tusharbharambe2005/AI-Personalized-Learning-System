import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.data?.error || err?.data?.detail || 'Invalid username or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }} className="anim-fade-up">
          <div className="brand-mark" style={{ width: 48, height: 48, fontSize: '1.25rem', margin: '0 auto 16px' }}>🎓</div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-.5px', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>Sign in to continue your personalised journey.</p>
        </div>

        <div className="auth-card anim-fade-up anim-d1">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                id="login-username"
                type="text"
                className="form-input"
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                disabled={loading}
              />
            </div>
            {error && (
              <div className="pl-alert danger" style={{ marginBottom: 16 }}>
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{error}</span>
              </div>
            )}
            <button id="login-submit" type="submit" className="btn-primary btn-lg btn-full" disabled={loading}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'plSpin 0.8s linear infinite' }}></span>Signing in…</>
                : <><i className="bi bi-box-arrow-in-right"></i>Sign In</>}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary)' }}>Register free</Link>
          </p>

          {/* Quick credentials hint */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-4)', textAlign: 'center' }}>
            <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
              ⚡ Backend Connected to Django
            </p>
            <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Use your Django admin credentials, or register a new account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
