export const rnd = (n: number): number => Math.floor(Math.random() * n);
export const ri = (a: number, b: number): number => a + rnd(b - a + 1);

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export function fmtClock(s: number): string {
  const sec = Math.max(0, Math.ceil(s));
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

export function fmtMarks(x: number): string {
  return (Math.round(x * 10) / 10).toString().replace(/\.0$/, '');
}

export function dayIndex(): number {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

export function downloadBlob(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function downloadOfflineHtml(onNotify: (msg: string) => void): Promise<void> {
  try {
    const res = await fetch('/assets/aistudio/dhaakira-download-version_02b7bdba.html');
    if (!res.ok) throw new Error('Asset fetch failed');
    const html = await res.text();
    downloadBlob(html, 'dhaakira-grand-memory-arena.html', 'text/html');
    onNotify('Downloading DHAAKIRA — one HTML file, works offline ✓');
  } catch {
    onNotify('Offline HTML download is unavailable right now.');
  }
}

export function copyText(txt: string, onNotify: (msg: string) => void): void {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(
      () => onNotify('Report copied ✓'),
      () => fallbackCopy(txt, onNotify)
    );
  } else {
    fallbackCopy(txt, onNotify);
  }
}

function fallbackCopy(txt: string, onNotify: (msg: string) => void): void {
  const ta = document.createElement('textarea');
  ta.value = txt;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    onNotify('Report copied ✓');
  } catch {
    onNotify('Copy failed — use Download instead');
  }
  ta.remove();
}

// Gentle Web Audio synthesized feedback for 2D game tactile feel
let audioCtx: AudioContext | null = null;
export function playTone(freq: number, durationMs = 110, type: OscillatorType = 'sine', volume = 0.05): void {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + durationMs / 1000);
  } catch {
    // Ignore audio errors when blocked
  }
}
