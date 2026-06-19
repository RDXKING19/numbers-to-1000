// ─────────────────────────────────────────────────────────────────────────────
// Question Bank — Numbers to 1000
// Singapore MOE Grade 2 Mathematics
// 10 question types × 10 questions = 100 total, distributed across 10 worlds
// ─────────────────────────────────────────────────────────────────────────────

const SG_NAMES    = ['Oliver','Asha','Sophie','Marcus','Emma','Jake','Lily','Ryan','Nathan','Grandpa Ben'];
const SG_OBJECTS  = ['beads','stamps','buttons','marbles','coins','blocks','stickers','books'];

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function generateDistractors(correct, min = 100, max = 1000, count = 3) {
  const d = new Set();
  let att = 0;
  while (d.size < count && att < 80) {
    att++;
    const strat = Math.floor(Math.random() * 3);
    let v;
    if (strat === 0) {
      const place = [1, 10, 100][Math.floor(Math.random() * 3)];
      v = correct + (Math.random() > 0.5 ? 1 : -1) * place;
    } else if (strat === 1) {
      const s = String(correct).padStart(3, '0').split('');
      const i = Math.floor(Math.random() * 3);
      const j = (i + 1 + Math.floor(Math.random() * 2)) % 3;
      [s[i], s[j]] = [s[j], s[i]];
      v = parseInt(s.join(''));
    } else {
      v = Math.round(correct / 10) * 10 + (Math.random() > 0.5 ? 5 : -5);
    }
    if (v >= min && v <= max && v !== correct && !d.has(v)) d.add(v);
  }
  [correct - 10, correct + 10, correct + 1, correct - 1].forEach(v => {
    if (v >= min && v <= max && v !== correct && d.size < count) d.add(v);
  });
  return shuffleArray([correct, ...d]);
}

