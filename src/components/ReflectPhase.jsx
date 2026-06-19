import { useState, useCallback, useEffect, useRef } from 'react';
import { narrate, stopNarration, sounds } from '../utils/audio';
import {
  reflectIntroNarration, reflectCorrectNarration, reflectWrongNarration,
  reflectConfidenceNarration, reflectCertificateNarration,
} from '../utils/narration';

const REFLECT_QUESTIONS = [
  {
    q: 'What do we call the digit that tells us how many hundreds are in a number?',
    options: [
      { text: 'The hundreds digit', correct: true,  emoji: '✅' },
      { text: 'The ones digit',     correct: false, emoji: '❌' },
      { text: 'The tens digit',     correct: false, emoji: '❌' },
    ],
  },
  {
    q: 'What is the value of the digit 5 in the number 503?',
    options: [
      { text: '5',   correct: false, emoji: '❌' },
      { text: '50',  correct: false, emoji: '❌' },
      { text: '500', correct: true,  emoji: '✅' },
    ],
  },
  {
    q: 'How do we write 7 hundreds, 3 tens, and 2 ones as a number?',
    options: [
      { text: '237', correct: false, emoji: '❌' },
      { text: '732', correct: true,  emoji: '✅' },
      { text: '723', correct: false, emoji: '❌' },
    ],
  },
];

const CONFIDENCE_LEVELS = [
  { emoji: '😊', label: "I'm a numbers expert!",   color: '#4caf50' },
  { emoji: '🙂', label: 'I can count to 1000!',    color: '#ff9800' },
  { emoji: '😐', label: "I'm still practising",    color: '#42a5f5' },
];

