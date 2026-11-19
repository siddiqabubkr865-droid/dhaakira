import React from 'react';
import type { AnswerMap, QuestionSpec, ShowBlock } from '../data/arenaRounds';

export const ShowBlocksRenderer: React.FC<{ blocks: ShowBlock[] }> = ({ blocks }) => {
  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'words':
            return (
              <div key={idx} className="flex flex-wrap gap-2.5 justify-center">
                {block.words.map((w, i) => (
                  <span
                    key={`${w}-${i}`}
                    className="rounded-xl border-[1.5px] px-4 py-2.5 font-extrabold text-[clamp(16px,4.4vw,21px)]"
                    style={{
                      background: 'var(--bg)',
                      borderColor: 'var(--accent)',
                      color: 'var(--ink)',
                    }}
                  >
                    {block.numbered && (
                      <span
                        className="font-display text-[0.72em] mr-2 tabular-nums"
                        style={{ color: 'var(--accent2)' }}
                      >
                        {i + 1}
                      </span>
                    )}
                    {w}
                  </span>
                ))}
              </div>
            );
          case 'bigseq':
            return (
              <div key={idx}>
                <div
                  className={`font-display font-extrabold break-words ${
                    block.compact
                      ? 'tracking-[0.06em] text-[clamp(20px,5.4vw,32px)]'
                      : 'tracking-[0.22em] text-[clamp(26px,7.5vw,44px)]'
                  }`}
                >
                  {block.text}
                </div>
                {block.sub && (
                  <p className="mt-2 mb-0 text-sm" style={{ color: 'var(--muted)' }}>
                    {block.sub}
                  </p>
                )}
              </div>
            );
          case 'emojiGrid':
            return (
              <div key={idx} className="flex flex-wrap gap-3 justify-center text-[clamp(38px,9vw,54px)]">
                {block.items.map((item, i) => (
                  <span
                    key={i}
                    className="rounded-[14px] border-[1.5px] px-3 py-2 leading-[1.15]"
                    style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
                  >
                    {item.e}
                    {item.cap && (
                      <span
                        className="block text-xs font-bold mt-1"
                        style={{ color: 'var(--muted)' }}
                      >
                        {item.cap}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            );
          case 'emojiRows':
            return (
              <div key={idx} className="space-y-2 text-[clamp(34px,8vw,48px)]">
                {block.rows.map((row, i) => (
                  <div key={i} className="leading-tight">
                    {row}
                  </div>
                ))}
              </div>
            );
          case 'colorSeq':
            return (
              <div key={idx}>
                <div className="flex gap-2.5 justify-center flex-wrap">
                  {block.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-[clamp(44px,11vw,64px)] h-[clamp(44px,11vw,64px)] rounded-[14px] border-2 border-white/40"
                      style={{ background: c.c }}
                      title={c.n}
                    />
                  ))}
                </div>
                {block.showNames && (
                  <p className="mt-3 mb-0 text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>
                    {block.colors.map((c) => c.n).join(' · ')}
                  </p>
                )}
              </div>
            );
          case 'sentence':
            return (
              <div
                key={idx}
                className="text-[clamp(19px,5vw,25px)] font-bold leading-[1.55] max-w-[640px] mx-auto"
              >
                {block.text}
              </div>
            );
          case 'passage':
            return (
              <div key={idx} className="text-left text-[16.5px] leading-[1.75] max-w-[640px] mx-auto space-y-2.5">
                {block.title && (
                  <p className="m-0 font-bold">{block.title}</p>
                )}
                {block.paragraphs.map((p, i) => (
                  <p key={i} className="m-0">
                    {p}
                  </p>
                ))}
              </div>
            );
          case 'pairRows':
            return (
              <div key={idx} className="grid gap-2 max-w-[460px] mx-auto text-left">
                {block.rows.map((r, i) => (
                  <div
                    key={i}
                    className="flex justify-between gap-3 rounded-xl border-[1.5px] px-4 py-2.5 font-extrabold text-[16.5px]"
                    style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
                  >
                    <span>{r.left}</span>
                    <span className="font-display tabular-nums" style={{ color: 'var(--accent2)' }}>
                      {r.right}
                    </span>
                  </div>
                ))}
              </div>
            );
          case 'shapeGrid':
            return (
              <div key={idx} className="flex flex-wrap gap-3 justify-center">
                {block.combos.map((x, i) => (
                  <span
                    key={i}
                    className="rounded-[14px] border-[1.5px] px-3 py-2 flex flex-col items-center"
                    style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
                  >
                    <svg
                      width="60"
                      height="60"
                      viewBox="0 0 60 60"
                      dangerouslySetInnerHTML={{ __html: x.s.paths(x.c.c) }}
                    />
                    <span className="text-xs font-bold mt-1" style={{ color: 'var(--muted)' }}>
                      {x.s.n} · {x.c.n}
                    </span>
                  </span>
                ))}
              </div>
            );
          case 'gridPattern': {
            const litSet = new Set(block.lit);
            return (
              <div
                key={idx}
                className="grid gap-1.5 justify-center mx-auto"
                style={{ gridTemplateColumns: `repeat(${block.size}, auto)` }}
              >
                {Array.from({ length: block.size * block.size }, (_, i) => {
                  const isLit = litSet.has(i);
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
            );
          }
          case 'gridObjects':
            return (
              <div key={idx}>
                <div
                  className="grid gap-1.5 justify-center mx-auto"
                  style={{ gridTemplateColumns: `repeat(${block.cols}, auto)` }}
                >
                  {block.cells.map((emoji, i) => (
                    <div
                      key={i}
                      className="w-[clamp(46px,12vw,62px)] h-[clamp(46px,12vw,62px)] rounded-xl border-[1.5px] flex items-center justify-center text-[30px]"
                      style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
                    >
                      {emoji ?? ''}
                    </div>
                  ))}
                </div>
                {block.footer && (
                  <p className="mt-2.5 mb-0 text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>
                    {block.footer}
                  </p>
                )}
              </div>
            );
          case 'judgeBox':
            return (
              <div
                key={idx}
                className="text-left rounded-xl border-[1.5px] px-3.5 py-3 text-sm mb-3.5"
                style={{
                  background: 'color-mix(in srgb, var(--warn) 14%, transparent)',
                  borderColor: 'var(--warn)',
                }}
              >
                <b style={{ color: 'var(--warn)' }}>Instruction:</b> {block.text}
              </div>
            );
          case 'stars':
            return (
              <div key={idx} className="text-[30px] mt-2">
                {'⭐'.repeat(block.count)}
              </div>
            );
        }
      })}
    </div>
  );
};

interface RecallQuestionsProps {
  questions: QuestionSpec[];
  answers: AnswerMap;
  onChange: (id: string, value: unknown) => void;
}

export const RecallQuestions: React.FC<RecallQuestionsProps> = ({
  questions,
  answers,
  onChange,
}) => {
  return (
    <div className="space-y-5">
      {questions.map((q) => {
        switch (q.kind) {
          case 'mcq': {
            const sel = typeof answers[q.id] === 'number' ? (answers[q.id] as number) : -1;
            return (
              <div key={q.id}>
                <div className="font-extrabold text-base mb-2.5 flex items-center gap-2 flex-wrap">
                  <span>{q.prompt}</span>
                  {q.promptEmoji && <span className="text-[28px]">{q.promptEmoji}</span>}
                </div>
                <div className="grid gap-2">
                  {q.options.map((o, i) => {
                    const active = sel === i;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => onChange(q.id, i)}
                        className="text-left rounded-xl border-[1.5px] px-3.5 py-2.5 min-h-[48px] font-bold flex items-center gap-2.5 cursor-pointer transition-colors"
                        style={{
                          background: active
                            ? 'color-mix(in srgb, var(--accent) 18%, var(--surface2))'
                            : 'var(--surface2)',
                          borderColor: active ? 'var(--accent)' : 'var(--line)',
                          color: 'var(--ink)',
                        }}
                      >
                        {o.emoji && <span className="text-[28px] leading-none">{o.emoji}</span>}
                        {o.shape && (
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 60 60"
                            dangerouslySetInnerHTML={{ __html: o.shape.s.paths(o.shape.c.c) }}
                          />
                        )}
                        {o.label && <span>{o.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }
          case 'multi': {
            const chosen = new Set(Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : []);
            const toggle = (id: string) => {
              const next = new Set(chosen);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              onChange(q.id, Array.from(next));
            };
            return (
              <div key={q.id}>
                <div className="font-extrabold text-base mb-2.5">
                  <div>{q.prompt}</div>
                  {q.subNote && (
                    <div className="text-[13px] font-semibold mt-1" style={{ color: 'var(--muted)' }}>
                      {q.subNote}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((o) => {
                    const active = chosen.has(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => toggle(o.id)}
                        className="rounded-full border-[1.5px] px-4 py-2 min-h-[44px] font-bold cursor-pointer transition-colors"
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
            );
          }
          case 'order': {
            const chosenIds = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
            const lookup = new Map(q.pool.map((p) => [p.id, p]));
            const addItem = (id: string) => onChange(q.id, [...chosenIds, id]);
            const removeAt = (idx: number) =>
              onChange(
                q.id,
                chosenIds.filter((_, i) => i !== idx)
              );
            return (
              <div key={q.id}>
                <div className="font-extrabold text-base mb-2.5">{q.prompt}</div>
                <div
                  className="min-h-[52px] rounded-xl border-[1.5px] border-dashed p-2 flex flex-wrap gap-2 items-center mb-2.5"
                  style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
                >
                  {chosenIds.length === 0 ? (
                    <span className="text-[13px] font-semibold p-1" style={{ color: 'var(--muted)' }}>
                      Tap the items below in order…
                    </span>
                  ) : (
                    chosenIds.map((id, idx) => {
                      const item = lookup.get(id);
                      if (!item) return null;
                      return (
                        <button
                          key={`${id}-${idx}`}
                          type="button"
                          title="Tap to remove"
                          onClick={() => removeAt(idx)}
                          className="rounded-full border-[1.5px] px-3.5 py-1.5 min-h-[40px] font-bold cursor-pointer inline-flex items-center gap-1.5"
                          style={{
                            background: 'color-mix(in srgb, var(--accent) 20%, var(--surface2))',
                            borderColor: 'var(--accent)',
                            color: 'var(--ink)',
                          }}
                        >
                          {item.colorHex && (
                            <span
                              className="inline-block w-4 h-4 rounded"
                              style={{ background: item.colorHex }}
                            />
                          )}
                          <span className={item.bigEmoji ? 'text-xl leading-none' : ''}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {q.pool.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addItem(item.id)}
                      className="rounded-full border-[1.5px] px-3.5 py-2 min-h-[44px] font-bold cursor-pointer inline-flex items-center gap-1.5"
                      style={{
                        background: 'var(--surface2)',
                        borderColor: 'var(--line)',
                        color: 'var(--ink)',
                      }}
                    >
                      {item.colorHex && (
                        <span
                          className="inline-block w-5 h-5 rounded-md border border-white/25"
                          style={{ background: item.colorHex }}
                        />
                      )}
                      <span className={item.bigEmoji ? 'text-xl leading-none' : ''}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onChange(q.id, [])}
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
            );
          }
          case 'text': {
            const val = typeof answers[q.id] === 'string' ? (answers[q.id] as string) : '';
            return (
              <div key={q.id}>
                <div className="font-extrabold text-base mb-2">{q.prompt}</div>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder={q.placeholder}
                  value={val}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  className="w-full min-h-[46px] rounded-xl border-[1.5px] px-3.5 py-2.5 font-bold"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--ink)',
                    borderColor: 'var(--line)',
                  }}
                />
              </div>
            );
          }
          case 'number': {
            const val =
              answers[q.id] === undefined || answers[q.id] === null ? '' : String(answers[q.id]);
            return (
              <div key={q.id}>
                <div className="font-extrabold text-base mb-2">{q.prompt}</div>
                <input
                  type="number"
                  min={0}
                  autoComplete="off"
                  value={val}
                  onChange={(e) =>
                    onChange(q.id, e.target.value === '' ? null : parseInt(e.target.value, 10))
                  }
                  className="w-full min-h-[46px] rounded-xl border-[1.5px] px-3.5 py-2.5 font-bold tabular-nums"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--ink)',
                    borderColor: 'var(--line)',
                  }}
                />
              </div>
            );
          }
          case 'textarea': {
            const val = typeof answers[q.id] === 'string' ? (answers[q.id] as string) : '';
            return (
              <div key={q.id}>
                <div className="font-extrabold text-base mb-2">{q.prompt}</div>
                <textarea
                  placeholder={q.placeholder}
                  value={val}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  className="w-full min-h-[120px] rounded-xl border-[1.5px] px-3.5 py-2.5 resize-y"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--ink)',
                    borderColor: 'var(--line)',
                  }}
                />
              </div>
            );
          }
          case 'gridPattern': {
            const mine = new Set(Array.isArray(answers[q.id]) ? (answers[q.id] as number[]) : []);
            const toggle = (i: number) => {
              const next = new Set(mine);
              if (next.has(i)) next.delete(i);
              else next.add(i);
              onChange(q.id, Array.from(next));
            };
            return (
              <div key={q.id}>
                <div className="font-extrabold text-base mb-2.5">{q.prompt}</div>
                <div
                  className="grid gap-1.5 justify-center mx-auto"
                  style={{ gridTemplateColumns: `repeat(${q.size}, auto)` }}
                >
                  {Array.from({ length: q.size * q.size }, (_, i) => {
                    const isLit = mine.has(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggle(i)}
                        aria-label={`Grid square ${i + 1}`}
                        className="w-[clamp(46px,12vw,62px)] h-[clamp(46px,12vw,62px)] rounded-xl border-[1.5px] cursor-pointer transition-colors"
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
            );
          }
          case 'gridLocation': {
            const sel = typeof answers[q.id] === 'number' ? (answers[q.id] as number) : -1;
            return (
              <div key={q.id}>
                <div className="font-extrabold text-base mb-2.5">{q.prompt}</div>
                <div
                  className="grid gap-1.5 justify-center mx-auto"
                  style={{ gridTemplateColumns: `repeat(${q.cols}, auto)` }}
                >
                  {Array.from({ length: q.totalCells }, (_, i) => {
                    const picked = sel === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onChange(q.id, i)}
                        aria-label={`Location square ${i + 1}`}
                        className="w-[clamp(46px,12vw,62px)] h-[clamp(46px,12vw,62px)] rounded-xl border-[1.5px] cursor-pointer transition-all"
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
            );
          }
        }
      })}
    </div>
  );
};
