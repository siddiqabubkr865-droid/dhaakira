import type { ColorItem, DifficultyLevel, ObjectItem, ShapeItem } from '../types';
import {
  BNO14_ITEMS,
  BNO14_PASSAGE,
  COLORS,
  DIRS,
  FACES,
  NAMES,
  OBJECTS,
  PAIRS,
  PROCESSES,
  ROUND_NAMES,
  SHAPES,
  SYMBOLS,
  WORDS,
  makeRandomSentence,
} from './pools';
import { ri, sample, shuffle } from '../utils/helpers';

export type ShowBlock =
  | { type: 'words'; words: string[]; numbered?: boolean }
  | { type: 'bigseq'; text: string; compact?: boolean; sub?: string }
  | { type: 'emojiGrid'; items: { e: string; cap?: string }[] }
  | { type: 'emojiRows'; rows: string[] }
  | { type: 'colorSeq'; colors: ColorItem[]; showNames?: boolean }
  | { type: 'sentence'; text: string }
  | { type: 'passage'; title?: string; paragraphs: string[] }
  | { type: 'pairRows'; rows: { left: string; right: string }[] }
  | { type: 'shapeGrid'; combos: { s: ShapeItem; c: ColorItem }[] }
  | { type: 'gridPattern'; size: number; lit: number[] }
  | { type: 'gridObjects'; cols: number; cells: (string | null)[]; footer?: string }
  | { type: 'judgeBox'; text: string }
  | { type: 'stars'; count: number };

export interface McqOption {
  id: string;
  label: string;
  emoji?: string;
  shape?: { s: ShapeItem; c: ColorItem };
}

export interface OrderOption {
  id: string;
  label: string;
  colorHex?: string;
  bigEmoji?: string;
}

export interface MultiOption {
  id: string;
  label: string;
}

export type QuestionSpec =
  | {
      kind: 'mcq';
      id: string;
      prompt: string;
      promptEmoji?: string;
      options: McqOption[];
      correctIndex: number;
    }
  | {
      kind: 'multi';
      id: string;
      prompt: string;
      subNote?: string;
      options: MultiOption[];
      correctIds: string[];
    }
  | {
      kind: 'order';
      id: string;
      prompt: string;
      pool: OrderOption[];
      correctIds: string[];
    }
  | {
      kind: 'text';
      id: string;
      prompt: string;
      placeholder: string;
      mode: 'digits' | 'letters';
      expected: string[];
    }
  | {
      kind: 'number';
      id: string;
      prompt: string;
      expected: number;
      allowOffByOneHalf?: boolean;
    }
  | {
      kind: 'textarea';
      id: string;
      prompt: string;
      placeholder: string;
      keywords: string[];
    }
  | {
      kind: 'gridPattern';
      id: string;
      prompt: string;
      size: number;
      lit: number[];
    }
  | {
      kind: 'gridLocation';
      id: string;
      prompt: string;
      cols: number;
      totalCells: number;
      correctIndex: number;
    };

export interface RoundInstance {
  showSecs: number;
  judge?: string;
  showBlocks: ShowBlock[];
  questions: QuestionSpec[];
}

export interface RoundDef {
  name: string;
  max: number;
  make: (level: DifficultyLevel) => RoundInstance;
}

export type AnswerMap = Record<string, unknown>;

export function seqFrac(got: string[], want: string[]): number {
  if (!want.length) return 0;
  let ok = 0;
  for (let i = 0; i < want.length; i++) {
    if (got[i] === want[i]) ok++;
  }
  return ok / want.length;
}

export function orderFrac(gotIds: string[], correctIds: string[]): number {
  if (!correctIds.length) return 0;
  let ok = 0;
  correctIds.forEach((id, i) => {
    if (gotIds[i] === id) ok++;
  });
  return ok / correctIds.length;
}

export function scoreQuestion(q: QuestionSpec, raw: unknown): number {
  switch (q.kind) {
    case 'mcq':
      return typeof raw === 'number' && raw === q.correctIndex ? 1 : 0;
    case 'multi': {
      const chosen = Array.isArray(raw) ? (raw as string[]) : [];
      const correctSet = new Set(q.correctIds);
      let hits = 0;
      let falseP = 0;
      chosen.forEach((id) => {
        if (correctSet.has(id)) hits++;
        else falseP++;
      });
      return q.correctIds.length ? Math.max(0, hits - falseP) / q.correctIds.length : 0;
    }
    case 'order': {
      const got = Array.isArray(raw) ? (raw as string[]) : [];
      return orderFrac(got, q.correctIds);
    }
    case 'text': {
      const val = typeof raw === 'string' ? raw.trim() : '';
      if (q.mode === 'digits') {
        const digits = val.replace(/\D/g, '').split('');
        return seqFrac(digits, q.expected);
      }
      const letters = val.toUpperCase().replace(/[^A-Z]/g, '').split('');
      return seqFrac(letters, q.expected);
    }
    case 'number': {
      if (raw === null || raw === undefined || raw === '') return 0;
      const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
      if (Number.isNaN(n)) return 0;
      if (n === q.expected) return 1;
      if (q.allowOffByOneHalf && Math.abs(n - q.expected) === 1) return 0.5;
      return 0;
    }
    case 'textarea': {
      const val = typeof raw === 'string' ? raw : '';
      const mine = new Set(val.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/));
      let hit = 0;
      q.keywords.forEach((k) => {
        if (mine.has(k)) hit++;
      });
      return q.keywords.length ? hit / q.keywords.length : 0;
    }
    case 'gridPattern': {
      const total = q.size * q.size;
      const mine = new Set(Array.isArray(raw) ? (raw as number[]) : []);
      const litSet = new Set(q.lit);
      let ok = 0;
      for (let i = 0; i < total; i++) {
        if (litSet.has(i) === mine.has(i)) ok++;
      }
      return ok / total;
    }
    case 'gridLocation':
      return typeof raw === 'number' && raw === q.correctIndex ? 1 : 0;
  }
}

