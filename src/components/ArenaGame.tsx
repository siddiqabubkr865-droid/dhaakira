import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DifficultyLevel, PaperId, RoundScore, UserAccount } from '../types';
import {
  BNO14_DEFS,
  DHAKIRA_DEFS,
  scoreRoundInstance,
  type AnswerMap,
  type RoundInstance,
} from '../data/arenaRounds';
import { charFor } from '../data/characters';
import { CHEERS } from '../data/pools';
import { fmtClock, fmtMarks, playTone } from '../utils/helpers';
import { Avatar } from './Avatar';
import { RecallQuestions, ShowBlocksRenderer } from './RecallWidgets';

interface ArenaGameProps {
  user: UserAccount;
  paper: PaperId;
  level: DifficultyLevel;
  onQuit: () => void;
  onFinish: (reason: 'done' | 'time' | 'stopped', scores: RoundScore[], totalMax: number) => void;
}

export const ArenaGame: React.FC<ArenaGameProps> = ({
  user,
  paper,
  level,
  onQuit,
  onFinish,
}) => {
  const defs = useMemo(() => (paper === 'dhaakira' ? DHAKIRA_DEFS : BNO14_DEFS), [paper]);
  const totalMax = useMemo(() => defs.reduce((s, d) => s + d.max, 0), [defs]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [scores, setScores] = useState<RoundScore[]>([]);
  const [phase, setPhase] = useState<'show' | 'recall'>('show');
  const [inst, setInst] = useState<RoundInstance>(() => defs[0].make(level));
  const [showLeft, setShowLeft] = useState(() => inst.showSecs);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [paused, setPaused] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'quit' | 'stop' | null>(null);
  const [cheerMsg, setCheerMsg] = useState<string | null>(null);
  const cheerIdxRef = useRef(0);
  const finishedRef = useRef(false);
  const scoresRef = useRef<RoundScore[]>(scores);
  scoresRef.current = scores;

  const finalize = useCallback(
    (reason: 'done' | 'time' | 'stopped', latestScores: RoundScore[]) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const padded = latestScores.slice();
      while (padded.length < defs.length) {
        padded.push({ name: defs[padded.length].name, got: 0, max: defs[padded.length].max });
      }
      onFinish(reason, padded, totalMax);
    },
    [defs, onFinish, totalMax]
  );

  // Main 30-minute countdown clock
  useEffect(() => {
    const id = setInterval(() => {
      if (paused || confirmMode !== null || finishedRef.current) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          finalize('time', scoresRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, confirmMode, finalize]);

  // Memorise-phase timer
  useEffect(() => {
    if (phase !== 'show' || paused || confirmMode !== null || finishedRef.current) return;
    const id = setInterval(() => {
      setShowLeft((prev) => {
        if (prev <= 0.25) {
          clearInterval(id);
          setPhase('recall');
          playTone(520, 90);
          return 0;
        }
        return prev - 0.25;
      });
    }, 250);
    return () => clearInterval(id);
  }, [phase, paused, confirmMode, roundIdx]);

  const handleSubmitRound = () => {
    const def = defs[roundIdx];
    const frac = scoreRoundInstance(inst, answers);
    const got = Math.round(frac * def.max * 10) / 10;
    const nextScores = [...scores, { name: def.name, got, max: def.max }];
    setScores(nextScores);
    playTone(frac >= 0.6 ? 660 : 440, 120);

    const msg = CHEERS[cheerIdxRef.current % CHEERS.length];
    cheerIdxRef.current++;
    setCheerMsg(msg);
    setTimeout(() => setCheerMsg((cur) => (cur === msg ? null : cur)), 4200);

    const nextIdx = roundIdx + 1;
    if (nextIdx >= defs.length) {
      finalize('done', nextScores);
      return;
    }
    const nextInst = defs[nextIdx].make(level);
    setRoundIdx(nextIdx);
    setInst(nextInst);
    setShowLeft(nextInst.showSecs);
    setAnswers({});
    setPhase('show');
    window.scrollTo({ top: 0 });
  };

  const totalGot = scores.reduce((s, r) => s + r.got, 0);
  const currentDef = defs[roundIdx];
  const c = charFor(user.adno);

  return (
    <section className="animate-fadein">
      {/* Sticky HUD */}
      <div
        className="sticky top-2 z-30 rounded-[14px] border px-3 py-2.5 flex flex-wrap gap-2 items-center"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--line)',
          boxShadow: '0 10px 26px rgba(0,0,0,.25)',
        }}
      >
        <div className="font-display font-extrabold text-[15px] mr-auto">
          {paper === 'dhaakira'
            ? `Round ${roundIdx + 1} of 30 · ${currentDef.name}`
            : `Stage ${roundIdx + 1} of 5 · ${currentDef.name}`}
        </div>
        <div className="flex items-center gap-2 font-extrabold text-[13px]">
          <Avatar adno={user.adno} size="sm" />
          <span>
            {user.name} ·{' '}
            <span style={{ color: 'var(--accent)' }}>
              {c.emoji} {c.name}
            </span>
            <br />
            <span
              className="font-display tracking-[0.06em] text-xs tabular-nums"
              style={{ color: 'var(--accent2)' }}
            >
              Ad.No {user.adno}
            </span>
          </span>
        </div>
        <div
          className="font-extrabold text-[13.5px] rounded-[10px] border px-2.5 py-1.5 tabular-nums whitespace-nowrap"
          style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
        >
          Score {fmtMarks(totalGot)} / {totalMax}
        </div>
        <div
          className={`font-display font-extrabold text-[19px] tracking-[0.06em] px-3 py-1 rounded-[10px] border-[1.5px] tabular-nums whitespace-nowrap ${
            timeLeft <= 60 ? 'animate-clockpulse' : ''
          }`}
          style={{
            background: 'var(--bg)',
            borderColor: timeLeft <= 60 ? 'var(--bad)' : 'var(--line)',
            color: timeLeft <= 60 ? 'var(--bad)' : 'var(--ink)',
          }}
        >
          {fmtClock(timeLeft)}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setPaused(true)}
            className="min-h-[40px] rounded-xl border px-3 py-1.5 text-[13.5px] font-bold cursor-pointer whitespace-nowrap"
            style={{ background: 'var(--surface2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            ⏸ Pause
          </button>
          <button
            type="button"
            onClick={() => setConfirmMode('quit')}
            className="min-h-[40px] rounded-xl border px-3 py-1.5 text-[13.5px] font-bold cursor-pointer whitespace-nowrap"
            style={{ background: 'var(--surface2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            Quit
          </button>
          <button
            type="button"
            onClick={() => setConfirmMode('stop')}
            className="min-h-[40px] rounded-xl border px-3 py-1.5 text-[13.5px] font-bold cursor-pointer whitespace-nowrap"
            style={{ background: 'transparent', borderColor: 'var(--bad)', color: 'var(--bad)' }}
          >
            ■ Stop
          </button>
        </div>
      </div>

      {cheerMsg && (
        <div
          className="text-center font-extrabold text-[15.5px] rounded-xl px-3.5 py-2.5 mt-3 border-[1.5px] animate-fadein"
          style={{
            background: 'color-mix(in srgb, var(--accent2) 16%, transparent)',
            borderColor: 'var(--accent2)',
          }}
        >
          {cheerMsg}
        </div>
      )}

      {/* Progress Bar */}
      <div
        className="h-[9px] rounded-full overflow-hidden mt-3.5 mb-1 border"
        style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
      >
        <div
          className="h-full transition-[width] duration-250 ease-linear"
          style={{
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            width:
              phase === 'show'
                ? `${Math.max(0, (showLeft / inst.showSecs) * 100)}%`
                : '0%',
          }}
        />
      </div>
      <div className="flex justify-between text-[12.5px] font-extrabold" style={{ color: 'var(--muted)' }}>
        <span>
          {phase === 'show'
            ? paper === 'dhaakira'
              ? '👀 MEMORISE — observe carefully'
              : '👀 STAGE — observe carefully'
            : '✍️ RECALL — answer from memory'}
        </span>
        <span className="tabular-nums">
          {phase === 'show' ? `${Math.max(0, Math.ceil(showLeft))}s to memorise` : 'No going back!'}
        </span>
      </div>

      {/* Phase Body */}
      {phase === 'show' ? (
        <div>
          {inst.judge && (
            <div
              className="text-left rounded-xl border-[1.5px] px-3.5 py-3 text-sm mt-3"
              style={{
                background: 'color-mix(in srgb, var(--warn) 14%, transparent)',
                borderColor: 'var(--warn)',
              }}
            >
              <b style={{ color: 'var(--warn)' }}>Judge's instructions:</b> {inst.judge}
            </div>
          )}
          <div
            className="rounded-[14px] border-[1.5px] px-4 py-5 mt-3 text-center"
            style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
          >
            <ShowBlocksRenderer blocks={inst.showBlocks} />
          </div>
          <button
            type="button"
            onClick={() => {
              setPhase('recall');
              playTone(520, 90);
            }}
            className="mt-3.5 w-full min-h-[48px] rounded-[14px] px-6 py-3.5 text-[17px] font-bold text-white cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              boxShadow: '0 6px 22px color-mix(in srgb, var(--accent) 45%, transparent)',
            }}
          >
            ✓ I&apos;ve memorised it — start recall
          </button>
        </div>
      ) : (
        <div>
          <div
            className="mt-3 rounded-2xl border p-5"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--line)',
              boxShadow: '0 12px 32px rgba(0,0,0,.22)',
            }}
          >
            <RecallQuestions
              questions={inst.questions}
              answers={answers}
              onChange={(id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))}
            />
          </div>
          <button
            type="button"
            onClick={handleSubmitRound}
            className="mt-3.5 w-full min-h-[48px] rounded-[14px] px-6 py-3.5 text-[17px] font-bold text-white cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              boxShadow: '0 6px 22px color-mix(in srgb, var(--accent) 45%, transparent)',
            }}
          >
            {roundIdx === defs.length - 1 ? 'Finish & see my result 🏁' : 'Submit round →'}
          </button>
        </div>
      )}

      {/* Pause Overlay */}
      {paused && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div
            className="rounded-[18px] border-[1.5px] p-6 max-w-[420px] w-full text-center"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--accent)',
              boxShadow: '0 24px 60px rgba(0,0,0,.5)',
            }}
          >
            <h2 className="font-display text-2xl font-bold m-0 mb-2">⏸ Paused</h2>
            <p className="m-0 mb-4" style={{ color: 'var(--muted)' }}>
              The clock and the round are frozen. Take a breath.
            </p>
            <button
              type="button"
              onClick={() => setPaused(false)}
              className="w-full min-h-[48px] rounded-[14px] px-6 py-3.5 text-[17px] font-bold text-white cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              }}
            >
              ▶ Resume
            </button>
            <div className="flex gap-2.5 flex-wrap mt-3.5">
              <button
                type="button"
                onClick={() => setConfirmMode('quit')}
                className="flex-1 min-w-[140px] min-h-[44px] rounded-xl border px-4 py-2.5 font-bold cursor-pointer"
                style={{ background: 'var(--surface2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              >
                Quit game
              </button>
              <button
                type="button"
                onClick={() => setConfirmMode('stop')}
                className="flex-1 min-w-[140px] min-h-[44px] rounded-xl border px-4 py-2.5 font-bold cursor-pointer"
                style={{ background: 'transparent', borderColor: 'var(--bad)', color: 'var(--bad)' }}
              >
                ■ Stop &amp; see result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Overlay */}
      {confirmMode && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div
            className="rounded-[18px] border-[1.5px] p-6 max-w-[420px] w-full text-center"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--accent)',
              boxShadow: '0 24px 60px rgba(0,0,0,.5)',
            }}
          >
            <h2 className="font-display text-xl font-bold m-0 mb-2">
              {confirmMode === 'quit' ? 'Quit this game?' : 'Stop & see result?'}
            </h2>
            <p className="m-0 mb-4" style={{ color: 'var(--muted)' }}>
              {confirmMode === 'quit'
                ? 'Your progress in this game will be lost and no score will be recorded.'
                : 'The game ends now. You keep the marks earned so far; unplayed rounds score 0.'}
            </p>
            <div className="flex gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setConfirmMode(null)}
                className="flex-1 min-w-[140px] min-h-[44px] rounded-xl border px-4 py-2.5 font-bold cursor-pointer"
                style={{ background: 'var(--surface2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              >
                Keep playing
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmMode;
                  setConfirmMode(null);
                  setPaused(false);
                  if (action === 'quit') onQuit();
                  else finalize('stopped', scoresRef.current);
                }}
                className="flex-1 min-w-[140px] min-h-[44px] rounded-xl border px-4 py-2.5 font-bold cursor-pointer"
                style={{ background: 'transparent', borderColor: 'var(--bad)', color: 'var(--bad)' }}
              >
                {confirmMode === 'quit' ? 'Yes, quit' : 'Stop & show result'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
