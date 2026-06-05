import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'plSpin 0.8s linear infinite' }}></div>
    </div>
  );
}

export default function History() {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState([]);
  const [pref, setPref] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([recApi.getInteractionHistory(), recApi.getPreferences()])
      .then(([histData, prefData]) => {
        setInteractions(histData.results || []);
        setPref(prefData);
      })
      .catch(() => setError('Could not load history.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><Spinner /></div>;

  const preferredStyle = pref?.preferred_style || user?.profile?.preferred_style || 'balanced';
  const topStyleScore = pref
    ? Math.max(pref.diagram_score || 0, pref.analogy_score || 0, pref.example_score || 0, pref.theory_score || 0, pref.logic_score || 0)
    : 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }} className="anim-fade-up">
        <div>
          <h1 className="page-title">Interaction History</h1>
          <p className="page-subtitle">Every explanation you've selected — this data shapes your personalised recommendations.</p>
        </div>
        <Link to="/dashboard" className="btn-secondary btn-sm"><i className="bi bi-grid-1x2"></i>Dashboard</Link>
      </div>

      {error && <div className="pl-alert danger" style={{ marginBottom: 16 }}><i className="bi bi-exclamation-circle-fill"></i>{error}</div>}

      {/* Summary Cards */}
      <div className="grid-4 anim-fade-up anim-d1" style={{ gap: 12, marginBottom: 40 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-l)', color: 'var(--primary)' }}><i className="bi bi-cursor-fill"></i></div>
          <div className="stat-value">{pref?.interaction_count ?? interactions.length}</div>
          <div className="stat-label">Total Interactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-l)', color: 'var(--success)' }}><i className="bi bi-star-fill"></i></div>
          <div className="stat-value" style={{ fontSize: '1.25rem', paddingTop: '.25rem' }}>
            <span className={`style-chip chip-${preferredStyle}`}>{preferredStyle.charAt(0).toUpperCase() + preferredStyle.slice(1)}</span>
          </div>
          <div className="stat-label">Preferred Style</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-l)', color: 'var(--accent)' }}><i className="bi bi-journals"></i></div>
          <div className="stat-value">{interactions.length}</div>
          <div className="stat-label">Topics Explored</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-l)', color: 'var(--warning)' }}><i className="bi bi-bar-chart"></i></div>
          <div className="stat-value">{topStyleScore}%</div>
          <div className="stat-label">Top Style Score</div>
        </div>
      </div>

      {/* History Table */}
      {interactions.length > 0 ? (
        <div className="history-table anim-fade-up anim-d2">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Topic</th>
                <th>Subject</th>
                <th>Style Chosen</th>
                <th>Explanation</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {interactions.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '.8rem' }}>{i + 1}</td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--text)' }}>
                      {(item.topic_title || '—').substring(0, 35)}{(item.topic_title || '').length > 35 ? '...' : ''}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '.8125rem' }}>{item.subject_name || '—'}</td>
                  <td>
                    <span className={`style-chip chip-${item.style_type}`}>
                      {(item.style_type || 'diagram').charAt(0).toUpperCase() + (item.style_type || 'diagram').slice(1)}
                    </span>
                  </td>
                  <td style={{ fontSize: '.8125rem', color: 'var(--text-muted)' }}>
                    {(item.content_version_title || '—').substring(0, 38)}{(item.content_version_title || '').length > 38 ? '...' : ''}
                  </td>
                  <td>
                    {item.rating
                      ? <span className="star-rating">{'⭐'.repeat(item.rating)}</span>
                      : <span style={{ color: 'var(--text-light)', fontSize: '.8rem' }}>
                          {item.skipped ? <span className="style-chip chip-balanced" style={{ fontSize: '.65rem' }}>Skipped</span> : '—'}
                        </span>}
                  </td>
                  <td style={{ fontSize: '.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card anim-fade-up">
          <div className="empty-state">
            <div className="empty-icon"><i className="bi bi-clock-history"></i></div>
            <div className="empty-title">No interactions yet</div>
            <p className="empty-desc">Start exploring topics and selecting explanations to build your learning profile.</p>
            <Link to="/subjects" className="btn-primary btn-sm"><i className="bi bi-collection"></i>Browse Subjects</Link>
          </div>
        </div>
      )}
    </div>
  );
}
