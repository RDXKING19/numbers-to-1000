// Reusable Base-Ten Block SVG components

function HundredsFlat() {
  return (
    <svg width={44} height={44} viewBox="0 0 44 44">
      <rect width={44} height={44} fill="#4A90D9" stroke="#2E6DB4" strokeWidth={2} rx={3} />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <line x1={4.4 * (i + 1)} y1={0}  x2={4.4 * (i + 1)} y2={44} stroke="#2E6DB4" strokeWidth={0.5} opacity={0.5} />
          <line x1={0}  y1={4.4 * (i + 1)} x2={44} y2={4.4 * (i + 1)} stroke="#2E6DB4" strokeWidth={0.5} opacity={0.5} />
        </g>
      ))}
    </svg>
  );
}

function TensRod() {
  return (
    <svg width={9} height={44} viewBox="0 0 9 44">
      <rect width={9} height={44} fill="#FF8A50" stroke="#E65C00" strokeWidth={1.5} rx={2} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={0} y1={4.4 * (i + 1)} x2={9} y2={4.4 * (i + 1)} stroke="#E65C00" strokeWidth={0.5} opacity={0.6} />
      ))}
    </svg>
  );
}

function OnesUnit() {
  return (
    <svg width={9} height={9} viewBox="0 0 9 9">
      <rect width={9} height={9} fill="#4CAF50" stroke="#388E3C" strokeWidth={1.5} rx={1.5} />
    </svg>
  );
}

export default function BaseTenDisplay({ hundreds, tens, ones }) {
  return (
    <div className="btblocks">
      {hundreds > 0 && (
        <div className="btgrp">
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 150 }}>
            {Array.from({ length: Math.min(hundreds, 9) }, (_, i) => (
              <HundredsFlat key={i} />
            ))}
          </div>
          <div className="btlbl" style={{ color: '#4A90D9' }}>
            {hundreds}×100
          </div>
        </div>
      )}

      {tens > 0 && (
        <div className="btgrp">
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
            {Array.from({ length: Math.min(tens, 9) }, (_, i) => (
              <TensRod key={i} />
            ))}
          </div>
          <div className="btlbl" style={{ color: '#FF8A50' }}>
            {tens}×10
          </div>
        </div>
      )}

      {ones > 0 && (
        <div className="btgrp">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, auto)', gap: 2 }}>
            {Array.from({ length: Math.min(ones, 9) }, (_, i) => (
              <OnesUnit key={i} />
            ))}
          </div>
          <div className="btlbl" style={{ color: '#4CAF50' }}>
            {ones}×1
          </div>
        </div>
      )}
    </div>
  );
}
