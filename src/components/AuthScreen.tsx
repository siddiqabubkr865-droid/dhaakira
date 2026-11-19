import React, { useState } from 'react';
import type { UserAccount } from '../types';
import { charFor } from '../data/characters';
import { ri } from '../utils/helpers';
import { Avatar } from './Avatar';
import { InstallDownloadOptions } from './InstallDownloadOptions';

interface AuthScreenProps {
  users: UserAccount[];
  onSignUp: (user: UserAccount) => void;
  onSignIn: (user: UserAccount) => void;
  onNotify: (msg: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  onSignUp,
  onSignIn,
  onNotify,
}) => {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState<{ kind: 'err' | 'ok'; text: string } | null>(null);
  const [createdUser, setCreatedUser] = useState<UserAccount | null>(null);

  const switchMode = (m: 'in' | 'up') => {
    setMode(m);
    setMsg(null);
    if (m === 'in') setCreatedUser(null);
  };

  const generateAdno = (): number => {
    let a: number;
    do {
      a = ri(1000000, 9999999);
    } while (users.some((u) => u.adno === a));
    return a;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setMsg({ kind: 'err', text: 'Please enter your name (at least 2 letters).' });
      return;
    }
    if (pass.length < 3) {
      setMsg({ kind: 'err', text: 'Password must be at least 3 characters.' });
      return;
    }

    if (mode === 'up') {
      if (users.some((u) => u.name.toLowerCase() === cleanName.toLowerCase())) {
        setMsg({
          kind: 'err',
          text: 'That name is already signed up in this visit. Use Sign In, or pick another name.',
        });
        return;
      }
      const newUser: UserAccount = { name: cleanName, pass, adno: generateAdno() };
      const uc = charFor(newUser.adno);
      setCreatedUser(newUser);
      setMsg({
        kind: 'ok',
        text: `Account created! Welcome, ${cleanName}. Your Ad.No is ${newUser.adno} and your character is ${uc.name} from ${uc.cartoon} — chosen from your Ad.No, so you will get this same character at every sign-in. Entering the Arena…`,
      });
      setTimeout(() => {
        onSignUp(newUser);
      }, 1400);
    } else {
      const existing = users.find((u) => u.name.toLowerCase() === cleanName.toLowerCase());
      if (!existing) {
        setMsg({
          kind: 'err',
          text: 'No account with that name in this visit yet. Tap "Sign Up" first.',
        });
        return;
      }
      if (existing.pass !== pass) {
        setMsg({ kind: 'err', text: 'Wrong password. Try again.' });
        return;
      }
      onSignIn(existing);
    }
  };

  const revealedChar = createdUser ? charFor(createdUser.adno) : null;

  return (
    <section className="animate-fadein">
      <div
        className="my-4 rounded-2xl border p-5"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--line)',
          boxShadow: '0 12px 32px rgba(0,0,0,.22), 0 0 26px color-mix(in srgb, var(--accent) 10%, transparent)',
        }}
      >
        <h2 className="font-display text-xl font-bold tracking-[0.04em] m-0 mb-1.5">
          {mode === 'in' ? 'Sign in to enter the Arena' : 'Sign up — get your Ad.No'}
        </h2>
        <p className="text-[13px] mt-0.5 mb-3" style={{ color: 'var(--muted)' }}>
          New player? Sign up — a random 7-digit <b>Ad.No</b> is allotted to you automatically,
          along with <b>your own cartoon character avatar</b> — one of 124 famous cartoon characters,
          chosen from that Ad.No, so no two players share an avatar and you get the same character
          back at every sign-in. Accounts are kept in this tab for this visit.
        </p>

        <div className="flex gap-2 mb-1.5" role="tablist">
          <button
            type="button"
            onClick={() => switchMode('in')}
            className="flex-1 min-h-[44px] rounded-xl border font-bold px-4 py-2.5 cursor-pointer transition-colors whitespace-nowrap"
            style={{
              background: mode === 'in' ? 'var(--accent)' : 'var(--surface2)',
              borderColor: mode === 'in' ? 'var(--accent)' : 'var(--line)',
              color: mode === 'in' ? '#fff' : 'var(--ink)',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('up')}
            className="flex-1 min-h-[44px] rounded-xl border font-bold px-4 py-2.5 cursor-pointer transition-colors whitespace-nowrap"
            style={{
              background: mode === 'up' ? 'var(--accent)' : 'var(--surface2)',
              borderColor: mode === 'up' ? 'var(--accent)' : 'var(--line)',
              color: mode === 'up' ? '#fff' : 'var(--ink)',
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block font-bold text-[13.5px] mt-3.5 mb-1.5" htmlFor="authName">
            Your name
          </label>
          <input
            id="authName"
            type="text"
            autoComplete="username"
            placeholder="e.g. Afeef"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full min-h-[46px] rounded-xl border-[1.5px] px-3.5 py-2.5 focus:outline-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--ink)',
              borderColor: 'var(--line)',
              outlineColor: 'var(--accent)',
            }}
          />

          <label className="block font-bold text-[13.5px] mt-3.5 mb-1.5" htmlFor="authPass">
            Password
          </label>
          <input
            id="authPass"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full min-h-[46px] rounded-xl border-[1.5px] px-3.5 py-2.5 focus:outline-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--ink)',
              borderColor: 'var(--line)',
              outlineColor: 'var(--accent)',
            }}
          />

          {createdUser && revealedChar && (
            <div className="mt-3.5 text-center">
              <div className="flex justify-center">
                <Avatar adno={createdUser.adno} size="lg" />
              </div>
              <div
                className="font-display font-bold text-[13.5px] tracking-[0.14em] mt-2"
                style={{
                  color: 'var(--accent2)',
                  textShadow: '0 0 12px color-mix(in srgb, var(--accent2) 55%, transparent)',
                }}
              >
                This is your avatar
              </div>
              <div className="font-display font-extrabold text-[21px] mt-2">
                {revealedChar.emoji} {revealedChar.name}
              </div>
              <div className="font-bold text-[13.5px]" style={{ color: 'var(--muted)' }}>
                from {revealedChar.cartoon}
              </div>
              <p className="mt-4 mb-0 font-extrabold" style={{ color: 'var(--muted)' }}>
                This is your character — yours alone, chosen from your Ad.No!
                <br />
                Your Ad.No — note it down!
              </p>
              <div
                className="font-display font-extrabold tracking-[0.18em] text-[clamp(34px,9vw,52px)] my-1.5 tabular-nums"
                style={{ color: 'var(--accent2)' }}
              >
                {createdUser.adno}
              </div>
            </div>
          )}

          {msg && (
            <div
              className="rounded-xl p-3 font-bold text-sm mt-3.5 border"
              style={{
                background:
                  msg.kind === 'err'
                    ? 'color-mix(in srgb, var(--bad) 16%, transparent)'
                    : 'color-mix(in srgb, var(--good) 16%, transparent)',
                borderColor: msg.kind === 'err' ? 'var(--bad)' : 'var(--good)',
                color: 'var(--ink)',
              }}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={Boolean(createdUser)}
            className="mt-3.5 w-full min-h-[48px] rounded-[14px] px-6 py-3.5 text-[17px] font-bold text-white cursor-pointer disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              boxShadow: '0 6px 22px color-mix(in srgb, var(--accent) 45%, transparent)',
            }}
          >
            {mode === 'in' ? 'Sign In' : 'Create account & enter'}
          </button>
        </form>

        <InstallDownloadOptions onNotify={onNotify} />
      </div>
    </section>
  );
};