// number → English words
const _ones  = ['','one','two','three','four','five','six','seven','eight','nine'];
const _teens = ['ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const _tens  = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
export function numberToWords(n) {
  if (n === 1000) return 'one thousand';
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const t = Math.floor(rem / 10);
  const o = rem % 10;
  let r = '';
  if (h > 0) r += _ones[h] + ' hundred';
  if (rem > 0) {
    r += (h > 0 ? ' and ' : '');
    if (rem < 10)       r += _ones[o];
    else if (rem < 20)  r += _teens[rem - 10];
    else { r += _tens[t]; if (o > 0) r += '-' + _ones[o]; }
  }
  return r.trim();
}

function randHTO(mn, mx) {
  let v;
  do { v = Math.floor(Math.random() * (mx - mn + 1)) + mn; } while (v < 100);
  return { v, H: Math.floor(v / 100), T: Math.floor((v % 100) / 10), O: v % 10 };
}

function diffRange(d) {
  if (d === 1) return [100, 399];
  if (d === 2) return [400, 699];
  return [700, 999];
}

// ── Q1  block_read ─────────────────────────────────
function genQ1(id, world, diff) {
  const [mn, mx] = diffRange(diff);
  const { v, H, T, O } = randHTO(mn, mx);
  return {
    id, type: 'block_read', world, difficulty: diff,
    hundreds: H, tens: T, ones: O, value: v,
    questionText: 'Look at the base-ten blocks. What number do they show?',
    visual: 'blocks',
    hint1: 'Count the big squares first. Each big square is one hundred.',
    hint2: `There ${H === 1 ? 'is' : 'are'} ${H} hundred${H !== 1 ? 's' : ''}, ${T} ten${T !== 1 ? 's' : ''}, and ${O} one${O !== 1 ? 's' : ''}.`,
    explanation: `${H}×100=${H * 100}, ${T}×10=${T * 10}, ${O}×1=${O}. Total = ${v}.`,
    options: generateDistractors(v),
    correctAnswer: v,
  };
}

// ── Q2  number_to_words ────────────────────────────
function genQ2(id, world, diff) {
  const [mn, mx] = diffRange(diff);
  const { v, H, T, O } = randHTO(mn, mx);
  const w = numberToWords(v);
  const alts = [
    numberToWords(v + 10 <= 1000 ? v + 10 : v - 10),
    numberToWords(v + 100 <= 1000 ? v + 100 : v - 100),
    numberToWords(v - 10 >= 100 ? v - 10 : v + 20),
  ];
  return {
    id, type: 'number_to_words', world, difficulty: diff,
    hundreds: H, tens: T, ones: O, value: v,
    questionText: `Write the number ${v} in words.`,
    visual: 'sentence',
    hint1: `Start with the hundreds digit: ${H} hundred${H !== 1 ? 's' : ''}.`,
    hint2: `${H} hundred and ${numberToWords(v % 100) || 'zero'}.`,
    explanation: `${v} in words is "${w}".`,
    options: shuffleArray([w, ...alts]),
    correctAnswer: w,
  };
}

// ── Q3  words_to_number ────────────────────────────
function genQ3(id, world, diff) {
  const [mn, mx] = diffRange(diff);
  const { v, H, T, O } = randHTO(mn, mx);
  const w = numberToWords(v);
  return {
    id, type: 'words_to_number', world, difficulty: diff,
    hundreds: H, tens: T, ones: O, value: v,
    questionText: `Write the numeral for: "${w}"`,
    visual: 'sentence',
    hint1: 'Find the hundreds word first.',
    hint2: `${H} hundreds = ${H * 100}. Then add the tens and ones.`,
    explanation: `"${w}" = ${H * 100} + ${T * 10} + ${O} = ${v}.`,
    options: generateDistractors(v),
    correctAnswer: v,
  };
}

// ── Q4  place_value ────────────────────────────────
const PV_NUMS = [[3,2,1],[5,7,3],[6,4,7],[8,0,5],[4,9,2],[7,3,6],[2,8,4],[9,1,7],[3,5,0],[6,7,9]];
function genQ4(id, world, diff, idx) {
  const [H, T, O] = PV_NUMS[idx % PV_NUMS.length];
  const v = H * 100 + T * 10 + O;
  const places = ['hundreds', 'tens', 'ones'];
  const place = places[idx % 3];
  const pv    = place === 'hundreds' ? H * 100 : place === 'tens' ? T * 10 : O;
  const pd    = place === 'hundreds' ? H : place === 'tens' ? T : O;
  return {
    id, type: 'place_value', world, difficulty: diff,
    hundreds: H, tens: T, ones: O, value: v,
    chosenPlace: place, chosenDigit: pd,
    questionText: `In the number ${v}, what is the value of the digit ${pd}?`,
    visual: 'chart',
    hint1: `Look at the ${place} column in the place value chart.`,
    hint2: `The digit ${pd} is in the ${place} place. What is its value?`,
    explanation: `${pd} is in the ${place} place → value = ${pv}.`,
    options: shuffleArray([pv, pd, Math.abs(pv - 10), pv + 10 > 1000 ? pd + 10 : pv + 10]),
    correctAnswer: pv,
  };
}

// ── Q5  compare ────────────────────────────────────
const CMP_PAIRS = [[301,310],[456,465],[789,798],[200,200],[547,574],[890,809],[123,132],[650,605],[999,998],[417,714]];
function genQ5(id, world, diff, idx) {
  const [a, b] = CMP_PAIRS[idx % CMP_PAIRS.length];
  const ans = a < b ? '<' : a > b ? '>' : '=';
  return {
    id, type: 'compare', world, difficulty: diff,
    hundreds: Math.floor(a / 100), tens: Math.floor((a % 100) / 10), ones: a % 10, value: a,
    numA: a, numB: b,
    questionText: `Compare: ${a} ___ ${b}`,
    visual: 'compare_pair',
    hint1: `Compare the hundreds digits first: ${Math.floor(a / 100)} and ${Math.floor(b / 100)}.`,
    hint2: a === b ? 'All digits are the same! They are equal.' : a < b ? `${a} is smaller than ${b}.` : `${a} is bigger than ${b}.`,
    explanation: `${a} ${ans} ${b}.`,
    options: ['<', '>', '='],
    correctAnswer: ans,
  };
}

// ── Q6  order ──────────────────────────────────────
const ORDER_SETS = [[120,210,102],[345,435,354],[789,987,879],[100,500,250],[234,324,243],[567,675,756],[890,908,980],[111,999,555],[416,641,164],[720,207,702]];
function genQ6(id, world, diff, idx) {
  const nums = ORDER_SETS[idx % ORDER_SETS.length];
  const sorted = [...nums].sort((a, b) => a - b);
  return {
    id, type: 'order', world, difficulty: diff,
    hundreds: 0, tens: 0, ones: 0, value: nums[0], nums,
    questionText: `Order from smallest to largest: ${nums.join(', ')}`,
    visual: 'three_numbers',
    hint1: 'Compare the hundreds digits first.',
    hint2: `${Math.min(...nums)} is the smallest number.`,
    explanation: `Ordered: ${sorted.join(' < ')}.`,
    options: shuffleArray([
      sorted.join(', '),
      [...nums].sort((a, b) => b - a).join(', '),
      [nums[1], nums[0], nums[2]].join(', '),
      [nums[2], nums[0], nums[1]].join(', '),
    ]),
    correctAnswer: sorted.join(', '),
  };
}

// ── Q7  pattern ────────────────────────────────────
const PATTERNS = [
  { seq:[100,200,null,400,500], ans:300, rule:'Count by 100s' },
  { seq:[455,460,null,470,475], ans:465, rule:'Count by 5s' },
  { seq:[920,910,900,null,880], ans:890, rule:'Count back by 10s' },
  { seq:[150,250,350,null,550], ans:450, rule:'Count by 100s' },
  { seq:[null,360,370,380,390], ans:350, rule:'Count by 10s' },
  { seq:[801,802,803,null,805], ans:804, rule:'Count by 1s' },
  { seq:[200,300,null,500,600], ans:400, rule:'Count by 100s' },
  { seq:[980,970,960,null,940], ans:950, rule:'Count back by 10s' },
  { seq:[115,125,135,null,155], ans:145, rule:'Count by 10s' },
  { seq:[700,800,900,null,null], ans:1000, rule:'Count by 100s' },
];
function genQ7(id, world, diff, idx) {
  const p = PATTERNS[idx % PATTERNS.length];
  const display = p.seq.map(x => x === null ? '___' : x).join(', ');
  return {
    id, type: 'pattern', world, difficulty: diff,
    hundreds: 0, tens: 0, ones: 0, value: p.ans, sequence: p.seq, patternRule: p.rule,
    questionText: `${display}. What is the missing number?`,
    visual: 'pattern_sequence',
    hint1: 'Are the numbers going up or down?',
    hint2: 'Find the difference between two neighbouring numbers.',
    explanation: `Pattern rule: ${p.rule}. Missing number = ${p.ans}.`,
    options: generateDistractors(p.ans, 100, 1000),
    correctAnswer: p.ans,
  };
}

// ── Q8  expanded_form ──────────────────────────────
const EXP_NUMS = [647,538,905,712,384,206,891,450,163,1000];
function genQ8(id, world, diff, idx) {
  const v = EXP_NUMS[idx % EXP_NUMS.length];
  const H = Math.floor(v / 100), T = Math.floor((v % 100) / 10), O = v % 10;
  const parts = [H > 0 ? `${H * 100}` : '', T > 0 ? `${T * 10}` : '', O > 0 ? `${O}` : ''].filter(Boolean);
  const exp = parts.join(' + ');
  return {
    id, type: 'expanded_form', world, difficulty: diff,
    hundreds: H, tens: T, ones: O, value: v,
    questionText: `${exp} = ___`,
    visual: 'sentence',
    hint1: `Add the hundreds first: ${H * 100}.`,
    hint2: `${H * 100} + ${T * 10} + ${O} = ?`,
    explanation: `${exp} = ${v}.`,
    options: generateDistractors(v),
    correctAnswer: v,
  };
}

// ── Q9  decompose ──────────────────────────────────
const DEC_NUMS = [345,620,809,471,253,768,134,590,987,416];
function genQ9(id, world, diff, idx) {
  const v = DEC_NUMS[idx % DEC_NUMS.length];
  const H = Math.floor(v / 100), T = Math.floor((v % 100) / 10), O = v % 10;
  return {
    id, type: 'decompose', world, difficulty: diff,
    hundreds: H, tens: T, ones: O, value: v,
    questionText: `${v} = ___ hundreds  ___ tens  ___ ones`,
    visual: 'chart',
    hint1: `How many complete hundreds are in ${v}? (${v} ÷ 100)`,
    hint2: `${v} = ${H} hundreds + ${T} tens + ${O} ones.`,
    explanation: `${v} = ${H} hundreds, ${T} tens, ${O} ones.`,
    correctAnswer: `${H},${T},${O}`,
    inputType: 'hto',
    hA: H, tA: T, oA: O,
  };
}

// ── Q10  word_problem ──────────────────────────────
const WP_DATA = [
  {n:'Oliver',ob:'beads',   H:1,T:2,O:3},
  {n:'Emma',  ob:'stamps',  H:2,T:7,O:5},
  {n:'Asha',  ob:'buttons', H:3,T:4,O:6},
  {n:'Jake',  ob:'marbles', H:4,T:0,O:8},
  {n:'Sophie',ob:'coins',   H:5,T:3,O:1},
  {n:'Ryan',  ob:'blocks',  H:6,T:2,O:9},
  {n:'Lily',  ob:'stickers',H:7,T:5,O:0},
  {n:'Marcus',ob:'books',   H:8,T:1,O:4},
  {n:'Nathan',ob:'beads',   H:9,T:6,O:2},
  {n:'Asha',  ob:'marbles', H:1,T:0,O:0},
];
function genQ10(id, world, diff, idx) {
  const { n, ob, H, T, O } = WP_DATA[idx % WP_DATA.length];
  const v = H * 100 + T * 10 + O;
  return {
    id, type: 'word_problem', world, difficulty: diff,
    hundreds: H, tens: T, ones: O, value: v,
    characterName: n, objectName: ob,
    questionText: `${n} counted ${H} box${H !== 1 ? 'es' : ''} of 100 ${ob}, ${T} bag${T !== 1 ? 's' : ''} of 10 ${ob}, and ${O} loose ${ob}. How many ${ob} are there in total?`,
    visual: 'word_problem',
    hint1: `${H} boxes × 100 = ${H * 100} ${ob}.`,
    hint2: `${H * 100} + ${T * 10} + ${O} = ?`,
    explanation: `${H}×100=${H * 100}, ${T}×10=${T * 10}, ${O}×1=${O}. Total = ${H * 100 + T * 10 + O}.`,
    options: generateDistractors(v),
    correctAnswer: v,
  };
}

// ── Assemble 100-question bank ─────────────────────
export function generateSessionQuestions() {
  const bank = [];
  let counter = 1;
  const nid = (t) => `${t}_${String(counter++).padStart(3, '0')}`;

  for (let i = 0; i < 10; i++) {
    const diff = i < 4 ? 1 : i < 8 ? 2 : 3;
    bank.push(genQ1 (nid('Q1'),  i, diff));
    bank.push(genQ2 (nid('Q2'),  i, diff));
    bank.push(genQ3 (nid('Q3'),  i, diff));
    bank.push(genQ4 (nid('Q4'),  i, diff, i));
    bank.push(genQ5 (nid('Q5'),  i, diff, i));
    bank.push(genQ6 (nid('Q6'),  i, diff, i));
    bank.push(genQ7 (nid('Q7'),  i, diff, i));
    bank.push(genQ8 (nid('Q8'),  i, diff, i));
    bank.push(genQ9 (nid('Q9'),  i, diff, i));
    bank.push(genQ10(nid('Q10'), i, diff, i));
  }

  // Group by world and return 10 per world
  const byWorld = {};
  bank.forEach(q => {
    if (!byWorld[q.world]) byWorld[q.world] = [];
    byWorld[q.world].push(q);
  });
  const result = [];
  for (let w = 0; w < 10; w++) {
    result.push(...shuffleArray(byWorld[w] || []).slice(0, 10));
  }
  return result;
}
