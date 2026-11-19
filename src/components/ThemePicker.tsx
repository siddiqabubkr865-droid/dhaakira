import React, { useState } from 'react';
import type { ThemeSpec } from '../types';
import { THEMES, themePalette } from '../data/themes';

interface ThemePickerProps {
  currentTheme: ThemeSpec;
  onSelectTheme: (theme: ThemeSpec) => void;
  onNotify: (msg: string) => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  currentTheme,
  onSelectTheme,
  onNotify,
}) => {
  const [open, setOpen] = useState(false);
  const p = themePalette(currentTheme);

  return (
    <div
      className="my-4 rounded-2xl border p-5 transition-colors"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--line)',
        boxShadow: '0 12px 32px rgba(0,0,0,.22), 0 0 26px color-mix(in srgb, var(--accent) 10%, transparent)',
      }}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="flex flex-1 min-w-[220px] items-center gap-3 text-left rounded-[14px] border-[1.5px] px-3.5 py-2.5 min-h-[52px] cursor-pointer transition-colors"
          style={{
            background: 'var(--surface2)',
            borderColor: 'var(--accent)',
            color: 'var(--ink)',
          }}
        >
          <span
            className="w-[34px] h-[34px] rounded-[10px] shrink-0 border-2 border-white/35"
            style={{ background: `linear-gradient(135deg, ${p.accent}, ${p.accent2})` }}
          />
          <span>
            <span className="block font-extrabold text-base leading-tight">{currentTheme.name}</span>
            <span className="block text-xs font-semibold" style={{ color: 'var(--muted)' }}>
              Theme — tap to browse all 100
            </span>
          </span>
          <span
            className={`ml-auto text-lg transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            ▾
          </span>
        </button>
      </div>

      {open && (
        <div className="mt-3">
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-2 max-h-[320px] overflow-auto p-1 rounded-xl border border-dashed"
            style={{ borderColor: 'var(--line)' }}
          >
            {THEMES.map((t) => {
              const tp = themePalette(t);
              const isSel = t.name === currentTheme.name;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    onSelectTheme(t);
                    onNotify(`Theme: ${t.name} — list stays open, tap Done when finished`);
                  }}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-[10px] border-[1.5px] text-left text-[12.5px] font-bold min-h-[44px] cursor-pointer transition-all"
                  style={{
                    background: 'var(--surface2)',
                    borderColor: isSel ? 'var(--accent)' : 'var(--line)',
                    color: 'var(--ink)',
                    boxShadow: isSel
                      ? '0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent)'
                      : undefined,
                  }}
                >
                  <span
                    className="w-[22px] h-[22px] rounded-[7px] shrink-0 border border-white/35"
                    style={{ background: `linear-gradient(135deg, ${tp.accent}, ${tp.accent2})` }}
                  />
                  <span className="truncate">{t.name}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onNotify(`Theme kept: ${currentTheme.name} ✓`);
            }}
            className="mt-3 w-full min-h-[44px] rounded-xl px-4 py-2.5 font-bold text-white cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              boxShadow: '0 6px 22px color-mix(in srgb, var(--accent) 45%, transparent)',
            }}
          >
            ✓ Done — keep this theme
          </button>
        </div>
      )}
    </div>
  );
};
