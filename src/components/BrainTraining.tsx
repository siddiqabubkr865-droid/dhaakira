import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { BrainModeId, DifficultyLevel, UserAccount } from '../types';
import { orderFrac, seqFrac } from '../data/arenaRounds';
import { charFor } from '../data/characters';
import { BT_MODES, CHEERS, COLORS, WORDS } from '../data/pools';
import { playTone, ri, sample, shuffle } from '../utils/helpers';
import { Avatar, DancerAvatar } from './Avatar';

interface BrainTrainingProps {
  user: UserAccount;
  mode: BrainModeId;
  diff: DifficultyLevel;
  totalPts: number;
  onAddPoints: (pts: number, meta: { mode: BrainModeId; frac: number; elapsed: number; parSecs: number }) => void;
  onUpdateBest: (mode: BrainModeId, sessionPts: number) => void;
  onEndToHome: () => void;
  onReplayMode: (mode: BrainModeId) => void;
}

type BtPhase = 'show' | 'watch' | 'recall' | 'stageResult' | 'sessionSummary';

interface StageData {
  parSecs: number;
  showSecs: number;
  // Number
  numSeq?: number[];
  // Pattern
  gridSize?: number;
  patternLit?: number[];
  // Color
  colorSeq?: { n: string; c: string }[];
  // Word
  words?: string[];
  wordOpts?: { id: string; label: string }[];
  // Sequence (Simon)
  simonSeq?: number[];
  // Grid sequential
  gridTargets?: number[];
}

const SIMON_PADS = [
  { n: 'Ruby', c: '#ef476f', freq: 330 },
  { n: 'Sky', c: '#4cc9f0', freq: 440 },
  { n: 'Lime', c: '#2fbf71', freq: 554 },
  { n: 'Gold', c: '#ffb703', freq: 659 },
];

