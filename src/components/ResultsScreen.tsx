import React from 'react';
import type { DifficultyLevel, LeaderboardEntry, PaperId, RoundScore, UserAccount } from '../types';
import { avatarDesc, charFor } from '../data/characters';
import { copyText, downloadBlob, fmtMarks } from '../utils/helpers';
import { DancerAvatar } from './Avatar';
import { LeaderboardCard } from './LeaderboardCard';

interface ResultsScreenProps {
  user: UserAccount;
  paper: PaperId;
  level: DifficultyLevel;
  reason: 'done' | 'time' | 'stopped';
  scores: RoundScore[];
  got: number;
  max: number;
  pct: number;
  leaderboard: LeaderboardEntry[];
  onPlayAgain: () => void;
  onHome: () => void;
  onNotify: (msg: string) => void;
}

function gradeWord(pct: number): string {
  if (pct >= 90) return '🏆 Memory Legend!';
  if (pct >= 75) return '🌟 Outstanding memory!';
  if (pct >= 60) return '👏 Strong recall!';
  if (pct >= 45) return '💪 Good effort — keep training!';
  if (pct >= 30) return '🌱 A fair start — practise daily!';
  return '🔁 Every champion began somewhere — try again!';
}

function moodLine(pct: number): string {
  if (pct >= 90) return '👑 CHAMPION MODE! Your memory deserves its own trophy shelf — the Arena bows to you!';
  if (pct >= 75) return '🌟 Superstar recall! Somewhere, a goldfish is taking notes from you. 🐠';
  if (pct >= 60) return '🎉 Lovely work! Your brain is doing happy little dances right now.';
  if (pct >= 45) return "💪 Solid effort! Your memory muscles grew a little today — feel that burn? That's growth!";
  if (pct >= 30) return '🌱 A cheerful start! Even elephants began with small steps. Tomorrow, you roar! 🦁';
  return '😄 Plot twist: your brain was just warming up! Every legend has a funny first chapter — play again and watch the comeback!';
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  user,
  paper,
  level,
  reason,
  scores,
  got,
  max,
  pct,
  leaderboard,
  onPlayAgain,
  onHome,
  onNotify,
}) => {
  const c = charFor(user.adno);

  const buildReport = (): string => {
    const lines: string[] = [];
    lines.push('DHAAKIRA – The Grand Memory Arena');
    lines.push("SIBAQ'26 – National Arts Fest · Darul Huda Islamic University");
    lines.push('Observe. Remember. Recall.');
    lines.push('----------------------------------------');
    lines.push(`Name: ${user.name}`);
    lines.push(`Ad.No: ${user.adno}`);
    lines.push(`Avatar: ${avatarDesc(user.adno)} (chosen from this Ad.No; the same character appears at every sign-in)`);
    lines.push(`Paper: ${paper === 'dhaakira' ? 'DHAAKIRA (30 rounds)' : 'BNO14 Memory Test (5 stages)'}`);
    lines.push(`Level: ${level[0].toUpperCase() + level.slice(1)}`);
    lines.push(`Date: ${new Date().toLocaleString()}`);
    lines.push(
      `Finished: ${
        reason === 'time'
          ? 'Time up — auto-submitted'
          : reason === 'stopped'
            ? 'Stopped early by player'
            : 'Completed all rounds'
      }`
    );
    lines.push('----------------------------------------');
    scores.forEach((r, i) => lines.push(`${String(i + 1).padStart(2, ' ')}. ${r.name} — ${fmtMarks(r.got)} / ${r.max}`));
    lines.push('----------------------------------------');
    lines.push(`TOTAL: ${fmtMarks(got)} / ${max}`);
    lines.push(`PERCENTAGE: ${pct.toFixed(1)}%`);
    lines.push(gradeWord(pct));
    return lines.join('\n');
  };

  const reportTxt = buildReport();

  return (
    <section className="animate-fadein">
      <div
        className="my-4 rounded-2xl border p-5"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--line)',
          boxShadow: '0 12px 32px rgba(0,0,0,.22)',
        }}
      >
        <h2 className="font-display text-xl font-bold text-center m-0">
          {reason === 'time'
            ? "⏰ Time's up — auto-submitted!"
            : reason === 'stopped'
              ? '■ Game stopped'
              : '🏁 Arena complete!'}
        </h2>

        <div className="flex justify-center mt-2.5 mb-0.5">
          <DancerAvatar adno={user.adno} pct={pct} />
        </div>
        <div
          className="font-display font-bold text-[13.5px] tracking-[0.14em] text-center mt-2"
          style={{
            color: 'var(--accent2)',
            textShadow: '0 0 12px color-mix(in srgb, var(--accent2) 55%, transparent)',
          }}
        >
          This is your avatar
        </div>
        <div className="text-center mt-2">
          <span className="font-display font-extrabold text-[21px]">
            {c.emoji} {c.name}
          </span>
          <br />
          <span className="font-bold text-[13.5px]" style={{ color: 'var(--muted)' }}>
            from {c.cartoon}
          </span>
        </div>

        <div
          className="font-display font-extrabold text-[clamp(58px,15vw,96px)] text-center leading-none mt-1.5 mb-0.5 tabular-nums"
          style={{ color: 'var(--accent)' }}
        >
          {pct.toFixed(1)}%
        </div>
        <div className="text-center text-[19px] font-extrabold tabular-nums">
          {user.name} · Ad.No {user.adno}
          <br />
          {fmtMarks(got)} / {max} marks · {paper === 'dhaakira' ? 'DHAAKIRA' : 'BNO14'} · {level}
        </div>
        <p className="text-center text-[17px] font-extrabold mt-2.5 mb-1">{gradeWord(pct)}</p>
        <p className="text-center text-[16.5px] font-extrabold leading-normal my-2.5 mx-auto max-w-[520px]">
          {moodLine(pct)}
        </p>

        <h3 className="font-display text-base font-bold tracking-[0.04em] mt-4.5 mb-2">
          Round-wise marks
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th
                className="font-display tracking-[0.05em] text-[12.5px] py-2 px-2 border-b text-left"
                style={{ color: 'var(--muted)', borderColor: 'var(--line)' }}
              >
                Round
              </th>
              <th
                className="py-2 px-2 border-b"
                style={{ borderColor: 'var(--line)' }}
              />
              <th
                className="font-display tracking-[0.05em] text-[12.5px] py-2 px-2 border-b text-right"
                style={{ color: 'var(--muted)', borderColor: 'var(--line)' }}
              >
                Marks
              </th>
            </tr>
          </thead>
          <tbody>
            {scores.map((r, i) => (
              <tr key={`${r.name}-${i}`}>
                <td className="py-2 px-2 border-b" style={{ borderColor: 'var(--line)' }}>
                  <span className="tabular-nums">{i + 1}.</span> {r.name}
                </td>
                <td className="py-2 px-2 border-b" style={{ borderColor: 'var(--line)' }}>
                  <div
                    className="rounded-full h-2 overflow-hidden min-w-[70px]"
                    style={{ background: 'var(--surface2)' }}
                  >
                    <div
                      className="h-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                        width: `${r.max ? (r.got / r.max) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </td>
                <td
                  className="py-2 px-2 border-b text-right tabular-nums"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <b>{fmtMarks(r.got)}</b> / {r.max}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-2.5 flex-wrap mt-3.5">
          <button
            type="button"
            onClick={() => downloadBlob(reportTxt, `dhaakira-result-${user.adno}.txt`, 'text/plain')}
            className="flex-1 min-w-[150px] min-h-[44px] rounded-xl px-4 py-2.5 font-bold text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
          >
            ⬇ Download result report
          </button>
          <button
            type="button"
            onClick={() => copyText(reportTxt, onNotify)}
            className="flex-1 min-w-[150px] min-h-[44px] rounded-xl border px-4 py-2.5 font-bold cursor-pointer"
            style={{
              background: 'var(--surface2)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }}
          >
            📋 Copy report
          </button>
        </div>

        <div className="flex gap-2.5 flex-wrap mt-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="btn-celebrate flex-1 min-w-[150px] min-h-[48px] rounded-xl px-4 py-2.5 font-bold text-white text-base cursor-pointer"
          >
            🎉 Play again — celebrate!
          </button>
          <button
            type="button"
            onClick={onHome}
            className="flex-1 min-w-[150px] min-h-[48px] rounded-xl border px-4 py-2.5 font-bold cursor-pointer"
            style={{
              background: 'var(--surface2)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }}
          >
            ⌂ Home
          </button>
        </div>
      </div>

      <LeaderboardCard entries={leaderboard} />
    </section>
  );
};
