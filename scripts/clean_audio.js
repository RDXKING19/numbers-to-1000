// ─────────────────────────────────────────────────────────────────────────────
// Audio Cleanup Script — Numbers to 1000
// Usage:  node scripts/clean_audio.js
// Deletes any .mp3 files in public/assets/audio/ that are no longer
// referenced in src/utils/audioMap.js
// ─────────────────────────────────────────────────────────────────────────────

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const audioDir  = path.join(__dirname, '../public/assets/audio');
const mapPath   = path.join(__dirname, '../src/utils/audioMap.js');

if (!fs.existsSync(mapPath)) {
  console.error('❌  audioMap.js not found. Run generate_audio.js first.');
  process.exit(1);
}

// Dynamically import the map
const { audioMap } = await import(mapPath);

const validFiles = new Set(
  Object.values(audioMap).map(p => path.basename(p))
);

if (!fs.existsSync(audioDir)) {
  console.log('ℹ️   Audio directory does not exist. Nothing to clean.');
  process.exit(0);
}

const allFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
let removed = 0;

for (const file of allFiles) {
  if (!validFiles.has(file)) {
    fs.unlinkSync(path.join(audioDir, file));
    console.log(`🗑  Removed orphan: ${file}`);
    removed++;
  }
}

console.log(`\n✅ Cleanup complete. ${removed} file(s) removed, ${allFiles.length - removed} kept.`);
