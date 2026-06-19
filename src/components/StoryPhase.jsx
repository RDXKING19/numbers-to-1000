import { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration, preloadNarration } from '../utils/audio';
import { getStoryNarration } from '../utils/narration';

const STORY_SLIDES = [
  {
    title:      "The Bead Shop",
    text:       "Oliver and Asha visited Grandpa Ben's bead shop after school. \"Grandpa Ben, how do you count all your beads?\" asks Oliver. Grandpa Ben smiles: \"I use a very clever trick! Let me show you.\"",
    highlight:  '"I use a very clever trick!"',
    mascotText: "Let's help count! 🧶",
    pv:         null,
  },
  {
    title:      "Hundreds!",
    text:       '"First, I put 100 beads into each big box," says Grandpa Ben. He places 3 boxes on the counter. "Three boxes means… three hundreds!"',
    highlight:  '"Three boxes = three hundreds!"',
    mascotText: 'Each box = 100! 📦',
    pv:         { H: 3, T: 0, O: 0 },
  },
  {
    title:      "Tens!",
    text:       '"Next, leftover beads go into small bags of 10," says Grandpa Ben. He places 4 bags next to the boxes. "Four bags means… four tens!"',
    highlight:  '"Four bags = four tens!"',
    mascotText: 'Each bag = 10! 👜',
    pv:         { H: 3, T: 4, O: 0 },
  },
  {
    title:      "Ones!",
    text:       'Asha counts the loose beads: "One, two, three, four, five! Five ones!" Grandpa Ben nods: "So altogether we have three hundred and forty-five!"',
    highlight:  '"Three hundred and forty-five! = 345"',
    mascotText: 'Count the ones! 🔢',
    pv:         { H: 3, T: 4, O: 5 },
  },
  {
    title:      "The Magic of Place Value",
    text:       '"So every digit has a special place?" asks Oliver. "Exactly!" says Grandpa Ben. "The place tells you the value!" 3 → 300, 4 → 40, 5 → 5. Sum = 345.',
    highlight:  '"Place tells you the VALUE!"',
    mascotText: 'Place = value! 💡',
    pv:         { H: 3, T: 4, O: 5 },
  },
  {
    title:      "Count to 1000!",
    text:       'Sparky appears: "Now you know the secret! Hundreds, Tens, and Ones — that is how we count all the way to ONE THOUSAND!" Oliver: "I can\'t wait to try it myself!"',
    highlight:  '"Hundreds + Tens + Ones = ONE THOUSAND! 🎉"',
    mascotText: "You've got this! 🚀",
    pv:         null,
  },
];

const PV_COLS = [
  { key: 'H', label: 'H', bg: '#4A90D9', border: '#2E6DB4' },
  { key: 'T', label: 'T', bg: '#FF8A50', border: '#E65C00' },
  { key: 'O', label: 'O', bg: '#4CAF50', border: '#388E3C' },
];

export default function StoryPhase({ onComplete, audioEnabled }) {
  const [slide,   setSlide]   = useState(0);
  const [anim,    setAnim]    = useState(false);
  const [textVis, setTextVis] = useState(false);
  const [hlVis,   setHlVis]   = useState(false);
  const narrationRef = useRef(null);

  const s      = STORY_SLIDES[slide];
  const isLast = slide === STORY_SLIDES.length - 1;
  const pct    = ((slide + 1) / STORY_SLIDES.length) * 100;

  // Preload current + next slide audio
  useEffect(() => {
    if (audioEnabled) {
      preloadNarration(getStoryNarration(slide));
      if (slide + 1 < STORY_SLIDES.length) preloadNarration(getStoryNarration(slide + 1));
    }
  }, [slide, audioEnabled]);

  // Stagger text/highlight reveal on slide change
  useEffect(() => {
    setTextVis(false); setHlVis(false);
    const t1 = setTimeout(() => setTextVis(true), 100);
    const t2 = setTimeout(() => setHlVis(true),   800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [slide]);

  // Narrate after text appears
  useEffect(() => {
    if (textVis && audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(getStoryNarration(slide), true);
    }
    return () => { narrationRef.current?.cancel(); };
  }, [textVis, slide, audioEnabled]);

  const goNext = useCallback(() => {
    if (anim) return;
    narrationRef.current?.cancel(); stopNarration();
    setAnim(true);
    setTimeout(() => { isLast ? onComplete() : setSlide(i => i + 1); setAnim(false); }, 400);
  }, [anim, isLast, onComplete]);

  const goPrev = useCallback(() => {
    if (anim || slide === 0) return;
    narrationRef.current?.cancel(); stopNarration();
    setAnim(true);
    setTimeout(() => { setSlide(i => i - 1); setAnim(false); }, 400);
  }, [anim, slide]);

  return (
    <div className="story-phase">
      {/* Progress bar */}
      <div className="story-progress">
        <div className="story-progress-bar">
          <div className="story-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="story-progress-label">{slide + 1} / {STORY_SLIDES.length}</span>
      </div>

      {/* Slide card */}
      <div className={`story-card ${anim ? 'flipping' : ''}`}>
        {/* Image placeholder */}
        <div className="story-image-section">
          <span style={{ fontSize: '3rem' }}>🖼️</span>
          <span style={{ fontSize: '0.82rem' }}>
            [Story Image {slide + 1}: {['Bead shop exterior','Boxes of 100 beads','Bags of 10 beads','Counting single beads','Place value chart','Sparky with 1000 banner'][slide]}]
          </span>
        </div>

        <div className="story-text-section">
          <h2 className="story-title">{s.title}</h2>

          <p className={`story-text ${textVis ? 'revealed' : ''}`}>{s.text}</p>

          <div className={`story-highlight ${hlVis ? 'visible' : ''}`}>
            <span>✨</span>
            <span className="story-highlight-text">{s.highlight}</span>
            <span>✨</span>
          </div>

          {/* Live place value chart */}
          {s.pv && (
            <div className="story-pv-chart">
              {PV_COLS.map(c => (
                <div
                  key={c.key}
                  className="story-pv-col"
                  style={{ background: `${c.bg}22`, borderColor: c.border }}
                >
                  <span className="story-pv-label" style={{ color: c.bg }}>{c.label}</span>
                  <span className="story-pv-digit" style={{ color: 'white' }}>{s.pv[c.key]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Mascot */}
          <div className="story-mascot">
            <div className="mascot" style={{ width: 50, height: 50, fontSize: '1.4rem' }}>🤖</div>
            <div className="speech-bubble" style={{ fontSize: '0.8rem', padding: '8px 14px', maxWidth: 200 }}>
              {s.mascotText}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="story-nav">
        <button
          className="btn btn-outline btn-sm"
          onClick={goPrev}
          disabled={slide === 0}
          style={{ opacity: slide === 0 ? 0.3 : 1 }}
        >
          ← Back
        </button>

        <div className="story-dots">
          {STORY_SLIDES.map((_, i) => (
            <div
              key={i}
              className={`story-dot ${i === slide ? 'active' : i < slide ? 'completed' : ''}`}
            />
          ))}
        </div>

        <button
          className={`btn ${isLast ? 'btn-green' : 'btn-primary'} btn-sm`}
          onClick={goNext}
        >
          {isLast ? "🚀 Let's Explore!" : 'Next →'}
        </button>
      </div>
    </div>
  );
}
