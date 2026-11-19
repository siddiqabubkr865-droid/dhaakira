import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DhaakiraLogo } from './DhaakiraLogo';

interface OpeningSplashProps {
  onComplete: () => void;
}

export const OpeningSplash: React.FC<OpeningSplashProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const duration = reduce ? 450 : 2500;
    const hideTimer = setTimeout(() => setVisible(false), duration);
    const doneTimer = setTimeout(() => onComplete(), duration + 450);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setVisible(false);
    setTimeout(onComplete, 250);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="opening-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center px-6 text-center select-none"
          style={{
            background: 'var(--bg)',
            backgroundImage:
              'radial-gradient(640px 420px at 50% 42%, color-mix(in srgb, var(--accent) 26%, transparent), transparent 68%), radial-gradient(520px 360px at 50% 62%, color-mix(in srgb, var(--accent2) 18%, transparent), transparent 70%)',
          }}
        >
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-5 right-5 min-h-[38px] rounded-xl border px-3.5 py-1.5 text-xs font-bold cursor-pointer transition-opacity hover:opacity-100 opacity-75"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--line)',
              color: 'var(--muted)',
            }}
          >
            Skip →
          </button>

          {/* Animated Logo Crest */}
          <motion.div
            initial={{ opacity: 0, scale: 0.55, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: [0, 0.7, 0.35], scale: [0.7, 1.25, 1.1] }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="absolute w-32 h-32 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in srgb, var(--accent) 42%, transparent), transparent 70%)',
              }}
            />
            <DhaakiraLogo size={108} className="relative z-10 drop-shadow-xl" />
          </motion.div>

          {/* Arabic & Brand Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4"
          >
            <div
              className="font-arabic font-bold text-[52px] leading-none"
              lang="ar"
              dir="rtl"
              style={{
                color: 'var(--accent)',
                textShadow: '0 0 28px color-mix(in srgb, var(--accent) 45%, transparent)',
              }}
            >
              ذَاكِرَة
            </div>
            <div
              className="font-display font-extrabold tracking-[0.22em] text-[28px] mt-1"
              style={{
                color: 'var(--ink)',
                textShadow: '0 0 20px color-mix(in srgb, var(--accent2) 35%, transparent)',
              }}
            >
              DHAAKIRA
            </div>
          </motion.div>

          {/* Subtitle Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 font-display tracking-[0.26em] text-xs font-bold uppercase"
            style={{ color: 'var(--accent2)' }}
          >
            UNLOCK THE UNIMAGINED
          </motion.div>

          {/* Expanding Accent Line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 h-0.5 w-48 origin-center"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent)',
            }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.45 }}
            className="mt-2.5 text-xs font-semibold tracking-[0.14em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Observe · Remember · Recall
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
