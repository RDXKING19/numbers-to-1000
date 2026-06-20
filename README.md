# Numbers to 1000 — Intellia SG

> **Grade 2 Math · Singapore MOE Curriculum**
> Count, read, write and compare numbers up to 1,000 using hundreds, tens and ones.

---

## Overview

An interactive 5-phase educational app built with **React + Vite**, following the same architecture as the Numberbound reference project. It uses **ElevenLabs exclusively** for narration (no browser TTS fallback), and ships with a pre-generation pipeline so all known audio is served as zero-latency static `.mp3` files.

### Learning Phases

| # | Phase    | Description |
|---|----------|-------------|
| 1 | 🔍 Wonder   | Counter animation 0→1000, curiosity hook |
| 2 | 📖 Story    | 6-panel narrative — Oliver, Asha & Grandpa Ben's bead shop |
| 3 | 🧪 Simulate | 4 stations: Block Builder · Place Value Chart · Number Line · Counting Patterns |
| 4 | 🎮 Play     | 10 worlds × 10 questions = 100 challenges, XP + streak system |
| 5 | 📓 Reflect  | 3 consolidation questions, confidence rating, certificate |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and add your ElevenLabs API key
cp .env.local.example .env.local
# Edit .env.local and set VITE_ELEVENLABS_API_KEY

# 3. (Optional but recommended) Pre-generate all narration audio
node scripts/generate_audio.js

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Audio Pipeline

This project uses **ElevenLabs only** — there is no browser TTS fallback.

### Voice Profile
| Property | Value |
|----------|-------|
| Provider | ElevenLabs |
| Voice    | Alice — Clear, Engaging Educator |
| Voice ID | `Xb7hH8MSUJpSbSDYk0k2` |
| Model    | `eleven_multilingual_v2` |

### Speech Styles
| Style | Usage | ElevenLabs Settings |
|-------|-------|---------------------|
| `statement`    | Normal teaching | stability 0.20, style 0.50 |
| `question`     | Questions       | stability 0.20, style 0.55 |
| `encouragement`| Praise          | stability 0.16, style 0.65 |
| `emphasis`     | Key facts       | stability 0.16, style 0.60 |
| `thinking`     | Wonder moments  | stability 0.24, style 0.35 |
| `celebration`  | Correct answers | stability 0.12, style 0.75 |

### Pre-generation (recommended)

```bash
node scripts/generate_audio.js
```

Reads `VITE_ELEVENLABS_API_KEY` from `.env.local`, hits the ElevenLabs API for every phrase in `scripts/generate_audio.js`, saves `.mp3` files to `public/assets/audio/`, and writes `src/utils/audioMap.js`.

### Cleanup

```bash
node scripts/clean_audio.js
```

Removes any `.mp3` files in `public/assets/audio/` that are no longer referenced in `audioMap.js`.

### Dynamic generation (runtime fallback)

If a phrase isn't pre-generated and `VITE_ELEVENLABS_API_KEY` is present, the frontend calls the ElevenLabs API directly. On Vercel, it first tries the secure server-side proxy at `/api/elevenlabs`.

### Adding new narration

1. Add the phrase to `scripts/generate_audio.js` → `phrases` array.
2. Run `node scripts/generate_audio.js`.
3. Add the **exact same string** to the relevant function in `src/utils/narration.js`.
4. Use it in the UI component — the text displayed must exactly match the narrated text (1:1 parity rule).

---

## Project Structure

```
numbers-to-1000/
├── public/
│   └── assets/audio/          # Pre-generated .mp3 files
├── src/
│   ├── components/
│   │   ├── FloatingNumbers.jsx
│   │   ├── IntroScreen.jsx
│   │   ├── WonderPhase.jsx
│   │   ├── StoryPhase.jsx
│   │   ├── BaseTenBlocks.jsx
│   │   ├── SimulatePhase.jsx
│   │   ├── QuestionRenderer.jsx
│   │   ├── PlayPhase.jsx
│   │   └── ReflectPhase.jsx
│   ├── utils/
│   │   ├── audio.js            # ElevenLabs engine + tone sounds
│   │   ├── audioMap.js         # Auto-generated static asset map
│   │   ├── narration.js        # All narration scripts
│   │   └── questionBank.js     # 100-question generator (10 types)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── scripts/
│   ├── generate_audio.js       # Offline TTS pre-generation
│   └── clean_audio.js          # Remove orphaned audio files
├── api/
│   └── elevenlabs.js           # Vercel serverless proxy
├── index.html
├── vite.config.js
├── package.json
└── .env.local.example
```

---

## Question Types

| Type | Description |
|------|-------------|
| `block_read`     | Read a number from base-ten block visuals |
| `number_to_words`| Write a numeral in English words |
| `words_to_number`| Write the numeral for an English phrase |
| `place_value`    | Find the value of a specific digit |
| `compare`        | Compare two numbers with <, >, = |
| `order`          | Order three numbers smallest to largest |
| `pattern`        | Find the missing number in a sequence |
| `expanded_form`  | Add expanded notation to find the numeral |
| `decompose`      | Fill in hundreds / tens / ones |
| `word_problem`   | Singapore-context story problems |

---

## Deployment (Vercel)

All 39 narration lines are already pre-generated as static `.mp3` files in `public/assets/audio/`, and the 6 story illustrations are pre-optimised in `public/assets/images/story/`. **No API key is required for the app to work in production** — narration plays from the static files, and `/api/elevenlabs` is only used as a fallback if you later add new narration lines that haven't been pre-generated yet.

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
# follow the prompts, then for production:
vercel --prod
```

### Option B — Vercel Dashboard (Git-connected)

1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. In Vercel: **Add New Project** → import the repo.
3. Vercel auto-detects Vite (build command `npm run build`, output dir `dist`) — `vercel.json` in this project also pins this explicitly along with a SPA rewrite rule so client-side routing doesn't 404 on refresh.
4. Click **Deploy**.

### Environment variables (optional)

Only needed if you plan to add **new** narration lines after deploying and want them generated dynamically at runtime instead of via `npm run generate-audio` locally first:

| Variable | Where | Description |
|----------|-------|--------------|
| `ELEVENLABS_API_KEY`      | Vercel → Project → Settings → Environment Variables | Server-side key used by `/api/elevenlabs`. Never exposed to the browser. |
| `VITE_ELEVENLABS_API_KEY` | Same | Client-side fallback key, only used if the serverless function fails. Optional — omit this if you don't want any client-exposed key. |

### Pre-deploy checklist

- [x] All narration audio pre-generated → `public/assets/audio/*.mp3` (39 files, verified against `audioMap.js`)
- [x] Story illustrations optimised → `public/assets/images/story/*.webp` (+ `.jpg` fallback), ~110–135 KB each
- [x] `vercel.json` present with SPA rewrite + asset caching headers
- [x] No secrets committed (`.env.local` is git-ignored)
- [x] `npm run build` completes locally before pushing

### Verify the production build locally first

```bash
npm run build
npm run preview
```

Open the printed local URL and confirm: narration plays without lag, the mute button stops audio instantly, and all 6 story images load.

---

## Tech Stack

- **React 18** + **Vite 5**
- **ElevenLabs** text-to-speech (Alice, eleven_multilingual_v2) — pre-generated to static `.mp3`
- **Web Audio API** for tone sounds (correct/wrong/badge/streak chimes)
- **CSS custom properties** for theming (Fredoka + Nunito fonts)
- WebP illustrations with JPEG fallback via `<picture>`
- No external UI library dependencies

---

*Built by Intellia SG · Singapore MOE Grade 2 Mathematics*
