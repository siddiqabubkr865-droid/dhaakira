import type { BadgeDef, BrainModeId, ColorItem, DirItem, ObjectItem, ShapeItem } from '../types';
import { ri, sample } from '../utils/helpers';

export const WORDS = [
  'Lantern', 'Compass', 'Meadow', 'Harbour', 'Velvet', 'Cinder', 'Marble', 'Saffron', 'Willow', 'Cobalt',
  'Juniper', 'Tempest', 'Quiver', 'Zephyr', 'Onyx', 'Garnet', 'Hollow', 'Bramble', 'Copper', 'Sable',
  'Thistle', 'Umbra', 'Falcon', 'Geyser', 'Hazel', 'Ivory', 'Jasper', 'Kestrel', 'Lagoon', 'Mica',
  'Nectar', 'Obsidian', 'Pepper', 'Quartz', 'Rowan', 'Sorrel', 'Topaz', 'Umber', 'Violet', 'Walnut',
  'Yonder', 'Zinc', 'Amber', 'Birch', 'Cedar', 'Dune', 'Ember', 'Flint', 'Grove', 'Heather',
  'Indigo', 'Jute', 'Keel', 'Linden', 'Myrrh', 'Nickel', 'Opal', 'Pine', 'Ridge', 'Slate',
  'Tundra', 'Urchin', 'Vine', 'Wicker', 'Yarn', 'Zenith', 'Anchor', 'Beacon', 'Drizzle', 'Elm',
  'Fable', 'Granite', 'Haven', 'Ink', 'Jewel', 'Kite', 'Loom', 'Mist', 'Noble', 'Orbit',
  'Pearl', 'Quest', 'Reed', 'Summit', 'Timber', 'Unity', 'Vault', 'Whisper', 'Yield', 'Zeal',
  'Atlas', 'Breeze', 'Canyon', 'Drift', 'Echo', 'Frost',
];

export const NAMES = [
  'Afeef', 'Siddiq', 'Maryam', 'Fathima', 'Yusuf', 'Ibrahim', 'Aisha', 'Bilal', 'Hana', 'Omar',
  'Zainab', 'Idris', 'Layla', 'Hamza', 'Noor', 'Salman', 'Rania', 'Tariq', 'Imran', 'Sana',
  'Arjun', 'Meera', 'Ravi', 'Ananya', 'Kiran', 'Divya', 'Rahul', 'Priya', 'Vikram', 'Nisha',
  'John', 'Sarah', 'David', 'Emma', 'Lucas', 'Mia', 'Noah', 'Ava', 'Liam', 'Ella',
];

export const OBJECTS: ObjectItem[] = [
  { e: '🍎', n: 'Apple' }, { e: '🚗', n: 'Car' }, { e: '⚽', n: 'Football' }, { e: '📚', n: 'Books' }, { e: '🌙', n: 'Moon' }, { e: '⭐', n: 'Star' },
  { e: '🐪', n: 'Camel' }, { e: '⛵', n: 'Boat' }, { e: '🎁', n: 'Gift' }, { e: '🔑', n: 'Key' }, { e: '⌚', n: 'Watch' }, { e: '🍌', n: 'Banana' },
  { e: '🦁', n: 'Lion' }, { e: '🌹', n: 'Rose' }, { e: '🏰', n: 'Castle' }, { e: '🚲', n: 'Bicycle' }, { e: '🍇', n: 'Grapes' }, { e: '🐘', n: 'Elephant' },
  { e: '💎', n: 'Diamond' }, { e: '🎈', n: 'Balloon' }, { e: '🍓', n: 'Strawberry' }, { e: '🦋', n: 'Butterfly' }, { e: '🏺', n: 'Vase' }, { e: '🕯️', n: 'Candle' },
  { e: '🌴', n: 'Palm tree' }, { e: '🐢', n: 'Turtle' }, { e: '🍕', n: 'Pizza' }, { e: '🎸', n: 'Guitar' }, { e: '🚀', n: 'Rocket' }, { e: '🍩', n: 'Doughnut' },
  { e: '🦉', n: 'Owl' }, { e: '🌻', n: 'Sunflower' }, { e: '⛲', n: 'Fountain' }, { e: '🧲', n: 'Magnet' }, { e: '🪁', n: 'Kite' }, { e: '🍉', n: 'Watermelon' },
];