export function scoreRoundInstance(inst: RoundInstance, answers: AnswerMap): number {
  if (!inst.questions.length) return 0;
  const sum = inst.questions.reduce((acc, q) => acc + scoreQuestion(q, answers[q.id]), 0);
  return sum / inst.questions.length;
}

const pickN = (level: DifficultyLevel, e: number, m: number, h: number) =>
  level === 'easy' ? e : level === 'medium' ? m : h;

const GENERATORS: ((level: DifficultyLevel) => RoundInstance)[] = [
  // 1 Word Memorization
  (level) => {
    const n = pickN(level, 6, 9, 12);
    const words = sample(WORDS, n);
    const distract = sample(WORDS.filter((w) => !words.includes(w)), 6);
    const opts = shuffle([...words.map((w) => ({ id: w, label: w })), ...distract.map((w) => ({ id: `x${w}`, label: w }))]);
    return {
      showSecs: pickN(level, 25, 32, 38),
      showBlocks: [{ type: 'words', words }],
      questions: [{ kind: 'multi', id: 'q1', prompt: `Select ALL ${n} words you saw:`, options: opts, correctIds: words }],
    };
  },
  // 2 Number Sequence Memory
  (level) => {
    const len = pickN(level, 6, 8, 10);
    const seq = Array.from({ length: len }, () => String(ri(0, 9)));
    return {
      showSecs: pickN(level, 15, 18, 22),
      showBlocks: [{ type: 'bigseq', text: seq.join(' ') }],
      questions: [
        {
          kind: 'text',
          id: 'q1',
          prompt: 'Type the number sequence exactly as shown (digits in order):',
          placeholder: `${seq.length} digits`,
          mode: 'digits',
          expected: seq,
        },
      ],
    };
  },
  // 3 Picture Memory
  (level) => {
    const n = pickN(level, 6, 9, 12);
    const pics = sample(OBJECTS, n);
    const qs: QuestionSpec[] = [];
    for (let k = 0; k < 3; k++) {
      const target = k < 2 ? sample(pics, 1)[0] : sample(OBJECTS.filter((o) => !pics.includes(o)), 1)[0];
      const others = sample(OBJECTS.filter((o) => o !== target), 3);
      const opts = shuffle([target, ...others]);
      qs.push({
        kind: 'mcq',
        id: `q${k}`,
        prompt: `Question ${k + 1}: Which picture WAS in the grid?`,
        options: opts.map((o) => ({ id: o.n, label: o.n, emoji: o.e })),
        correctIndex: opts.indexOf(target),
      });
    }
    return {
      showSecs: pickN(level, 22, 28, 34),
      showBlocks: [{ type: 'emojiGrid', items: pics.map((o) => ({ e: o.e, cap: o.n })) }],
      questions: qs,
    };
  },
  // 4 Sentence Memory
  (level) => {
    const s = makeRandomSentence();
    const variants = shuffle([
      s.text,
      s.text.replace(s.slots.who, sample(NAMES.filter((x) => x !== s.slots.who), 1)[0]),
      s.text.replace(/\d+/, (m) => String(parseInt(m, 10) + 2)),
      s.text
        .replace('morning', 'evening')
        .replace('noon', 'midnight')
        .replace('Friday', 'Monday')
        .replace('rang', 'rang twice'),
    ]);
    const whereOpts = shuffle([s.slots.where, 'the railway station', 'a desert island', 'the city zoo']);
    return {
      showSecs: pickN(level, 18, 22, 26),
      showBlocks: [{ type: 'sentence', text: s.text }],
      questions: [
        {
          kind: 'mcq',
          id: 'q1',
          prompt: 'Which sentence did you see, word for word?',
          options: variants.map((v, i) => ({ id: `v${i}`, label: v })),
          correctIndex: variants.indexOf(s.text),
        },
        {
          kind: 'mcq',
          id: 'q2',
          prompt: 'Where did it happen / where was it?',
          options: whereOpts.map((v, i) => ({ id: `w${i}`, label: v })),
          correctIndex: whereOpts.indexOf(s.slots.where),
        },
      ],
    };
  },
  // 5 Alphabet Sequence Memory
  (level) => {
    const len = pickN(level, 6, 8, 10);
    const letters = Array.from({ length: len }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[ri(0, 25)]);
    return {
      showSecs: pickN(level, 15, 18, 22),
      showBlocks: [{ type: 'bigseq', text: letters.join(' ') }],
      questions: [
        {
          kind: 'text',
          id: 'q1',
          prompt: 'Type the letter sequence exactly as shown:',
          placeholder: `${len} letters`,
          mode: 'letters',
          expected: letters,
        },
      ],
    };
  },
  // 6 Colour Memory
  (level) => {
    const n = pickN(level, 5, 7, 9);
    const seq = Array.from({ length: n }, () => COLORS[ri(0, COLORS.length - 1)]);
    return {
      showSecs: pickN(level, 16, 20, 24),
      showBlocks: [{ type: 'colorSeq', colors: seq, showNames: true }],
      questions: [
        {
          kind: 'order',
          id: 'q1',
          prompt: 'Tap the colours in the SAME order you saw them:',
          pool: COLORS.map((c) => ({ id: c.n, label: c.n, colorHex: c.c })),
          correctIds: seq.map((c) => c.n),
        },
      ],
    };
  },
  // 7 Name and Number Memory
  (level) => {
    const n = pickN(level, 3, 4, 5);
    const names = sample(NAMES, n);
    const pairs = names.map((nm) => ({ nm, num: ri(100, 999) }));
    const qs: QuestionSpec[] = pairs.slice(0, pickN(level, 2, 3, 3)).map((p, idx) => {
      const opts = shuffle([...pairs.map((x) => x.num), ri(100, 999)])
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 4);
      if (!opts.includes(p.num)) opts[0] = p.num;
      return {
        kind: 'mcq',
        id: `q${idx}`,
        prompt: `What was the number with ${p.nm}?`,
        options: opts.map((o) => ({ id: String(o), label: String(o) })),
        correctIndex: opts.indexOf(p.num),
      };
    });
    return {
      showSecs: pickN(level, 20, 26, 32),
      showBlocks: [{ type: 'pairRows', rows: pairs.map((p) => ({ left: p.nm, right: String(p.num) })) }],
      questions: qs,
    };
  },
  // 8 Object Counting Memory
  (level) => {
    const kinds = sample(OBJECTS, 3);
    const counts = kinds.map(() => ri(2, 8));
    const rows = kinds.map((o, k) => o.e.repeat(counts[k]));
    return {
      showSecs: pickN(level, 18, 22, 26),
      showBlocks: [{ type: 'emojiRows', rows }],
      questions: kinds.map((o, k) => ({
        kind: 'number',
        id: `q${k}`,
        prompt: `How many ${o.n} (${o.e}) were there?`,
        expected: counts[k],
        allowOffByOneHalf: true,
      })),
    };
  },
  // 9 Reverse Memory
  (level) => {
    const n = pickN(level, 5, 6, 7);
    const words = sample(WORDS, n);
    const rev = words.slice().reverse();
    return {
      showSecs: pickN(level, 20, 24, 28),
      showBlocks: [{ type: 'words', words, numbered: true }],
      questions: [
        {
          kind: 'order',
          id: 'q1',
          prompt: 'Arrange the words in REVERSE order (last shown first):',
          pool: shuffle(words).map((w) => ({ id: w, label: w })),
          correctIds: rev,
        },
      ],
    };
  },
  // 10 Story Memory
  (level) => {
    const hero = sample(NAMES, 1)[0];
    const place = sample(['Kasaragod', 'Wayanad', 'Idukki', 'Palakkad', 'Alappuzha'], 1)[0];
    const obj = sample(OBJECTS, 1)[0];
    const num = ri(3, 14);
    const day = sample(['Monday', 'Tuesday', 'Thursday', 'Saturday'], 1)[0];
    const story = `${hero} travelled to ${place} on ${day}. Near the old bridge, ${hero} found a ${obj.n.toLowerCase()} ${obj.e} lying beside ${num} smooth stones. ${hero} picked it up, counted the stones twice to be sure, and carried everything home before sunset.`;
    const wrong = (arr: string[], right: string) => shuffle([right, ...sample(arr.filter((x) => x !== right), 3)]);
    const stOpts = wrong(['Kasaragod', 'Wayanad', 'Idukki', 'Palakkad', 'Alappuzha', 'Kochi'], place);
    const soOpts = wrong(OBJECTS.map((o) => o.n), obj.n);
    const snOpts = wrong(['2', '3', '5', '7', '9', '11', '14', '17'], String(num));
    const sdOpts = wrong(['Monday', 'Tuesday', 'Thursday', 'Saturday', 'Friday'], day);
    return {
      showSecs: pickN(level, 26, 32, 38),
      showBlocks: [{ type: 'passage', paragraphs: [story] }],
      questions: [
        { kind: 'mcq', id: 'q1', prompt: 'Where did the story happen?', options: stOpts.map((v) => ({ id: v, label: v })), correctIndex: stOpts.indexOf(place) },
        { kind: 'mcq', id: 'q2', prompt: `What did ${hero} find?`, options: soOpts.map((v) => ({ id: v, label: v })), correctIndex: soOpts.indexOf(obj.n) },
        { kind: 'mcq', id: 'q3', prompt: 'How many smooth stones were there?', options: snOpts.map((v) => ({ id: v, label: v })), correctIndex: snOpts.indexOf(String(num)) },
        { kind: 'mcq', id: 'q4', prompt: 'On which day did the journey happen?', options: sdOpts.map((v) => ({ id: v, label: v })), correctIndex: sdOpts.indexOf(day) },
      ],
    };
  },
  // 11 Word Position Memory
  (level) => {
    const n = pickN(level, 6, 8, 10);
    const words = sample(WORDS, n);
    const pos1 = ri(1, n);
    const w2 = sample(words, 1)[0];
    const p1Opts = shuffle([words[pos1 - 1], ...sample(words.filter((w) => w !== words[pos1 - 1]), 3)]);
    const targetPos = String(words.indexOf(w2) + 1);
    const opts2 = shuffle([
      targetPos,
      ...sample(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].filter((x) => x !== targetPos), 3),
    ]);
    return {
      showSecs: pickN(level, 22, 28, 34),
      showBlocks: [{ type: 'words', words, numbered: true }],
      questions: [
        { kind: 'mcq', id: 'q1', prompt: `Which word was at position ${pos1}?`, options: p1Opts.map((v) => ({ id: v, label: v })), correctIndex: p1Opts.indexOf(words[pos1 - 1]) },
        { kind: 'mcq', id: 'q2', prompt: `At which position was "${w2}"?`, options: opts2.map((v) => ({ id: v, label: v })), correctIndex: opts2.indexOf(targetPos) },
      ],
    };
  },
  // 12 Symbol Memory
  (level) => {
    const n = pickN(level, 5, 7, 9);
    const seq = Array.from({ length: n }, () => SYMBOLS[ri(0, SYMBOLS.length - 1)]);
    return {
      showSecs: pickN(level, 16, 20, 24),
      showBlocks: [{ type: 'bigseq', text: seq.join(' ') }],
      questions: [
        {
          kind: 'order',
          id: 'q1',
          prompt: 'Tap the symbols in the SAME order you saw them:',
          pool: SYMBOLS.map((s) => ({ id: s, label: s, bigEmoji: s })),
          correctIds: seq,
        },
      ],
    };
  },
  // 13 Shape Recognition
  (level) => {
    const n = pickN(level, 5, 7, 9);
    const allCombos = SHAPES.flatMap((s) => COLORS.slice(0, 8).map((c) => ({ s, c })));
    const combos = sample(allCombos, n);
    const shownKeys = new Set(combos.map((x) => `${x.s.n}|${x.c.n}`));
    const qs: QuestionSpec[] = [];
    for (let k = 0; k < 2; k++) {
      const target = sample(combos, 1)[0];
      const rest = sample(allCombos.filter((x) => !shownKeys.has(`${x.s.n}|${x.c.n}`)), 3);
      const opts = shuffle([target, ...rest]);
      qs.push({
        kind: 'mcq',
        id: `q${k}`,
        prompt: `Question ${k + 1}: Which shape was shown?`,
        options: opts.map((o) => ({ id: `${o.s.n}|${o.c.n}`, label: `${o.s.n} · ${o.c.n}`, shape: o })),
        correctIndex: opts.indexOf(target),
      });
    }
    return {
      showSecs: pickN(level, 22, 28, 34),
      showBlocks: [{ type: 'shapeGrid', combos }],
      questions: qs,
    };
  },
  // 14 Pattern Memory
  (level) => {
    const size = pickN(level, 4, 4, 5);
    const litN = pickN(level, 5, 7, 9);
    const cells = Array.from({ length: size * size }, (_, i) => i);
    const lit = sample(cells, litN);
    return {
      showSecs: pickN(level, 16, 20, 24),
      showBlocks: [{ type: 'gridPattern', size, lit }],
      questions: [{ kind: 'gridPattern', id: 'q1', prompt: 'Rebuild the pattern — tap the squares that were lit:', size, lit }],
    };
  },
  // 15 Face Recognition
  (level) => {
    const n = pickN(level, 4, 5, 6);
    const faces = sample(FACES, n);
    const names = sample(NAMES, n);
    const pairs = faces.map((f, i) => ({ f, nm: names[i] }));
    const t1 = sample(pairs, 1)[0];
    const t2 = sample(pairs.filter((p) => p !== t1), 1)[0];
    const o1 = shuffle([t1.nm, ...sample(NAMES.filter((x) => !names.includes(x)), 3)]);
    const o2 = shuffle([t2.f, ...sample(FACES.filter((x) => !faces.includes(x)), 3)]);
    return {
      showSecs: pickN(level, 20, 26, 32),
      showBlocks: [{ type: 'emojiGrid', items: pairs.map((p) => ({ e: p.f, cap: p.nm })) }],
      questions: [
        { kind: 'mcq', id: 'q1', prompt: 'Who had this face?', promptEmoji: t1.f, options: o1.map((v) => ({ id: v, label: v })), correctIndex: o1.indexOf(t1.nm) },
        { kind: 'mcq', id: 'q2', prompt: `Which face belonged to ${t2.nm}?`, options: o2.map((v) => ({ id: v, label: '', emoji: v })), correctIndex: o2.indexOf(t2.f) },
      ],
    };
  },
  // 16 Location Memory
  (level) => {
    const size = pickN(level, 3, 3, 4);
    const cells = size * size;
    const items = sample(OBJECTS, pickN(level, 4, 5, 6));
    const spots = sample(Array.from({ length: cells }, (_, i) => i), items.length);
    const gridCells = Array.from({ length: cells }, (_, i) => {
      const k = spots.indexOf(i);
      return k >= 0 ? items[k].e : null;
    });
    const targets = sample(items, 2);
    return {
      showSecs: pickN(level, 20, 26, 32),
      showBlocks: [{ type: 'gridObjects', cols: size, cells: gridCells }],
      questions: targets.map((o, idx) => ({
        kind: 'gridLocation',
        id: `q${idx}`,
        prompt: `Where was the ${o.n} ${o.e}? Tap its square:`,
        cols: size,
        totalCells: cells,
        correctIndex: spots[items.indexOf(o)],
      })),
    };
  },
  // 17 Direction Memory
  (level) => {
    const n = pickN(level, 5, 7, 9);
    const seq = Array.from({ length: n }, () => DIRS[ri(0, DIRS.length - 1)]);
    return {
      showSecs: pickN(level, 16, 20, 24),
      showBlocks: [{ type: 'emojiGrid', items: seq.map((d) => ({ e: d.a, cap: d.n })) }],
      questions: [
        {
          kind: 'order',
          id: 'q1',
          prompt: 'Tap the directions in the SAME order you saw them:',
          pool: DIRS.map((d) => ({ id: d.n, label: `${d.a} ${d.n}` })),
          correctIds: seq.map((d) => d.n),
        },
      ],
    };
  },
  // 18 Date and Time Memory
  (level) => {
    const n = pickN(level, 3, 4, 5);
    const events = sample(
      ['Football final', 'Science exhibition', 'Library opening', 'Art competition', 'Drama rehearsal', 'Chess tournament', 'Poetry evening', 'Robotics demo'],
      n
    );
    const cards = events.map((ev) => ({
      ev,
      date: `${ri(1, 28)} ${sample(['January', 'February', 'March', 'April', 'May', 'June'], 1)[0]}`,
      time: `${ri(1, 12)}:${sample(['00', '15', '30', '45'], 1)[0]} ${sample(['AM', 'PM'], 1)[0]}`,
    }));
    const t = sample(cards, 1)[0];
    const t2 = sample(cards.filter((c) => c !== t), 1)[0];
    const od = shuffle([t.date, ...sample(cards.filter((c) => c !== t).map((c) => c.date).concat(['7 July', '19 August']), 3)]).slice(0, 4);
    if (!od.includes(t.date)) od[0] = t.date;
    const ot = shuffle([t2.time, ...sample(cards.filter((c) => c !== t2).map((c) => c.time).concat(['6:00 PM', '9:30 AM']), 3)]).slice(0, 4);
    if (!ot.includes(t2.time)) ot[0] = t2.time;
    return {
      showSecs: pickN(level, 20, 26, 32),
      showBlocks: [{ type: 'pairRows', rows: cards.map((c) => ({ left: c.ev, right: `${c.date} · ${c.time}` })) }],
      questions: [
        { kind: 'mcq', id: 'q1', prompt: `On which date is the ${t.ev}?`, options: od.map((v) => ({ id: v, label: v })), correctIndex: od.indexOf(t.date) },
        { kind: 'mcq', id: 'q2', prompt: `At what time is the ${t2.ev}?`, options: ot.map((v) => ({ id: v, label: v })), correctIndex: ot.indexOf(t2.time) },
      ],
    };
  },
  // 19 Object Arrangement Memory
  (level) => {
    const n = pickN(level, 5, 7, 8);
    const items = sample(OBJECTS, n);
    return {
      showSecs: pickN(level, 18, 24, 30),
      showBlocks: [{ type: 'emojiGrid', items: items.map((o) => ({ e: o.e, cap: o.n })) }],
      questions: [
        {
          kind: 'order',
          id: 'q1',
          prompt: 'Arrange the objects in the SAME left-to-right order you saw:',
          pool: shuffle(items).map((o) => ({ id: o.n, label: `${o.e} ${o.n}` })),
          correctIds: items.map((o) => o.n),
        },
      ],
    };
  },
  // 20 Missing Item Memory
  (level) => {
    const n = pickN(level, 7, 9, 11);
    const items = sample(WORDS, n);
    const missN = pickN(level, 1, 1, 2);
    const missing = sample(items, missN);
    const rest = items.filter((w) => !missing.includes(w));
    const opts = shuffle([
      ...missing.map((w) => ({ id: w, label: w })),
      ...sample(WORDS.filter((w) => !items.includes(w)), 4).map((w) => ({ id: `x${w}`, label: w })),
    ]);
    return {
      showSecs: pickN(level, 22, 28, 34),
      showBlocks: [{ type: 'words', words: items }],
      questions: [
        {
          kind: 'multi',
          id: 'q1',
          prompt: 'One list is shown again below in the recall — which item(s) are MISSING from it?',
          subNote: `Second list: ${rest.join(', ')}`,
          options: opts,
          correctIds: missing,
        },
      ],
    };
  },
  // 21 Order Reconstruction
  (level) => {
    const proc = PROCESSES[ri(0, PROCESSES.length - 1)];
    const steps = proc.steps.slice(0, pickN(level, 4, 5, 6));
    return {
      showSecs: pickN(level, 24, 30, 36),
      showBlocks: [{ type: 'passage', title: proc.t, paragraphs: steps.map((s, i) => `${i + 1}. ${s}`) }],
      questions: [
        {
          kind: 'order',
          id: 'q1',
          prompt: `Put the steps of "${proc.t}" back in the correct order:`,
          pool: shuffle(steps).map((s) => ({ id: s, label: s })),
          correctIds: steps,
        },
      ],
    };
  },
  // 22 Audio Memory (judge-read-aloud)
  (level) => {
    const n = pickN(level, 5, 7, 9);
    const seq = Array.from({ length: n }, (_, i) => (i % 2 ? String(ri(10, 99)) : sample(WORDS, 1)[0]));
    const correctIds = seq.map((s, i) => `${i}|${s}`);
    return {
      showSecs: pickN(level, 20, 26, 32),
      judge: 'Read the sequence aloud twice, clearly. The player listens only and must not write anything down.',
      showBlocks: [
        {
          type: 'judgeBox',
          text: 'For the judge / a friend: read the sequence below aloud, clearly, twice. The player must only LISTEN — cover this card while it is read. Solo players: read it aloud yourself, then press the recall button.',
        },
        { type: 'bigseq', text: seq.join(' · '), compact: true },
      ],
      questions: [
        {
          kind: 'order',
          id: 'q1',
          prompt: 'Arrange the items in the order the judge read them:',
          pool: shuffle(seq.map((s, i) => ({ id: `${i}|${s}`, label: s }))),
          correctIds,
        },
      ],
    };
  },
  // 23 Visual Observation Memory
  (level) => {
    const row = sample(OBJECTS, 5);
    const stars = ri(2, 6);
    const mid = row[2];
    const right = row[4];
    const o1 = shuffle([mid.n, ...sample(OBJECTS.filter((o) => !row.includes(o)), 3).map((o) => o.n)]);
    const q2opts = shuffle([String(stars), String(stars + 1), String(stars + 2), String(Math.max(1, stars - 1))].filter((v, i, a) => a.indexOf(v) === i));
    const q3opts = shuffle([right.n, ...sample(OBJECTS.filter((o) => o !== right), 3).map((o) => o.n)]);
    return {
      showSecs: pickN(level, 16, 20, 24),
      showBlocks: [
        { type: 'emojiGrid', items: row.map((o) => ({ e: o.e, cap: o.n })) },
        { type: 'stars', count: stars },
      ],
      questions: [
        { kind: 'mcq', id: 'q1', prompt: 'Which object was in the MIDDLE of the row?', options: o1.map((v) => ({ id: v, label: v })), correctIndex: o1.indexOf(mid.n) },
        { kind: 'mcq', id: 'q2', prompt: 'How many stars were under the row?', options: q2opts.map((v) => ({ id: v, label: v })), correctIndex: q2opts.indexOf(String(stars)) },
        { kind: 'mcq', id: 'q3', prompt: 'Which object was at the FAR RIGHT?', options: q3opts.map((v) => ({ id: v, label: v })), correctIndex: q3opts.indexOf(right.n) },
      ],
    };
  },
  // 24 Mathematical Sequence Memory
  (level) => {
    const start = ri(2, 20);
    const step = ri(2, 9);
    const len = pickN(level, 5, 6, 6);
    const seq = Array.from({ length: len }, (_, i) => start + step * i);
    const next1 = start + step * len;
    const next2 = start + step * (len + 1);
    return {
      showSecs: pickN(level, 18, 22, 26),
      showBlocks: [{ type: 'bigseq', text: seq.join(', '), compact: true, sub: 'Memorise the pattern, not just the numbers.' }],
      questions: [
        { kind: 'number', id: 'q1', prompt: `The sequence was: ${seq.join(', ')}, … — what comes NEXT?`, expected: next1 },
        { kind: 'number', id: 'q2', prompt: 'And the number after that?', expected: next2 },
      ],
    };
  },
  // 25 Pair Matching Memory
  (level) => {
    const n = pickN(level, 3, 4, 5);
    const pairs = sample(PAIRS, n);
    const rights = PAIRS.map((p) => p[1]);
    return {
      showSecs: pickN(level, 22, 28, 34),
      showBlocks: [{ type: 'pairRows', rows: pairs.map((p) => ({ left: p[0], right: p[1] })) }],
      questions: pairs.map((p, idx) => {
        const opts = shuffle([p[1], ...sample(rights.filter((r) => r !== p[1]), 3)]);
        return {
          kind: 'mcq',
          id: `q${idx}`,
          prompt: `What was paired with "${p[0]}"?`,
          options: opts.map((v) => ({ id: v, label: v })),
          correctIndex: opts.indexOf(p[1]),
        };
      }),
    };
  },
  // 26 Paragraph Reproduction
  (level) => {
    const hero = sample(NAMES, 1)[0];
    const place = sample(['the riverside village', 'the hill town', 'the coastal city'], 1)[0];
    const obj = sample(OBJECTS, 1)[0];
    const num = ri(4, 20);
    const para = `${hero} lived in ${place} and kept a small notebook of everything worth remembering. One spring morning, ${hero} counted ${num} boats on the water, bought a ${obj.n.toLowerCase()} from the market, and wrote the day's lesson in the notebook: a memory that is written and revisited is a memory that stays.`;
    const keywords = [...new Set(para.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter((w) => w.length > 3))];
    return {
      showSecs: pickN(level, 30, 36, 42),
      showBlocks: [{ type: 'passage', paragraphs: [para] }],
      questions: [
        {
          kind: 'textarea',
          id: 'q1',
          prompt: 'Rewrite the paragraph from memory — as close as you can (scored on how many key words you reproduce):',
          placeholder: 'Type the paragraph here…',
          keywords,
        },
      ],
    };
  },
  // 27 Mixed Information Memory
  (level) => {
    const nm = sample(NAMES, 1)[0];
    const age = ri(11, 17);
    const city = sample(['Kochi', 'Calicut', 'Malappuram', 'Thrissur', 'Kannur', 'Palakkad'], 1)[0];
    const col = sample(COLORS, 1)[0];
    const pet = sample(['cat', 'dog', 'parrot', 'rabbit', 'goat'], 1)[0];
    const lucky = ri(2, 30);
    const fix = (arr: string[], right: string) => shuffle([right, ...arr.filter((x) => x !== right).slice(0, 3)]);
    const cOpts = fix(['Kochi', 'Calicut', 'Malappuram', 'Thrissur', 'Kannur', 'Palakkad'], city);
    const nOpts = shuffle([...new Set([String(lucky), String(lucky + 3), String(lucky + 7), String(Math.max(1, lucky - 2))])]);
    const pOpts = fix(['cat', 'dog', 'parrot', 'rabbit', 'goat'], pet);
    return {
      showSecs: pickN(level, 20, 26, 32),
      showBlocks: [
        {
          type: 'pairRows',
          rows: [
            { left: 'Name', right: nm },
            { left: 'Age', right: String(age) },
            { left: 'City', right: city },
            { left: 'Favourite colour', right: col.n },
            { left: 'Pet', right: pet },
            { left: 'Lucky number', right: String(lucky) },
          ],
        },
      ],
      questions: [
        { kind: 'mcq', id: 'q1', prompt: 'Which city?', options: cOpts.map((v) => ({ id: v, label: v })), correctIndex: cOpts.indexOf(city) },
        { kind: 'mcq', id: 'q2', prompt: 'What is the lucky number?', options: nOpts.map((v) => ({ id: v, label: v })), correctIndex: nOpts.indexOf(String(lucky)) },
        { kind: 'mcq', id: 'q3', prompt: 'Which pet?', options: pOpts.map((v) => ({ id: v, label: v })), correctIndex: pOpts.indexOf(pet) },
      ],
    };
  },
  // 28 Image Detail Identification
  (level) => {
    const grid = sample(OBJECTS, 9);
    const tl = grid[0];
    const br = grid[8];
    const present = sample(grid, 1)[0];
    const o1 = shuffle([tl.n, ...sample(OBJECTS.filter((o) => !grid.includes(o)), 3).map((o) => o.n)]);
    const o2 = shuffle([br.n, ...sample(OBJECTS.filter((o) => !grid.includes(o)), 3).map((o) => o.n)]);
    const o3 = shuffle([present.n, sample(OBJECTS.filter((o) => !grid.includes(o)), 1)[0].n]);
    return {
      showSecs: pickN(level, 18, 24, 30),
      showBlocks: [{ type: 'gridObjects', cols: 3, cells: grid.map((o) => o.e) }],
      questions: [
        { kind: 'mcq', id: 'q1', prompt: 'What was in the TOP-LEFT corner of the picture?', options: o1.map((v) => ({ id: v, label: v })), correctIndex: o1.indexOf(tl.n) },
        { kind: 'mcq', id: 'q2', prompt: 'What was in the BOTTOM-RIGHT corner?', options: o2.map((v) => ({ id: v, label: v })), correctIndex: o2.indexOf(br.n) },
        { kind: 'mcq', id: 'q3', prompt: 'Which of these WAS in the picture?', options: o3.map((v) => ({ id: v, label: v })), correctIndex: o3.indexOf(present.n) },
      ],
    };
  },
  // 29 Logical Recall Challenge
  (level) => {
    const trio = sample(NAMES, 3);
    const items = sample(OBJECTS, 3);
    const facts = `${trio[0]} is taller than ${trio[1]}. ${trio[1]} is taller than ${trio[2]}. The ${items[0].n} ${items[0].e} is kept to the LEFT of the ${items[1].n} ${items[1].e}, and the ${items[1].n} is to the LEFT of the ${items[2].n} ${items[2].e}.`;
    const o1 = shuffle(trio.slice());
    const o2 = shuffle(trio.slice());
    const o3 = shuffle(items.map((o) => o.n));
    return {
      showSecs: pickN(level, 22, 28, 34),
      showBlocks: [{ type: 'passage', paragraphs: [facts] }],
      questions: [
        { kind: 'mcq', id: 'q1', prompt: 'Who is the TALLEST?', options: o1.map((v) => ({ id: v, label: v })), correctIndex: o1.indexOf(trio[0]) },
        { kind: 'mcq', id: 'q2', prompt: 'Who is in the MIDDLE height?', options: o2.map((v) => ({ id: v, label: v })), correctIndex: o2.indexOf(trio[1]) },
        { kind: 'mcq', id: 'q3', prompt: 'Which object is on the far LEFT?', options: o3.map((v) => ({ id: v, label: v })), correctIndex: o3.indexOf(items[0].n) },
      ],
    };
  },
  // 30 Grand Finale – Ultimate Memory Challenge
  (level) => {
    const words = sample(WORDS, 4);
    const num = Array.from({ length: 4 }, () => String(ri(1, 9)));
    const cols = sample(COLORS, 3);
    const obj: ObjectItem = sample(OBJECTS, 1)[0];
    const distract = sample(WORDS.filter((w) => !words.includes(w)), 4);
    const wordOpts = shuffle([...words.map((w) => ({ id: w, label: w })), ...distract.map((w) => ({ id: `x${w}`, label: w }))]);
    const oOpts = shuffle([obj.n, ...sample(OBJECTS.filter((o) => o !== obj), 3).map((o) => o.n)]);
    return {
      showSecs: pickN(level, 34, 40, 46),
      showBlocks: [
        { type: 'words', words },
        { type: 'bigseq', text: num.join(' ') },
        { type: 'colorSeq', colors: cols },
        { type: 'emojiGrid', items: [{ e: obj.e, cap: obj.n }] },
      ],
      questions: [
        { kind: 'multi', id: 'q1', prompt: 'Part 1 — select the 4 words:', options: wordOpts, correctIds: words },
        { kind: 'text', id: 'q2', prompt: 'Part 2 — type the 4-digit number:', placeholder: '4 digits', mode: 'digits', expected: num },
        { kind: 'order', id: 'q3', prompt: 'Part 3 — tap the 3 colours in order:', pool: COLORS.map((c) => ({ id: c.n, label: c.n, colorHex: c.c })), correctIds: cols.map((c) => c.n) },
        { kind: 'mcq', id: 'q4', prompt: 'Part 4 — which object was shown?', options: oOpts.map((v) => ({ id: v, label: v })), correctIndex: oOpts.indexOf(obj.n) },
      ],
    };
  },
];

