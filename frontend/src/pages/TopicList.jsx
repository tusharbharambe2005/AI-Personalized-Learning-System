import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { learningApi } from '../services/api';

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'plSpin 0.8s linear infinite' }}></div>
    </div>
  );
}

export default function TopicList() {
  const { subjectSlug } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    learningApi.getSubject(subjectSlug)
      .then(data => setSubject(data))
      .catch(() => setError('Subject not found.'))
      .finally(() => setLoading(false));
  }, [subjectSlug]);

  if (loading) return <div className="page-container"><Spinner /></div>;

  if (error || !subject) {
    return (
      <div className="page-container">
        <div className="card"><div className="empty-state">
          <div className="empty-icon"><i className="bi bi-exclamation-circle"></i></div>
          <div className="empty-title">Subject not found</div>
          <Link to="/subjects" className="btn-primary btn-sm">Back to Subjects</Link>
        </div></div>
      </div>
    );
  }

  const topics = subject.topics || [];

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="pl-breadcrumb anim-fade-up">
        <Link to="/subjects">Subjects</Link>
        <span className="sep">›</span>
        <span className="current">{subject.name}</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 'var(--r-lg)', background: (subject.color || '#6b21a8') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`bi ${subject.icon || 'bi-book'}`} style={{ color: subject.color || '#6b21a8', fontSize: '1.5rem' }}></i>
        </div>
        <div>
          <h1 className="page-title">{subject.name}</h1>
          <p className="page-subtitle">{subject.description}</p>
        </div>
      </div>

      {/* Topics */}
      {topics.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topics.map((topic, i) => (
            <Link
              key={topic.id}
              to={`/subjects/${subjectSlug}/${topic.slug}`}
              className="anim-fade-up"
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'var(--surface)', 
                border: '1px solid var(--border)',
                borderLeft: topic.is_completed ? '4px solid #22c55e' : '1px solid var(--border)',
                borderRadius: 'var(--r-lg)', padding: '16px 20px',
                boxShadow: 'var(--shadow-xs)', transition: 'var(--transition)',
                textDecoration: 'none',
                animationDelay: `${i * 60}ms`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = topic.is_completed ? '#22c55e' : 'var(--border-focus)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{
                width: 34, height: 34, minWidth: 34,
                background: topic.is_completed ? '#dcfce7' : 'var(--surface-2)', 
                color: topic.is_completed ? '#16a34a' : 'var(--text-muted)',
                borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.8rem', fontWeight: 700,
              }}>
                {topic.is_completed ? <i className="bi bi-check-lg" style={{ fontSize: '1.1rem' }} /> : (topic.order || i + 1)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.9375rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{topic.title}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span><i className="bi bi-file-text" style={{marginRight: 4}}/>{topic.content_version_count || 5} explanations</span>
                  <span><i className="bi bi-play-circle" style={{marginRight: 4}}/>{topic.video_count || 0} videos</span>
                  {topic.is_completed && <span style={{color: '#16a34a'}}><i className="bi bi-check-circle" style={{marginRight: 4}}/>Completed</span>}
                </div>
              </div>
              {topic.is_completed ? (
                <div style={{ background: 'var(--primary)', color: 'white', padding: '6px 14px', borderRadius: 'var(--r-md)', fontSize: '.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="bi bi-arrow-repeat" /> Review
                </div>
              ) : (
                <i className="bi bi-chevron-right" style={{ color: 'var(--text-light)', fontSize: '.8rem' }}></i>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><i className="bi bi-inbox"></i></div>
            <div className="empty-title">No topics yet</div>
            <p className="empty-desc">Topics will appear here once added by an admin.</p>
          </div>
        </div>
      )}
    </div>
  );
}
