import { useState, useEffect } from 'react';
import BaseTenDisplay from './BaseTenBlocks';

// ── Place value digit tile ─────────────────────────────────────────────────────
function PVDigit({ digit, column, size = 56, animate = false }) {
  const cols = {
    hundreds: { bg: '#4A90D9', border: '#2E6DB4' },
    tens:     { bg: '#FF8A50', border: '#E65C00' },
    ones:     { bg: '#4CAF50', border: '#388E3C' },
  };
  const c = cols[column] || cols.ones;
  return (
    <div
      className="pv-digit-tile"
      style={{
        width:           size,
        height:          size,
        backgroundColor: c.bg,
        borderColor:     c.border,
        fontSize:        size * 0.55,
        color:           'white',
        animation:       animate ? 'bounceIn 0.3s ease' : 'none',
      }}
    >
      {digit}
    </div>
  );
}

// ── Question visual per type ───────────────────────────────────────────────────
function QuestionVisual({ question: q }) {
  if (q.visual === 'blocks') {
    return <BaseTenDisplay hundreds={q.hundreds} tens={q.tens} ones={q.ones} />;
  }

  if (q.visual === 'chart') {
    return (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '16px 0' }}>
        <PVDigit digit={q.hundreds} column="hundreds" size={54} animate />
        <PVDigit digit={q.tens}     column="tens"     size={54} animate />
        <PVDigit digit={q.ones}     column="ones"     size={54} animate />
      </div>
    );
  }

  if (q.visual === 'compare_pair') {
    return (
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center', margin: '16px 0' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--gold)' }}>
          {q.numA}
        </div>
        <div style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>&nbsp;___&nbsp;</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--gold)' }}>
          {q.numB}
        </div>
      </div>
    );
  }

  if (q.visual === 'pattern_sequence') {
    return (
      <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap', margin: '16px 0' }}>
        {q.sequence.map((v, i) => (
          <div
            key={i}
            className={`qptile ${v === null ? 'blank' : ''}`}
            style={{ color: v === null ? 'var(--gold)' : 'var(--text-primary)' }}
          >
            {v === null ? '?' : v}
          </div>
        ))}
      </div>
    );
  }

  if (q.visual === 'three_numbers') {
    return (
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', margin: '16px 0' }}>
        {q.nums.map((n, i) => (
          <div
            key={i}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.14)',
              fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700,
            }}
          >
            {n}
          </div>
        ))}
      </div>
    );
  }

  if (q.visual === 'word_problem') {
    return (
      <div className="wpcard">
        <span style={{ fontSize: '0.7rem', color: 'rgba(99,102,241,0.9)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          📖 Word Problem
        </span>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
          {q.questionText}
        </p>
      </div>
    );
  }

  return null;
}

// ── Hint box ───────────────────────────────────────────────────────────────────
function HintBox({ hintsUsed, hint1, hint2, explanation }) {
  const text = hintsUsed === 1 ? hint1 : hintsUsed === 2 ? hint2 : explanation;
  return (
    <div className="hint-box">
      <div className="hint-label">💡 Hint {hintsUsed}</div>
      <div className="hint-text-content">{text}</div>
    </div>
  );
}

// ── Main QuestionRenderer ──────────────────────────────────────────────────────
export default function QuestionRenderer({ question: q, onAnswer, hintsUsed, showHint }) {
  const [selected, setSelected] = useState(null);
  const [hH,       setHH]       = useState('');
  const [hT,       setHT]       = useState('');
  const [hO,       setHO]       = useState('');

  useEffect(() => {
    setSelected(null); setHH(''); setHT(''); setHO('');
  }, [q.id]);

  // HTO decompose input
  if (q.inputType === 'hto') {
    const handleSubmit = () => onAnswer(`${hH},${hT},${hO}`);
    return (
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.6, margin: '14px 0 20px', textAlign: 'center' }}>
          {q.questionText}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '14px 0' }}>
          {[['H', '#4A90D9', hH, setHH], ['T', '#FF8A50', hT, setHT], ['O', '#4CAF50', hO, setHO]].map(([l, c, v, sv]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: c, marginBottom: 3 }}>{l}</div>
              <input
                type="number" min={0} max={9}
                style={{
                  width: 56, height: 56, borderRadius: 12,
                  border: `2px solid ${c}`, background: `${c}22`,
                  color: 'white', fontFamily: 'Fredoka', fontSize: '1.8rem',
                  fontWeight: 700, textAlign: 'center', outline: 'none',
                  MozAppearance: 'textfield',
                }}
                value={v}
                onChange={e => sv(e.target.value)}
                placeholder="?"
              />
            </div>
          ))}
        </div>
        {showHint && <HintBox hintsUsed={hintsUsed} hint1={q.hint1} hint2={q.hint2} explanation={q.explanation} />}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <button className="btn btn-primary" onClick={handleSubmit}>✓ Check Answer</button>
        </div>
      </div>
    );
  }

  // Standard MCQ
  const handleSelect = opt => {
    if (selected) return;
    setSelected(opt);
    setTimeout(() => onAnswer(opt), 300);
  };

  return (
    <div>
      {q.visual !== 'word_problem' && (
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.6, margin: '14px 0 18px', textAlign: 'center' }}>
          {q.questionText}
        </div>
      )}

      <QuestionVisual question={q} />

      <div className="options-grid">
        {(q.options || []).map((opt, i) => (
          <button
            key={i}
            className={[
              'option-btn',
              selected === opt && opt === q.correctAnswer  ? 'correct'  : '',
              selected === opt && opt !== q.correctAnswer  ? 'wrong'    : '',
              selected                                      ? 'disabled' : '',
            ].join(' ')}
            onClick={() => !selected && handleSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      {showHint && <HintBox hintsUsed={hintsUsed} hint1={q.hint1} hint2={q.hint2} explanation={q.explanation} />}
    </div>
  );
}
