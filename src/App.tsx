/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BadgeDef,
  BrainModeId,
  DifficultyLevel,
  LeaderboardEntry,
  PaperId,
  RoundScore,
  ScreenId,
  ThemeSpec,
  UserAccount,
} from './types';
import { applyThemeToDom, THEMES } from './data/themes';
import { BADGES, BT_MODES, SPIN_SEGS } from './data/pools';
import { dayIndex } from './utils/helpers';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { ArenaGame } from './components/ArenaGame';
import { BrainTraining } from './components/BrainTraining';
import { ResultsScreen } from './components/ResultsScreen';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { DhaakiraLogo } from './components/DhaakiraLogo';
import { OpeningSplash } from './components/OpeningSplash';

export default function App() {
  const isOnline = useOnlineStatus();
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<ScreenId>('auth');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeSpec>(THEMES[0]);

  // Paper & difficulty
  const [paper, setPaper] = useState<PaperId>('dhaakira');
  const [level, setLevel] = useState<DifficultyLevel>('easy');
  const [arenaKey, setArenaKey] = useState(0);

  // Results
  const [lastResult, setLastResult] = useState<{
    reason: 'done' | 'time' | 'stopped';
    scores: RoundScore[];
    got: number;
    max: number;
    pct: number;
  } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Brain Training state
  const [btDiff, setBtDiff] = useState<DifficultyLevel>('easy');
  const [btMode, setBtMode] = useState<BrainModeId>('number');
  const [btKey, setBtKey] = useState(0);
  const [btTotal, setBtTotal] = useState(0);
  const [btBests, setBtBests] = useState<Partial<Record<BrainModeId, number>>>({});

  // Joy Layer: badges, daily challenge, spin wheel, confetti, toast
  const [badges, setBadges] = useState<Partial<Record<BadgeDef['id'], boolean>>>({});
  const [lastAwardedBadge, setLastAwardedBadge] = useState<BadgeDef['id'] | null>(null);
  const triedModesRef = useRef<Set<BrainModeId>>(new Set());
  const btStreakRef = useRef(0);

  const dailyMode = BT_MODES[dayIndex() % BT_MODES.length].id;
  const [dailyDone, setDailyDone] = useState(false);

  const [spun, setSpun] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [spinResultText, setSpinResultText] = useState('');

  const [confettiState, setConfettiState] = useState({ key: 0, big: false });
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    applyThemeToDom(currentTheme);
  }, [currentTheme]);

  const notify = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const triggerConfetti = useCallback((big: boolean) => {
    setConfettiState((prev) => ({ key: prev.key + 1, big }));
  }, []);

  const awardBadge = useCallback(
    (id: BadgeDef['id']) => {
      setBadges((prev) => {
        if (prev[id]) return prev;
        const b = BADGES.find((x) => x.id === id);
        if (b) notify(`🏅 Badge earned: ${b.ico} ${b.name}!`);
        setLastAwardedBadge(id);
        return { ...prev, [id]: true };
      });
    },
    [notify]
  );

  const handleSignUp = (newUser: UserAccount) => {
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    setScreen('home');
    window.scrollTo({ top: 0 });
  };

  const handleSignIn = (existingUser: UserAccount) => {
    setUser(existingUser);
    setScreen('home');
    window.scrollTo({ top: 0 });
  };

  const handleStartArena = () => {
    setArenaKey((k) => k + 1);
    setScreen('game');
    window.scrollTo({ top: 0 });
  };

  const handleArenaFinish = useCallback(
    (reason: 'done' | 'time' | 'stopped', scores: RoundScore[], max: number) => {
      if (!user) return;
      const got = scores.reduce((s, r) => s + r.got, 0);
      const pct = max ? (got / max) * 100 : 0;
      setLastResult({ reason, scores, got, max, pct });
      setLeaderboard((prev) => [
        ...prev,
        {
          name: user.name,
          adno: user.adno,
          paper: paper === 'dhaakira' ? 'DHAAKIRA' : 'BNO14',
          level,
          got,
          max,
          pct,
          when: new Date(),
        },
      ]);
      setScreen('results');
      window.scrollTo({ top: 0 });
      awardBadge('first');
      if (pct >= 80) awardBadge('sharp');
      if (reason === 'done' && paper === 'dhaakira') awardBadge('master');
      triggerConfetti(true);
    },
    [user, paper, level, awardBadge, triggerConfetti]
  );

  const handleStartBrainMode = (mode: BrainModeId) => {
    setBtMode(mode);
    setBtKey((k) => k + 1);
    triedModesRef.current.add(mode);
    if (triedModesRef.current.size >= BT_MODES.length) {
      awardBadge('explorer');
    }
    setScreen('brain');
    window.scrollTo({ top: 0 });
  };

  const handleBrainAddPoints = useCallback(
    (
      pts: number,
      meta: { mode: BrainModeId; frac: number; elapsed: number; parSecs: number }
    ) => {
      setBtTotal((t) => t + pts);
      awardBadge('first');
      const clearedStage = meta.frac >= 0.6;
      if (meta.frac >= 0.8 && meta.elapsed <= meta.parSecs * 0.45) {
        awardBadge('speed');
      }
      btStreakRef.current = clearedStage ? btStreakRef.current + 1 : 0;
      if (btStreakRef.current >= 3) {
        awardBadge('fire');
      }
      if (meta.mode === dailyMode) {
        setDailyDone(true);
      }
      if (meta.frac > 0.9) triggerConfetti(true);
      else if (clearedStage) triggerConfetti(false);
    },
    [awardBadge, dailyMode, triggerConfetti]
  );

  const handleUpdateBest = useCallback((mode: BrainModeId, sessionPts: number) => {
    setBtBests((prev) => {
      if (!prev[mode] || sessionPts > prev[mode]!) {
        return { ...prev, [mode]: sessionPts };
      }
      return prev;
    });
  }, []);

  const handleSpinWheel = (winIdx: number, nextAngle: number) => {
    setSpinAngle(nextAngle);
    const pts = SPIN_SEGS[winIdx].pts;
    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
      setSpun(true);
      setBtTotal((prev) => {
        const nextTotal = prev + pts;
        setSpinResultText(
          `🎉 You won +${pts} bonus pts — added to your Brain Training total (now ${nextTotal} pts)!`
        );
        return nextTotal;
      });
      triggerConfetti(false);
      notify(`🎡 Lucky Spin: +${pts} Brain Training pts!`);
    }, reduce ? 700 : 4400);
  };

  return (
    <div className="max-w-[920px] mx-auto px-4 pt-[18px] pb-16">
      {showSplash && <OpeningSplash onComplete={() => setShowSplash(false)} />}

      {/* Masthead */}
      <header className="text-center pt-[26px] px-2.5 pb-2">
        <div className="flex justify-center mb-1.5">
          <DhaakiraLogo size={58} />
        </div>
        <h1
          className="font-arabic font-bold leading-[1.15] m-0 text-[clamp(64px,15vw,118px)]"
          lang="ar"
          dir="rtl"
          style={{
            color: 'var(--accent)',
            textShadow: '0 0 34px color-mix(in srgb, var(--accent) 45%, transparent)',
          }}
        >
          ذَاكِرَة
        </h1>
        <div
          className="font-display font-extrabold tracking-[0.14em] text-[clamp(24px,5.4vw,38px)] mt-0.5 mb-1"
          style={{
            textShadow: '0 0 22px color-mix(in srgb, var(--accent2) 40%, transparent)',
          }}
        >
          DHAAKIRA
        </div>
        <div
          className="font-display tracking-[0.3em] text-[clamp(10px,2.4vw,13px)] uppercase"
          style={{ color: 'var(--muted)' }}
        >
          The Grand Memory Arena
        </div>
        <div
          className="mt-1.5 font-display tracking-[0.22em] text-[clamp(12px,2.8vw,15px)] font-bold uppercase"
          style={{ color: 'var(--accent)' }}
        >
          UNLOCK THE UNIMAGINED
        </div>
        <div className="mt-2.5 text-[13.5px] font-semibold" style={{ color: 'var(--muted)' }}>
          <b style={{ color: 'var(--ink)' }}>SIBAQ&apos;26</b> – National Arts Fest ·{' '}
          <b style={{ color: 'var(--ink)' }}>Darul Huda Islamic University</b>
        </div>
        <div
          className="mt-1.5 font-display text-[clamp(14px,3.4vw,19px)] tracking-[0.12em] font-bold"
          style={{ color: 'var(--accent2)' }}
        >
          Observe. Remember. Recall.
        </div>
        <hr
          className="h-0.5 border-0 mx-auto mt-4.5 mb-1 max-w-[520px]"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent)',
          }}
        />
      </header>

      {/* Screens */}
      {screen === 'auth' && (
        <AuthScreen
          users={users}
          onSignUp={handleSignUp}
          onSignIn={handleSignIn}
          onNotify={notify}
        />
      )}

      {screen === 'home' && user && (
        <HomeScreen
          user={user}
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
          paper={paper}
          onSelectPaper={setPaper}
          level={level}
          onSelectLevel={setLevel}
          onStartArena={handleStartArena}
          btDiff={btDiff}
          onSelectBtDiff={setBtDiff}
          btTotal={btTotal}
          btBests={btBests}
          onStartBrainMode={handleStartBrainMode}
          badges={badges}
          lastAwardedBadge={lastAwardedBadge}
          dailyDone={dailyDone}
          dailyMode={dailyMode}
          spun={spun}
          spinAngle={spinAngle}
          spinResultText={spinResultText}
          onSpinWheel={handleSpinWheel}
          leaderboard={leaderboard}
          onSignOut={() => {
            setUser(null);
            setScreen('auth');
            window.scrollTo({ top: 0 });
          }}
          onNotify={notify}
        />
      )}

      {screen === 'game' && user && (
        <ArenaGame
          key={arenaKey}
          user={user}
          paper={paper}
          level={level}
          onQuit={() => {
            setScreen('home');
            window.scrollTo({ top: 0 });
          }}
          onFinish={handleArenaFinish}
        />
      )}

      {screen === 'brain' && user && (
        <BrainTraining
          key={btKey}
          user={user}
          mode={btMode}
          diff={btDiff}
          totalPts={btTotal}
          onAddPoints={handleBrainAddPoints}
          onUpdateBest={handleUpdateBest}
          onEndToHome={() => {
            setScreen('home');
            window.scrollTo({ top: 0 });
          }}
          onReplayMode={handleStartBrainMode}
        />
      )}

      {screen === 'results' && user && lastResult && (
        <ResultsScreen
          user={user}
          paper={paper}
          level={level}
          reason={lastResult.reason}
          scores={lastResult.scores}
          got={lastResult.got}
          max={lastResult.max}
          pct={lastResult.pct}
          leaderboard={leaderboard}
          onPlayAgain={handleStartArena}
          onHome={() => {
            setScreen('home');
            window.scrollTo({ top: 0 });
          }}
          onNotify={notify}
        />
      )}

      <ConfettiCanvas burstKey={confettiState.key} big={confettiState.big} />

      {!isOnline && (
        <div
          className="fixed bottom-4 left-4 z-50 rounded-lg px-3 py-1.5 text-xs font-bold shadow-lg"
          style={{ background: 'var(--warn)', color: '#111827' }}
        >
          Offline Mode — Running from cached files.
        </div>
      )}

      {/* Toast */}
      <div
        className={`fixed left-1/2 bottom-[22px] -translate-x-1/2 rounded-xl border-[1.5px] px-[18px] py-[11px] font-extrabold text-sm z-[99] pointer-events-none transition-all duration-250 max-w-[92vw] text-center ${
          toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
        style={{
          background: 'var(--surface)',
          color: 'var(--ink)',
          borderColor: 'var(--accent)',
        }}
      >
        {toastMsg}
      </div>
    </div>
  );
}
