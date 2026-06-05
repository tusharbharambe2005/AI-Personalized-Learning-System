import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { learningApi } from '../services/api';

const styleShowcase = [
  { icon: '📊', style: 'diagram', label: 'Diagram-Based Explanation', desc: 'Visual flow, charts, and structure', align: 'left' },
  { icon: '💡', style: 'analogy', label: 'Analogy-Based Explanation', desc: 'Real-world comparisons and parallels', align: 'right' },
  { icon: '💻', style: 'example', label: 'Example-Based Explanation', desc: 'Code, problems, and step-by-step demos', align: 'left' },
  { icon: '📖', style: 'theory',  label: 'Theory-Based Explanation', desc: 'Formal definitions and structured text', align: 'right' },
  { icon: '⚙️', style: 'logic',   label: 'Logic-Based Explanation', desc: 'Step-by-step reasoning and proofs', align: 'left' },
];

const howItWorks = [
  { icon: 'bi-collection-fill', color: 'var(--primary)', bg: 'var(--primary-l)', title: 'Multiple Styles per Topic', desc: 'Every topic has Diagram, Analogy, Example, Theory & Logic explanations. Pick what clicks for you.' },
  { icon: 'bi-hand-thumbs-up-fill', color: 'var(--success)', bg: 'var(--success-l)', title: 'Select What Helped Most', desc: 'After reading, mark the version that was clearest. Rate 1–5 stars for a stronger signal.' },
  { icon: 'bi-graph-up-arrow', color: 'var(--accent)', bg: 'var(--accent-l)', title: 'Smart Recommendations', desc: 'The system scores every topic and video against your preference profile and surfaces best matches first.' },
];

