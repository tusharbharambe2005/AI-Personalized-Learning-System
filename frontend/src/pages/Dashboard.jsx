import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { recApi } from '../services/api';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function buildChartData(scores) {
  return {
    labels: ['Diagram', 'Analogy', 'Example', 'Theory', 'Logic'],
    datasets: [{
      label: 'Learning Style',
      data: [
        scores.diagram ?? 0,
        scores.analogy ?? 0,
        scores.example ?? 0,
        scores.theory ?? 0,
        scores.logic ?? 0,
      ],
      backgroundColor: 'rgba(79,70,229,0.08)',
      borderColor: 'rgba(79,70,229,0.6)',
      borderWidth: 2,
      pointBackgroundColor: '#4f46e5',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  };
}

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    r: {
      min: 0, max: 100,
      grid: { color: 'rgba(15,23,42,0.06)' },
      angleLines: { color: 'rgba(15,23,42,0.06)' },
      pointLabels: { color: '#64748b', font: { family: 'Inter', size: 11, weight: '600' } },
      ticks: { display: false }
    }
  }
};

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'plSpin 0.8s linear infinite' }}></div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [pref, setPref] = useState(null);
  const [recTopics, setRecTopics] = useState([]);
  const [recVideos, setRecVideos] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      recApi.getPreferences(),
      recApi.getRecommendedTopics(),
      recApi.getRecommendedVideos(),
      recApi.getInteractionHistory(),
    ])
      .then(([prefData, topicsData, videosData, historyData]) => {
        setPref(prefData);
        setRecTopics(topicsData.results || []);
        setRecVideos(videosData.results || []);
        setHistory(historyData.results || []);
      })
      .catch((err) => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.first_name || user?.username || 'Student';
  const isPro = user?.profile?.is_pro;
  const proRequested = user?.profile?.pro_requested;
  const preferredStyle = pref?.preferred_style || user?.profile?.preferred_style || 'balanced';
  const interactionCount = pref?.interaction_count ?? 0;
  const totalTopics = pref?.total_topics_count ?? 0;

  const normScores = pref ? {
    diagram: pref.diagram_score ?? 0,
    analogy: pref.analogy_score ?? 0,
    example: pref.example_score ?? 0,
    theory: pref.theory_score ?? 0,
    logic: pref.logic_score ?? 0,
  } : { diagram: 0, analogy: 0, example: 0, theory: 0, logic: 0 };

  const progressPct = totalTopics > 0 ? Math.round((interactionCount / totalTopics) * 100) : 0;

  if (loading) return (
    <div className="page-container"><Spinner /></div>
  );

  if (error) return (
    <div className="page-container">
      <div className="pl-alert danger"><i className="bi bi-exclamation-circle-fill"></i>{error}</div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="user-avatar" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>
            {user?.profile?.avatar_url
              ? <img src={user.profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (firstName[0] || 'U').toUpperCase()}
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Welcome back, {firstName}</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>Your personalized learning journey continues.</p>
          </div>
        </div>
        <span className={`style-chip chip-${preferredStyle}`}>
          <i className="bi bi-star-fill"></i>{preferredStyle.charAt(0).toUpperCase() + preferredStyle.slice(1)} Learner
        </span>
      </div>

      {/* Pro Status */}
      <div style={{ marginBottom: 24 }} className="anim-fade-up">
        {isPro ? (
          <div className="pl-alert success">
            <div style={{ fontSize: '1.5rem' }}>✅</div>
            <div><strong>Pro Active</strong>
              <p style={{ margin: 0, fontSize: '.875rem' }}>AI Chatbot is unlocked.</p>
            </div>
          </div>
        ) : proRequested ? (
          <div className="pl-alert warning">
            <div style={{ fontSize: '1.5rem' }}>⏳</div>
            <div><strong>Pro Approval Pending</strong>
              <p style={{ margin: 0, fontSize: '.875rem' }}>Your request is awaiting admin review.</p>
            </div>
          </div>
        ) : (
          <div className="pl-alert info">
            <div style={{ fontSize: '1.5rem' }}>⚡</div>
            <div>
              <p style={{ margin: 0 }}><Link to="/upgrade" style={{ fontWeight: 700 }}>Upgrade to Pro</Link> to unlock the AI Chatbot tutor.</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid-4 anim-fade-up anim-d1" style={{ gap: 12, marginBottom: 40 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-l)', color: 'var(--primary)' }}><i className="bi bi-cursor-fill"></i></div>
          <div className="stat-value">{interactionCount}</div>
          <div className="stat-label">Interactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-l)', color: 'var(--accent)' }}><i className="bi bi-journals"></i></div>
          <div className="stat-value">{recTopics.length}</div>
          <div className="stat-label">Recommended</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-l)', color: 'var(--success)' }}><i className="bi bi-play-circle"></i></div>
          <div className="stat-value">{recVideos.length}</div>
          <div className="stat-label">Videos</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-l)', color: 'var(--warning)' }}><i className="bi bi-star-fill"></i></div>
          <div className="stat-value" style={{ fontSize: '1rem', paddingTop: '.25rem' }}>
            <span className={`style-chip chip-${preferredStyle}`}>{preferredStyle.charAt(0).toUpperCase() + preferredStyle.slice(1)}</span>
          </div>
          <div className="stat-label">Top Style</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-main-grid" style={{ marginBottom: 40 }}>
        {/* Style Profile */}
        <div className="card anim-fade-up anim-d2">
          <div className="card-body">
            <div className="section-header" style={{ marginBottom: 24 }}>
              <div className="section-title">
                <span className="icon-dot"><i className="bi bi-pie-chart"></i></span>Style Profile
              </div>
            </div>
            {pref ? (
              <>
                <div className="chart-container" style={{ marginBottom: 24 }}>
                  <Radar data={buildChartData(normScores)} options={chartOptions} />
                </div>
                {Object.entries(normScores).map(([style, val]) => (
                  <div key={style} className="pref-bar-row">
                    <span className="pref-label">{style.charAt(0).toUpperCase() + style.slice(1)}</span>
                    <div className="pref-bar-wrap">
                      <div className={`progress-bar-fill ${style}`} style={{ width: `${Math.min(val, 100)}%` }}></div>
                    </div>
                    <span className="pref-val">{val}%</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-icon"><i className="bi bi-bar-chart"></i></div>
                <div className="empty-title">No data yet</div>
                <p className="empty-desc">Start reading topics to build your profile.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Topics */}
        <div className="card anim-fade-up anim-d3">
          <div className="card-body">
            <div className="section-header">
              <div className="section-title"><span className="icon-dot"><i className="bi bi-compass"></i></span>Recommended Topics</div>
              <Link to="/subjects" className="btn-ghost btn-sm">All subjects</Link>
            </div>
            {recTopics.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recTopics.map((topic, i) => (
                  <div key={topic.id} className="rec-card">
                    <div className="rec-rank">#{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: '.9375rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{topic.title}</div>
                          <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
                            <i className="bi bi-book" style={{ marginRight: 4 }}></i>{topic.subject_name}
                          </div>
                        </div>
                        <Link to={`/subjects/${topic.subject_slug}/${topic.slug}`} className="btn-primary btn-sm" style={{ flexShrink: 0 }}>
                          <i className="bi bi-play-fill"></i>Start
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div className="empty-icon"><i className="bi bi-compass"></i></div>
                <div className="empty-title">Interact with topics first</div>
                <p className="empty-desc">Once you've rated some content, personalized recommendations will appear here.</p>
                <Link to="/subjects" className="btn-primary btn-sm">Browse Subjects</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Videos */}
      {recVideos.length > 0 && (
        <div className="section anim-fade-up">
          <div className="section-header">
            <div className="section-title"><span className="icon-dot"><i className="bi bi-play-circle"></i></span>Recommended Videos</div>
            <Link to="/videos" className="btn-ghost btn-sm">View all</Link>
          </div>
          <div className="grid-3" style={{ gap: 16 }}>
            {recVideos.slice(0, 3).map(video => (
              <div key={video.id} className="video-card">
                <a href={video.youtube_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <div className="video-thumb">
                    <img src={video.thumbnail} alt={video.title} loading="lazy"
                      onError={e => { e.target.src = 'https://placehold.co/480x270/f1f5f9/94a3b8?text=Video'; }} />
                    <div className="video-play"><div className="play-btn"><i className="bi bi-play-fill"></i></div></div>
                  </div>
                </a>
                <div className="video-info">
                  <div className="video-title">{video.title.substring(0, 55)}{video.title.length > 55 ? '...' : ''}</div>
                  <div className="video-meta" style={{ marginBottom: 8 }}><i className="bi bi-book"></i>{video.topic?.title?.substring(0, 30)}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {video.diagram_score >= 60 && <span className="style-chip chip-diagram" style={{ fontSize: '.6rem', padding: '2px 7px' }}>Diagram {video.diagram_score}%</span>}
                    {video.example_score >= 60 && <span className="style-chip chip-example" style={{ fontSize: '.6rem', padding: '2px 7px' }}>Example {video.example_score}%</span>}
                    {video.analogy_score >= 60 && <span className="style-chip chip-analogy" style={{ fontSize: '.6rem', padding: '2px 7px' }}>Analogy {video.analogy_score}%</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {history.length > 0 && (
        <div className="section anim-fade-up">
          <div className="section-header">
            <div className="section-title"><span className="icon-dot"><i className="bi bi-clock-history"></i></span>Recent Activity</div>
            <Link to="/history" className="btn-ghost btn-sm">Full history</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.slice(0, 3).map(item => (
              <div key={item.id} className="rec-card" style={{ borderLeft: '3px solid var(--border-focus)' }}>
                <span className={`style-chip chip-${item.style_type}`}>{item.style_type?.charAt(0).toUpperCase()}{item.style_type?.slice(1)}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text)' }}>{item.topic_title}</span>
                  <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>{item.subject_name}</span>
                </div>
                {item.rating && <span className="star-rating">{'⭐'.repeat(item.rating)}</span>}
                <span style={{ fontSize: '.75rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>{new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
