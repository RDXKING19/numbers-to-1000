// ─────────────────────────────────────────────────────
// ElevenLabs Audio Engine — Numbers to 1000
// Voice: Alice (Xb7hH8MSUJpSbSDYk0k2) · eleven_multilingual_v2
// No browser TTS fallback. Segment preloading for zero latency.
// ─────────────────────────────────────────────────────

let currentQueue = null;
let currentAudio  = null;
let playId        = 0;
const elevenLabsCache = new Map();

const ELEVENLABS_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
const ELEVENLABS_MODEL    = 'eleven_multilingual_v2';

// Load pre-generated audioMap if available (written by generate_audio.js)
let audioMap = {};
try {
  import('./audioMap.js').then(m => { audioMap = m.audioMap || {}; }).catch(() => {});
} catch (_) {}

// Map pedagogical speech styles to ElevenLabs voice settings
// Optimised for maximum humanisation on eleven_multilingual_v2
const getElevenLabsSettings = (style) => {
  switch (style) {
    case 'celebration':
      return { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true };
    case 'encouragement':
      return { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true };
    case 'question':
      return { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true };
    case 'emphasis':
      return { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true };
    case 'thinking':
      return { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true };
    default: // statement, instruction
      return { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true };
  }
};

// ─── Core: resolve audio URL ─────────────────────────
export async function getAudioUrl(text, style = 'statement') {
  // 1. Static pre-generated file (zero latency)
  if (audioMap[text]) return audioMap[text];

  const cacheKey = `${text}_${style}`;
  if (elevenLabsCache.has(cacheKey)) return elevenLabsCache.get(cacheKey);

  const fetchPromise = (async () => {
    // Try secure server-side proxy first (Vercel/serverless)
    let response = await fetch('/api/elevenlabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceId: ELEVENLABS_VOICE_ID,
        voiceSettings: getElevenLabsSettings(style),
      }),
    });

    const isHtmlFallback = (response.headers.get('content-type') || '').includes('text/html');

    // Fallback: call ElevenLabs directly with client-side key (dev/local)
    if ((!response.ok || isHtmlFallback) && import.meta.env.VITE_ELEVENLABS_API_KEY) {
      response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: ELEVENLABS_MODEL,
            voice_settings: getElevenLabsSettings(style),
          }),
        }
      );
    }

    if (!response.ok || isHtmlFallback) return null;

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  })();

  elevenLabsCache.set(cacheKey, fetchPromise);
  fetchPromise.catch(() => elevenLabsCache.delete(cacheKey));
  return fetchPromise;
}

// ─── Speak a single segment ──────────────────────────
export function speak(text, enabled = true, style = 'statement') {
  return new Promise(async (resolve) => {
    if (!enabled || !text) { resolve(); return; }
    playId++;
    const thisId = playId;
    try {
      const url = await getAudioUrl(text, style);
      if (thisId !== playId) { resolve(); return; }
      if (!url) { resolve(); return; }
      if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
      currentAudio = new Audio(url);
      currentAudio.onended = () => resolve();
      currentAudio.onerror = () => resolve();
      await currentAudio.play().catch(() => resolve());
    } catch { resolve(); }
  });
}

// ─── Narration segment constructors ──────────────────
export function seg(text, style = 'statement', pause = 0) {
  return { text, style, pause };
}
export const say       = (text, pause = 0) => seg(text, 'statement',    pause);
export const ask       = (text, pause = 0) => seg(text, 'question',     pause);
export const cheer     = (text, pause = 0) => seg(text, 'encouragement',pause);
export const emphasize = (text, pause = 0) => seg(text, 'emphasis',     pause);
export const think     = (text, pause = 0) => seg(text, 'thinking',     pause);
export const celebrate = (text, pause = 0) => seg(text, 'celebration',  pause);
export const instruct  = (text, pause = 0) => seg(text, 'instruction',  pause);
export const pause_seg = (ms  = 0)         => seg('',  'statement',     ms);

// ─── Preload audio for a narration sequence ──────────
export function preloadNarration(segments) {
  if (!segments) return;
  segments.forEach(s => {
    if (s.text && s.text.trim()) {
      getAudioUrl(s.text, s.style).catch(() => {});
    }
  });
}

// ─── Play a sequence of segments ─────────────────────
// Returns { cancel, promise }
export function narrate(segments, enabled = true) {
  const queueId = Symbol('narration');
  currentQueue = queueId;
  let cancelled = false;

  const cancel = () => {
    cancelled = true;
    if (currentQueue === queueId) currentQueue = null;
  };

  const promise = (async () => {
    if (!enabled || !segments?.length) return;
    for (let i = 0; i < segments.length; i++) {
      if (cancelled || currentQueue !== queueId) return;
      const s = segments[i];
      // Eagerly preload next segment to eliminate inter-sentence latency
      if (i + 1 < segments.length && segments[i + 1].text) {
        getAudioUrl(segments[i + 1].text, segments[i + 1].style).catch(() => {});
      }
      if (s.text && s.text.trim()) {
        await speak(s.text, true, s.style);
      }
      if (s.pause > 0 && !cancelled && currentQueue === queueId) {
        await new Promise(r => setTimeout(r, s.pause));
      }
    }
  })();

  return { cancel, promise };
}

// ─── Stop all active narration ────────────────────────
export function stopNarration() {
  playId++;
  currentQueue = null;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

// ─── Tone sounds (AudioContext) ───────────────────────
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
export function playTone(frequency, duration = 200) {
  try {
    const ctx = getCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (_) {}
}

export const sounds = {
  correct: () => {
    playTone(523, 150);
    setTimeout(() => playTone(659, 150), 150);
    setTimeout(() => playTone(784, 200), 300);
  },
  wrong:  () => playTone(220, 300),
  badge:  () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 200), i * 150)),
  click:  () => playTone(440, 80),
  streak: () => { playTone(880, 100); setTimeout(() => playTone(1100, 150), 100); },
};
