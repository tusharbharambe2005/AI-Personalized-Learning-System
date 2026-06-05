import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    email: '', institution: '', password: '', password2: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.first_name) e.first_name = 'First name is required.';
    if (!form.username) e.username = 'Username is required.';
    if (!form.email) e.email = 'Email is required.';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.password2) e.password2 = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      await register({
        username: form.username,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        institution: form.institution,
      });
      navigate('/dashboard');
    } catch (err) {
      const data = err?.data || {};
      setErrors(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }} className="anim-fade-up">
          <div className="brand-mark" style={{ width: 48, height: 48, fontSize: '1.25rem', margin: '0 auto 16px' }}>🎓</div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-.5px', marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>Join PersonaLearn and discover your learning style.</p>
        </div>

        <div className="auth-card anim-fade-up anim-d1">
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid-2" style={{ gap: '12px 20px' }}>
              {/* First Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">First Name</label>
                <input id="reg-first-name" type="text" className={`form-input ${errors.first_name ? 'error' : ''}`} placeholder="First name" value={form.first_name} onChange={set('first_name')} disabled={loading} />
                {errors.first_name && <div className="form-error">{errors.first_name}</div>}
              </div>
              {/* Last Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Last Name</label>
                <input id="reg-last-name" type="text" className="form-input" placeholder="Last name" value={form.last_name} onChange={set('last_name')} disabled={loading} />
              </div>
              {/* Username */}
              <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
                <label className="form-label">Username</label>
                <input id="reg-username" type="text" className={`form-input ${errors.username ? 'error' : ''}`} placeholder="Choose a username" value={form.username} onChange={set('username')} autoComplete="username" disabled={loading} />
                {errors.username && <div className="form-error">{errors.username}</div>}
              </div>
              {/* Email */}
              <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input id="reg-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="your@email.com" value={form.email} onChange={set('email')} disabled={loading} />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
              {/* Institution */}
              <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
                <label className="form-label">Institution <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span></label>
                <input id="reg-institution" type="text" className="form-input" placeholder="College or university name" value={form.institution} onChange={set('institution')} disabled={loading} />
              </div>
              {/* Password */}
              <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <input id="reg-password" type="password" className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Create a password (min 8 chars)" value={form.password} onChange={set('password')} autoComplete="new-password" disabled={loading} />
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>
              {/* Confirm Password */}
              <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
                <label className="form-label">Confirm Password</label>
                <input id="reg-confirm-password" type="password" className={`form-input ${errors.password2 ? 'error' : ''}`} placeholder="Repeat password" value={form.password2} onChange={set('password2')} autoComplete="new-password" disabled={loading} />
                {errors.password2 && <div className="form-error">{errors.password2}</div>}
              </div>
              {/* Submit */}
              <div style={{ gridColumn: '1/-1', marginTop: 8 }}>
                <button id="reg-submit" type="submit" className="btn-primary btn-lg btn-full" disabled={loading}>
                  {loading
                    ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'plSpin 0.8s linear infinite' }}></span>Creating account…</>
                    : <><i className="bi bi-rocket-takeoff"></i>Create Account</>}
                </button>
              </div>
            </div>
          </form>
          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