export const BrainTraining: React.FC<BrainTrainingProps> = ({
  user,
  mode,
  diff,
  totalPts,
  onAddPoints,
  onUpdateBest,
  onEndToHome,
  onReplayMode,
}) => {
  const base = diff === 'easy' ? 0 : diff === 'medium' ? 1 : 2;
  const modeName = BT_MODES.find((m) => m.id === mode)?.name ?? 'Brain Training';
  const diffCap = diff[0].toUpperCase() + diff.slice(1);
  const c = charFor(user.adno);

  const [stage, setStage] = useState(1);
  const [sessionPts, setSessionPts] = useState(0);
  const [phase, setPhase] = useState<BtPhase>('show');
  const [stageData, setStageData] = useState<StageData>(() => buildStage(mode, 1, base));
  const [showLeft, setShowLeft] = useState(() => stageData.showSecs);

  // Recall inputs
  const [numInput, setNumInput] = useState('');
  const [patternMine, setPatternMine] = useState<number[]>([]);
  const [colorOrder, setColorOrder] = useState<string[]>([]);
  const [wordChosen, setWordChosen] = useState<string[]>([]);
  const [gridMine, setGridMine] = useState<number[]>([]);

  // Sequence / Grid watch animation
  const [activePad, setActivePad] = useState<number | null>(null);
  const [simonProgress, setSimonProgress] = useState(0);
  const [flashCell, setFlashCell] = useState<number | null>(null);
  const [watchDone, setWatchDone] = useState(false);

  // Stage result
  const [lastResult, setLastResult] = useState<{
    frac: number;
    pts: number;
    basePts: number;
    bonus: number;
    elapsed: number;
    note: string;
  } | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [cheerMsg, setCheerMsg] = useState<string | null>(null);

  const recallStartRef = useRef<number>(Date.now());
  const cheerIdxRef = useRef(0);

  function buildStage(m: BrainModeId, st: number, b: number): StageData {
    switch (m) {
      case 'number': {
        const len = Math.min(16, 4 + b * 2 + (st - 1));
        const numSeq = Array.from({ length: len }, () => ri(0, 9));
        return { showSecs: 3 + len * 0.8, parSecs: 6 + len * 1.5, numSeq };
      }
      case 'pattern': {
        const gridSize = Math.min(5, 3 + (b >= 1 ? 1 : 0) + (st >= 4 ? 1 : 0));
        const cells = Array.from({ length: gridSize * gridSize }, (_, i) => i);
        const litN = Math.min(cells.length - 2, 3 + b + st);
        const patternLit = sample(cells, litN);
        return { showSecs: 6 + litN, parSecs: 25, gridSize, patternLit };
      }
      case 'color': {
        const n = Math.min(10, 3 + b + st);
        const colorSeq = Array.from({ length: n }, () => COLORS[ri(0, COLORS.length - 1)]);
        return { showSecs: 4 + n * 1.1, parSecs: 8 + n * 2, colorSeq };
      }
      case 'word': {
        const n = Math.min(14, 4 + b * 2 + (st - 1));
        const words = sample(WORDS, n);
        const distract = sample(WORDS.filter((w) => !words.includes(w)), Math.min(8, Math.ceil(n / 2) + 2));
        const wordOpts = shuffle([...words.map((w) => ({ id: w, label: w })), ...distract.map((w) => ({ id: `x${w}`, label: w }))]);
        return { showSecs: 5 + n * 1.6, parSecs: 30, words, wordOpts };
      }
      case 'sequence': {
        const len = Math.min(12, 3 + b + (st - 1));
        const simonSeq = Array.from({ length: len }, () => ri(0, 3));
        return { showSecs: 0, parSecs: 6 + len * 2, simonSeq };
      }
      case 'grid': {
        const gridSize = Math.min(5, 3 + (b >= 1 ? 1 : 0) + (st >= 5 ? 1 : 0));
        const cells = Array.from({ length: gridSize * gridSize }, (_, i) => i);
        const n = Math.min(cells.length - 3, 3 + b + st);
        const gridTargets = sample(cells, n);
        return { showSecs: 0, parSecs: 22, gridSize, gridTargets };
      }
    }
  }

  const initStage = useCallback(
    (st: number) => {
      const data = buildStage(mode, st, base);
      setStageData(data);
      setShowLeft(data.showSecs);
      setNumInput('');
      setPatternMine([]);
      setColorOrder([]);
      setWordChosen([]);
      setGridMine([]);
      setActivePad(null);
      setSimonProgress(0);
      setFlashCell(null);
      setWatchDone(false);
      setPhase(mode === 'sequence' || mode === 'grid' ? 'watch' : 'show');
    },
    [mode, base]
  );

  // Initialize on mount or mode change
  useEffect(() => {
    setStage(1);
    setSessionPts(0);
    initStage(1);
  }, [mode, diff, initStage]);

  // Show countdown timer for non-watch modes
  useEffect(() => {
    if (phase !== 'show') return;
    const id = setInterval(() => {
      setShowLeft((prev) => {
        if (prev <= 0.25) {
          clearInterval(id);
          recallStartRef.current = Date.now();
          setPhase('recall');
          playTone(520, 90);
          return 0;
        }
        return prev - 0.25;
      });
    }, 250);
    return () => clearInterval(id);
  }, [phase, stage]);

  // Sequence / Grid watch animations
  useEffect(() => {
    if (phase !== 'watch') return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (mode === 'sequence' && stageData.simonSeq) {
      const seq = stageData.simonSeq;
      let i = 0;
      const flashNext = () => {
        if (cancelled) return;
        if (i >= seq.length) {
          setWatchDone(true);
          recallStartRef.current = Date.now();
          setPhase('recall');
          return;
        }
        const padIdx = seq[i];
        setActivePad(padIdx);
        playTone(SIMON_PADS[padIdx].freq, 180);
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            setActivePad(null);
            i++;
            timers.push(setTimeout(flashNext, 200));
          }, 560)
        );
      };
      timers.push(setTimeout(flashNext, 700));
    } else if (mode === 'grid' && stageData.gridTargets) {
      const targets = stageData.gridTargets;
      let i = 0;
      const flashNext = () => {
        if (cancelled) return;
        if (i >= targets.length) {
          setWatchDone(true);
          recallStartRef.current = Date.now();
          setPhase('recall');
          return;
        }
        setFlashCell(targets[i]);
        playTone(480, 120);
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            setFlashCell(null);
            i++;
            timers.push(setTimeout(flashNext, 180));
          }, 620)
        );
      };
      timers.push(setTimeout(flashNext, 700));
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [phase, mode, stageData]);

  const finishStage = (frac: number, note: string) => {
    const elapsed = Math.max(0.1, (Date.now() - recallStartRef.current) / 1000);
    const basePts = Math.round(frac * 100);
    const bonus = frac > 0 ? Math.round(Math.max(0, stageData.parSecs - elapsed) * 2 * frac) : 0;
    const pts = basePts + bonus;
    const newSession = sessionPts + pts;
    setSessionPts(newSession);
    onAddPoints(pts, { mode, frac, elapsed, parSecs: stageData.parSecs });
    onUpdateBest(mode, newSession);

    const msg = CHEERS[cheerIdxRef.current % CHEERS.length];
    cheerIdxRef.current++;
    setCheerMsg(msg);
    setTimeout(() => setCheerMsg((cur) => (cur === msg ? null : cur)), 4200);

    playTone(frac >= 0.6 ? 680 : 380, 140);
    setLastResult({ frac, pts, basePts, bonus, elapsed, note });
    setPhase('stageResult');
  };

  const handlePadTap = (idx: number) => {
    if (phase !== 'recall' || mode !== 'sequence' || !stageData.simonSeq) return;
    setActivePad(idx);
    playTone(SIMON_PADS[idx].freq, 150);
    setTimeout(() => setActivePad((cur) => (cur === idx ? null : cur)), 220);

    const seq = stageData.simonSeq;
    if (idx === seq[simonProgress]) {
      const next = simonProgress + 1;
      setSimonProgress(next);
      if (next >= seq.length) {
        finishStage(1, `Full ${seq.length}-step sequence repeated!`);
      }
    } else {
      finishStage(simonProgress / seq.length, `You reached step ${simonProgress + 1} of ${seq.length} before a wrong pad.`);
    }
  };

  const enterRecallNow = () => {
    recallStartRef.current = Date.now();
    setPhase('recall');
    playTone(520, 90);
  };

  return (
    <section className="animate-fadein">
      {/* HUD */}
      <div
        className="sticky top-2 z-30 rounded-[14px] border px-3 py-2.5 flex flex-wrap gap-2 items-center"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--line)',
          boxShadow: '0 10px 26px rgba(0,0,0,.25)',
        }}
      >
        <div className="font-display font-extrabold text-[15px] mr-auto">{modeName}</div>
        <div className="flex items-center gap-2 font-extrabold text-[13px]">
          <Avatar adno={user.adno} size="sm" />
          <span>
            {user.name} ·{' '}
            <span style={{ color: 'var(--accent)' }}>
              {c.emoji} {c.name}
            </span>
            <br />
            <span className="font-display text-xs tabular-nums" style={{ color: 'var(--accent2)' }}>
              Ad.No {user.adno}
            </span>
          </span>
        </div>
        <div
          className="font-extrabold text-[13.5px] rounded-[10px] border px-2.5 py-1.5 tabular-nums whitespace-nowrap"
          style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
        >
          Stage {stage} · {diffCap}
        </div>
        <div
          className="font-extrabold text-[13.5px] rounded-[10px] border px-2.5 py-1.5 tabular-nums whitespace-nowrap"
          style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
        >
          Session {sessionPts} pts
        </div>
        <div
          className="font-extrabold text-[13.5px] rounded-[10px] border px-2.5 py-1.5 tabular-nums whitespace-nowrap"
          style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
        >
          Total {totalPts} pts
        </div>
        <button
          type="button"
          onClick={() => setConfirmEnd(true)}
          className="min-h-[40px] rounded-xl border px-3 py-1.5 text-[13.5px] font-bold cursor-pointer whitespace-nowrap"
          style={{ background: 'transparent', borderColor: 'var(--bad)', color: 'var(--bad)' }}
        >
          ✕ End
        </button>
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

      {/* Stage body */}
      {(phase === 'show' || phase === 'watch' || phase === 'recall') && (
        <div>
          <div
            className="h-[9px] rounded-full overflow-hidden mt-3.5 mb-1 border"
            style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
          >
            <div
              className="h-full transition-[width] duration-250 ease-linear"
              style={{
                background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                width:
                  phase === 'show' && stageData.showSecs > 0
                    ? `${Math.max(0, (showLeft / stageData.showSecs) * 100)}%`
                    : '0%',
              }}
            />
          </div>
          <div className="flex justify-between text-[12.5px] font-extrabold" style={{ color: 'var(--muted)' }}>
            <span>
              {phase === 'show'
                ? '👀 MEMORISE — observe carefully'
                : phase === 'watch'
                  ? mode === 'sequence'
                    ? '👀 WATCH — the pads will flash in sequence'
                    : '👀 WATCH — tiles light up one by one'
                  : '✍️ RECALL — answer from memory'}
            </span>
            <span className="tabular-nums">
              {phase === 'show'
                ? `${Math.max(0, Math.ceil(showLeft))}s to memorise`
                : phase === 'watch'
                  ? mode === 'sequence'
                    ? `${stageData.simonSeq?.length ?? 0} flashes`
                    : `${stageData.gridTargets?.length ?? 0} tiles`
                  : 'Fast recall = bigger speed bonus ⚡'}
            </span>
          </div>

          {/* SHOW PHASE */}
          {phase === 'show' && (
            <div>
              <div
                className="rounded-[14px] border-[1.5px] px-4 py-5 mt-3 text-center"
                style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
              >
                {mode === 'number' && stageData.numSeq && (
                  <>
                    <div className="font-display font-extrabold tracking-[0.22em] text-[clamp(26px,7.5vw,44px)] break-all">
                      {stageData.numSeq.join(' ')}
                    </div>
                    <p className="mt-2.5 mb-0 text-[13px]" style={{ color: 'var(--muted)' }}>
                      {stageData.numSeq.length} digits — Stage {stage}
                    </p>
                  </>
                )}
                {mode === 'pattern' && stageData.gridSize && stageData.patternLit && (
                  <div
                    className="grid gap-1.5 justify-center mx-auto"
                    style={{ gridTemplateColumns: `repeat(${stageData.gridSize}, auto)` }}
                  >
                    {Array.from({ length: stageData.gridSize * stageData.gridSize }, (_, i) => {
                      const isLit = stageData.patternLit!.includes(i);
                      return (
                        <div
                          key={i}
                          className="w-[clamp(46px,12vw,62px)] h-[clamp(46px,12vw,62px)] rounded-xl border-[1.5px]"
                          style={{
                            background: isLit ? 'var(--accent)' : 'var(--bg)',
                            borderColor: isLit ? 'var(--accent)' : 'var(--line)',
                            boxShadow: isLit
                              ? '0 0 14px color-mix(in srgb, var(--accent) 60%, transparent)'
                              : undefined,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
                {mode === 'color' && stageData.colorSeq && (
                  <>
                    <div className="flex gap-2.5 justify-center flex-wrap">
                      {stageData.colorSeq.map((col, i) => (
                        <div
                          key={i}
                          className="w-[clamp(44px,11vw,64px)] h-[clamp(44px,11vw,64px)] rounded-[14px] border-2 border-white/40"
                          style={{ background: col.c }}
                          title={col.n}
                        />
                      ))}
                    </div>
                    <p className="mt-3 mb-0 text-[13px]" style={{ color: 'var(--muted)' }}>
                      {stageData.colorSeq.length} colours in order — Stage {stage}
                    </p>
                  </>
                )}
                {mode === 'word' && stageData.words && (
                  <div className="flex flex-wrap gap-2.5 justify-center">
                    {stageData.words.map((w, i) => (
                      <span
                        key={`${w}-${i}`}
                        className="rounded-xl border-[1.5px] px-4 py-2.5 font-extrabold text-[clamp(16px,4.4vw,21px)]"
                        style={{ background: 'var(--bg)', borderColor: 'var(--accent)', color: 'var(--ink)' }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={enterRecallNow}
                className="mt-3.5 w-full min-h-[48px] rounded-[14px] px-6 py-3.5 text-[17px] font-bold text-white cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  boxShadow: '0 6px 22px color-mix(in srgb, var(--accent) 45%, transparent)',
                }}
              >
                ✓ I&apos;ve memorised it — start recall
              </button>
            </div>
          )}

          {/* WATCH / RECALL FOR SEQUENCE */}
          {mode === 'sequence' && (phase === 'watch' || phase === 'recall') && (
            <div
              className="rounded-[14px] border-[1.5px] px-4 py-5 mt-3 text-center"
              style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
            >
              <div className="grid grid-cols-2 gap-3 justify-center max-w-[292px] mx-auto">
                {SIMON_PADS.map((p, idx) => {
                  const isOn = activePad === idx;
                  return (
                    <button
                      key={p.n}
                      type="button"
                      disabled={phase !== 'recall'}
                      aria-label={`${p.n} pad`}
                      onClick={() => handlePadTap(idx)}
                      className="h-[98px] rounded-[18px] border-2 border-white/35 transition-all duration-150 cursor-pointer disabled:cursor-default"
                      style={{
                        background: p.c,
                        opacity: isOn ? 1 : 0.45,
                        filter: isOn ? 'brightness(1.5)' : undefined,
                        boxShadow: isOn ? `0 0 30px ${p.c}` : undefined,
                      }}
                    />
                  );
                })}
              </div>
              <p className="font-extrabold mt-3.5 mb-0" style={{ color: 'var(--muted)' }}>
                {phase === 'recall' || watchDone
                  ? '✍️ Your turn — repeat the sequence!'
                  : 'Get ready…'}
              </p>
            </div>
          )}

          {/* WATCH FOR GRID */}
          {mode === 'grid' && phase === 'watch' && stageData.gridSize && (
            <div
              className="rounded-[14px] border-[1.5px] px-4 py-5 mt-3 text-center"
              style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
            >
              <div
                className="grid gap-1.5 justify-center mx-auto"
                style={{ gridTemplateColumns: `repeat(${stageData.gridSize}, auto)` }}
              >
                {Array.from({ length: stageData.gridSize * stageData.gridSize }, (_, i) => {
                  const isFlashing = flashCell === i;
                  return (
                    <div
                      key={i}
                      className="w-[clamp(46px,12vw,62px)] h-[clamp(46px,12vw,62px)] rounded-xl border-[1.5px] transition-all"
                      style={{
                        background: isFlashing ? 'var(--accent2)' : 'var(--bg)',
                        borderColor: isFlashing ? 'var(--accent2)' : 'var(--line)',
                        boxShadow: isFlashing
                          ? '0 0 20px color-mix(in srgb, var(--accent2) 65%, transparent)'
                          : undefined,
                      }}
                    />
                  );
                })}
              </div>
              <p className="font-extrabold mt-3.5 mb-0" style={{ color: 'var(--muted)' }}>
                Remember every tile that lights up…
              </p>
            </div>
          )}

          {/* RECALL FOR NUMBER, PATTERN, COLOR, WORD, GRID */}
          {phase === 'recall' && mode !== 'sequence' && (
            <div>
              <div
                className="mt-3 rounded-2xl border p-5"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--line)',
                  boxShadow: '0 12px 32px rgba(0,0,0,.22)',
                }}
              >
                {mode === 'number' && stageData.numSeq && (
                  <div>
                    <div className="font-extrabold text-base mb-2.5">
                      Type the {stageData.numSeq.length} digits in the same order:
                    </div>
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder={`${stageData.numSeq.length} digits`}
                      value={numInput}
                      onChange={(e) => setNumInput(e.target.value)}
                      className="w-full min-h-[46px] rounded-xl border-[1.5px] px-3.5 py-2.5 font-bold"
                      style={{
                        background: 'var(--bg)',
                        color: 'var(--ink)',
                        borderColor: 'var(--line)',
                      }}
                    />
                  </div>
                )}

                {mode === 'pattern' && stageData.gridSize && stageData.patternLit && (
                  <div>
                    <div className="font-extrabold text-base mb-2.5">
                      Rebuild the pattern — tap the {stageData.patternLit.length} squares that were lit:
                    </div>
                    <div
                      className="grid gap-1.5 justify-center mx-auto"
                      style={{ gridTemplateColumns: `repeat(${stageData.gridSize}, auto)` }}
                    >
                      {Array.from({ length: stageData.gridSize * stageData.gridSize }, (_, i) => {
                        const isLit = patternMine.includes(i);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setPatternMine((prev) =>
                                prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                              )
                            }
                            aria-label={`Pattern square ${i + 1}`}
                            className="w-[clamp(46px,12vw,62px)] h-[clamp(46px,12vw,62px)] rounded-xl border-[1.5px] cursor-pointer"
                            style={{
                              background: isLit ? 'var(--accent)' : 'var(--bg)',
                              borderColor: isLit ? 'var(--accent)' : 'var(--line)',
                              boxShadow: isLit
                                ? '0 0 14px color-mix(in srgb, var(--accent) 60%, transparent)'
                                : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {mode === 'color' && (
                  <div>
                    <div className="font-extrabold text-base mb-2.5">
                      Tap the colours in the SAME order you saw them:
                    </div>
                    <div
                      className="min-h-[52px] rounded-xl border-[1.5px] border-dashed p-2 flex flex-wrap gap-2 items-center mb-2.5"
                      style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
                    >
                      {colorOrder.length === 0 ? (
                        <span className="text-[13px] font-semibold p-1" style={{ color: 'var(--muted)' }}>
                          Tap the items below in order…
                        </span>
                      ) : (
                        colorOrder.map((name, idx) => {
                          const col = COLORS.find((x) => x.n === name);
                          return (
                            <button
                              key={`${name}-${idx}`}
                              type="button"
                              onClick={() =>
                                setColorOrder((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="rounded-full border-[1.5px] px-3.5 py-1.5 min-h-[40px] font-bold cursor-pointer inline-flex items-center gap-1.5"
                              style={{
                                background: 'color-mix(in srgb, var(--accent) 20%, var(--surface2))',
                                borderColor: 'var(--accent)',
                                color: 'var(--ink)',
                              }}
                            >
                              {col && (
                                <span
                                  className="inline-block w-4 h-4 rounded"
                                  style={{ background: col.c }}
                                />
                              )}
                              {name}
                            </button>
                          );
                        })
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((col) => (
                        <button
                          key={col.n}
                          type="button"
                          onClick={() => setColorOrder((prev) => [...prev, col.n])}
                          className="rounded-full border-[1.5px] px-3.5 py-2 min-h-[44px] font-bold cursor-pointer inline-flex items-center gap-1.5"
                          style={{
                            background: 'var(--surface2)',
                            borderColor: 'var(--line)',
                            color: 'var(--ink)',
                          }}
                        >
                          <span
                            className="inline-block w-5 h-5 rounded-md border border-white/25"
                            style={{ background: col.c }}
                          />
                          {col.n}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setColorOrder([])}
                      className="mt-3 rounded-xl border px-4 py-2 min-h-[44px] font-bold cursor-pointer"
                      style={{
                        background: 'var(--surface2)',
                        borderColor: 'var(--line)',
                        color: 'var(--ink)',
                      }}
                    >
                      ↺ Clear &amp; start again
                    </button>
                  </div>
                )}

                {mode === 'word' && stageData.words && stageData.wordOpts && (
                  <div>
                    <div className="font-extrabold text-base mb-2.5">
                      Select ALL {stageData.words.length} words you saw:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stageData.wordOpts.map((o) => {
                        const active = wordChosen.includes(o.id);
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() =>
                              setWordChosen((prev) =>
                                prev.includes(o.id) ? prev.filter((x) => x !== o.id) : [...prev, o.id]
                              )
                            }
                            className="rounded-full border-[1.5px] px-4 py-2 min-h-[44px] font-bold cursor-pointer"
                            style={{
                              background: active
                                ? 'color-mix(in srgb, var(--accent) 20%, var(--surface2))'
                                : 'var(--surface2)',
                              borderColor: active ? 'var(--accent)' : 'var(--line)',
                              color: 'var(--ink)',
                            }}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {mode === 'grid' && stageData.gridSize && stageData.gridTargets && (
                  <div>
                    <div className="font-extrabold text-base mb-2.5">
                      Tap the {stageData.gridTargets.length} tiles that lit up:
                    </div>
                    <div
                      className="grid gap-1.5 justify-center mx-auto"
                      style={{ gridTemplateColumns: `repeat(${stageData.gridSize}, auto)` }}
                    >
                      {Array.from({ length: stageData.gridSize * stageData.gridSize }, (_, i) => {
                        const picked = gridMine.includes(i);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setGridMine((prev) =>
                                prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                              )
                            }
                            aria-label={`Grid tile ${i + 1}`}
                            className="w-[clamp(46px,12vw,62px)] h-[clamp(46px,12vw,62px)] rounded-xl border-[1.5px] cursor-pointer"
                            style={{
                              background: 'var(--bg)',
                              borderColor: picked ? 'var(--accent2)' : 'var(--line)',
                              boxShadow: picked
                                ? '0 0 0 3px color-mix(in srgb, var(--accent2) 45%, transparent)'
                                : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (mode === 'number' && stageData.numSeq) {
                    const got = numInput.replace(/\D/g, '').split('');
                    finishStage(
                      seqFrac(got, stageData.numSeq.map(String)),
                      `The sequence was: ${stageData.numSeq.join(' ')}`
                    );
                  } else if (mode === 'pattern' && stageData.gridSize && stageData.patternLit) {
                    const total = stageData.gridSize * stageData.gridSize;
                    const litSet = new Set(stageData.patternLit);
                    const mineSet = new Set(patternMine);
                    let ok = 0;
                    for (let i = 0; i < total; i++) {
                      if (litSet.has(i) === mineSet.has(i)) ok++;
                    }
                    finishStage(
                      ok / total,
                      `${mineSet.size} squares tapped · ${stageData.patternLit.length} were lit`
                    );
                  } else if (mode === 'color' && stageData.colorSeq) {
                    finishStage(
                      orderFrac(colorOrder, stageData.colorSeq.map((x) => x.n)),
                      `The order was: ${stageData.colorSeq.map((x) => x.n).join(' · ')}`
                    );
                  } else if (mode === 'word' && stageData.words) {
                    const correctSet = new Set(stageData.words);
                    let hits = 0;
                    let falseP = 0;
                    wordChosen.forEach((id) => {
                      if (correctSet.has(id)) hits++;
                      else falseP++;
                    });
                    finishStage(
                      Math.max(0, hits - falseP) / stageData.words.length,
                      `The words were: ${stageData.words.join(', ')}`
                    );
                  } else if (mode === 'grid' && stageData.gridTargets) {
                    const targetSet = new Set(stageData.gridTargets);
                    let hits = 0;
                    let falseP = 0;
                    gridMine.forEach((ci) => {
                      if (targetSet.has(ci)) hits++;
                      else falseP++;
                    });
                    finishStage(
                      Math.max(0, hits - falseP) / stageData.gridTargets.length,
                      `${hits} of ${stageData.gridTargets.length} tiles found`
                    );
                  }
                }}
                className="mt-3.5 w-full min-h-[48px] rounded-[14px] px-6 py-3.5 text-[17px] font-bold text-white cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  boxShadow: '0 6px 22px color-mix(in srgb, var(--accent) 45%, transparent)',
                }}
              >
                {mode === 'number'
                  ? 'Check my answer'
                  : mode === 'pattern'
                    ? 'Check my pattern'
                    : mode === 'color'
                      ? 'Check my order'
                      : mode === 'word'
                        ? 'Check my words'
                        : 'Check my tiles'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* STAGE RESULT */}
      {phase === 'stageResult' && lastResult && (
        <div
          className="my-4 rounded-2xl border p-5 text-center"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--line)',
            boxShadow: '0 12px 32px rgba(0,0,0,.22)',
          }}
        >
          <h2 className="font-display text-xl font-bold m-0">
            {lastResult.frac >= 1
              ? '🎉 Perfect recall!'
              : lastResult.frac >= 0.6
                ? '👏 Great memory!'
                : lastResult.frac > 0
                  ? '💪 Partial recall — points earned'
                  : '🌱 No points this stage — keep going!'}
          </h2>
          <p className="mt-1 mb-0" style={{ color: 'var(--muted)' }}>
            Stage {stage} · {modeName} · {diffCap}
          </p>
          <div className="flex justify-center mt-3">
            <DancerAvatar adno={user.adno} pct={lastResult.frac * 100} />
          </div>
          <div
            className="font-display font-bold text-[13.5px] tracking-[0.14em] mt-2"
            style={{ color: 'var(--accent2)' }}
          >
            This is your avatar
          </div>
          <div
            className="font-display font-extrabold text-[clamp(44px,11vw,64px)] leading-[1.05] my-1 tabular-nums"
            style={{
              color: 'var(--accent2)',
              textShadow: '0 0 26px color-mix(in srgb, var(--accent2) 45%, transparent)',
            }}
          >
            +{lastResult.pts} pts
          </div>
          <div className="font-bold text-[15px] leading-[1.7] tabular-nums">
            Correct answers: <b>+{lastResult.basePts}</b> pts
            <br />
            Speed bonus: <b>+{lastResult.bonus}</b> pts{' '}
            <span style={{ color: 'var(--muted)' }}>
              (answered in {lastResult.elapsed.toFixed(1)}s)
            </span>
            {lastResult.note && (
              <>
                <br />
                <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
                  {lastResult.note}
                </span>
              </>
            )}
          </div>
          <p className="font-extrabold mt-3 mb-0 tabular-nums">
            Session {sessionPts} pts · ⭐ Total {totalPts} pts
          </p>
          <div className="flex gap-2.5 flex-wrap mt-3.5">
            <button
              type="button"
              onClick={() => {
                const next = stage + 1;
                setStage(next);
                initStage(next);
              }}
              className="flex-1 min-w-[150px] min-h-[44px] rounded-xl px-4 py-2.5 font-bold text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
            >
              Next stage → harder
            </button>
            <button
              type="button"
              onClick={() => setPhase('sessionSummary')}
              className="flex-1 min-w-[150px] min-h-[44px] rounded-xl border px-4 py-2.5 font-bold cursor-pointer"
              style={{
                background: 'var(--surface2)',
                borderColor: 'var(--line)',
                color: 'var(--ink)',
              }}
            >
              End session
            </button>
          </div>
        </div>
      )}

      {/* SESSION SUMMARY */}
      {phase === 'sessionSummary' && (
        <div
          className="my-4 rounded-2xl border p-5 text-center"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--line)',
            boxShadow: '0 12px 32px rgba(0,0,0,.22)',
          }}
        >
          <h2 className="font-display text-xl font-bold m-0">
            🏁 Session complete — {modeName}
          </h2>
          <div
            className="font-display font-extrabold text-[clamp(44px,11vw,64px)] leading-[1.05] my-2 tabular-nums"
            style={{ color: 'var(--accent2)' }}
          >
            {sessionPts} pts
          </div>
          <div className="font-bold text-[15px] leading-[1.7]">
            You reached <b>Stage {stage}</b> on {diffCap}.
            <br />⭐ Brain Training total: <b className="tabular-nums">{totalPts} pts</b>
          </div>
          <div className="flex gap-2.5 flex-wrap mt-3.5">
            <button
              type="button"
              onClick={() => onReplayMode(mode)}
              className="flex-1 min-w-[150px] min-h-[44px] rounded-xl px-4 py-2.5 font-bold text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
            >
              ↻ Play this mode again
            </button>
            <button
              type="button"
              onClick={onEndToHome}
              className="flex-1 min-w-[150px] min-h-[44px] rounded-xl border px-4 py-2.5 font-bold cursor-pointer"
              style={{
                background: 'var(--surface2)',
                borderColor: 'var(--line)',
                color: 'var(--ink)',
              }}
            >
              ⌂ All modes
            </button>
          </div>
        </div>
      )}

      {/* End Confirm Modal */}
      {confirmEnd && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div
            className="rounded-[18px] border-[1.5px] p-6 max-w-[420px] w-full text-center"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--accent)',
              boxShadow: '0 24px 60px rgba(0,0,0,.5)',
            }}
          >
            <h2 className="font-display text-xl font-bold m-0 mb-2">End brain training?</h2>
            <p className="m-0 mb-4" style={{ color: 'var(--muted)' }}>
              This session ends. Your total score so far is kept.
            </p>
            <div className="flex gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setConfirmEnd(false)}
                className="flex-1 min-w-[140px] min-h-[44px] rounded-xl border px-4 py-2.5 font-bold cursor-pointer"
                style={{
                  background: 'var(--surface2)',
                  borderColor: 'var(--line)',
                  color: 'var(--ink)',
                }}
              >
                Keep playing
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmEnd(false);
                  onEndToHome();
                }}
                className="flex-1 min-w-[140px] min-h-[44px] rounded-xl border px-4 py-2.5 font-bold cursor-pointer"
                style={{ background: 'transparent', borderColor: 'var(--bad)', color: 'var(--bad)' }}
              >
                End session
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