export default function ReflectPhase({ stats, onRestart, onGoHome, audioEnabled }) {
  const [step,          setStep]          = useState(0);
  const [qIdx,          setQIdx]          = useState(0);
  const [answered,      setAnswered]      = useState(false);
  const [teachCorrect,  setTeachCorrect]  = useState(0);
  const [confidence,    setConfidence]    = useState(null);
  const [showConfetti,  setShowConfetti]  = useState(false);
  const [confettiPieces,setConfettiPieces]= useState([]);
  const narrationRef = useRef(null);

  const {
    score         = 0,
    totalAnswered = 0,
    xp            = 0,
    maxStreak     = 0,
    worldResults  = {},
    badges        = [],
  } = stats || {};

  const pct        = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
  const totalStars = Object.values(worldResults).reduce((a, r) => a + (r.stars || 0), 0);

  useEffect(() => {
    if (step === 0 && audioEnabled) {
      narrationRef.current = narrate(reflectIntroNarration(), true);
    }
    return () => { narrationRef.current?.cancel(); };
  }, [step, audioEnabled]);

  useEffect(() => {
    if (showConfetti) {
      setConfettiPieces(
        Array.from({ length: 40 }, (_, i) => ({
          id:       i,
          x:        Math.random() * 100,
          delay:    Math.random() * 2,
          color:    ['#ffc107','#e91e63','#4caf50','#2196f3','#ff5722','#9c27b0'][i % 6],
          size:     6 + Math.random() * 10,
          duration: 2 + Math.random() * 3,
        }))
      );
    }
  }, [showConfetti]);

  const handleAnswer = useCallback((option) => {
    if (answered) return;
    setAnswered(true);
    narrationRef.current?.cancel();

    if (option.correct) {
      setTeachCorrect(c => c + 1);
      sounds.correct();
      if (audioEnabled) narrationRef.current = narrate(reflectCorrectNarration(), true);
    } else {
      sounds.wrong();
      if (audioEnabled) narrationRef.current = narrate(reflectWrongNarration(), true);
    }

    setTimeout(() => {
      setAnswered(false);
      if (qIdx + 1 < REFLECT_QUESTIONS.length) {
        setQIdx(i => i + 1);
      } else {
        setStep(1);
        if (audioEnabled) narrationRef.current = narrate(reflectConfidenceNarration(), true);
      }
    }, 1100);
  }, [answered, qIdx, audioEnabled]);

  const handleConfidence = useCallback((idx) => {
    setConfidence(idx);
    sounds.badge();
    setShowConfetti(true);
    narrationRef.current?.cancel();
    if (audioEnabled) narrationRef.current = narrate(reflectCertificateNarration(pct), true);
    setTimeout(() => setStep(2), 700);
  }, [pct, audioEnabled]);

  return (
    <div className="reflect-phase">
      {/* Confetti */}
      {showConfetti && (
        <div className="confetti-container">
          {confettiPieces.map(p => (
            <div
              key={p.id}
              className="confetti-piece"
              style={{
                left:              `${p.x}%`,
                width:             p.size,
                height:            p.size,
                background:        p.color,
                animationDuration: `${p.duration}s`,
                animationDelay:    `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── STEP 0: Reflect questions ── */}
      {step === 0 && (
        <div className="reflect-card">
          <div className="reflect-title">📓 Time to Reflect!</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, textAlign: 'center', fontSize: '0.92rem' }}>
            Let's check what you learned about Numbers to 1000!
          </p>
          <div className="reflect-question">{REFLECT_QUESTIONS[qIdx].q}</div>
          <div className="reflect-options">
            {REFLECT_QUESTIONS[qIdx].options.map((o, i) => (
              <button
                key={i}
                className={`reflect-option ${answered ? (o.correct ? 'correct' : 'wrong') : ''}`}
                onClick={() => handleAnswer(o)}
                disabled={answered}
              >
                <span className="reflect-option-emoji">{o.emoji}</span>
                {o.text}
              </button>
            ))}
          </div>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 16 }}>
            {REFLECT_QUESTIONS.map((_, i) => (
              <div
                key={i}
                style={{
                  width:        9,
                  height:       9,
                  borderRadius: '50%',
                  background:   i < qIdx ? 'var(--green)' : i === qIdx ? 'var(--gold)' : 'rgba(255,255,255,0.18)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 1: Confidence check ── */}
      {step === 1 && (
        <div className="reflect-card">
          <div className="reflect-title">🤔 How do you feel?</div>
          <p className="reflect-question">
            How confident do you feel about numbers to 1000?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CONFIDENCE_LEVELS.map((c, i) => (
              <button
                key={i}
                className={`confidence-btn ${confidence === i ? 'selected' : ''}`}
                onClick={() => handleConfidence(i)}
              >
                <span style={{ fontSize: '2rem' }}>{c.emoji}</span>
                <span style={{ fontWeight: 600 }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Certificate ── */}
      {step === 2 && (
        <div className="cert-card">
          <div className="cert-badge">🌟</div>
          <h2 className="cert-title">Thousand Champion!</h2>
          <p className="cert-subtitle">
            You completed Numbers to 1000 — Singapore MOE Grade 2
          </p>

          <div className="cert-stats">
            {[
              { value: `${pct}%`,        label: 'Score',    color: 'var(--gold)' },
              { value: `${totalStars}⭐`, label: 'Stars',    color: 'var(--gold)' },
              { value: xp,               label: 'XP',       color: 'var(--gold)' },
            ].map(s => (
              <div key={s.label} className="cert-stat">
                <div className="cert-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="cert-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {badges.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', margin: '12px 0' }}>
              {badges.map(bid => (
                <div
                  key={bid}
                  style={{
                    padding:    '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255,193,7,0.15)',
                    border:     '1px solid rgba(255,193,7,0.3)',
                    fontSize:   '0.85rem',
                    fontWeight: 600,
                    color:      'var(--gold-light)',
                  }}
                >
                  {bid}
                </div>
              ))}
            </div>
          )}

          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: '16px 0' }}>
            🌟 You can count all the way to ONE THOUSAND! 🌟
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
            <button className="btn btn-outline btn-sm" onClick={onGoHome}>🏠 Home</button>
            <button className="btn btn-primary"        onClick={onRestart}>🔄 Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
