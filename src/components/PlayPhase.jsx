import { useState, useCallback, useEffect, useRef } from 'react';
import { generateSessionQuestions, shuffleArray } from '../utils/questionBank';
import { narrate, stopNarration, sounds } from '../utils/audio';
import {
  playWorldIntro, playReadQuestion,
  playCorrectNarration, playWrongNarration,
  playWorldComplete,
} from '../utils/narration';
import QuestionRenderer from './QuestionRenderer';

const WORLDS = [
  { id: 0, name: 'Bead Bazaar',         icon: '🧶', color: '#ff6b6b' },
  { id: 1, name: 'Block Island',        icon: '🧱', color: '#ff9f43' },
  { id: 2, name: 'Hundreds Valley',     icon: '🌄', color: '#ffc107' },
  { id: 3, name: 'Pattern Plains',      icon: '🌾', color: '#26de81' },
  { id: 4, name: 'Digit Dunes',         icon: '🏜️', color: '#fd9644' },
  { id: 5, name: 'Number Rainforest',   icon: '🌿', color: '#20bf6b' },
  { id: 6, name: 'Sky Towers',          icon: '🏙️', color: '#4A90D9' },
  { id: 7, name: 'Crystal Caves',       icon: '💎', color: '#9c27b0' },
  { id: 8, name: 'The Giant Hundreds',  icon: '🔢', color: '#e91e63' },
  { id: 9, name: '1000 Summit',         icon: '🏔️', color: '#ffd700' },
];

function calcXP(attemptNum, hintsUsed, streak) {
  const base = attemptNum === 1 ? 10 : hintsUsed > 0 ? 5 : 7;
  return base + (streak >= 5 ? 5 : 0);
}

function calcStars(correct, total = 10) {
  if (correct >= 9) return 3;
  if (correct >= 7) return 2;
  if (correct >= 5) return 1;
  return 0;
}

