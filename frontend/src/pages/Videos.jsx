import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { learningApi } from '../services/api';
import { fetchYouTubeVideosCached } from '../services/youtube';

/* ─── Style score calculator (based on video title/description keywords) ─── */
const STYLE_KEYWORDS = {
  diagram:  ['diagram', 'visual', 'chart', 'graph', 'flowchart', 'draw', 'illustration', 'animation', 'visualize', 'picture', 'image'],
  analogy:  ['analogy', 'like', 'similar', 'compare', 'real world', 'everyday', 'simple explanation', 'easy', 'beginner', 'understand'],
  example:  ['example', 'code', 'demo', 'practice', 'hands-on', 'step by step', 'tutorial', 'implement', 'project', 'exercise', 'program'],
  theory:   ['theory', 'concept', 'definition', 'explain', 'introduction', 'overview', 'fundamentals', 'basics', 'principles', 'lecture'],
  logic:    ['logic', 'proof', 'algorithm', 'reasoning', 'analysis', 'math', 'formula', 'derive', 'solve', 'compute', 'systematic'],
};

// Hard-coded hex colors — reliable in inline styles (no CSS var dependency)
const STYLE_META = {
  diagram: { color: '#0ea5e9', bg: '#e0f2fe', emoji: '📊', label: 'Diagram'  },
  analogy: { color: '#f59e0b', bg: '#fef3c7', emoji: '💡', label: 'Analogy'  },
  example: { color: '#10b981', bg: '#d1fae5', emoji: '💻', label: 'Example'  },
  theory:  { color: '#8b5cf6', bg: '#ede9fe', emoji: '📖', label: 'Theory'   },
  logic:   { color: '#ef4444', bg: '#fee2e2', emoji: '⚙️', label: 'Logic'    },
};

function calcStyleScores(video) {
  const text = `${video.title} ${video.description || ''}`.toLowerCase();
  const raw = {};
  Object.entries(STYLE_KEYWORDS).forEach(([style, kws]) => {
    let hits = 0;
    kws.forEach(kw => { if (text.includes(kw)) hits++; });
    raw[style] = hits;
  });
  const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
  const pct = {};
  Object.keys(raw).forEach(s => {
    pct[s] = Math.round((raw[s] / total) * 100);
  });
  // Ensure they sum to 100 (give remainder to highest)
  const sum = Object.values(pct).reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    const top = Object.keys(pct).sort((a, b) => pct[b] - pct[a])[0];
    pct[top] += (100 - sum);
  }
  return pct;
}

