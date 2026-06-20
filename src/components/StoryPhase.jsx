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
    image:      '1',
    imageAlt:   'Oliver and Asha walk into Grandpa Ben\'s colourful bead shop and greet him at the counter.',
  },
  {
    title:      "Hundreds!",
    text:       '"First, I put 100 beads into each big box," says Grandpa Ben. He places 3 boxes on the counter. "Three boxes means… three hundreds!"',
    highlight:  '"Three boxes = three hundreds!"',
    mascotText: 'Each box = 100! 📦',
    pv:         { H: 3, T: 0, O: 0 },
    image:      '2',
    imageAlt:   'Grandpa Ben shows Oliver and Asha three boxes, each filled with one hundred beads.',
  },
  {
    title:      "Tens!",
    text:       '"Next, leftover beads go into small bags of 10," says Grandpa Ben. He places 4 bags next to the boxes. "Four bags means… four tens!"',
    highlight:  '"Four bags = four tens!"',
    mascotText: 'Each bag = 10! 👜',
    pv:         { H: 3, T: 4, O: 0 },
    image:      '3',
    imageAlt:   'Grandpa Ben places four small bags of ten beads each next to the boxes of hundreds.',
  },
  {
    title:      "Ones!",
    text:       'Asha counts the loose beads: "One, two, three, four, five! Five ones!" Grandpa Ben nods: "So altogether we have three hundred and forty-five!"',
    highlight:  '"Three hundred and forty-five! = 345"',
    mascotText: 'Count the ones! 🔢',
    pv:         { H: 3, T: 4, O: 5 },
    image:      '4',
    imageAlt:   'Asha counts five loose beads on the counter, one by one.',
  },
  {
    title:      "The Magic of Place Value",
    text:       '"So every digit has a special place?" asks Oliver. "Exactly!" says Grandpa Ben. "The place tells you the value!" 3 → 300, 4 → 40, 5 → 5. Sum = 345.',
    highlight:  '"Place tells you the VALUE!"',
    mascotText: 'Place = value! 💡',
    pv:         { H: 3, T: 4, O: 5 },
    image:      '5',
    imageAlt:   'Grandpa Ben explains the place value chart to Oliver and Asha, showing how each digit has its own place.',
  },
  {
    title:      "Count to 1000!",
    text:       'Sparky appears: "Now you know the secret! Hundreds, Tens, and Ones — that is how we count all the way to ONE THOUSAND!" Oliver: "I can\'t wait to try it myself!"',
    highlight:  '"Hundreds + Tens + Ones = ONE THOUSAND! 🎉"',
    mascotText: "You've got this! 🚀",
    pv:         null,
    image:      '6',
    imageAlt:   'Sparky celebrates with Oliver and Asha, holding up a banner that says ONE THOUSAND.',
  },
];

const PV_COLS = [
  { key: 'H', label: 'H', bg: '#4A90D9', border: '#2E6DB4' },
  { key: 'T', label: 'T', bg: '#FF8A50', border: '#E65C00' },
  { key: 'O', label: 'O', bg: '#4CAF50', border: '#388E3C' },
];

export default function StoryPhase({ onComplete, audioEnabled }) {
  const [slide,     setSlide]     = useState(0);
  const [anim,      setAnim]      = useState(false);
  const [textVis,   setTextVis]   = useState(false);
  const [hlVis,     setHlVis]     = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
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

  // Preload next slide's image so the transition feels instant
  useEffect(() => {
    const next = STORY_SLIDES[slide + 1];
    if (next) {
      const img = new Image();
      img.src = `/assets/images/story/${next.image}.webp`;
    }
  }, [slide]);

  // Reset image-loaded flag whenever the slide changes
  useEffect(() => {
    setImgLoaded(false);
  }, [slide]);

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
        {/* Story illustration */}
        <div className="story-image-section">
          {!imgLoaded && (
            <div className="story-image-skeleton">
              <span className="story-image-skeleton-spinner" />
            </div>
          )}
          <picture>
            <source srcSet={`/assets/images/story/${s.image}.webp`} type="image/webp" />
            <img
              key={s.image}
              src={`/assets/images/story/${s.image}.jpg`}
              alt={s.imageAlt}
              className="story-image"
              style={{ opacity: imgLoaded ? 1 : 0 }}
              loading={slide === 0 ? 'eager' : 'lazy'}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
            />
          </picture>
          <div className="story-image-overlay" />
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
