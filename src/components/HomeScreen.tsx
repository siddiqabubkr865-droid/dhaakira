import React, { useState } from 'react';
import type {
  BadgeDef,
  BrainModeId,
  DifficultyLevel,
  LeaderboardEntry,
  PaperId,
  ThemeSpec,
  UserAccount,
} from '../types';
import { CHARACTERS, charFor } from '../data/characters';
import {
  BADGES,
  BT_MODES,
  DAILY_TWISTS,
  ROUND_NAMES,
  SPIN_SEGS,
  TIPS,
} from '../data/pools';
import { dayIndex, rnd } from '../utils/helpers';
import { Avatar } from './Avatar';
import { InstallDownloadOptions } from './InstallDownloadOptions';
import { LeaderboardCard } from './LeaderboardCard';
import { ThemePicker } from './ThemePicker';

interface HomeScreenProps {
  user: UserAccount;
  currentTheme: ThemeSpec;
  onSelectTheme: (t: ThemeSpec) => void;
  paper: PaperId;
  onSelectPaper: (p: PaperId) => void;
  level: DifficultyLevel;
  onSelectLevel: (l: DifficultyLevel) => void;
  onStartArena: () => void;
  btDiff: DifficultyLevel;
  onSelectBtDiff: (l: DifficultyLevel) => void;
  btTotal: number;
  btBests: Partial<Record<BrainModeId, number>>;
  onStartBrainMode: (mode: BrainModeId) => void;
  badges: Partial<Record<BadgeDef['id'], boolean>>;
  lastAwardedBadge: BadgeDef['id'] | null;
  dailyDone: boolean;
  dailyMode: BrainModeId;
  spun: boolean;
  spinAngle: number;
  spinResultText: string;
  onSpinWheel: (winIdx: number, nextAngle: number) => void;
  leaderboard: LeaderboardEntry[];
  onSignOut: () => void;
  onNotify: (msg: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  currentTheme,
  onSelectTheme,
  paper,
  onSelectPaper,
  level,
  onSelectLevel,
  onStartArena,
  btDiff,
  onSelectBtDiff,
  btTotal,
  btBests,
  onStartBrainMode,
  badges,
  lastAwardedBadge,
  dailyDone,
  dailyMode,
  spun,
  spinAngle,
  spinResultText,
  onSpinWheel,
  leaderboard,
  onSignOut,
  onNotify,
}) => {
  const [tipIdx, setTipIdx] = useState(() => dayIndex());
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const hc = charFor(user.adno);
  const earnedCount = BADGES.filter((b) => badges[b.id]).length;
  const dailyModeObj = BT_MODES.find((m) => m.id === dailyMode) ?? BT_MODES[0];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const segDeg = 360 / SPIN_SEGS.length;
  const wheelGradient = `conic-gradient(${SPIN_SEGS.map(
    (s, i) => `${s.c} ${i * segDeg}deg ${(i + 1) * segDeg}deg`
  ).join(', ')})`;

  const handleSpin = () => {
    if (spun || spinning) return;
    setSpinning(true);
    const winIdx = rnd(SPIN_SEGS.length);
    const targetMod = (360 - (winIdx + 0.5) * segDeg) % 360;
    const curMod = ((spinAngle % 360) + 360) % 360;
    let delta = targetMod - curMod;
    if (delta < 0) delta += 360;
    const nextAngle = spinAngle + 360 * 5 + delta;
    onSpinWheel(winIdx, nextAngle);
    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => setSpinning(false), reduce ? 700 : 4400);
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    borderColor: 'var(--line)',
    boxShadow: '0 12px 32px rgba(0,0,0,.22), 0 0 26px color-mix(in srgb, var(--accent) 10%, transparent)',
  };

  return (
    <section className="animate-fadein">
      {/* User bar */}
      <div className="my-4 rounded-2xl border p-5" style={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="font-extrabold flex items-center gap-3 flex-wrap">
            <span className="inline-flex flex-col items-center gap-0.5">
              <Avatar adno={user.adno} />
              <span
                className="font-display font-bold text-[11px] tracking-[0.1em]"
                style={{ color: 'var(--accent2)' }}
              >
                This is your avatar
              </span>
            </span>
            <span>
              <span>{user.name}</span> · Ad.No{' '}
              <span
                className="font-display tracking-[0.08em] tabular-nums"
                style={{ color: 'var(--accent2)' }}
              >
                {user.adno}
              </span>
              <br />
              <span className="font-extrabold" style={{ color: 'var(--accent)' }}>
                {hc.emoji} {hc.name} · {hc.cartoon}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="min-h-[44px] rounded-xl border px-4 py-2 font-bold cursor-pointer whitespace-nowrap"
            style={{
              background: 'var(--surface2)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* My Badges */}
      <div className="my-4 rounded-2xl border p-5" style={cardStyle}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display text-xl font-bold tracking-[0.04em] m-0">🏅 My Badges</h2>
          <span className="text-[13px] font-extrabold tabular-nums" style={{ color: 'var(--muted)' }}>
            {earnedCount} / 6 earned
          </span>
        </div>
        <p className="text-[13px] mt-1 mb-0" style={{ color: 'var(--muted)' }}>
          Badges light up as you play — they stay lit for this visit. Collect all six!
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2.5">
          {BADGES.map((b) => {
            const lit = Boolean(badges[b.id]);
            const pop = lastAwardedBadge === b.id;
            return (
              <div
                key={b.id}
                className={`text-center rounded-[14px] border-[1.5px] px-2 py-3 transition-all ${
                  pop ? 'animate-badgepop' : ''
                }`}
                style={{
                  background: 'var(--surface2)',
                  borderColor: lit ? 'var(--accent2)' : 'var(--line)',
                  opacity: lit ? 1 : 0.42,
                  filter: lit ? 'none' : 'grayscale(0.85)',
                  boxShadow: lit
                    ? '0 0 18px color-mix(in srgb, var(--accent2) 35%, transparent)'
                    : undefined,
                }}
              >
                <div className="text-[30px] leading-[1.1]">{b.ico}</div>
                <div className="font-extrabold text-[13px] mt-1">{b.name}</div>
                <div className="text-[11px] font-semibold leading-[1.35] mt-0.5" style={{ color: 'var(--muted)' }}>
                  {lit ? '✓ Earned!' : b.how}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brain Tip of the Day */}
      <div className="my-4 rounded-2xl border p-5" style={cardStyle}>
        <h3 className="font-display text-base font-bold tracking-[0.04em] m-0 mb-2">
          💡 Brain Tip of the Day
        </h3>
        <p className="text-[15.5px] font-bold leading-[1.55] m-0">{TIPS[tipIdx % TIPS.length]}</p>
        <button
          type="button"
          onClick={() => setTipIdx((i) => i + 1)}
          className="mt-3.5 min-h-[44px] rounded-xl border px-4 py-2 font-bold cursor-pointer"
          style={{
            background: 'var(--surface2)',
            borderColor: 'var(--line)',
            color: 'var(--ink)',
          }}
        >
          🔄 Another tip
        </button>
      </div>

      {/* Theme Picker */}
      <ThemePicker
        currentTheme={currentTheme}
        onSelectTheme={onSelectTheme}
        onNotify={onNotify}
      />

      {/* Choose your paper */}
      <div className="my-4 rounded-2xl border p-5" style={cardStyle}>
        <h2 className="font-display text-xl font-bold tracking-[0.04em] m-0 mb-2.5">
          Choose your paper
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelectPaper('dhaakira')}
            className="text-left rounded-[14px] border-2 p-4 cursor-pointer w-full transition-all"
            style={{
              background: 'var(--surface2)',
              borderColor: paper === 'dhaakira' ? 'var(--accent)' : 'var(--line)',
              color: 'var(--ink)',
              boxShadow:
                paper === 'dhaakira'
                  ? '0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent)'
                  : undefined,
            }}
          >
            <div className="font-display font-extrabold text-lg">DHAAKIRA</div>
            <p className="text-[13px] mt-1.5 mb-0" style={{ color: 'var(--muted)' }}>
              The Grand Memory Arena — <b>30 rounds</b>, 100 marks, one 30-minute clock.
            </p>
          </button>
          <button
            type="button"
            onClick={() => onSelectPaper('bno14')}
            className="text-left rounded-[14px] border-2 p-4 cursor-pointer w-full transition-all"
            style={{
              background: 'var(--surface2)',
              borderColor: paper === 'bno14' ? 'var(--accent)' : 'var(--line)',
              color: 'var(--ink)',
              boxShadow:
                paper === 'bno14'
                  ? '0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent)'
                  : undefined,
            }}
          >
            <div className="font-display font-extrabold text-lg">BNO14 · Memory Test</div>
            <p className="text-[13px] mt-1.5 mb-0" style={{ color: 'var(--muted)' }}>
              The official-style paper — <b>5 stages</b> with judge&apos;s instructions, 100 marks, 30
              minutes.
            </p>
          </button>
        </div>

        <label className="block font-bold text-[13.5px] mt-3.5 mb-1.5">Level</label>
        <div className="flex gap-2 flex-wrap">
          {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((lvl) => {
            const sel = level === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onSelectLevel(lvl)}
                className="flex-1 min-w-[100px] min-h-[44px] rounded-xl border px-4 py-2 font-bold cursor-pointer capitalize whitespace-nowrap"
                style={{
                  background: sel ? 'var(--accent)' : 'var(--surface2)',
                  borderColor: sel ? 'var(--accent)' : 'var(--line)',
                  color: sel ? '#fff' : 'var(--ink)',
                }}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        <p className="text-[13px] mt-3 mb-3" style={{ color: 'var(--muted)' }}>
          100 marks · 30 minutes on one clock · auto-submits when time ends · fresh material every
          play · unlimited replays · automatic scoring, no negative marking.
        </p>

        <button
          type="button"
          onClick={onStartArena}
          className="w-full min-h-[48px] rounded-[14px] px-6 py-3.5 text-[17px] font-bold text-white cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            boxShadow: '0 6px 22px color-mix(in srgb, var(--accent) 45%, transparent)',
          }}
        >
          ▶ Enter the Arena
        </button>

        <InstallDownloadOptions onNotify={onNotify} />

        <details className="mt-2.5">
          <summary className="cursor-pointer font-extrabold py-2 min-h-[36px]">
            See all 30 rounds in order
          </summary>
          <ol className="mt-1.5 pl-6 columns-1 sm:columns-2 gap-7">
            {ROUND_NAMES.map((rn) => (
              <li key={rn} className="py-0.5 text-[13.5px] break-inside-avoid">
                {rn}
              </li>
            ))}
          </ol>
        </details>
      </div>

      {/* Brain Training Modes */}
      <div className="my-4 rounded-2xl border p-5" style={cardStyle}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display text-xl font-bold tracking-[0.04em] m-0">
            🧠 Brain Training Modes
          </h2>
          <div
            className="font-extrabold text-[15px] rounded-xl px-3.5 py-2 text-white tabular-nums"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              boxShadow: '0 0 20px color-mix(in srgb, var(--accent) 50%, transparent)',
            }}
          >
            ⭐ Total score: {btTotal} pts
          </div>
        </div>
        <p className="text-[13px] mt-1.5 mb-0" style={{ color: 'var(--muted)' }}>
          Six quick memory challenges, separate from the Arena. Every correct answer earns{' '}
          <b>points</b>, fast recalls earn a <b>speed bonus</b>, and each stage gets harder than
          the last. The Arena above keeps its own 100-marks scoring.
        </p>

        <label className="block font-bold text-[13.5px] mt-3.5 mb-1.5">
          Brain training difficulty
        </label>
        <div className="flex gap-2 flex-wrap mb-3">
          {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((lvl) => {
            const sel = btDiff === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onSelectBtDiff(lvl)}
                className="flex-1 min-w-[100px] min-h-[44px] rounded-xl border px-4 py-2 font-bold cursor-pointer capitalize whitespace-nowrap"
                style={{
                  background: sel ? 'var(--accent)' : 'var(--surface2)',
                  borderColor: sel ? 'var(--accent)' : 'var(--line)',
                  color: sel ? '#fff' : 'var(--ink)',
                }}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-1.5">
          {BT_MODES.map((m) => {
            const best = btBests[m.id];
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onStartBrainMode(m.id)}
                className="text-left w-full rounded-2xl border-[1.5px] p-4 cursor-pointer transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--surface2)',
                  borderColor: 'var(--line)',
                  color: 'var(--ink)',
                }}
              >
                <span
                  className="inline-flex items-center justify-center min-w-[52px] h-[52px] px-2.5 rounded-[14px] font-display font-extrabold text-[19px] text-white mb-2.5"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    boxShadow: '0 0 16px color-mix(in srgb, var(--accent) 45%, transparent)',
                  }}
                >
                  {m.ico}
                </span>
                <div className="font-display font-extrabold text-[16.5px] tracking-[0.03em]">
                  {m.name}
                </div>
                <div className="text-[13px] font-semibold my-1.5 leading-[1.45]" style={{ color: 'var(--muted)' }}>
                  {m.desc}
                </div>
                <div className="text-[12.5px] font-extrabold tabular-nums" style={{ color: 'var(--accent2)' }}>
                  {best ? `Best session: ${best} pts` : 'Not played yet — tap to start'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Challenge of the Day */}
      <div className="my-4 rounded-2xl border p-5" style={cardStyle}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display text-xl font-bold tracking-[0.04em] m-0">
            📅 Challenge of the Day
          </h2>
          {dailyDone && (
            <span
              className="font-extrabold text-[15px] rounded-xl px-3.5 py-2 text-white"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              }}
            >
              ✓ Done today!
            </span>
          )}
        </div>
        <p className="font-extrabold text-[16.5px] mt-2 mb-0.5">
          🎯 {dailyModeObj.name} — {dayNames[new Date().getDay()]} Special
        </p>
        <p className="text-[13px] m-0" style={{ color: 'var(--muted)' }}>
          {dailyModeObj.desc} {DAILY_TWISTS[dayIndex() % DAILY_TWISTS.length]} Clear Stage 1 to
          complete today&apos;s challenge.
        </p>
        <button
          type="button"
          onClick={() => onStartBrainMode(dailyMode)}
          className="mt-3.5 w-full min-h-[48px] rounded-[14px] px-6 py-3.5 text-[17px] font-bold text-white cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          }}
        >
          {dailyDone ? '✓ Completed today — play again for fun' : "▶ Play today's challenge"}
        </button>
        {dailyDone && (
          <p className="text-[13px] mt-2.5 mb-0 font-extrabold" style={{ color: 'var(--muted)' }}>
            🎉 Challenge complete for today — super work! A fresh one arrives tomorrow.
          </p>
        )}
      </div>

      {/* Lucky Spin */}
      <div className="my-4 rounded-2xl border p-5" style={cardStyle}>
        <h2 className="font-display text-xl font-bold tracking-[0.04em] m-0 text-center">
          🎡 Lucky Spin
        </h2>
        <p className="text-[13px] text-center mt-0.5 mb-2" style={{ color: 'var(--muted)' }}>
          One free spin per visit! Whatever you win is added as{' '}
          <b>bonus points to your Brain Training total only</b> — Arena marks are never touched.
        </p>
        <div className="flex flex-col items-center gap-1.5 mt-2">
          <div className="relative w-[min(260px,78vw)] aspect-square">
            <div
              className="absolute left-1/2 -top-2 -translate-x-1/2 z-[3] text-[26px] drop-shadow"
              style={{ color: 'var(--accent2)' }}
            >
              ▼
            </div>
            <div
              className="w-full h-full rounded-full border-[5px] relative overflow-hidden"
              style={{
                borderColor: 'var(--accent)',
                background: wheelGradient,
                boxShadow:
                  '0 0 30px color-mix(in srgb, var(--accent) 45%, transparent), inset 0 0 24px rgba(0,0,0,.25)',
                transform: `rotate(${spinAngle}deg)`,
                transition: 'transform 4.2s cubic-bezier(.12,.8,.16,1)',
              }}
            >
              {SPIN_SEGS.map((s, i) => {
                const a = (i + 0.5) * segDeg;
                return (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2 font-extrabold text-sm text-white whitespace-nowrap origin-top-left drop-shadow tabular-nums"
                    style={{ transform: `rotate(${a}deg) translate(58px,-50%)` }}
                  >
                    {s.pts}
                  </span>
                );
              })}
            </div>
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] w-16 h-16 rounded-full border-[3px] flex items-center justify-center text-[28px]"
              style={{ background: 'var(--surface)', borderColor: 'var(--accent2)' }}
            >
              🍀
            </div>
          </div>
          <div className="font-extrabold text-base min-h-[24px] text-center mt-1">
            {spinning ? 'Spinning… good luck! 🍀' : spinResultText}
          </div>
          <button
            type="button"
            disabled={spun || spinning}
            onClick={handleSpin}
            className="w-full max-w-[320px] min-h-[48px] rounded-[14px] px-6 py-3.5 text-[17px] font-bold text-white cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
          >
            {spun ? '✓ Spin used — see you next visit!' : '🎡 Spin the wheel!'}
          </button>
        </div>
      </div>

      {/* Meet the Avatars */}
      <div className="my-4 rounded-2xl border p-5" style={cardStyle}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display text-xl font-bold tracking-[0.04em] m-0">
            🎭 Meet the Avatars
          </h2>
          <button
            type="button"
            aria-expanded={galleryOpen}
            onClick={() => setGalleryOpen((o) => !o)}
            className="min-h-[44px] rounded-xl border px-4 py-2 font-bold cursor-pointer"
            style={{
              background: 'var(--surface2)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }}
          >
            {galleryOpen ? 'Hide gallery' : 'Browse all 124'}
          </button>
        </div>
        <p className="text-[13px] mt-1 mb-0" style={{ color: 'var(--muted)' }}>
          Every player gets one of these 124 cartoon characters as their avatar, chosen from their
          Ad.No. Yours wears a ⭐ star.
        </p>
        {galleryOpen && (
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(86px,1fr))] gap-2 mt-3 max-h-[380px] overflow-auto p-1 rounded-xl border border-dashed"
            style={{ borderColor: 'var(--line)' }}
          >
            {CHARACTERS.map((ch, i) => {
              const own = i + 1 === hc.num;
              return (
                <div
                  key={`${ch[1]}-${i}`}
                  className="text-center rounded-xl border-[1.5px] px-1 pt-2.5 pb-2"
                  style={{
                    background: 'var(--surface2)',
                    borderColor: own ? 'var(--accent2)' : 'var(--line)',
                    boxShadow: own
                      ? '0 0 0 2px color-mix(in srgb, var(--accent2) 45%, transparent), 0 0 16px color-mix(in srgb, var(--accent2) 30%, transparent)'
                      : undefined,
                  }}
                >
                  <div className="text-[30px] leading-[1.15]">{ch[0]}</div>
                  {own && <div className="text-sm">⭐</div>}
                  <div
                    className="text-[10.5px] font-bold leading-[1.25] mt-0.5"
                    style={{ color: own ? 'var(--ink)' : 'var(--muted)' }}
                  >
                    {ch[1]}
                  </div>
                  {own && (
                    <div
                      className="text-[9.5px] font-extrabold tracking-[0.04em] mt-0.5"
                      style={{ color: 'var(--accent2)' }}
                    >
                      This is your avatar
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <LeaderboardCard entries={leaderboard} />
    </section>
  );
};