/* ─── Style Scores Bar Component ─────────────────────────────── */
function StyleScores({ video, preferredStyle }) {
  const scores = calcStyleScores(video);
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{
      marginTop: 10,
      background: '#f8f7f4',
      borderRadius: 10,
      padding: '10px 12px',
      border: '1px solid #e6e2d6',
    }}>
      <div style={{
        fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '.5px', color: '#6366f1',
        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5,
      }}>
        ⚡ Style Match
      </div>
      {entries.map(([style, pct]) => {
        const m = STYLE_META[style];
        const isPreferred = style === preferredStyle;
        return (
          <div key={style} style={{ marginBottom: 5 }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 2,
            }}>
              <span style={{
                fontSize: '.7rem', fontWeight: isPreferred ? 700 : 500,
                color: isPreferred ? m.color : '#64748b',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {m.emoji} {m.label}
                {isPreferred && (
                  <span style={{
                    fontSize: '.58rem', background: m.color, color: '#fff',
                    padding: '1px 5px', borderRadius: 99, fontWeight: 800,
                  }}>YOU</span>
                )}
              </span>
              <span style={{
                fontSize: '.7rem', fontWeight: 700,
                color: isPreferred ? m.color : '#94a3b8',
              }}>
                {pct}%
              </span>
            </div>
            <div style={{
              height: isPreferred ? 7 : 4,
              background: '#e2e8f0',
              borderRadius: 99, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: m.color,
                borderRadius: 99, opacity: isPreferred ? 1 : 0.5,
                transition: 'width 0.9s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Spinner ─────────────────────────────────────────────────── */
function Spinner({ size = 36 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{
        width: size, height: size,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'plSpin 0.8s linear infinite',
      }} />
    </div>
  );
}

/* ─── YouTube Video Card ──────────────────────────────────────── */
function YTVideoCard({ video, index, onEmbed, preferredStyle }) {
  return (
    <div
      className="video-card anim-fade-up"
      style={{ display: 'flex', flexDirection: 'column', animationDelay: `${index * 70}ms` }}
    >
      {/* Thumbnail */}
      <div
        className="video-thumb"
        style={{ cursor: 'pointer' }}
        onClick={() => onEmbed(video)}
        title="Click to play"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          onError={e => { e.target.src = 'https://placehold.co/480x270/f1f5f9/94a3b8?text=Video'; }}
        />
        <div className="video-play">
          <div className="play-btn"><i className="bi bi-play-fill" /></div>
        </div>
        {video.duration && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.78)', color: '#fff',
            fontSize: '.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4,
          }}>
            {video.duration}
          </div>
        )}
        {index < 2 && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span style={{
              background: 'var(--primary)', color: 'white',
              fontSize: '.68rem', fontWeight: 700,
              padding: '3px 10px', borderRadius: 'var(--r-full)',
            }}>
              #{index + 1} Top Result
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="video-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="video-title" title={video.title}>
          {video.title.length > 70 ? video.title.slice(0, 70) + '…' : video.title}
        </div>
        <div className="video-meta" style={{ marginBottom: 8, gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="bi bi-youtube" style={{ color: '#ff0000' }} />
            {video.channelName}
          </span>
          {video.views && <span><i className="bi bi-eye" /> {video.views}</span>}
          {video.publishedAt && <span><i className="bi bi-clock" /> {video.publishedAt}</span>}
        </div>

        {/* ── Style Scores ── */}
        <StyleScores video={video} preferredStyle={preferredStyle} />

        {/* Buttons */}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button
            onClick={() => onEmbed(video)}
            className="btn-primary btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <i className="bi bi-play-fill" /> Play Here
          </button>
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary btn-sm"
            style={{ flexShrink: 0 }}
            title="Open on YouTube"
          >
            <i className="bi bi-box-arrow-up-right" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Embed Modal ─────────────────────────────────────────────── */
function EmbedModal({ video, onClose }) {
  if (!video) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 860, background: '#000',
          borderRadius: 'var(--r-xl)', overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'fadeSlideIn 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
        }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-play-circle-fill" />
            {video.title.length > 60 ? video.title.slice(0, 60) + '…' : video.title}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: 'white', width: 30, height: 30,
              borderRadius: 'var(--r-md)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.9rem', flexShrink: 0,
            }}
          >
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

/* ─── Search Dropdown ─────────────────────────────────────────── */
function TopicSearchDropdown({ allTopics, selectedTopic, onSelect }) {
  const [query, setQuery]       = useState('');
  const [open, setOpen]         = useState(false);
  const wrapRef                 = useRef(null);

  const filtered = query.trim()
    ? allTopics.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.subjectName.toLowerCase().includes(query.toLowerCase())
      )
    : allTopics;

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (topic) => {
    onSelect(topic);
    setQuery(topic.title);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', zIndex: 100 }}>
      <div style={{ position: 'relative' }}>
        <i className="bi bi-search" style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)', fontSize: '.85rem', pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search and select a topic…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="form-input"
          style={{ paddingLeft: 38, paddingRight: 36 }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); onSelect(null); setOpen(true); }}
            style={{
              position: 'absolute', right: 10, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '.8rem',
              display: 'flex', alignItems: 'center',
            }}
          >
            <i className="bi bi-x-circle-fill" />
          </button>
        )}
      </div>

      {/* Dropdown list */}
      {open && (
        <div style={{
        position: 'absolute', top: 'calc(100% + 6px)',
          left: 0, right: 0, zIndex: 9999,
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          maxHeight: 360, overflowY: 'auto',
          animation: 'fadeSlideIn 0.18s ease',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.8rem' }}>
              <i className="bi bi-search" style={{ marginRight: 6 }} />No topics match "{query}"
            </div>
          ) : (
            filtered.map(topic => {
              const isActive = selectedTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onMouseDown={() => handleSelect(topic)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '10px 16px', border: 'none',
                    borderBottom: '1px solid var(--border)',
                    background: isActive ? 'var(--primary-l)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    fontSize: '.84rem', fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--text)',
                    lineHeight: 1.3,
                  }}>
                    {isActive && <i className="bi bi-check2" style={{ marginRight: 6 }} />}
                    {topic.title}
                  </div>
                  <div style={{ fontSize: '.72rem', color: isActive ? 'var(--primary)' : 'var(--text-muted)', marginTop: 2 }}>
                    <i className="bi bi-book" style={{ marginRight: 4 }} />{topic.subjectName}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Videos Page ───────────────────────────────────────── */
export default function Videos() {
  const { user } = useAuth();

  const [subjects, setSubjects]           = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [videos, setVideos]               = useState([]);
  const [ytLoading, setYtLoading]         = useState(false);
  const [ytError, setYtError]             = useState('');
  const [subLoading, setSubLoading]       = useState(true);
  const [embedVideo, setEmbedVideo]       = useState(null);

  const preferredStyle = user?.profile?.preferred_style || 'diagram';

  // Load subjects then load each subject's topics individually
  useEffect(() => {
    learningApi.getSubjects()
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        // Load topics for each subject in parallel
        return Promise.all(
          list.map(sub => learningApi.getSubject(sub.slug)
            .then(fullSub => ({ ...sub, topics: fullSub.topics || [] }))
            .catch(() => ({ ...sub, topics: [] }))
          )
        );
      })
      .then(fullList => {
        setSubjects(fullList);
        // Auto-select first available topic
        const firstSub   = fullList.find(s => s.topics?.length > 0);
        const firstTopic = firstSub?.topics?.[0];
        if (firstTopic) setSelectedTopic({ ...firstTopic, subjectName: firstSub.name });
      })
      .catch(() => {})
      .finally(() => setSubLoading(false));
  }, []);

  // Fetch YouTube on topic change
  useEffect(() => {
    if (!selectedTopic) return;
    setYtLoading(true);
    setYtError('');
    setVideos([]);
    fetchYouTubeVideosCached(selectedTopic.title, 5)
      .then(vids => setVideos(vids))
      .catch(err  => setYtError(err.message || 'Failed to load YouTube videos.'))
      .finally(() => setYtLoading(false));
  }, [selectedTopic?.id]);

  const allTopics = subjects.flatMap(sub =>
    (sub.topics || []).map(t => ({ ...t, subjectName: sub.name }))
  );

  return (
    <div className="page-container">
      <EmbedModal video={embedVideo} onClose={() => setEmbedVideo(null)} />

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }} className="anim-fade-up">
        <div>
          <h1 className="page-title">
            <i className="bi bi-youtube" style={{ color: '#ff0000', marginRight: 10 }} />
            YouTube Videos
          </h1>
          <p className="page-subtitle">
            Live YouTube results · Topic-wise · 5 videos per topic · Style score analysis included
          </p>
        </div>
        <span className={`style-chip chip-${preferredStyle}`}>
          <i className="bi bi-star-fill" />
          {preferredStyle.charAt(0).toUpperCase() + preferredStyle.slice(1)} Style
        </span>
      </div>

      {/* ── Topic Search Bar (top, full width) ── */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: '18px 20px',
        marginBottom: 24, boxShadow: 'var(--shadow-sm)',
        position: 'relative', zIndex: 50,
        overflow: 'visible',
      }} className="anim-fade-up">
        <div style={{ fontSize: '.8125rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-collection" style={{ color: 'var(--primary)' }} />
          Select a Topic to Load YouTube Videos
          {subLoading && <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>Loading topics…</span>}
        </div>

        {subLoading ? (
          <div style={{ height: 42, background: 'var(--surface-2)', borderRadius: 'var(--r-lg)', animation: 'pulse 1.5s infinite' }} />
        ) : (
          <TopicSearchDropdown
            allTopics={allTopics}
            selectedTopic={selectedTopic}
            onSelect={setSelectedTopic}
          />
        )}

        {/* Selected topic badge */}
        {selectedTopic && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Now showing:</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--primary-l)', color: 'var(--primary)',
              border: '1px solid var(--primary-m)',
              borderRadius: 'var(--r-full)', padding: '3px 12px',
              fontSize: '.78rem', fontWeight: 700,
            }}>
              <i className="bi bi-collection-play-fill" />
              {selectedTopic.title}
              <span style={{ opacity: 0.6 }}>· {selectedTopic.subjectName}</span>
            </span>
            <span style={{
              background: '#ff0000', color: 'white',
              fontSize: '.65rem', fontWeight: 700,
              padding: '3px 9px', borderRadius: 'var(--r-full)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <i className="bi bi-youtube" /> LIVE
            </span>
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {ytError && (
        <div className="pl-alert danger" style={{ marginBottom: 20 }}>
          <i className="bi bi-exclamation-circle-fill" />
          <div>
            <strong>Error: </strong>{ytError}
            {ytError.includes('API key') && (
              <div style={{ marginTop: 8, fontSize: '.8rem' }}>
                👉 Add <code style={{ background: 'rgba(239,68,68,0.1)', padding: '1px 5px', borderRadius: 4 }}>VITE_YOUTUBE_API_KEY=your_key</code> to <code>.env</code> and restart dev server.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── YouTube Loading ── */}
      {ytLoading && (
        <div style={{ textAlign: 'center', padding: '56px 0' }}>
          <div style={{
            width: 52, height: 52,
            border: '3px solid var(--border)', borderTopColor: '#ff0000',
            borderRadius: '50%', animation: 'plSpin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>
            <i className="bi bi-youtube" style={{ color: '#ff0000', marginRight: 6 }} />
            Loading YouTube videos for <strong>{selectedTopic?.title}</strong>…
          </div>
        </div>
      )}

      {/* ── Video Grid ── */}
      {!ytLoading && !ytError && videos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 22 }}>
          {videos.map((video, i) => (
            <YTVideoCard
              key={video.id}
              video={video}
              index={i}
              onEmbed={setEmbedVideo}
              preferredStyle={preferredStyle}
            />
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!ytLoading && !ytError && videos.length === 0 && selectedTopic && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><i className="bi bi-camera-video" /></div>
            <div className="empty-title">No videos found</div>
            <p className="empty-desc">No YouTube results for "{selectedTopic.title}". Try another topic.</p>
          </div>
        </div>
      )}

      {/* ── No topic selected ── */}
      {!selectedTopic && !subLoading && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><i className="bi bi-collection" /></div>
            <div className="empty-title">Select a topic above</div>
            <p className="empty-desc">Use the search box to find and select a topic to load YouTube videos.</p>
          </div>
        </div>
      )}
    </div>
  );
}
