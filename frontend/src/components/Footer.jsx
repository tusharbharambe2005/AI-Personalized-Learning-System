import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">Persona<span>Learn</span></div>
            <div className="footer-copy">AI-inspired Personalized Learning · Rule-based engine</div>
          </div>
          <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
            React · Vite · Chart.js · Bootstrap Icons
          </span>
        </div>
      </footer>

      {/* Floating AI Chatbot Button (Pro only) */}
      {isAuthenticated && user?.profile?.is_pro && (
        <a
          href="/chatbot"
          title="Ask AI Tutor"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            width: 60, height: 60, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            background: 'var(--primary)', textDecoration: 'none',
          }}
        >
          🤖
        </a>
      )}
    </>
  );
}
