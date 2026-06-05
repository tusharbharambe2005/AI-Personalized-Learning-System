import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { learningApi, recApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fetchYouTubeVideosCached } from '../services/youtube';

const accentColors = {
  diagram: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
  analogy: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
  example: 'linear-gradient(90deg, #10b981, #34d399)',
  theory:  'linear-gradient(90deg, #6366f1, #818cf8)',
  logic:   'linear-gradient(90deg, #ef4444, #f87171)',
};

// Hard-coded colors (no CSS vars) for reliable inline style rendering
const STYLE_META = {
  diagram: { color: '#0ea5e9', bg: '#e0f2fe', emoji: '📊', label: 'Diagram'  },
  analogy: { color: '#f59e0b', bg: '#fef3c7', emoji: '💡', label: 'Analogy'  },
  example: { color: '#10b981', bg: '#d1fae5', emoji: '💻', label: 'Example'  },
  theory:  { color: '#8b5cf6', bg: '#ede9fe', emoji: '📖', label: 'Theory'   },
  logic:   { color: '#ef4444', bg: '#fee2e2', emoji: '⚙️', label: 'Logic'    },
};

const STYLE_KEYWORDS = {
  diagram:  ['diagram','visual','chart','graph','flowchart','animation','illustration','picture','draw'],
  analogy:  ['analogy','like','compare','real world','everyday','simple','beginner','understand','relate'],
  example:  ['example','code','demo','practice','hands-on','step by step','tutorial','implement','exercise'],
  theory:   ['theory','concept','definition','explain','introduction','overview','fundamentals','basics','lecture'],
  logic:    ['logic','proof','algorithm','reasoning','analysis','math','formula','derive','solve','systematic'],
};

function calcStyleScores(video) {
  const text = `${video.title} ${video.description || ''}`.toLowerCase();
  const raw = {};
  Object.entries(STYLE_KEYWORDS).forEach(([s, kws]) => {
    raw[s] = kws.filter(kw => text.includes(kw)).length;
  });
  const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
  const pct = {};
  Object.keys(raw).forEach(s => { pct[s] = Math.round((raw[s] / total) * 100); });
  // Normalize to 100
  const diff = 100 - Object.values(pct).reduce((a, b) => a + b, 0);
  const topKey = Object.keys(pct).sort((a, b) => (raw[b] || 0) - (raw[a] || 0))[0];
  pct[topKey] = Math.max(0, (pct[topKey] || 0) + diff);
  return pct;
}

