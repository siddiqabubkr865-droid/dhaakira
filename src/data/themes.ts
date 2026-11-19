import type { ThemePalette, ThemeSpec } from '../types';

const RAW_THEMES: [string, number, number, 'dark' | 'light'][] = [
  ['Neon', 262, 320, 'dark'], ['Candy', 335, 190, 'light'], ['Ocean', 205, 170, 'dark'], ['Night', 240, 280, 'dark'],
  ['Galaxy', 268, 210, 'dark'], ['Rainbow', 350, 200, 'light'], ['Jungle', 140, 80, 'dark'], ['Space', 230, 290, 'dark'],
  ['Underwater', 190, 160, 'dark'], ['Fire', 16, 45, 'dark'], ['Ice', 195, 220, 'light'], ['Forest', 135, 90, 'dark'],
  ['Desert', 38, 20, 'light'], ['Sunset', 18, 320, 'dark'], ['Sunrise', 32, 350, 'light'], ['Flower Garden', 330, 120, 'light'],
  ['Butterfly', 285, 45, 'light'], ['Crystal', 185, 260, 'light'], ['Golden', 45, 30, 'dark'], ['Silver', 220, 210, 'light'],
  ['Pastel', 300, 160, 'light'], ['Chocolate', 24, 36, 'dark'], ['Fantasy', 280, 330, 'dark'], ['Cyberpunk', 300, 180, 'dark'],
  ['Magic', 265, 45, 'dark'], ['Winter', 205, 190, 'light'], ['Summer', 45, 160, 'light'], ['Rainbow Candy', 340, 170, 'light'],
  ['Dark Mystery', 255, 200, 'dark'], ['Dream World', 290, 190, 'light'],
  ['Diamond Rush', 190, 45, 'dark'], ['Neon City', 315, 190, 'dark'], ['Jelly World', 320, 150, 'light'], ['Pop Art', 350, 55, 'light'],
  ['Rainbow Lights', 275, 130, 'dark'], ['Electric Storm', 225, 55, 'dark'], ['Cosmic Dust', 255, 330, 'dark'], ['Star Dust', 250, 45, 'light'],
  ['Moon Garden', 235, 140, 'dark'], ['Solar System', 28, 210, 'dark'], ['Planet World', 210, 120, 'dark'], ['Mars Mission', 14, 35, 'dark'],
  ['Alien World', 110, 280, 'dark'], ['UFO Zone', 150, 260, 'dark'], ['Space Station', 215, 180, 'dark'], ['Meteor Shower', 240, 30, 'dark'],
  ['Galaxy Lights', 272, 190, 'dark'], ['Astro Land', 228, 320, 'light'], ['Lava World', 10, 40, 'dark'], ['Volcano Island', 18, 150, 'dark'],
  ['Frozen Kingdom', 200, 240, 'light'], ['Arctic World', 198, 170, 'light'], ['Polar Lights', 160, 290, 'dark'], ['Ice Castle', 205, 260, 'light'],
  ['Snowflake World', 202, 215, 'light'], ['Crystal Cave', 180, 280, 'dark'], ['Golden Kingdom', 46, 25, 'dark'], ['Silver Moon', 225, 45, 'light'],
  ['Royal Palace', 275, 45, 'dark'], ['Treasure Island', 42, 170, 'dark'], ['Pirate World', 20, 205, 'dark'], ['Secret Island', 160, 40, 'light'],
  ['Ancient Egypt', 40, 200, 'light'], ['Pyramid Land', 36, 24, 'light'], ['Lost Kingdom', 85, 30, 'dark'], ['Dragon World', 5, 130, 'dark'],
  ['Unicorn Land', 300, 180, 'light'], ['Mermaid World', 185, 320, 'light'], ['Fairy Garden', 320, 130, 'light'], ['Magic School', 258, 42, 'dark'],
  ['Wizard World', 248, 300, 'dark'], ['Potion Lab', 130, 290, 'dark'], ['Enchanted Castle', 282, 200, 'dark'], ['Mystery Mansion', 230, 20, 'dark'],
  ['Haunted House', 255, 90, 'dark'], ['Halloween Night', 24, 280, 'dark'], ['Pumpkin Land', 26, 110, 'light'], ['Carnival World', 345, 200, 'light'],
  ['Circus Land', 355, 230, 'light'], ['Funfair', 320, 45, 'light'], ['Balloon Festival', 200, 340, 'light'], ['Toy Kingdom', 350, 160, 'light'],
  ['Lego World', 355, 210, 'light'], ['Miniature World', 150, 330, 'light'], ['Paper World', 40, 190, 'light'], ['Origami Land', 170, 350, 'light'],
  ['Rainbow Blocks', 0, 240, 'light'], ['Geometric World', 210, 330, 'dark'], ['Puzzle Land', 95, 260, 'light'], ['Optical Illusion', 0, 0, 'dark'],
  ['Neon Maze', 290, 140, 'dark'], ['Mirror World', 210, 210, 'light'], ['Shadow Land', 240, 240, 'dark'], ['Monochrome', 0, 0, 'light'],
  ['Pastel Dreams', 310, 170, 'light'], ['Velvet World', 330, 270, 'dark'], ['Silk Touch', 25, 330, 'light'], ['Glitter World', 45, 300, 'light'],
  ['Hologram World', 185, 300, 'dark'], ['Infinity World', 245, 175, 'dark'],
];