export const COLORS: ColorItem[] = [
  { n: 'Red', c: '#e63946' }, { n: 'Blue', c: '#4361ee' }, { n: 'Green', c: '#2a9d3a' }, { n: 'Yellow', c: '#f4c20d' },
  { n: 'Purple', c: '#8338ec' }, { n: 'Orange', c: '#fb8500' }, { n: 'Pink', c: '#ef5da8' }, { n: 'Teal', c: '#0aa6a6' },
  { n: 'Brown', c: '#8a5a2b' }, { n: 'White', c: '#f1f1f1' }, { n: 'Black', c: '#22242a' }, { n: 'Sky Blue', c: '#4cc9f0' },
];

export const SYMBOLS = ['★', '☾', '♦', '♠', '♥', '♣', '▲', '●', '■', '◆', '✿', '☀', '⚡', '✚', '♪', '☂', '✈', '⚓', '♞', '⬟'];
export const FACES = ['😀', '😎', '🤔', '😴', '🤠', '😇', '🥳', '😜', '🤓', '😌', '🙂', '😲', '🥸', '😺', '🤗', '😷'];
export const DIRS: DirItem[] = [
  { n: 'North', a: '⬆' }, { n: 'East', a: '➡' }, { n: 'South', a: '⬇' }, { n: 'West', a: '⬅' },
  { n: 'North-East', a: '↗' }, { n: 'South-West', a: '↙' }, { n: 'North-West', a: '↖' }, { n: 'South-East', a: '↘' },
];

export const SHAPES: ShapeItem[] = [
  { n: 'Circle', paths: c => `<circle cx="30" cy="30" r="22" fill="${c}"/>` },
  { n: 'Square', paths: c => `<rect x="9" y="9" width="42" height="42" rx="5" fill="${c}"/>` },
  { n: 'Triangle', paths: c => `<polygon points="30,6 55,52 5,52" fill="${c}"/>` },
  { n: 'Star', paths: c => `<polygon points="30,4 38,22 57,22 42,34 47,53 30,42 13,53 18,34 3,22 22,22" fill="${c}"/>` },
  { n: 'Diamond', paths: c => `<polygon points="30,4 54,30 30,56 6,30" fill="${c}"/>` },
  { n: 'Hexagon', paths: c => `<polygon points="30,4 52,17 52,43 30,56 8,43 8,17" fill="${c}"/>` },
  { n: 'Heart', paths: c => `<path d="M30 52 C6 34 8 12 22 10 C27 9 30 13 30 16 C30 13 33 9 38 10 C52 12 54 34 30 52Z" fill="${c}"/>` },
  { n: 'Oval', paths: c => `<ellipse cx="30" cy="30" rx="24" ry="16" fill="${c}"/>` },
];

export const PAIRS: [string, string][] = [
  ['India', 'New Delhi'], ['Japan', 'Tokyo'], ['France', 'Paris'], ['Egypt', 'Cairo'], ['Brazil', 'Brasília'], ['Canada', 'Ottawa'],
  ['Australia', 'Canberra'], ['Italy', 'Rome'], ['Spain', 'Madrid'], ['Turkey', 'Ankara'], ['Iran', 'Tehran'], ['Iraq', 'Baghdad'],
  ['Sun', 'Day'], ['Moon', 'Night'], ['King', 'Crown'], ['Bird', 'Nest'], ['Fish', 'Water'], ['Bee', 'Honey'],
  ['Doctor', 'Hospital'], ['Teacher', 'School'], ['Pilot', 'Aeroplane'], ['Farmer', 'Field'], ['Chef', 'Kitchen'], ['Sailor', 'Ship'],
];