/* ─── Style Score Bars ───────────────────────────────────────── */
function StyleScoreBars({ video, preferredStyle }) {
  const scores = calcStyleScores(video);
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  return (
    <div style={{
      marginTop: 10, padding: '10px 12px',
      background: '#f8f7f4', borderRadius: 10,
      border: '1px solid #e6e2d6',
    }}>
      <div style={{
        fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.5px', color: '#6366f1', marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        ⚡ Style Match
      </div>
      {sorted.map(([style, pct]) => {
        const m = STYLE_META[style];
        const isMe = style === preferredStyle;
        return (
          <div key={style} style={{ marginBottom: 5 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 2,
            }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: isMe ? 700 : 500,
                color: isMe ? m.color : '#64748b',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {m.emoji} {m.label}
                {isMe && (
                  <span style={{
                    fontSize: '0.58rem', background: m.color, color: '#fff',
                    padding: '1px 5px', borderRadius: 99, fontWeight: 800,
                    letterSpacing: '0.2px',
                  }}>YOU</span>
                )}
              </span>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700,
                color: isMe ? m.color : '#94a3b8',
              }}>{pct}%</span>
            </div>
            <div style={{
              height: isMe ? 7 : 4, background: '#e2e8f0',
              borderRadius: 99, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: m.color,
                borderRadius: 99, opacity: isMe ? 1 : 0.5,
                transition: 'width 1s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Mini YouTube Card (for TopicDetail) ────────────────────── */
function YTMiniCard({ video, preferredStyle, onEmbed }) {
  return (
    <div className="video-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="video-thumb" style={{ cursor: 'pointer' }} onClick={() => onEmbed(video)}>
        <img src={video.thumbnail} alt={video.title} loading="lazy"
          onError={e => { e.target.src = 'https://placehold.co/480x270/f1f5f9/94a3b8?text=Video'; }} />
        <div className="video-play"><div className="play-btn"><i className="bi bi-play-fill" /></div></div>
        {video.duration && (
          <div style={{ position: 'absolute', bottom: 7, right: 7, background: 'rgba(0,0,0,0.78)', color: '#fff', fontSize: '.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>
            {video.duration}
          </div>
        )}
      </div>
      <div className="video-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="video-title" title={video.title} style={{ fontSize: '.8rem' }}>
          {video.title.length > 60 ? video.title.slice(0, 60) + '…' : video.title}
        </div>
        <div className="video-meta" style={{ fontSize: '.72rem', marginBottom: 4 }}>
          <span><i className="bi bi-youtube" style={{ color: '#ff0000' }} /> {video.channelName}</span>
          {video.views && <span><i className="bi bi-eye" /> {video.views}</span>}
        </div>
        {/* Style scores */}
        <StyleScoreBars video={video} preferredStyle={preferredStyle} />
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <button onClick={() => onEmbed(video)} className="btn-primary btn-sm"
            style={{ flex: 1, justifyContent: 'center', fontSize: '.75rem' }}>
            <i className="bi bi-play-fill" /> Play
          </button>
          <a href={video.youtubeUrl} target="_blank" rel="noreferrer"
            className="btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
            <i className="bi bi-box-arrow-up-right" />
          </a>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'plSpin 0.8s linear infinite' }} />
    </div>
  );
}


export default function TopicDetail() {
  const { subjectSlug, topicSlug } = useParams();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [topic, setTopic]                     = useState(null);
  const [allSubjectTopics, setAllSubjectTopics] = useState([]);   // for next-topic navigation
  const [currentVersion, setCurrentVersion]   = useState(null);
  const [exhausted, setExhausted]             = useState(false);
  const [completed, setCompleted]             = useState(false);
  const [showRating, setShowRating]           = useState(false);
  const [selectedRating, setSelectedRating]   = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [actionLoading, setActionLoading]     = useState(false);
  const [pendingNext, setPendingNext]         = useState(null);
  const [error, setError]                     = useState('');
  const [seenCount, setSeenCount]             = useState(0);
  const [totalVersions, setTotalVersions]     = useState(0);

  // YouTube
  const [ytVideos, setYtVideos]   = useState([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError]     = useState('');
  const [embedVideo, setEmbedVideo] = useState(null);

  const preferredStyle = user?.profile?.preferred_style || 'diagram';

  // Load topic + subject topics (for next-topic)
  useEffect(() => {
    // Reset state for new topic
    setTopic(null);
    setCurrentVersion(null);
    setExhausted(false);
    setCompleted(false);
    setShowRating(false);
    setSelectedRating(0);
    setPendingNext(null);
    setSeenCount(0);
    setLoading(true);
    setError('');

    Promise.all([
      learningApi.getTopic(subjectSlug, topicSlug),
      learningApi.getSubject(subjectSlug),   // ← loads all topics of subject
    ])
      .then(([topicData, subjectData]) => {
        setTopic(topicData);
        setTotalVersions(topicData.content_versions?.length || 0);
        setAllSubjectTopics(subjectData.topics || []);
        return recApi.getNextContent(topicData.id);
      })
      .then(cvData => {
        if (cvData?.exhausted) setExhausted(true);
        else setCurrentVersion(cvData);
      })
      .catch(() => setError('Could not load topic content.'))
      .finally(() => setLoading(false));
  }, [subjectSlug, topicSlug]);

  // Fetch YouTube videos
  useEffect(() => {
    if (!topic) return;
    setYtLoading(true);
    fetchYouTubeVideosCached(topic.title, 5)
      .then(vids => setYtVideos(vids))
      .catch(err  => setYtError(err.message))
      .finally(() => setYtLoading(false));
  }, [topic?.id]);

  // ── Next topic helper ──────────────────────────────────────────
  const getNextTopic = () => {
    if (!topic || !allSubjectTopics.length) return null;
    const idx = allSubjectTopics.findIndex(t => t.slug === topicSlug);
    if (idx === -1 || idx >= allSubjectTopics.length - 1) return null;
    return allSubjectTopics[idx + 1];
  };

  const handleSkip = async () => {
    if (!currentVersion) return;
    setActionLoading(true);
    try {
      const res = await recApi.submitInteraction(currentVersion.id, null, true);
      setSeenCount(prev => prev + 1);
      if (res.exhausted) { setCompleted(true); }
      else {
        setPendingNext(res.next_content);
      }
    } catch { setError('Failed to skip. Try again.'); }
    finally { setActionLoading(false); }
  };

  const handleSubmit = async () => {
    if (!currentVersion || !selectedRating) return;
    setActionLoading(true);
    try {
      await recApi.submitInteraction(currentVersion.id, selectedRating, false);
      setSeenCount(prev => prev + 1);
      const next = await recApi.getNextContent(topic.id);
      if (next?.exhausted) { setCompleted(true); }
      else {
        setPendingNext(next);
      }
    } catch { setError('Failed to submit. Try again.'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="page-container"><Spinner /></div>;
  if (error) return (
    <div className="page-container">
      <div className="pl-alert danger"><i className="bi bi-exclamation-circle-fill" />{error}</div>
    </div>
  );
  if (!topic) return (
    <div className="page-container">
      <div className="card"><div className="empty-state">
        <div className="empty-icon"><i className="bi bi-file-earmark-x" /></div>
        <div className="empty-title">Topic not found</div>
        <Link to="/subjects" className="btn-primary btn-sm">Browse Subjects</Link>
      </div></div>
    </div>
  );

  const isCompleted = completed || exhausted;
  const progressPct = isCompleted ? 100 : (totalVersions > 0 ? Math.round((seenCount / totalVersions) * 100) : 0);
  const displayStyleCount = isCompleted ? totalVersions : Math.min(seenCount + 1, totalVersions);
  const displayVersion = isCompleted 
    ? (topic.content_versions?.find(cv => cv.style_type === preferredStyle) || topic.content_versions?.[0])
    : currentVersion;
  const style       = displayVersion?.style_type || 'diagram';
  const nextTopic   = getNextTopic();



  // ── NORMAL TOPIC VIEW ──────────────────────────────────────────
  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="pl-breadcrumb anim-fade-up">
        <Link to="/subjects">Subjects</Link>
        <span className="sep">›</span>
        <Link to={`/subjects/${subjectSlug}`}>{topic.subject_name}</Link>
        <span className="sep">›</span>
        <span className="current">{topic.title}</span>
      </div>

      {/* Header */}
      <div className="topic-detail-grid">
        <div>
          <h1 className="page-title">{topic.title}</h1>
          <p className="page-subtitle">{topic.subject_name}</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--primary)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-info-circle" />How this works
          </div>
          <ol style={{ fontSize: '.8125rem', color: 'var(--text-muted)', paddingLeft: '1.1rem', margin: 0, lineHeight: 2 }}>
            <li>Read each explanation style</li>
            <li><strong>Rate</strong> or <strong>Skip</strong> each one</li>
            <li>Your profile updates automatically</li>
          </ol>
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-list-check" style={{ color: 'var(--primary)' }} />
            {isCompleted ? 'Topic Completed' : `Style ${displayStyleCount} of ${totalVersions}`}
          </div>
          <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-l)', padding: '2px 10px', borderRadius: 'var(--r-full)' }}>
            {progressPct}%
          </span>
        </div>
        <div style={{ width: '100%', height: 8, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: isCompleted ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, var(--primary), #a78bfa)', borderRadius: 'var(--r-full)', transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Content Card */}
      {displayVersion && (
        <div style={{ maxWidth: 800, margin: '0 auto 24px' }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ height: 4, background: accentColors[style] || accentColors.diagram }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0', flexWrap: 'wrap', gap: 8 }}>
              <span className={`style-chip chip-${style}`}>{displayVersion.style_display || style}</span>
              <span style={{ fontSize: '.7rem', fontWeight: 600, background: isCompleted ? '#dcfce7' : 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: isCompleted ? '#16a34a' : 'var(--primary)', padding: '4px 12px', borderRadius: 'var(--r-full)', border: isCompleted ? '1px solid #bbf7d0' : '1px solid #c4b5fd' }}>
                {isCompleted ? '⭐ Your Preferred Style' : '⭐ Personalized for you'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', padding: '12px 24px 0', lineHeight: 1.4 }}>{displayVersion.title}</h3>
            <div style={{ padding: '16px 24px 20px', fontSize: '.9rem', lineHeight: 1.85, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {displayVersion.content}
            </div>

            {/* Actions */}
            {pendingNext ? (
              <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'linear-gradient(180deg, #f0fdf4 0%, var(--surface) 100%)', textAlign: 'center' }}>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#166534', marginBottom: 16 }}>
                  <i className="bi bi-check-circle-fill" style={{marginRight: 8, fontSize: '1.2rem'}}/> Rating saved! What would you like to do next?
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => {
                      setCurrentVersion(pendingNext);
                      setShowRating(false);
                      setSelectedRating(0);
                      setPendingNext(null);
                    }}
                    className="btn-secondary"
                    style={{ padding: '12px 24px', flex: 1, minWidth: 200 }}
                  >
                    <i className="bi bi-arrow-clockwise" /> Try Another Style
                  </button>
                  {nextTopic ? (
                    <Link
                      to={`/subjects/${subjectSlug}/${nextTopic.slug}`}
                      className="btn-primary"
                      style={{ flex: 1, minWidth: 200, background: 'linear-gradient(135deg, #16a34a, #22c55e)', boxShadow: '0 4px 16px rgba(22,163,74,0.35)', padding: '12px 32px' }}
                    >
                      <i className="bi bi-arrow-right" /> Start Next Topic
                    </Link>
                  ) : (
                    <Link to={`/subjects/${subjectSlug}`} className="btn-primary" style={{ padding: '12px 24px' }}>
                      <i className="bi bi-list-ul" /> Back to Subject
                    </Link>
                  )}
                </div>
              </div>
            ) : isCompleted ? (
              <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'linear-gradient(180deg, #f0fdf4 0%, var(--surface) 100%)', textAlign: 'center' }}>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#166534', marginBottom: 16 }}>
                  <i className="bi bi-check-circle-fill" style={{marginRight: 8, fontSize: '1.2rem'}}/> You've completed this topic!
                </p>
                {nextTopic ? (
                  <Link
                    to={`/subjects/${subjectSlug}/${nextTopic.slug}`}
                    className="btn-primary"
                    style={{ display: 'inline-flex', background: 'linear-gradient(135deg, #16a34a, #22c55e)', boxShadow: '0 4px 16px rgba(22,163,74,0.35)', padding: '14px 32px', fontSize: '.95rem' }}
                  >
                    <i className="bi bi-arrow-right" />Start Next Topic: {nextTopic.title}
                  </Link>
                ) : (
                  <Link to={`/subjects/${subjectSlug}`} className="btn-secondary" style={{ padding: '12px 24px' }}>
                    <i className="bi bi-list-ul" />Back to Subject
                  </Link>
                )}
              </div>
            ) : !showRating ? (
              <div style={{ display: 'flex', gap: 12, padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '14px 24px', background: 'linear-gradient(135deg, var(--primary), #7c3aed)', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
                  onClick={() => setShowRating(true)} disabled={actionLoading}
                >
                  <i className="bi bi-star-fill" />Rate this explanation
                </button>
                <button
                  onClick={handleSkip} disabled={actionLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', background: 'var(--surface)', cursor: 'pointer', fontSize: '.8125rem', fontWeight: 500, fontFamily: 'var(--font-sans)', transition: 'var(--transition)' }}
                >
                  {actionLoading ? '…' : <><i className="bi bi-skip-forward" />Skip</>}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'linear-gradient(180deg, #fefce8 0%, var(--surface) 100%)' }}>
                <p style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>How helpful was this explanation?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setSelectedRating(star)} style={{
                      width: 52, height: 52, borderRadius: '50%',
                      border: `2px solid ${selectedRating >= star ? '#f59e0b' : '#e2e8f0'}`,
                      background: selectedRating >= star ? '#fef3c7' : 'white',
                      color: selectedRating >= star ? '#f59e0b' : '#cbd5e1',
                      fontSize: '1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>⭐</button>
                  ))}
                </div>
                <button onClick={handleSubmit} disabled={!selectedRating || actionLoading} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 32px',
                  background: selectedRating && !actionLoading ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#cbd5e1',
                  color: '#fff', border: 'none', borderRadius: 'var(--r-lg)',
                  cursor: selectedRating ? 'pointer' : 'not-allowed',
                  fontSize: '.875rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s', boxShadow: selectedRating ? '0 2px 8px rgba(22,163,74,0.3)' : 'none',
                }}>
                  {actionLoading ? '…' : <><i className="bi bi-check-lg" />Submit & Continue</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── YouTube Videos Section ── */}
      {topic && (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <i className="bi bi-youtube" style={{ color: '#ff0000', fontSize: '1.3rem' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--text)' }}>
                YouTube Videos · {topic.title}
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>5 live results · style scores shown</div>
            </div>
            {ytVideos.length > 0 && (
              <span style={{ marginLeft: 'auto', background: '#ff0000', color: '#fff', fontSize: '.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}>
                <i className="bi bi-youtube" /> LIVE
              </span>
            )}
          </div>

          {ytError && (
            <div className="pl-alert danger" style={{ marginBottom: 12 }}>
              <i className="bi bi-exclamation-circle-fill" />
              <span>{ytError}{ytError.includes('API key') && ' — Add VITE_YOUTUBE_API_KEY to .env'}</span>
            </div>
          )}

          {ytLoading && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #fca5a5', borderTopColor: '#ff0000', borderRadius: '50%', animation: 'plSpin 0.8s linear infinite', margin: '0 auto 10px' }} />
              <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Fetching YouTube videos…</div>
            </div>
          )}

          {!ytLoading && !ytError && ytVideos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {ytVideos.map(v => (
                <YTMiniCard key={v.id} video={v} preferredStyle={preferredStyle} onEmbed={setEmbedVideo} />
              ))}
            </div>
          )}

          {!ytLoading && !ytError && ytVideos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '.85rem' }}>
              No YouTube videos found for this topic.
            </div>
          )}
        </div>
      )}

      {/* Embed modal */}
      {embedVideo && <EmbedModal video={embedVideo} onClose={() => setEmbedVideo(null)} />}
    </div>
  );
}

/* ─── Embed Modal ─────────────────────────────────────────────── */
function EmbedModal({ video, onClose }) {
  if (!video) return null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 860, background: '#000', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'linear-gradient(135deg, var(--primary), #7c3aed)' }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-play-circle-fill" />
            {video.title.length > 60 ? video.title.slice(0, 60) + '…' : video.title}
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: 'var(--r-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            src={`${video.embedUrl}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