export const DHAKIRA_DEFS: RoundDef[] = ROUND_NAMES.map((name, i) => ({
  name,
  max: i < 20 ? 3 : 4,
  make: GENERATORS[i],
}));

export const BNO14_DEFS: RoundDef[] = [
  {
    name: 'The Village Library — Passage Memory',
    max: 20,
    make: (level) => {
      const q = (id: string, prompt: string, right: string, wrongs: string[]): QuestionSpec => {
        const o = shuffle([right, ...wrongs]);
        return { kind: 'mcq', id, prompt, options: o.map((v) => ({ id: v, label: v })), correctIndex: o.indexOf(right) };
      };
      return {
        showSecs: pickN(level, 45, 55, 65),
        judge: 'Read the passage silently and carefully. You will be asked questions about its details. Nothing may be written down.',
        showBlocks: [{ type: 'passage', paragraphs: [BNO14_PASSAGE] }],
        questions: [
          q('q1', 'In which year was the library built?', '1962', ['1952', '1972', '1985']),
          q('q2', "What was the librarian's name?", 'Kunhimoideen', ['Abdu Rahman', 'Moideen Kutty', 'Kunhalan']),
          q('q3', 'How many books did the library hold?', '4,250', ['2,450', '4,520', '5,250']),
          q('q4', 'On which day did the children come for the story?', 'Friday', ['Monday', 'Wednesday', 'Sunday']),
          q('q5', 'What did the children plant when he retired?', 'A mango sapling', ['A coconut palm', 'A rose bush', 'A jackfruit tree']),
        ],
      };
    },
  },
  {
    name: 'The Twelve Objects',
    max: 20,
    make: (level) => {
      const distract = ['purple hat', 'wooden ruler', 'copper coin', 'paper boat', 'striped scarf', 'iron nail'];
      const opts = shuffle([...BNO14_ITEMS.map((w) => ({ id: w, label: w })), ...distract.map((w) => ({ id: `x${w}`, label: w }))]);
      return {
        showSecs: pickN(level, 35, 42, 50),
        judge: 'Look at the twelve objects and fix each one in your mind. In the recall, pick exactly those twelve from a longer list.',
        showBlocks: [{ type: 'words', words: BNO14_ITEMS }],
        questions: [{ kind: 'multi', id: 'q1', prompt: 'Select ALL 12 objects that were on the list:', options: opts, correctIds: BNO14_ITEMS }],
      };
    },
  },
  {
    name: 'Judge-Read-Aloud Memory',
    max: 20,
    make: (level) => {
      const seq = ['Seven', 'River', 'Nineteen', 'Candle', 'Forty-two', 'Garden', 'Eleven', 'Silver', 'Ninety', 'Market'];
      const correctIds = seq.map((s, i) => `${i}|${s}`);
      return {
        showSecs: pickN(level, 35, 42, 50),
        judge: 'The judge reads the list aloud twice. The candidate listens only — eyes on the judge, nothing written down.',
        showBlocks: [
          {
            type: 'judgeBox',
            text: 'For the judge / a friend: read the list below aloud, clearly, twice, at a steady pace. The candidate must only LISTEN — cover this card while reading. Solo players: read it aloud yourself, then press recall.',
          },
          { type: 'bigseq', text: seq.join(' · '), compact: true },
        ],
        questions: [
          {
            kind: 'order',
            id: 'q1',
            prompt: 'Arrange the words and numbers in the order the judge read them:',
            pool: shuffle(seq.map((s, i) => ({ id: `${i}|${s}`, label: s }))),
            correctIds,
          },
        ],
      };
    },
  },
  {
    name: 'Word & Number Chain',
    max: 20,
    make: (level) => {
      const w = sample(WORDS, 4);
      const chain: string[] = [];
      for (let i = 0; i < 4; i++) {
        chain.push(w[i]);
        chain.push(String(ri(11, 99)));
      }
      const correctIds = chain.map((s, i) => `${i}|${s}`);
      return {
        showSecs: pickN(level, 26, 32, 38),
        judge: 'Memorise the chain — word, number, word, number — in its exact order.',
        showBlocks: [{ type: 'words', words: chain }],
        questions: [
          {
            kind: 'order',
            id: 'q1',
            prompt: 'Rebuild the chain in the exact order shown:',
            pool: shuffle(chain.map((s, i) => ({ id: `${i}|${s}`, label: s }))),
            correctIds,
          },
        ],
      };
    },
  },
  {
    name: 'Picture Positions',
    max: 20,
    make: (level) => {
      const items = sample(OBJECTS, 6);
      const targets = sample(items, 2);
      const oOpts = shuffle([items[0].n, ...sample(OBJECTS.filter((x) => !items.includes(x)), 3).map((x) => x.n)]);
      const qs: QuestionSpec[] = targets.map((o, idx) => ({
        kind: 'gridLocation',
        id: `q${idx}`,
        prompt: `Where was the ${o.n} ${o.e}? Tap its square:`,
        cols: 3,
        totalCells: 6,
        correctIndex: items.indexOf(o),
      }));
      qs.push({
        kind: 'mcq',
        id: 'q_tl',
        prompt: 'Which object was in the TOP-LEFT square?',
        options: oOpts.map((v) => ({ id: v, label: v })),
        correctIndex: oOpts.indexOf(items[0].n),
      });
      return {
        showSecs: pickN(level, 24, 30, 36),
        judge: 'Fix the position of every picture in the 3 × 2 grid. You will be asked where individual pictures stood.',
        showBlocks: [
          {
            type: 'gridObjects',
            cols: 3,
            cells: items.map((o) => o.e),
            footer: items.map((o) => o.n).join(' · '),
          },
        ],
        questions: qs,
      };
    },
  },
];
