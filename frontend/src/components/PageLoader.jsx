import { useEffect, useState } from 'react';

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const shown = sessionStorage.getItem('pl_loader_shown');
    if (shown) {
      setVisible(false);
      return;
    }
    sessionStorage.setItem('pl_loader_shown', 'true');
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div id="page-loader" className={!visible ? 'pl-out' : ''}>
      <div className="pl-particles">
        {[
          { w: 10, l: '12%', dur: '5s', delay: '0s' },
          { w: 7,  l: '28%', dur: '4.5s', delay: '.8s' },
          { w: 12, l: '55%', dur: '6s', delay: '.3s' },
          { w: 8,  l: '70%', dur: '5.5s', delay: '1.1s' },
          { w: 6,  l: '85%', dur: '4s', delay: '.5s' },
          { w: 9,  l: '40%', dur: '5.2s', delay: '1.4s' },
        ].map((p, i) => (
          <div
            key={i}
            className="pl-p"
            style={{ width: p.w, height: p.w, left: p.l, '--dur': p.dur, '--delay': p.delay }}
          />
        ))}
      </div>
      <div className="pl-card">
        <div className="pl-logo-wrap">
          <div className="pl-logo-ring" />
          <div className="pl-logo-inner">🎓</div>
        </div>
        <div className="pl-brand">
          <div className="pl-brand-name">Persona<span>Learn</span></div>
          <div className="pl-brand-tag">AI-Powered Personalized Learning</div>
        </div>
        <div className="pl-bar-wrap"><div className="pl-bar" /></div>
        <div className="pl-caption">
          <div className="pl-caption-dot" />
          <div className="pl-caption-dot" />
          <div className="pl-caption-dot" />
          Preparing your learning experience
        </div>
      </div>
    </div>
  );
}