export const THEMES: ThemeSpec[] = RAW_THEMES.map(([name, hue, hue2, mode]) => ({
  name,
  hue,
  hue2,
  mode,
}));

export function themePalette(t: ThemeSpec): ThemePalette {
  const { name, hue: h, hue2: h2, mode } = t;
  if (name === 'Monochrome') {
    return {
      bg: '#f4f4f4',
      surface: '#ffffff',
      surface2: '#e9e9e9',
      ink: '#17181c',
      muted: '#5c5f66',
      accent: '#17181c',
      accent2: '#6b7280',
      line: '#cfcfcf',
    };
  }
  if (name === 'Optical Illusion') {
    return {
      bg: '#0a0a0a',
      surface: '#161616',
      surface2: '#222222',
      ink: '#f5f5f5',
      muted: '#a3a3a3',
      accent: '#ffffff',
      accent2: '#8a8a8a',
      line: '#3a3a3a',
    };
  }
  if (mode === 'dark') {
    return {
      bg: `hsl(${h} 42% 9%)`,
      surface: `hsl(${h} 38% 15%)`,
      surface2: `hsl(${h} 36% 21%)`,
      ink: `hsl(${h} 30% 94%)`,
      muted: `hsl(${h} 22% 68%)`,
      accent: `hsl(${h} 88% 62%)`,
      accent2: `hsl(${h2} 88% 64%)`,
      line: `hsl(${h} 32% 30%)`,
    };
  }
  return {
    bg: `hsl(${h} 62% 93%)`,
    surface: `hsl(${h} 70% 98.5%)`,
    surface2: `hsl(${h} 58% 89%)`,
    ink: `hsl(${h} 32% 15%)`,
    muted: `hsl(${h} 20% 40%)`,
    accent: `hsl(${h} 78% 44%)`,
    accent2: `hsl(${h2} 78% 46%)`,
    line: `hsl(${h} 38% 76%)`,
  };
}

export function applyThemeToDom(t: ThemeSpec): void {
  const p = themePalette(t);
  const r = document.documentElement.style;
  r.setProperty('--bg', p.bg);
  r.setProperty('--surface', p.surface);
  r.setProperty('--surface2', p.surface2);
  r.setProperty('--ink', p.ink);
  r.setProperty('--muted', p.muted);
  r.setProperty('--accent', p.accent);
  r.setProperty('--accent2', p.accent2);
  r.setProperty('--line', p.line);
  document.documentElement.style.colorScheme =
    t.mode === 'dark' || t.name === 'Optical Illusion' ? 'dark' : 'light';
}
