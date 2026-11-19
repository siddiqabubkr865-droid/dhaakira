import React from 'react';
import type { LeaderboardEntry } from '../types';
import { charFor } from '../data/characters';
import { fmtMarks } from '../utils/helpers';
import { Avatar } from './Avatar';

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ entries }) => {
  const sorted = entries.slice().sort((a, b) => b.pct - a.pct || b.got - a.got);

  return (
    <div
      className="my-4 rounded-2xl border p-5"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--line)',
        boxShadow: '0 12px 32px rgba(0,0,0,.22), 0 0 26px color-mix(in srgb, var(--accent) 10%, transparent)',
      }}
    >
      <h3 className="font-display text-base font-bold tracking-[0.04em] m-0 mb-2">
        🏆 Leaderboard — this visit
      </h3>
      {sorted.length === 0 ? (
        <p className="text-[13px] m-0" style={{ color: 'var(--muted)' }}>
          No finished games yet this visit. Be the first on the board!
        </p>
      ) : (
        <div>
          {sorted.map((e, i) => {
            const c = charFor(e.adno);
            return (
              <div
                key={`${e.adno}-${e.when.getTime()}-${i}`}
                className="flex flex-wrap items-center gap-2.5 py-2.5 px-1 text-sm border-b last:border-b-0"
                style={{ borderColor: 'var(--line)' }}
              >
                <span
                  className="font-display font-extrabold w-[30px] tabular-nums"
                  style={{ color: 'var(--accent2)' }}
                >
                  {i + 1}
                </span>
                <Avatar adno={e.adno} size="sm" />
                <span className="font-extrabold">{e.name}</span>
                <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
                  Ad.No <span className="tabular-nums">{e.adno}</span> ·{' '}
                  <span className="font-extrabold" style={{ color: 'var(--accent)' }}>
                    {c.emoji} {c.name}
                  </span>{' '}
                  · {e.paper} · {e.level}
                </span>
                <span className="ml-auto font-extrabold tabular-nums">
                  {fmtMarks(e.got)}/{e.max} · {e.pct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