export const PROCESSES = [
  { t: 'Making a cup of tea', steps: ['Boil water in a kettle', 'Put tea leaves in the pot', 'Pour the hot water over the leaves', 'Let it brew for three minutes', 'Strain the tea into a cup', 'Add sugar and stir', 'Serve it hot'] },
  { t: 'Planting a seed', steps: ['Dig a small hole in the soil', 'Place the seed in the hole', 'Cover the seed with soil', 'Water the soil gently', 'Keep it in sunlight', 'Watch the sprout appear', 'Tend the young plant daily'] },
  { t: 'Sending a letter', steps: ['Write the letter on paper', 'Fold the letter neatly', 'Place it in an envelope', 'Write the address on the envelope', 'Stick a stamp on the corner', 'Drop it in the post box', 'The postman delivers it'] },
  { t: 'Baking bread', steps: ['Mix flour, yeast and water', 'Knead the dough well', 'Leave the dough to rise', 'Shape the dough into a loaf', 'Preheat the oven', 'Bake until golden brown', 'Cool the bread on a rack'] },
];

export function makeRandomSentence(): { text: string; slots: { who: string; what: string; where: string } } {
  const pick = ri(0, 2);
  if (pick === 0) {
    const n = sample(NAMES, 1)[0];
    const p = ri(2, 9);
    const c = sample(['Kochi', 'Calicut', 'Malappuram', 'Thrissur', 'Kannur'], 1)[0];
    return {
      text: `${n} bought ${p} notebooks from a shop in ${c} on Friday morning.`,
      slots: { who: n, what: `${p} notebooks`, where: c },
    };
  }
  if (pick === 1) {
    const n = sample(NAMES, 1)[0];
    const pet = sample(['cat', 'parrot', 'goat', 'pigeon'], 1)[0];
    return {
      text: `The ${pet} of ${n} drank water and slept under the mango tree at noon.`,
      slots: { who: n, what: pet, where: 'under the mango tree' },
    };
  }
  const p = ri(4, 15);
  const c = sample(['library', 'market', 'garden', 'harbour', 'school'], 1)[0];
  return {
    text: `Exactly ${p} children were reading story books in the ${c} when the bell rang.`,
    slots: { who: `${p} children`, what: 'story books', where: `the ${c}` },
  };
}

export const ROUND_NAMES = [
  'Word Memorization', 'Number Sequence Memory', 'Picture Memory', 'Sentence Memory', 'Alphabet Sequence Memory',
  'Colour Memory', 'Name and Number Memory', 'Object Counting Memory', 'Reverse Memory', 'Story Memory',
  'Word Position Memory', 'Symbol Memory', 'Shape Recognition', 'Pattern Memory', 'Face Recognition',
  'Location Memory', 'Direction Memory', 'Date and Time Memory', 'Object Arrangement Memory', 'Missing Item Memory',
  'Order Reconstruction', 'Audio Memory', 'Visual Observation Memory', 'Mathematical Sequence Memory', 'Pair Matching Memory',
  'Paragraph Reproduction', 'Mixed Information Memory', 'Image Detail Identification', 'Logical Recall Challenge',
  'Grand Finale – Ultimate Memory Challenge',
];

export const BNO14_PASSAGE = `In the village of Thennala, beside the slow green river, stood a small library built in the year 1962. Its librarian, an old man named Kunhimoideen, opened its doors every morning at seven o'clock. The library held exactly 4,250 books, arranged on nine tall wooden shelves. On the wall hung a blue clock that had not worked for twelve years, yet nobody wished to remove it. Every Friday, twenty school children came to hear Kunhimoideen read a story under the banyan tree outside. He always began with the same words: "A village that reads, remembers." When he retired at the age of seventy-five, the children planted a mango sapling beside the library door, so that its shade would guard the books for years to come.`;
export const BNO14_ITEMS = ['red umbrella', 'brass key', 'blue cup', 'pencil', 'banana', 'green book', 'silver spoon', 'white shoe', 'orange ball', 'glass bottle', 'yellow flower', 'black watch'];

