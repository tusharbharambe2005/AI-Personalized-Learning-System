import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { learningApi } from '../services/api';

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'plSpin 0.8s linear infinite' }}></div>
    </div>
  );
}

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    learningApi.getSubjects()
      .then(data => {
        // data is an array from ListAPIView
        setSubjects(Array.isArray(data) ? data : data.results || []);
      })
      .catch(() => setError('Could not load subjects.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><Spinner /></div>;

  return (
    <div className="page-container">
      <div className="page-header anim-fade-up">
        <h1 className="page-title">All Subjects</h1>
        <p className="page-subtitle">Choose a subject to explore topics and personalized explanations.</p>
      </div>

      {error && <div className="pl-alert danger"><i className="bi bi-exclamation-circle-fill"></i>{error}</div>}

      {subjects.length > 0 ? (
        <div className="grid-3" style={{ gap: 24 }}>
          {subjects.map((subject, i) => (
            <Link
              key={subject.id}
              to={`/subjects/${subject.slug}`}
              className={`subject-card anim-fade-up`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="subject-icon" style={{ background: (subject.color || '#6b21a8') + '18' }}>
                <i className={`bi ${subject.icon || 'bi-book'}`} style={{ color: subject.color || '#6b21a8', fontSize: '1.25rem' }}></i>
              </div>
              <div className="subject-name">{subject.name}</div>
              <div className="subject-meta"><i className="bi bi-journals" style={{ marginRight: 4 }}></i>{subject.topic_count} topics</div>
              <p className="subject-desc">{subject.description?.substring(0, 120) || 'Explore this subject.'}</p>
              <div style={{ marginTop: 12 }}>
                <span style={{ fontSize: '.8rem', fontWeight: 600, color: subject.color || '#6b21a8', background: (subject.color || '#6b21a8') + '12', padding: '4px 11px', borderRadius: 'var(--r-full)' }}>Browse topics →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : !error ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><i className="bi bi-inbox"></i></div>
            <div className="empty-title">No subjects yet</div>
            <p className="empty-desc">Subjects added by the admin will appear here. Make sure the Django server is running and has data.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