export default function PlayPhase({ onComplete, audioEnabled }) {
  const [currentWorld,  setCurrentWorld]  = useState(-1);
  const [worldResults,  setWorldResults]  = useState({});
  const [qIndex,        setQIndex]        = useState(0);
  const [score,         setScore]         = useState(0);
  const [totalXP,       setTotalXP]       = useState(0);
  const [streak,        setStreak]        = useState(0);
  const [maxStreak,     setMaxStreak]     = useState(0);
  const [attemptCount,  setAttemptCount]  = useState(0);
  const [hintsUsed,     setHintsUsed]     = useState(0);
  const [showHint,      setShowHint]      = useState(false);
  const [feedback,      setFeedback]      = useState(null);   // { correct, xp, explanation, reveal }
  const [xpPopup,       setXpPopup]       = useState(null);
  const [worldComplete, setWorldComplete] = useState(false);
  const [worldQuestions,setWorldQuestions]= useState([]);
  const narrationRef = useRef(null);

  const q = worldQuestions[qIndex];

  // Read question aloud
  useEffect(() => {
    if (audioEnabled && q && !worldComplete && !feedback && currentWorld >= 0) {
      const timer = setTimeout(() => {
        narrationRef.current = narrate(playReadQuestion(q.questionText), true);
      }, 350);
      return () => { clearTimeout(timer); narrationRef.current?.cancel(); };
    }
  }, [qIndex, q, worldComplete, feedback, currentWorld, audioEnabled]);

  const startWorld = useCallback((worldId) => {
    const bank = generateSessionQuestions();
    const wqs  = shuffleArray(bank.filter(q => q.world === worldId)).slice(0, 10);
    setWorldQuestions(wqs);
    setCurrentWorld(worldId);
    setQIndex(0); setScore(0); setStreak(0); setMaxStreak(0);
    setAttemptCount(0); setHintsUsed(0); setShowHint(false);
    setWorldComplete(false); setFeedback(null);
    narrationRef.current?.cancel();
    if (audioEnabled) narrationRef.current = narrate(playWorldIntro(WORLDS[worldId].name), true);
  }, [audioEnabled]);

  const handleAnswer = useCallback((answer) => {
    if (feedback) return;
    narrationRef.current?.cancel();
    const isCorrect = String(answer).trim() === String(q.correctAnswer).trim();

    if (isCorrect) {
      const newStreak = streak + 1;
      const xp        = calcXP(attemptCount + 1, hintsUsed, newStreak);
      setScore(s => s + 1);
      setTotalXP(x => x + xp);
      setStreak(newStreak);
      setMaxStreak(m => Math.max(m, newStreak));
      setXpPopup(`+${xp} XP`);
      setTimeout(() => setXpPopup(null), 1500);
      sounds.correct();
      if (newStreak >= 5) sounds.streak();
      setFeedback({ correct: true, xp, explanation: q.explanation });
      if (audioEnabled) narrationRef.current = narrate(playCorrectNarration(newStreak), true);
    } else {
      if (attemptCount >= 2) {
        sounds.wrong();
        setFeedback({ correct: false, explanation: q.explanation, reveal: true });
        setStreak(0);
        if (audioEnabled) narrationRef.current = narrate([{ text: "That's okay! Now you know for next time! 💪", style: 'statement' }], true);
      } else {
        sounds.wrong();
        setAttemptCount(a => a + 1);
        setHintsUsed(h => h + 1);
        setShowHint(true);
        setStreak(0);
        if (audioEnabled) narrationRef.current = narrate(playWrongNarration(attemptCount + 1), true);
      }
    }
  }, [q, feedback, attemptCount, hintsUsed, streak, audioEnabled]);

  const handleContinue = useCallback(() => {
    const finalScore = score + (feedback?.correct ? 1 : 0);
    setFeedback(null); setShowHint(false); setAttemptCount(0); setHintsUsed(0);

    if (qIndex + 1 >= worldQuestions.length) {
      const stars = calcStars(finalScore, worldQuestions.length);
      sounds.badge();
      setWorldResults(r => ({ ...r, [currentWorld]: { score: finalScore, total: worldQuestions.length, stars } }));
      setWorldComplete(true);
      narrationRef.current?.cancel();
      if (audioEnabled) narrationRef.current = narrate(playWorldComplete(WORLDS[currentWorld].name, finalScore, worldQuestions.length), true);
    } else {
      setQIndex(i => i + 1);
    }
  }, [qIndex, score, feedback, worldQuestions.length, currentWorld, audioEnabled]);

  const backToMap = useCallback(() => {
    narrationRef.current?.cancel(); stopNarration();
    setCurrentWorld(-1); setWorldComplete(false); setFeedback(null);
  }, []);

  const handleAllComplete = useCallback(() => {
    narrationRef.current?.cancel(); stopNarration();
    const totalScore     = Object.values(worldResults).reduce((a, r) => a + r.score,  0);
    const totalAnswered  = Object.values(worldResults).reduce((a, r) => a + r.total,  0);
    onComplete({ score: totalScore, totalAnswered, xp: totalXP, maxStreak, worldResults, badges: [] });
  }, [worldResults, totalXP, maxStreak, onComplete]);

  const canUnlock  = (wid) => wid === 0 || (worldResults[wid - 1]?.score || 0) >= 5;
  const allDone    = Object.keys(worldResults).length >= 10;

  // ── WORLD MAP ──────────────────────────────────────────────────────────────
  if (currentWorld === -1) {
    return (
      <div className="play-phase">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600 }}>🎮 IntelliPlay™</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            10 Worlds · 100 Questions · Unlock them all!
          </p>
          <div style={{
            marginTop: 7, padding: '5px 14px', borderRadius: 'var(--radius-full)',
            background: 'rgba(255,193,7,0.14)', border: '1px solid rgba(255,193,7,0.28)',
            display: 'inline-block', fontWeight: 700, color: 'var(--gold)',
          }}>
            ⚡ {totalXP} XP
          </div>
        </div>

        <div className="world-map">
          {WORLDS.map((w, i) => {
            const res    = worldResults[i];
            const locked = !canUnlock(i);
            return (
              <div
                key={i}
                className={`world-card ${locked ? 'locked' : 'unlocked'} ${res ? 'completed' : ''}`}
                style={{ borderColor: res ? 'var(--green)' : 'rgba(255,255,255,0.1)' }}
                onClick={() => !locked && startWorld(i)}
              >
                <div className="world-icon" style={{ background: `${w.color}22` }}>{w.icon}</div>
                <div className="world-info">
                  <div className="world-name">{w.name}</div>
                  <div className="world-desc">World {i + 1}</div>
                  {res && (
                    <div className="world-stars">
                      {Array.from({ length: 3 }, (_, si) => (
                        <span key={si} style={{ color: si < res.stars ? '#ffc107' : 'rgba(255,255,255,0.2)' }}>
                          {si < res.stars ? '⭐' : '☆'}
                        </span>
                      ))}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginLeft: 4 }}>
                        {res.score}/{res.total}
                      </span>
                    </div>
                  )}
                </div>
                {locked
                  ? <span style={{ fontSize: '1.1rem', opacity: 0.45 }}>🔒</span>
                  : res
                    ? <span style={{ color: 'var(--green)', fontSize: '1.1rem' }}>✓</span>
                    : <span style={{ color: w.color, fontSize: '0.78rem', fontWeight: 700 }}>→</span>
                }
              </div>
            );
          })}
        </div>

        {allDone && (
          <button className="btn btn-green" style={{ marginTop: 24 }} onClick={handleAllComplete}>
            🎉 Complete the Journey!
          </button>
        )}
      </div>
    );
  }

  // ── WORLD COMPLETE ─────────────────────────────────────────────────────────
  if (worldComplete) {
    const res   = worldResults[currentWorld];
    const stars = res?.stars || 0;
    return (
      <div className="play-phase">
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: 520 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--gold)', marginBottom: 8 }}>
            {WORLDS[currentWorld].name} Complete!
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', fontSize: '2.2rem', margin: '14px 0' }}>
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} style={{ opacity: i < stars ? 1 : 0.18, animation: i < stars ? `starPop 0.4s ease ${i * 0.14}s both` : 'none' }}>
                ⭐
              </span>
            ))}
          </div>
          <div className="score-circle">
            <div className="score-number">{res?.score ?? score}</div>
            <div className="score-label">/ {worldQuestions.length}</div>
          </div>
          <div className="progress-bar-container" style={{ margin: '14px 0' }}>
            <div className="progress-bar-label">
              <span>Score</span>
              <span>{Math.round(((res?.score ?? score) / worldQuestions.length) * 100)}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${((res?.score ?? score) / worldQuestions.length) * 100}%` }} />
            </div>
          </div>
          {(res?.score ?? score) < 5 && (
            <p style={{ color: 'var(--coral)', fontSize: '0.88rem', marginBottom: 10 }}>
              Score ≥ 5/10 to unlock the next world!
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-sm" onClick={backToMap}>← World Map</button>
            {currentWorld < 9 && canUnlock(currentWorld + 1) && (
              <button className="btn btn-primary btn-sm" onClick={() => startWorld(currentWorld + 1)}>
                Next World →
              </button>
            )}
            {allDone && (
              <button className="btn btn-green btn-sm" onClick={handleAllComplete}>🎉 Finish!</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── QUESTION VIEW ──────────────────────────────────────────────────────────
  return (
    <div className="play-phase">
      {xpPopup && <div className="xp-popup">{xpPopup}</div>}

      {/* HUD */}
      <div className="hud">
        <div className="hud-item">⚡ {totalXP} XP</div>
        <div className="hud-item">
          <span style={{ color: WORLDS[currentWorld].color }}>{WORLDS[currentWorld].icon}</span>
          {' '}{WORLDS[currentWorld].name}
        </div>
        <div className="hud-item">🔥 {streak}</div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-container" style={{ width: '100%', maxWidth: 700, marginBottom: 8 }}>
        <div className="progress-bar-label">
          <span style={{ fontSize: '0.8rem' }}>Q{qIndex + 1} of {worldQuestions.length}</span>
          <span style={{ fontSize: '0.8rem' }}>{score} correct</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${(qIndex / worldQuestions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="question-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>{q?.type?.replace(/_/g, ' ')}</span>
          <button
            className="btn btn-outline btn-sm"
            style={{ padding: '3px 10px', minWidth: 'auto', fontSize: '0.75rem' }}
            onClick={backToMap}
          >
            ← Map
          </button>
        </div>

        {q && (
          <QuestionRenderer
            question={q}
            onAnswer={handleAnswer}
            hintsUsed={hintsUsed}
            showHint={showHint}
          />
        )}
      </div>

      {/* Feedback overlay */}
      {feedback && (
        <div className="feedback-overlay" onClick={handleContinue}>
          <div className={`feedback-content ${feedback.correct ? 'correct' : 'wrong'}`}>
            <div className="feedback-emoji">{feedback.correct ? '🎉' : '💪'}</div>
            <div className="feedback-message">
              {feedback.correct ? 'Correct!' : feedback.reveal ? 'The answer is:' : 'Try again!'}
            </div>
            {feedback.reveal && (
              <div className="feedback-sub"><strong>{q?.correctAnswer}</strong></div>
            )}
            {feedback.correct && (
              <div className="feedback-sub" style={{ fontSize: '0.82rem', marginTop: 5 }}>
                {feedback.explanation}
              </div>
            )}
            <div className="feedback-sub" style={{ marginTop: 8, fontSize: '0.78rem', opacity: 0.65 }}>
              Tap to continue
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
