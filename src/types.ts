export type ScreenId = 'auth' | 'home' | 'game' | 'brain' | 'results';

export type PaperId = 'dhaakira' | 'bno14';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type BrainModeId = 'number' | 'pattern' | 'color' | 'word' | 'sequence' | 'grid';

export interface UserAccount {
  name: string;
  pass: string;
  adno: number;
}

export interface RoundScore {
  name: string;
  got: number;
  max: number;
}

export interface LeaderboardEntry {
  name: string;
  adno: number;
  paper: 'DHAAKIRA' | 'BNO14';
  level: DifficultyLevel;
  got: number;
  max: number;
  pct: number;
  when: Date;
}

export interface ThemeSpec {
  name: string;
  hue: number;
  hue2: number;
  mode: 'dark' | 'light';
}

export interface ThemePalette {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  muted: string;
  accent: string;
  accent2: string;
  line: string;
}

export interface CharacterInfo {
  emoji: string;
  name: string;
  cartoon: string;
  grad: [string, string];
  num: number;
}

export type DanceTier = 'cry' | 'regret' | 'smile' | 'mega';

export interface ObjectItem {
  e: string;
  n: string;
}

export interface ColorItem {
  n: string;
  c: string;
}

export interface DirItem {
  n: string;
  a: string;
}

export interface ShapeItem {
  n: string;
  paths: (color: string) => string;
}

export interface BadgeDef {
  id: 'first' | 'sharp' | 'speed' | 'master' | 'explorer' | 'fire';
  ico: string;
  name: string;
  how: string;
}
