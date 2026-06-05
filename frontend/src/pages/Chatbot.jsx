import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatbotApi } from '../services/api';
import './Chatbot.css';

const STYLE_COLORS = {
  diagram: '#0ea5e9', analogy: '#f59e0b', example: '#10b981',
  theory: '#8b5cf6', logic: '#ef4444', balanced: '#6b21a8',
};

function Spinner({ size = 20, color = 'var(--primary)' }) {
  return (
    <span style={{
      width: size, height: size, border: `2px solid rgba(99,102,241,0.15)`,
      borderTopColor: color, borderRadius: '50%',
      display: 'inline-block', animation: 'plSpin 0.7s linear infinite', flexShrink: 0,
    }} />
  );
}

function formatReply(text) {
  return text
    .split('\n')
    .map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code style="background:var(--surface-2);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:.83em;color:var(--primary);">$1</code>');
      return (
        <p
          key={i}
          style={{ margin: line === '' ? '0.4rem 0' : '0.2rem 0', lineHeight: 1.65 }}
          dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }}
        />
      );
    });
}

export default function Chatbot() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatbotApi.getStatus()
      .then(data => {
        setStatus(data);
        if (data.is_pro) {
          const style = data.learner_label || 'balanced';
          setMessages([{
            id: Date.now(), role: 'bot',
            text: `Hi ${data.username}! 👋 I can see you're a **${style.charAt(0).toUpperCase() + style.slice(1)}-style** learner. Ask me anything — I'll explain it in a way that works best for you!`,
            ts: new Date(),
          }]);
        }
      })
      .catch(() => setStatus({ is_pro: false, pro_requested: false }))
      .finally(() => setStatusLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { id: Date.now(), role: 'user', text, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    const newHistory = [...history, { role: 'user', text }];

    try {
      const res = await chatbotApi.sendMessage(text, newHistory);
      const botMsg = { id: Date.now() + 1, role: 'bot', text: res.reply, ts: new Date() };
      setMessages(prev => [...prev, botMsg]);
      setHistory([...newHistory, { role: 'model', text: res.reply }]);
    } catch (err) {
      const errMsg = err?.data?.error || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: errMsg, isError: true, ts: new Date() }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const preferredStyle = status?.learner_label || user?.profile?.preferred_style || 'balanced';

  if (statusLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spinner size={42} />
      </div>
    );
  }

  // ── Not Pro: Gate Screen ──────────────────────────────────────────────────
  if (!status?.is_pro) {
    return (
      <div className="chatbot-gate">
        <div className="chatbot-gate-card">
          <span className="chatbot-gate-icon">🤖</span>
          <h1 className="chatbot-gate-title">AI Chatbot Tutor</h1>
          <p className="chatbot-gate-desc">
            {status?.pro_requested
              ? 'Your Pro upgrade request is pending admin approval. Hang tight! ⏳'
              : 'Upgrade to Pro to unlock your personal AI tutor that explains topics in your unique learning style.'}
          </p>
          <div className="chatbot-gate-actions">
            {status?.pro_requested ? (
              <div className="pl-alert warning" style={{ justifyContent: 'center', width: '100%' }}>
                <i className="bi bi-clock-fill"></i>
                <span>Request pending — admin will approve shortly.</span>
              </div>
            ) : (
              <Link to="/upgrade" className="btn-primary btn-lg">
                <i className="bi bi-rocket-takeoff-fill"></i>Upgrade to Pro
              </Link>
            )}
            <Link to="/dashboard" className="btn-ghost">← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Pro: Full Chat UI ─────────────────────────────────────────────────────
  return (
    <div className="chatbot-wrapper">

      {/* ── Header ── */}
      <div className="chatbot-header">
        <div className="chatbot-header-left">
          <div className="chatbot-avatar-wrap">
            <div className="chatbot-avatar">🤖</div>
            <div className="chatbot-avatar-ring"></div>
          </div>
          <div>
            <div className="chatbot-title">AI Chatbot Tutor</div>
            <div className="chatbot-status">
              <span className="chatbot-status-dot"></span>
              Online · Tuned for{' '}
              <span className={`style-chip chip-${preferredStyle}`} style={{ fontSize: '.62rem', padding: '2px 8px' }}>
                {preferredStyle.charAt(0).toUpperCase() + preferredStyle.slice(1)}
              </span>
              learners
            </div>
          </div>
        </div>

        <div className="chatbot-header-actions">
          <button
            onClick={() => {
              setMessages([{
                id: Date.now(), role: 'bot',
                text: `New session started! 🔄 Ask me anything, ${user?.first_name || 'friend'}!`,
                ts: new Date(),
              }]);
              setHistory([]);
            }}
            className="btn-secondary btn-sm"
            title="New conversation"
          >
            <i className="bi bi-arrow-counterclockwise"></i>New Chat
          </button>
          <Link to="/dashboard" className="btn-ghost btn-sm">
            <i className="bi bi-arrow-left"></i>Back
          </Link>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-msg-row${msg.role === 'user' ? ' user-row' : ''}`}
          >
            {/* Avatar */}
            <div className={`chat-msg-avatar ${msg.role === 'bot' ? 'bot-avatar' : 'user-avatar-msg'}`}>
              {msg.role === 'bot' ? '🤖' : (user?.first_name?.[0]?.toUpperCase() || 'U')}
            </div>

            {/* Bubble */}
            <div
              className={`chat-msg-bubble ${
                msg.role === 'user'
                  ? 'user-bubble'
                  : msg.isError
                  ? 'error-bubble'
                  : 'bot-bubble'
              }`}
            >
              {msg.role === 'user'
                ? <p style={{ margin: 0 }}>{msg.text}</p>
                : formatReply(msg.text)
              }
              <div className="chat-msg-time">
                {msg.ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="chat-typing-row">
            <div className="chat-msg-avatar bot-avatar">🤖</div>
            <div className="chat-typing-bubble">
              {[0, 0.2, 0.4].map((d, i) => (
                <span
                  key={i}
                  className="typing-dot"
                  style={{ animation: `typingDot 1.2s infinite ${d}s` }}
                ></span>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="chatbot-input-area">
        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="chatbot-quick-prompts">
            {[
              '📊 Explain recursion with a diagram',
              '🔗 Analogy for linked lists',
              '💻 Code example of sorting',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt.replace(/^[^\s]+ /, ''))}
                className="quick-prompt-btn"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="chatbot-input-row">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Ask anything, ${user?.first_name || 'friend'}… (Enter to send)`}
            rows={1}
            disabled={sending}
            className="chatbot-textarea"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className={`chatbot-send-btn ${input.trim() && !sending ? 'active' : 'inactive'}`}
            title="Send message"
          >
            {sending ? <Spinner size={18} color="white" /> : <i className="bi bi-send-fill"></i>}
          </button>
        </div>

        <div className="chatbot-footer-note">
          Powered by Google Gemini · Tuned for <strong>{preferredStyle}</strong> learning style
        </div>
      </div>

    </div>
  );
}