export const BT_MODES: { id: BrainModeId; name: string; ico: string; desc: string }[] = [
  { id: 'number', name: 'Number Memory', ico: '123', desc: 'A digit sequence flashes up — memorise it and type it back exactly.' },
  { id: 'pattern', name: 'Pattern Memory', ico: '▦', desc: 'A pattern of lit squares appears — rebuild it on the empty grid.' },
  { id: 'color', name: 'Color Memory', ico: '●●●', desc: 'Colours appear in an order — replay the same order from memory.' },
  { id: 'word', name: 'Word Memory', ico: 'Aa', desc: 'Study a list of words — then pick every word you saw from a longer list.' },
  { id: 'sequence', name: 'Sequence Memory', ico: '»»', desc: 'Four pads flash in a growing sequence — repeat it by tapping the pads.' },
  { id: 'grid', name: 'Grid Memory', ico: '▤', desc: 'Tiles light up one by one — tap every tile that lit up.' },
];

export const BADGES: BadgeDef[] = [
  { id: 'first', ico: '👣', name: 'First Steps', how: 'Finish your first game' },
  { id: 'sharp', ico: '🎯', name: 'Sharp Mind', how: 'Score 80% or more in the Arena' },
  { id: 'speed', ico: '⚡', name: 'Speed Star', how: 'Clear a Brain Training stage super fast' },
  { id: 'master', ico: '👑', name: 'Memory Master', how: 'Finish all 30 Arena rounds' },
  { id: 'explorer', ico: '🧭', name: 'Explorer', how: 'Try all 6 Brain Training modes' },
  { id: 'fire', ico: '🔥', name: 'On Fire', how: 'Clear 3 Brain Training stages in a row' },
];

export const CHEERS = [
  'Superb! Nee oru memory star aanu! ⭐',
  'Adipoli! Your brain is shining bright! ✨',
  'Great going — ormma shakti polichu! 💪',
  'Lovely recall! Keep this josh going! 🎉',
  'Wah, fantastic! Brain full power! 🔋',
  'Nalla pani! That memory is getting sharper! 🗡️',
  'Brilliant! You are on a joyful roll! 🎈',
  'Polichadukki! One more round, one more smile! 😄',
];

export const TIPS = [
  'Chunk it! Grouping 9 digits as 3-3-3 makes them three times easier to hold. Try it in Number Memory!',
  'Your brain loves pictures — turn a word into a funny image in your mind and it sticks like glue. 🎨',
  "Sleep is memory's best friend: your brain files the day's memories while you dream. 😴",
  'Say it aloud! Hearing a list in your own voice gives your memory a second doorway in. 🗣️',
  'The memory palace trick: place each item in a room of your house, then walk through and collect them. 🏠',
  'Short, happy practice beats one long grind — five joyful minutes daily grows a champion memory. 🌱',
  'Smell and memory are neighbours in the brain — a familiar scent can bring back a whole day! 🌸',
  'Teach what you memorised to a friend — explaining is the strongest glue of all. 🤝',
  "Movement helps memory: a short walk before a game wakes up your brain's recording button. 🚶",
  'Curiosity is a memory magnet — things you find interesting are remembered almost for free. 🔍',
];

export const DAILY_TWISTS = [
  "Today's twist: play it on your chosen difficulty and clear Stage 1 with a smile!",
  "Today's twist: beat your own calm — no rushing, just steady, joyful recall.",
  "Today's twist: clear Stage 1, then try to beat that score on Stage 2!",
  "Today's twist: play it once with full concentration, phone face-down. You can do it!",
  "Today's twist: clear Stage 1 and cheer for yourself — out loud! 🎉",
  "Today's twist: finish Stage 1, then teach the trick you used to a friend.",
];

export const SPIN_SEGS = [
  { pts: 10, c: '#ef476f' }, { pts: 50, c: '#ffb703' }, { pts: 20, c: '#2fbf71' }, { pts: 100, c: '#a55eea' },
  { pts: 30, c: '#4cc9f0' }, { pts: 200, c: '#ff9f43' }, { pts: 40, c: '#f368e0' }, { pts: 75, c: '#4361ee' },
];
