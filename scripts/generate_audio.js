// ─────────────────────────────────────────────────────────────────────────────
// Audio Pre-Generation Script — Numbers to 1000
// Usage:  node scripts/generate_audio.js
// Reads:  .env.local (VITE_ELEVENLABS_API_KEY)
// Writes: public/assets/audio/*.mp3
//         src/utils/audioMap.js
//
// Voice:  Alice  (Xb7hH8MSUJpSbSDYk0k2)
// Model:  eleven_multilingual_v2
// ─────────────────────────────────────────────────────────────────────────────

import fs       from 'fs';
import path     from 'path';
import dotenv   from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiKey    = process.env.VITE_ELEVENLABS_API_KEY;
const voiceId   = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
const audioDir  = path.join(__dirname, '../public/assets/audio');

if (!apiKey) {
  console.error('❌  VITE_ELEVENLABS_API_KEY not found in .env.local');
  process.exit(1);
}
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

// Map pedagogical speech styles → ElevenLabs voice settings
// Optimised for maximum humanisation on eleven_multilingual_v2
const getSettings = (style) => {
  switch (style) {
    case 'celebration':   return { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true };
    case 'encouragement': return { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true };
    case 'question':      return { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true };
    case 'emphasis':      return { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true };
    case 'thinking':      return { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true };
    default:              return { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true };
  }
};

// ── All narration phrases — must exactly match strings in narration.js ────────
const phrases = [
  // Intro
  { text: "Welcome to Numbers to 1000!",                                                              style: 'encouragement' },
  { text: "Today we are going to learn how to count all the way to one thousand.",                    style: 'statement'     },
  { text: "We will use hundreds, tens, and ones to read, write, and compare big numbers.",            style: 'statement'     },
  { text: "Are you ready to explore big numbers? Let's get started on our learning journey!",         style: 'encouragement' },

  // Wonder
  { text: "Wow, look at all those stars!",                                                            style: 'thinking'      },
  { text: "Did you know there are one thousand of them?",                                             style: 'emphasis'      },
  { text: "Today we are going to learn how to count all the way to one thousand.",                    style: 'statement'     },
  { text: "Are you ready to explore big numbers? Let's go!",                                         style: 'encouragement' },

  // Story panel 0
  { text: "Oliver and Asha visited Grandpa Ben's bead shop after school.",                           style: 'statement'     },
  { text: "\"Grandpa Ben, how do you count all your beads?\" asks Oliver.",                          style: 'statement'     },
  { text: "Grandpa Ben smiles: \"I use a very clever trick! Let me show you.\"",                     style: 'statement'     },
  // Story panel 1
  { text: "Grandpa Ben placed three big boxes on the counter.",                                       style: 'statement'     },
  { text: "Each box had one hundred beads inside!",                                                   style: 'emphasis'      },
  { text: "\"Three boxes means... three hundreds!\" he said.",                                        style: 'statement'     },
  // Story panel 2
  { text: "Next, he counted four bags of ten beads each.",                                            style: 'statement'     },
  { text: "Four bags means four tens — that is forty!",                                               style: 'emphasis'      },
  // Story panel 3
  { text: "Asha counted the loose beads: \"One, two, three, four, five!\"",                          style: 'statement'     },
  { text: "Three hundred and forty-five! We did it!",                                                style: 'celebration'   },
  // Story panel 4
  { text: "Every digit sits in a special place. That place tells you its value.",                     style: 'thinking'      },
  { text: "Three hundreds, four tens, and five ones make three hundred and forty-five!",              style: 'emphasis'      },
  // Story panel 5
  { text: "Now you know how to count all the way to one thousand!",                                  style: 'celebration'   },
  { text: "Hundreds, tens, and ones — that is the secret!",                                          style: 'encouragement' },

  // Simulate
  { text: "Drag the base-ten blocks into the workspace to build a number!",                          style: 'statement'     },
  { text: "Use the plus and minus buttons to add hundreds, tens, and ones.",                         style: 'statement'     },
  { text: "Now let's fill in the place value chart.",                                                style: 'statement'     },
  { text: "Drag each digit to its correct column — hundreds, tens, or ones.",                        style: 'statement'     },
  { text: "Can you place the number on the number line?",                                            style: 'question'      },
  { text: "Click or tap on the number line to place the marker at the right spot!",                  style: 'statement'     },
  { text: "Look at the counting pattern. What number comes next?",                                   style: 'question'      },
  { text: "Find the missing number in the sequence!",                                                style: 'statement'     },
  { text: "Amazing! You completed all four simulation stations!",                                    style: 'celebration'   },
  { text: "Time to play!",                                                                           style: 'encouragement' },

  // Play
  { text: "That's okay! Now you know for next time! 💪",                                             style: 'statement'     },
  { text: "Let's try again! Look at the place value chart.",                                         style: 'statement'     },
  { text: "Here's a clue! Count the hundreds first.",                                                style: 'statement'     },

  // Reflect
  { text: "What did you learn today about numbers to one thousand?",                                 style: 'question'      },
  { text: "That's right!",                                                                           style: 'celebration'   },
  { text: "Good try! Let's remember that together.",                                                 style: 'statement'     },
  { text: "How confident do you feel about numbers to one thousand?",                                style: 'question'      },
  { text: "You can count all the way to one thousand!",                                              style: 'celebration'   },
];

async function generate() {
  const mapData = {};

  for (let i = 0; i < phrases.length; i++) {
    const { text, style } = phrases[i];
    const safeName = text.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50);
    const filename = `audio_${safeName}_${i}.mp3`;
    const filepath = path.join(audioDir, filename);

    mapData[text] = `/assets/audio/${filename}`;

    if (fs.existsSync(filepath)) {
      console.log(`⏭  Skipping (exists): ${filename}`);
      continue;
    }

    console.log(`🎙  Generating [${i + 1}/${phrases.length}]: ${filename}`);

    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
          body:    JSON.stringify({
            text,
            model_id:       'eleven_multilingual_v2',
            voice_settings: getSettings(style),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error(`  ❌ Failed: ${res.statusText} — ${err}`);
        continue;
      }

      const buffer = await res.arrayBuffer();
      fs.writeFileSync(filepath, Buffer.from(buffer));
      console.log(`  ✅ Saved: ${filename}`);
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  // Write the audioMap module
  const mapPath = path.join(__dirname, '../src/utils/audioMap.js');
  fs.writeFileSync(
    mapPath,
    `// Auto-generated by scripts/generate_audio.js — do not edit manually\nexport const audioMap = ${JSON.stringify(mapData, null, 2)};\n`
  );

  console.log(`\n✨ Done! ${phrases.length} phrases processed.`);
  console.log(`📝 audioMap written to src/utils/audioMap.js`);
}

generate();