function AnimCard({ delay = 0, children, style = {} }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      ...style
    }}>{children}</div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [counts, setCounts] = useState({ subjects: '...', topics: '...', explanations: '...' });
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    learningApi.getSubjects()
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        setSubjects(list);
        const totalTopics = list.reduce((a, s) => a + (s.topic_count || 0), 0);
        setCounts({
          subjects: list.length,
          topics: totalTopics,
          explanations: totalTopics * 5 + '+',
        });
      })
      .catch(() => setCounts({ subjects: '10+', topics: '200+', explanations: '1000+' }));
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="grid-2" style={{ gap: 48, alignItems: 'center' }}>
            <AnimCard delay={50}>
              <div className="hero-eyebrow">
                <i className="bi bi-stars"></i> Rule-Based Personalization
              </div>
              <h1 className="hero-title">
                Learn Every Topic<br />
                <span className="highlight">Your Way</span>
              </h1>
              <p className="hero-desc">
                Every topic. Multiple explanation styles. The system learns how you think
                and recommends content that actually clicks — diagrams, analogies, examples,
                theory, or logic.
              </p>
              <div className="hero-actions">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="btn-primary btn-lg">
                      <i className="bi bi-grid-1x2"></i>My Dashboard
                    </Link>
                    <Link to="/subjects" className="btn-secondary btn-lg">
                      <i className="bi bi-collection"></i>Browse Subjects
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary btn-lg">
                      <i className="bi bi-rocket-takeoff"></i>Start Learning Free
                    </Link>
                    <Link to="/login" className="btn-secondary btn-lg">Sign In</Link>
                  </>
                )}
              </div>
              <div className="hero-stats">
                {[
                  { val: counts.subjects, lbl: 'Subjects' },
                  { val: counts.topics, lbl: 'Topics' },
                  { val: counts.explanations, lbl: 'Explanations' },
                ].map((s, i) => (
                  <div key={i}>
                    <span className="hero-stat-val">{s.val}</span>
                    <span className="hero-stat-lbl">{s.lbl}</span>
                  </div>
                ))}
              </div>
            </AnimCard>

            {/* Style Cards Visual */}
            <AnimCard delay={200}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {styleShowcase.map((item, i) => (
                  <div
                    key={item.style}
                    className="home-style-card"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: 12, background: 'white', borderRadius: 12,
                      border: '1px solid var(--border)', maxWidth: 380,
                      boxShadow: 'var(--shadow-sm)',
                      marginLeft: item.align === 'right' ? 'auto' : 0,
                      opacity: 0, animation: `fadeSlideIn 0.5s ease ${300 + i * 100}ms forwards`,
                    }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 'var(--r-md)',
                      background: `var(--${item.style}-l)`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
                    }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.8125rem', fontWeight: 700, color: 'var(--text)' }}>{item.label}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    <span className={`style-chip chip-${item.style}`}>{item.style.charAt(0).toUpperCase() + item.style.slice(1)}</span>
                  </div>
                ))}
              </div>
            </AnimCard>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: 'var(--surface)', padding: '72px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <AnimCard delay={0}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="hero-eyebrow" style={{ display: 'inline-flex', marginBottom: 16 }}>
                <i className="bi bi-magic"></i> Simple Process
              </div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-.5px', marginBottom: 12 }}>How PersonaLearn Works</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '.9375rem', maxWidth: 480, margin: '0 auto' }}>
                Three simple steps to a fully personalized learning experience.
              </p>
            </div>
          </AnimCard>
          <div className="grid-3" style={{ gap: 24 }}>
            {howItWorks.map((f, i) => (
              <AnimCard key={i} delay={i * 120}>
                <div className="feature-card" style={{ height: '100%', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div className="feature-icon" style={{ background: f.bg, color: f.color, margin: 0, flexShrink: 0 }}>
                      <i className={`bi ${f.icon}`}></i>
                    </div>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--surface-2)', color: 'var(--text-muted)',
                      fontSize: '.875rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-sans)',
                    }}>{i + 1}</div>
                  </div>
                  <div className="feature-title">{f.title}</div>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </AnimCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBJECTS PREVIEW ── */}
      <section style={{ padding: '72px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <AnimCard delay={0}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-.3px', marginBottom: 6 }}>Available Subjects</h2>
                <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', margin: 0 }}>Start with any subject — your profile adapts as you learn.</p>
              </div>
              <Link to="/subjects" className="btn-ghost"><i className="bi bi-arrow-right"></i>View all</Link>
            </div>
          </AnimCard>

          {subjects.length > 0 ? (
            <div className="grid-3" style={{ gap: 24 }}>
              {subjects.slice(0, 6).map((subject, i) => (
                <AnimCard key={subject.id} delay={i * 80}>
                  <Link to={`/subjects/${subject.slug}`} className="subject-card" style={{ display: 'block' }}>
                    <div className="subject-icon" style={{ background: (subject.color || '#6b21a8') + '18' }}>
                      <i className={`bi ${subject.icon || 'bi-book'}`} style={{ color: subject.color || '#6b21a8', fontSize: '1.25rem' }}></i>
                    </div>
                    <div className="subject-name">{subject.name}</div>
                    <div className="subject-meta"><i className="bi bi-journals" style={{ marginRight: 4 }}></i>{subject.topic_count} topics</div>
                    <p className="subject-desc">{(subject.description || '').substring(0, 110)}{(subject.description || '').length > 110 ? '...' : ''}</p>
                    <div style={{ marginTop: 14 }}>
                      <span style={{ fontSize: '.8rem', fontWeight: 600, color: subject.color || '#6b21a8', background: (subject.color || '#6b21a8') + '12', padding: '4px 10px', borderRadius: 'var(--r-full)' }}>Explore →</span>
                    </div>
                  </Link>
                </AnimCard>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>📚</div>
              <p>Loading subjects from server…</p>
            </div>
          )}
        </div>
      </section>

      {/* ── AI CHATBOT SECTION ── */}
      <section style={{ padding: '72px 0', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 60%, #e0f2fe 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="grid-2" style={{ gap: 56, alignItems: 'center' }}>
            <AnimCard delay={0}>
              <div className="hero-eyebrow"><i className="bi bi-robot"></i> AI-Powered Tutor</div>
              <h2 style={{ fontSize: '2.125rem', fontWeight: 800, letterSpacing: '-.5px', lineHeight: 1.15, marginBottom: '1rem' }}>
                Your Personal AI<br />
                <span className="highlight">Chatbot Tutor</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '.9375rem', maxWidth: 480, lineHeight: 1.7, marginBottom: '1.75rem' }}>
                Ask anything. Get explanations tailored to <strong>your learning style</strong> — whether that's diagrams, analogies, code examples, or theory.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                {[
                  { icon: 'bi-lightning-fill', bg: 'var(--primary-l)', color: 'var(--primary)', text: 'Instant answers adapted to your style preference' },
                  { icon: 'bi-chat-dots-fill', bg: 'var(--success-l)', color: 'var(--success)', text: 'Ask follow-up questions in a natural conversation' },
                  { icon: 'bi-graph-up-arrow', bg: 'var(--accent-l)', color: 'var(--accent)', text: 'Linked to your profile — smarter with every session' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <span style={{ fontSize: '.9rem', color: 'var(--text)', fontWeight: 500 }}>{item.text}</span>
                  </div>
                ))}
              </div>
              {isAuthenticated ? (
                <Link to="/chatbot" className="btn-primary btn-lg">
                  <i className="bi bi-chat-dots-fill"></i>Open AI Tutor
                </Link>
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link to="/register" className="btn-primary btn-lg"><i className="bi bi-rocket-takeoff-fill"></i>Get Started Free</Link>
                  <Link to="/login" className="btn-secondary btn-lg">Sign In</Link>
                </div>
              )}
            </AnimCard>

            {/* Chat UI Preview */}
            <AnimCard delay={180}>
              <div style={{ background: 'white', borderRadius: 'var(--r-2xl)', boxShadow: '0 24px 64px rgba(79,70,229,0.12), 0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid var(--border)', maxWidth: 440, margin: '0 auto' }}>
                {/* Chat header */}
                <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🤖</div>
                  <div>
                    <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#fff' }}>AI Tutor</div>
                    <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 7, height: 7, background: '#4ade80', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                      Online — tuned to your style
                    </div>
                  </div>
                </div>

                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, background: '#f8fafc' }}>
                  <BotMsg text={<>Hi! I know you prefer <strong>visual learning</strong>. Shall I explain recursion with a diagram? 📊</>} />
                  <UserMsg text="Yes! And also give me a real-world analogy 💡" />
                  <BotMsg text={<>Sure! Think of recursion like <strong>Russian nesting dolls</strong> 🪆 — each doll contains a smaller version of itself...</>} />
                  <TypingDots />
                </div>

                <div style={{ padding: '14px 16px', background: 'white', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 'var(--r-full)', padding: '9px 16px', fontSize: '.8125rem', color: 'var(--text-light)' }}>Ask anything about your topic…</div>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', flexShrink: 0, cursor: 'pointer' }}>
                    <i className="bi bi-send-fill"></i>
                  </div>
                </div>
              </div>
            </AnimCard>
          </div>
        </div>
      </section>
    </>
  );
}

function BotMsg({ text }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', flexShrink: 0 }}>🤖</div>
      <div style={{ background: 'white', borderRadius: '14px 14px 14px 2px', padding: '10px 14px', fontSize: '.82rem', color: 'var(--text)', boxShadow: '0 1px 4px rgba(0,0,0,.06)', maxWidth: '80%', lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

function UserMsg({ text }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: 'row-reverse' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-l)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 700, flexShrink: 0 }}>U</div>
      <div style={{ background: 'var(--primary)', color: '#fff', borderRadius: '14px 14px 2px 14px', padding: '10px 14px', fontSize: '.82rem', maxWidth: '80%', lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', flexShrink: 0 }}>🤖</div>
      <div style={{ background: 'white', borderRadius: '14px 14px 14px 2px', padding: '12px 16px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, 0.2, 0.4].map((d, i) => (
          <span key={i} style={{ width: 7, height: 7, background: 'var(--primary)', borderRadius: '50%', display: 'inline-block', animation: `typingDot 1.2s infinite ${d}s` }}></span>
        ))}
      </div>
    </div>
  );
}
