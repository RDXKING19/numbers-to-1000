import { useState, useCallback, useEffect } from 'react';
import IntroScreen from './components/IntroScreen';
import WonderPhase from './components/WonderPhase';
import StoryPhase from './components/StoryPhase';
import SimulatePhase from './components/SimulatePhase';
import PlayPhase from './components/PlayPhase';
import ReflectPhase from './components/ReflectPhase';
import FloatingNumbers from './components/FloatingNumbers';
import { stopNarration, setMuted } from './utils/audio';

const PHASES = [
  { id: 'wonder',   label: 'Wonder',   icon: '🔍', num: '01' },
  { id: 'story',    label: 'Story',    icon: '📖', num: '02' },
  { id: 'simulate', label: 'Simulate', icon: '🧪', num: '03' },
  { id: 'play',     label: 'Play',     icon: '🎮', num: '04' },
  { id: 'reflect',  label: 'Reflect',  icon: '📓', num: '05' },
];

const STORAGE_KEY = 'intellia_numbers_to_1000_v1';

function saveProgress(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
  } catch (_) {}
}

export default function App() {
  const [phase, setPhase] = useState('intro');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [playStats, setPlayStats] = useState(null);

  // Keep the audio engine's global mute flag in sync with audioEnabled.
  // setMuted(true) immediately halts any in-flight/playing narration —
  // this is what makes the toggle button actually cut sound right away.
  useEffect(() => {
    setMuted(!audioEnabled);
  }, [audioEnabled]);

  const goHome = useCallback(() => {
    stopNarration();
    setPhase('intro');
  }, []);

  const handlePlayComplete = useCallback((stats) => {
    setPlayStats(stats);
    saveProgress({ phase: 'reflect', stats });
    setPhase('reflect');
  }, []);

  const handleRestart = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    setPlayStats(null);
    setPhase('intro');
  }, []);

  const handleToggleAudio = useCallback(() => {
    setAudioEnabled(a => !a);
  }, []);

  const currentPhaseIndex = PHASES.findIndex(p => p.id === phase);

  return (
    <>
      <FloatingNumbers />
      <div className="app-container">

        {/* Audio toggle */}
        <button
          onClick={handleToggleAudio}
          className="audio-toggle-btn"
          aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
          aria-pressed={!audioEnabled}
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>

        {/* Journey progress bar */}
        {phase !== 'intro' && (
          <div className="journey-bar">
            {PHASES.map((p, i) => (
              <div key={p.id} className={`journey-step ${p.id === phase ? 'active' : i < currentPhaseIndex ? 'completed' : ''}`}>
                <div className="journey-step-dot">
                  {i < currentPhaseIndex ? '✓' : p.num}
                </div>
                <span className="journey-step-label">{p.icon} {p.label}</span>
                {i < PHASES.length - 1 && (
                  <div className={`journey-connector ${i < currentPhaseIndex ? 'filled' : ''}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Home button */}
        {phase !== 'intro' && (
          <button className="home-btn" onClick={goHome} aria-label="Go home">
            🏠 Home
          </button>
        )}

        {/* Phase routing */}
        {phase === 'intro' && (
          <IntroScreen
            onStart={() => setPhase('wonder')}
            audioEnabled={audioEnabled}
            onToggleAudio={handleToggleAudio}
          />
        )}
        {phase === 'wonder' && (
          <WonderPhase onComplete={() => setPhase('story')} audioEnabled={audioEnabled} />
        )}
        {phase === 'story' && (
          <StoryPhase onComplete={() => setPhase('simulate')} audioEnabled={audioEnabled} />
        )}
        {phase === 'simulate' && (
          <SimulatePhase onComplete={() => setPhase('play')} audioEnabled={audioEnabled} />
        )}
        {phase === 'play' && (
          <PlayPhase onComplete={handlePlayComplete} audioEnabled={audioEnabled} />
        )}
        {phase === 'reflect' && (
          <ReflectPhase
            stats={playStats}
            onRestart={handleRestart}
            onGoHome={goHome}
            audioEnabled={audioEnabled}
          />
        )}
      </div>
    </>
  );
}
