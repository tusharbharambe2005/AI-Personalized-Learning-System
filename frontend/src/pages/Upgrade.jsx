import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function Upgrade() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type, text }

  const isPro = user?.profile?.is_pro;
  const proRequested = user?.profile?.pro_requested;

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!coupon.trim()) {
      setMsg({ type: 'error', text: 'Please enter your coupon code.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await authApi.upgradeRequest(coupon.trim());
      // Update local user state
      setUser({ ...user, profile: { ...user.profile, pro_requested: true } });
      setMsg({ type: 'success', text: '✅ Valid coupon! Request submitted. Admin will approve shortly.' });
    } catch (err) {
      const errData = err?.data || {};
      const errText = errData.error || errData.message || Object.values(errData)[0] || 'Failed to submit request.';
      setMsg({ type: 'error', text: errText });
    } finally {
      setLoading(false);
    }
  };

  if (isPro) {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="pl-alert success" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '2rem' }}>✅</div>
          <div>
            <strong>You're already a Pro member!</strong>
            <p style={{ margin: 0 }}>Enjoy all Pro features including the AI Chatbot.</p>
          </div>
        </div>
        <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }} className="anim-fade-up">
        <div style={{ width: 72, height: 72, borderRadius: 'var(--r-xl)', background: 'linear-gradient(135deg, var(--primary-l), var(--accent-l))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>⚡</div>
        <h1 className="page-title">Upgrade to Pro</h1>
        <p className="page-subtitle" style={{ maxWidth: 480, margin: '0 auto' }}>
          Unlock the AI Chatbot tutor and all Pro features with a coupon code.
        </p>
      </div>

      {/* Already Requested */}
      {proRequested && !msg && (
        <div className="card anim-fade-up" style={{ marginBottom: 24 }}>
          <div className="card-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>Request Pending</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Your Pro upgrade request has been submitted. An admin will review and approve it shortly.
            </p>
            <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
          </div>
        </div>
      )}

      {/* Success Message */}
      {msg && (
        <div className={`pl-alert ${msg.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 24 }}>
          <i className={`bi ${msg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Feature List */}
      {!proRequested && (
        <>
          <div className="card anim-fade-up anim-d1" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-sans)' }}>Pro Features</h3>
              {[
                { icon: '🤖', title: 'AI Chatbot Tutor', desc: 'Ask anything, get answers tailored to your learning style' },
                { icon: '💬', title: 'Natural Conversations', desc: 'Follow-up questions in a natural chat interface' },
                { icon: '🎯', title: 'Style-Aware Responses', desc: 'AI adapts explanations to your preference profile' },
                { icon: '📊', title: 'Advanced Analytics', desc: 'Deep insights into your learning pattern over time' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: i < 3 ? 16 : 0 }}>
                  <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--text)' }}>{f.title}</div>
                    <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)' }}>{f.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    <span className="style-chip chip-example" style={{ fontSize: '.6rem' }}>✓ Pro</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon Form */}
          <div className="card anim-fade-up anim-d2">
            <div className="card-body">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
                <i className="bi bi-ticket-perforated" style={{ color: 'var(--primary)', marginRight: 8 }}></i>
                Enter Coupon Code
              </h3>
              <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                Enter your beta coupon code to request Pro access.
              </p>
              <form onSubmit={handleRequest}>
                <div className="form-group">
                  <label className="form-label">Coupon Code</label>
                  <input
                    id="upgrade-coupon"
                    type="text"
                    className="form-input"
                    placeholder="e.g. TUSHAR123"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    disabled={loading}
                    style={{ letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button id="upgrade-request" type="submit" className="btn-primary btn-lg" disabled={loading}>
                    {loading
                      ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'plSpin 0.8s linear infinite' }}></span>Submitting…</>
                      : <><i className="bi bi-rocket-takeoff-fill"></i>Request Pro Upgrade</>}
                  </button>
                  <Link to="/dashboard" className="btn-ghost">Maybe later</Link>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
