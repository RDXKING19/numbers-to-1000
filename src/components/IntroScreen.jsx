import { useEffect, useRef } from 'react';
import { narrate, stopNarration } from '../utils/audio';
import { introNarration } from '../utils/narration';

const JOURNEY_PHASES = [
  { icon: '🔍', label: 'Wonder',   desc: 'Count the stars!' },
  { icon: '📖', label: 'Story',    desc: "Grandpa Ben's beads" },
  { icon: '🧪', label: 'Simulate', desc: 'Build numbers' },
  { icon: '🎮', label: 'Play',     desc: '100 challenges' },
  { icon: '📓', label: 'Reflect',  desc: 'What did you learn?' },
];

export default function IntroScreen({ onStart, audioEnabled }) {
  const narrationRef = useRef(null);

  useEffect(() => {
    if (audioEnabled) {
      const timer = setTimeout(() => {
        narrationRef.current = narrate(introNarration(), true);
      }, 300);
      return () => {
        clearTimeout(timer);
        narrationRef.current?.cancel();
        stopNarration();
      };
    }
  }, [audioEnabled]);

  const handleStart = () => {
    narrationRef.current?.cancel();
    stopNarration();
    onStart();
  };

  return (
    <div className="intro-screen">
      {/* Curriculum badge */}
      <div className="intro-badge">✨ Intellia SG · Grade 2 Math</div>

      {/* Title */}
      <h1 className="intro-title">
        <span style={{ color: 'var(--gold)' }}>Numbers</span>{' '}to{' '}
        <span style={{ color: 'var(--coral)' }}>1000</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 4, fontFamily: 'var(--font-display)' }}>
        Lesson · Count, read, write &amp; compare up to 1,000
      </p>

      {/* Mascot */}
      <div className="mascot-container">
        <div className="mascot">🤖</div>
        <div className="speech-bubble">Let's count to 1000! 🌟</div>
      </div>

      {/* Description */}
      <p className="intro-desc">
        Learn to use{' '}
        <strong style={{ color: 'var(--gold)' }}>hundreds, tens, and ones</strong>{' '}
        to read, write, compare and count numbers up to 1000!
      </p>

      {/* Journey map */}
      <div className="intro-journey-map">
        <h3 className="intro-journey-title">Your Learning Journey</h3>
        <div className="intro-journey-steps">
          {JOURNEY_PHASES.map((p, i) => (
            <div key={i} className="intro-journey-step">
              <div className="intro-journey-icon">{p.icon}</div>
              <div className="intro-journey-info">
                <div className="intro-journey-label">{p.label}</div>
                <div className="intro-journey-desc">{p.desc}</div>
              </div>
              {i < JOURNEY_PHASES.length - 1 && (
                <div className="intro-journey-arrow">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        className="btn btn-primary btn-lg"
        style={{ marginTop: 8, animation: 'bounceIn 0.6s ease' }}
        onClick={handleStart}
      >
        🚀 Begin Your Journey!
      </button>

      {/* Feature cards */}
      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-card-icon">🎯</div>
          <div className="feature-card-label">100 Challenges</div>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">🔢</div>
          <div className="feature-card-label">Place Value</div>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">✨</div>
          <div className="feature-card-label">Badges &amp; XP</div>
        </div>
      </div>
    </div>
  );
}
