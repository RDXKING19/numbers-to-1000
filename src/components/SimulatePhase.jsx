import { useState, useCallback, useEffect, useRef } from 'react';
import { narrate, stopNarration, sounds } from '../utils/audio';
import { celebrate } from '../utils/audio';
import {
  simulateStation1Intro, simulateStation2Intro,
  simulateStation3Intro, simulateStation4Intro,
  simulatePhaseComplete,
} from '../utils/narration';
import BaseTenDisplay from './BaseTenBlocks';

// ── Station A: Block Builder ───────────────────────────────────────────────────
function StationBlockBuilder({ audioEnabled, onComplete }) {
  const [H, setH] = useState(0);
  const [T, setT] = useState(0);
  const [O, setO] = useState(0);
  const [round,    setRound]    = useState(0);
  const [feedback, setFeedback] = useState(null);
  const narRef = useRef(null);

  const challenges = [
    { v: 123, l: 'One hundred and twenty-three' },
    { v: 342, l: 'Three hundred and forty-two' },
    { v: 506, l: 'Five hundred and six' },
    { v: 780, l: 'Seven hundred and eighty' },
    { v: 999, l: 'Nine hundred and ninety-nine' },
  ];
  const ch    = challenges[round % challenges.length];
  const total = H * 100 + T * 10 + O;

  useEffect(() => {
    setH(0); setT(0); setO(0); setFeedback(null);
    if (audioEnabled) {
      narRef.current?.cancel();
      narRef.current = narrate(simulateStation1Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [round, audioEnabled]);

  const check = () => {
    if (total === ch.v) {
      sounds.correct();
      setFeedback('correct');
      narRef.current?.cancel();
      if (audioEnabled) narRef.current = narrate([celebrate('Brilliant! That\'s correct!')], true);
      setTimeout(() => {
        if (round + 1 >= challenges.length) onComplete();
        else setRound(r => r + 1);
      }, 1500);
    } else {
      sounds.wrong();
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const zones = [
    { key: 'H', label: 'Hundreds', val: H, set: setH, color: 'var(--pv-hundreds)', border: 'var(--pv-hundreds-border)' },
    { key: 'T', label: 'Tens',     val: T, set: setT, color: 'var(--pv-tens)',     border: 'var(--pv-tens-border)' },
    { key: 'O', label: 'Ones',     val: O, set: setO, color: 'var(--pv-ones)',     border: 'var(--pv-ones-border)' },
  ];

  return (
    <div className="block-workspace">
      <div className="challenge-target">
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 3 }}>Build this number:</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--gold)' }}>{ch.v}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{ch.l}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{round + 1} / {challenges.length}</div>
      </div>

      <div className="block-zones">
        {zones.map(z => (
          <div key={z.key} className="block-zone" style={{ borderColor: z.border, background: `${z.color}20` }}>
            <div className="block-zone-label" style={{ color: z.color }}>{z.label}</div>
            <div className="block-zone-count" style={{ color: 'white' }}>{z.val}</div>
            <div className="block-zone-controls">
              <button className="block-ctrl" onClick={() => z.set(v => Math.max(0, v - 1))} disabled={z.val === 0}>−</button>
              <button className="block-ctrl" onClick={() => z.set(v => Math.min(9, v + 1))} disabled={z.val === 9}>+</button>
            </div>
          </div>
        ))}
      </div>

      {(H > 0 || T > 0 || O > 0) && <BaseTenDisplay hundreds={H} tens={T} ones={O} />}

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Your number:</div>
        <div
          className="block-total"
          style={{ animation: feedback ? `${feedback === 'correct' ? 'bounceIn' : 'shake'} 0.4s ease` : 'none' }}
        >
          {total || '—'}
        </div>
      </div>

      <button className="btn btn-primary" onClick={check} disabled={total === 0}>✓ Check!</button>
      {feedback === 'wrong' && (
        <p style={{ color: 'var(--coral)', fontSize: '0.88rem' }}>Not quite! Try again 💪</p>
      )}
    </div>
  );
}

// ── Station B: Place Value Chart ───────────────────────────────────────────────
function StationPVChart({ audioEnabled, onComplete }) {
  const challenges = [573, 248, 906, 134, 700];
  const [ci,       setCi]       = useState(0);
  const [hV,       setHV]       = useState('');
  const [tV,       setTV]       = useState('');
  const [oV,       setOV]       = useState('');
  const [feedback, setFeedback] = useState(null);
  const narRef = useRef(null);

  const cur = challenges[ci];
  const cH  = Math.floor(cur / 100);
  const cT  = Math.floor((cur % 100) / 10);
  const cO  = cur % 10;

  useEffect(() => {
    setHV(''); setTV(''); setOV(''); setFeedback(null);
    if (audioEnabled) {
      narRef.current?.cancel();
      narRef.current = narrate(simulateStation2Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [ci, audioEnabled]);

  const check = () => {
    if (parseInt(hV) === cH && parseInt(tV) === cT && parseInt(oV) === cO) {
      sounds.correct(); setFeedback('correct');
      narRef.current?.cancel();
      if (audioEnabled) narRef.current = narrate([celebrate('Perfect placement!')], true);
      setTimeout(() => { if (ci + 1 >= challenges.length) onComplete(); else setCi(c => c + 1); }, 1400);
    } else {
      sounds.wrong(); setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const cols = [
    { key: 'H', label: 'Hundreds', val: hV, set: setHV, color: '#4A90D9', border: '#2E6DB4' },
    { key: 'T', label: 'Tens',     val: tV, set: setTV, color: '#FF8A50', border: '#E65C00' },
    { key: 'O', label: 'Ones',     val: oV, set: setOV, color: '#4CAF50', border: '#388E3C' },
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="challenge-target" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 3 }}>Place each digit in the chart:</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--gold)' }}>{cur}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{ci + 1} / {challenges.length}</div>
      </div>

      <div className="pvc-chart">
        {cols.map(c => (
          <div key={c.key} className="pvc-col" style={{ borderColor: c.border, background: `${c.color}20` }}>
            <div className="pvc-col-label" style={{ color: c.color }}>{c.label}</div>
            <input
              type="number" min={0} max={9}
              className="pvc-digit-input"
              value={c.val}
              onChange={e => c.set(e.target.value)}
              placeholder="?"
              style={{ borderColor: c.border, color: c.color }}
            />
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={check} style={{ marginTop: 16 }}>✓ Check Placement</button>
      {feedback === 'correct' && <p style={{ color: 'var(--green)',  marginTop: 8 }}>✅ Correct! Great work!</p>}
      {feedback === 'wrong'   && <p style={{ color: 'var(--coral)', marginTop: 8 }}>Check each column carefully!</p>}
    </div>
  );
}

// ── Station C: Number Line ─────────────────────────────────────────────────────
function StationNumberLine({ audioEnabled, onComplete }) {
  const challenges = [
    { t: 250, mn: 200, mx: 300 },
    { t: 470, mn: 400, mx: 500 },
    { t: 630, mn: 600, mx: 700 },
    { t: 850, mn: 800, mx: 900 },
    { t: 150, mn: 100, mx: 200 },
  ];
  const [ci,       setCi]       = useState(0);
  const [mPct,     setMPct]     = useState(50);
  const [feedback, setFeedback] = useState(null);
  const svgRef = useRef(null);
  const narRef = useRef(null);
  const cur    = challenges[ci];

  useEffect(() => {
    setMPct(50); setFeedback(null);
    if (audioEnabled) {
      narRef.current?.cancel();
      narRef.current = narrate(simulateStation3Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [ci, audioEnabled]);

  const vAtP = pct => Math.round(cur.mn + (pct / 100) * (cur.mx - cur.mn));
  const pAtV = v   => ((v - cur.mn) / (cur.mx - cur.mn)) * 100;
  const snapped = Math.round(vAtP(mPct) / 10) * 10;

  const handleSvgClick = e => {
    const rect = svgRef.current.getBoundingClientRect();
    const rx   = (e.clientX - rect.left - 32) / (rect.width - 64);
    const p    = Math.max(0, Math.min(100, rx * 100));
    setMPct(pAtV(Math.round(vAtP(p) / 10) * 10));
  };

  const check = () => {
    if (Math.abs(snapped - cur.t) <= 10) {
      sounds.correct(); setFeedback('correct');
      narRef.current?.cancel();
      if (audioEnabled) narRef.current = narrate([celebrate(`That's ${cur.t}! Brilliant!`)], true);
      setTimeout(() => { if (ci + 1 >= challenges.length) onComplete(); else setCi(c => c + 1); }, 1400);
    } else {
      sounds.wrong(); setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const ticks = [];
  for (let v = cur.mn; v <= cur.mx; v += 10) ticks.push(v);
  const mX = 32 + (mPct / 100) * 596;

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="challenge-target" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 3 }}>Place this number on the number line:</div>
        <div className="num-line-target">{cur.t}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ci + 1} / {challenges.length}</div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 8 }}>
        Click or tap the number line to place the marker ⭐
      </p>

      <div className="num-line-wrap">
        <svg
          ref={svgRef}
          viewBox="0 0 660 90"
          style={{ width: '100%', maxWidth: 640, cursor: 'pointer' }}
          onClick={handleSvgClick}
        >
          <line x1={32} y1={45} x2={628} y2={45} stroke="rgba(255,255,255,0.35)" strokeWidth={2.5} />
          {ticks.map((v, i) => {
            const x   = 32 + (i / (ticks.length - 1)) * 596;
            const maj = v % 50 === 0;
            return (
              <g key={v}>
                <line x1={x} y1={maj ? 34 : 40} x2={x} y2={52} stroke="rgba(255,255,255,0.42)" strokeWidth={maj ? 2 : 1} />
                {maj && (
                  <text x={x} y={68} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.65)" fontFamily="Fredoka">
                    {v}
                  </text>
                )}
              </g>
            );
          })}
          <g transform={`translate(${mX},45)`}>
            <polygon
              points="0,-18 -10,-36 10,-36"
              fill={feedback === 'correct' ? '#4CAF50' : feedback === 'wrong' ? '#ef5350' : '#ffc107'}
              stroke="white" strokeWidth={1.2}
            />
            <text y={-40} textAnchor="middle" fontSize={12} fill="white" fontFamily="Fredoka">{snapped}</text>
          </g>
        </svg>
      </div>

      <button className="btn btn-primary" onClick={check}>✓ Place it here!</button>
      {feedback === 'wrong' && (
        <p style={{ color: 'var(--coral)', marginTop: 8 }}>Try moving closer! Check the tick marks.</p>
      )}
    </div>
  );
}

// ── Station D: Counting Patterns ───────────────────────────────────────────────
function StationPatterns({ audioEnabled, onComplete }) {
  const challenges = [
    { seq: [100, 200, null, 400, 500], ans: 300, lbl: 'Count by 100s' },
    { seq: [455, 460, null, 470, 475], ans: 465, lbl: 'Count by 5s' },
    { seq: [920, 910, 900, null, 880], ans: 890, lbl: 'Count back by 10s' },
    { seq: [null, 360, 370, 380, 390], ans: 350, lbl: 'Count by 10s' },
    { seq: [801, 802, 803, null, 805], ans: 804, lbl: 'Count by 1s' },
    { seq: [150, 250, 350, null, 550], ans: 450, lbl: 'Count by 100s' },
  ];
  const [ci,       setCi]       = useState(0);
  const [inp,      setInp]      = useState('');
  const [feedback, setFeedback] = useState(null);
  const narRef = useRef(null);
  const cur    = challenges[ci];

  useEffect(() => {
    setInp(''); setFeedback(null);
    if (audioEnabled) {
      narRef.current?.cancel();
      narRef.current = narrate(simulateStation4Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [ci, audioEnabled]);

  const check = () => {
    if (parseInt(inp) === cur.ans) {
      sounds.correct(); setFeedback('correct');
      narRef.current?.cancel();
      if (audioEnabled) narRef.current = narrate([celebrate('You found the pattern!')], true);
      setTimeout(() => { if (ci + 1 >= challenges.length) onComplete(); else setCi(c => c + 1); }, 1400);
    } else {
      sounds.wrong(); setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="challenge-target" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 3 }}>Find the missing number:</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{ci + 1} / {challenges.length}</div>
      </div>

      <div className="pattern-seq">
        {cur.seq.map((v, i) =>
          v !== null
            ? (
              <div key={i} className="pattern-tile" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                {v}
              </div>
            )
            : (
              <input
                key={i}
                type="number"
                className="pattern-input"
                value={inp}
                onChange={e => setInp(e.target.value)}
                placeholder="?"
              />
            )
        )}
      </div>

      <div style={{ color: 'var(--gold-light)', fontSize: '0.82rem', marginBottom: 14 }}>
        💡 Rule: {cur.lbl}
      </div>

      <button className="btn btn-primary" onClick={check}>✓ Check Pattern</button>
      {feedback === 'correct' && <p style={{ color: 'var(--green)',  marginTop: 8 }}>✅ Correct! Great pattern spotting!</p>}
      {feedback === 'wrong'   && <p style={{ color: 'var(--coral)', marginTop: 8 }}>Look at the differences between numbers!</p>}
    </div>
  );
}

// ── Main SimulatePhase ─────────────────────────────────────────────────────────
const STATIONS = [
  { icon: '🧱', label: 'Block Builder',    sublabel: 'Concrete — build numbers' },
  { icon: '📊', label: 'Place Value Chart', sublabel: 'Pictorial — fill the chart' },
  { icon: '📏', label: 'Number Line',       sublabel: 'Pictorial–Abstract' },
  { icon: '🔢', label: 'Counting Patterns', sublabel: 'Abstract — find the pattern' },
];

export default function SimulatePhase({ onComplete, audioEnabled }) {
  const [station, setStation] = useState(0);
  const [done,    setDone]    = useState([false, false, false, false]);
  const narRef = useRef(null);

  const handleStationComplete = useCallback(() => {
    sounds.badge();
    setDone(d => {
      const next = [...d];
      next[station] = true;
      if (next.every(Boolean)) {
        narRef.current?.cancel();
        if (audioEnabled) narRef.current = narrate(simulatePhaseComplete(), true);
        setTimeout(() => onComplete(), 1800);
      } else {
        const nx = next.findIndex((v, i) => !v && i > station);
        if (nx >= 0) setStation(nx);
      }
      return next;
    });
  }, [station, audioEnabled, onComplete]);

  return (
    <div className="simulate-phase">
      <div className="simulate-header">
        <h2 className="simulate-label">🧪 Simulate — Explore Place Value</h2>
        <p className="simulate-sublabel">Complete all 4 stations to continue</p>
      </div>

      {/* Station tabs */}
      <div className="simulate-station-tabs">
        {STATIONS.map((s, i) => (
          <button
            key={i}
            className={`sim-tab ${i === station ? 'active' : ''} ${done[i] ? 'done' : ''}`}
            onClick={() => setStation(i)}
          >
            {s.icon} {s.label}{done[i] ? ' ✓' : ''}
          </button>
        ))}
      </div>

      {/* Station content */}
      <div className="sim-content">
        <div className="station-title">{STATIONS[station].icon} {STATIONS[station].label}</div>
        <div className="station-subtitle">{STATIONS[station].sublabel}</div>

        {station === 0 && <StationBlockBuilder audioEnabled={audioEnabled} onComplete={handleStationComplete} />}
        {station === 1 && <StationPVChart      audioEnabled={audioEnabled} onComplete={handleStationComplete} />}
        {station === 2 && <StationNumberLine   audioEnabled={audioEnabled} onComplete={handleStationComplete} />}
        {station === 3 && <StationPatterns     audioEnabled={audioEnabled} onComplete={handleStationComplete} />}
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        {STATIONS.map((_, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background:  done[i] ? 'var(--green)' : i === station ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
              boxShadow:   i === station ? '0 0 8px rgba(255,193,7,0.4)' : done[i] ? '0 0 6px rgba(76,175,80,0.4)' : 'none',
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}
