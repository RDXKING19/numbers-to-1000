import { useState, useEffect, useRef, useMemo } from 'react';
import { narrate, stopNarration } from '../utils/audio';
import { wonderNarration } from '../utils/narration';

export default function WonderPhase({ onComplete, audioEnabled }) {
  const [stage,   setStage]   = useState(0);
  const [counter, setCounter] = useState(0);
  const narrationRef = useRef(null);

  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id:    i,
      emoji: ['⭐','🌟','✨','💫','🔢'][i % 5],
      x:     Math.random() * 90,
      y:     Math.random() * 90,
      delay: Math.random() * 8,
      dur:   8 + Math.random() * 10,
      size:  1 + Math.random() * 1.4,
    })), []);

  // Animate counter 0 → 1000
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 400);
    const t2 = setTimeout(() => setStage(2), 1400);
    let c = 0;
    const iv = setInterval(() => {
      c += 40;
      setCounter(Math.min(c, 1000));
      if (c >= 1000) clearInterval(iv);
    }, 55);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(iv); };
  }, []);

  useEffect(() => {
    if (stage === 1 && audioEnabled) {
      narrationRef.current = narrate(wonderNarration(), true);
    }
    return () => { narrationRef.current?.cancel(); };
  }, [stage, audioEnabled]);

  const handleDiscover = () => {
    narrationRef.current?.cancel();
    stopNarration();
    setTimeout(() => onComplete(), 350);
  };

  return (
    <div className="wonder-phase">
      {/* Particle field */}
      <div className="wonder-particles">
        {particles.map(p => (
          <span
            key={p.id}
            className="wonder-particle"
            style={{
              left:              `${p.x}%`,
              top:               `${p.y}%`,
              fontSize:          `${p.size}rem`,
              animationDelay:    `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      <div className="wonder-content">
        {/* Animated question mark */}
        <div className={`wonder-qmark ${stage >= 1 ? 'revealed' : ''}`}>
          <span className="wonder-qmark-icon">?</span>
          <div className="wonder-qmark-glow" />
        </div>

        {/* Mascot */}
        <div className={`wonder-mascot ${stage >= 1 ? 'visible' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="mascot thinking">🤖</div>
            <div className="speech-bubble">Hmm… I wonder… 🤔</div>
          </div>
        </div>

        {/* Question card */}
        <div className={`wonder-question-card ${stage >= 1 ? 'visible' : ''}`}>
          <div
            className="wonder-counter"
            key={counter}
            style={{ animation: 'countUp 0.3s ease' }}
          >
            {counter}
          </div>
          <h2 className="wonder-question-text">
            Can you count all the way to ONE THOUSAND?
          </h2>
          <p className="wonder-subtext">
            Did you know there are <strong>one thousand</strong> stars in the
            night sky?<br />
            Today we're going to learn how to count all the way to 1000!
          </p>
        </div>

        {/* Discover button */}
        <button
          className={`btn btn-wonder ${stage >= 2 ? 'visible' : ''}`}
          onClick={handleDiscover}
          style={{ fontSize: '1.15rem', padding: '16px 40px' }}
        >
          <span style={{ animation: 'wobble 1.5s infinite' }}>✨</span>
          {' '}Let's Discover!{' '}
          <span style={{ animation: 'wobble 1.5s infinite' }}>✨</span>
        </button>
      </div>
    </div>
  );
}
