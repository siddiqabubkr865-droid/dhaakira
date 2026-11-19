import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { downloadOfflineHtml } from '../utils/helpers';

interface InstallDownloadOptionsProps {
  onNotify: (msg: string) => void;
}

export const InstallDownloadOptions: React.FC<InstallDownloadOptionsProps> = ({ onNotify }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [guideTarget, setGuideTarget] = useState<'homescreen' | 'window' | null>(null);

  const handleHomeScreen = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        onNotify('DHAAKIRA added to your Home Screen ✓');
        return;
      }
    }
    setGuideTarget('homescreen');
  };

  const handleWindow = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        onNotify('DHAAKIRA installed as an app window ✓');
        return;
      }
    }
    setGuideTarget('window');
  };

  return (
    <div className="mt-3.5">
      <div className="text-[12.5px] font-bold mb-2" style={{ color: 'var(--muted)' }}>
        Download or install options
      </div>

      {!isInstalled ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleHomeScreen}
            className="min-h-[44px] rounded-xl border px-3.5 py-2.5 text-[13.5px] font-bold cursor-pointer transition-colors"
            style={{
              background: 'var(--surface2)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }}
          >
            📱 Add to Home Screen
          </button>

          <button
            type="button"
            onClick={handleWindow}
            className="min-h-[44px] rounded-xl border px-3.5 py-2.5 text-[13.5px] font-bold cursor-pointer transition-colors"
            style={{
              background: 'var(--surface2)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }}
          >
            🖥️ Open / Install Window
          </button>

          <button
            type="button"
            onClick={() => downloadOfflineHtml(onNotify)}
            className="min-h-[44px] rounded-xl border px-3.5 py-2.5 text-[13.5px] font-bold cursor-pointer transition-colors"
            style={{
              background: 'var(--surface2)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }}
          >
            ⬇ Download Offline HTML
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => downloadOfflineHtml(onNotify)}
          className="w-full min-h-[44px] rounded-xl border px-4 py-2.5 text-[14px] font-bold cursor-pointer transition-colors"
          style={{
            background: 'var(--surface2)',
            borderColor: 'var(--line)',
            color: 'var(--ink)',
          }}
        >
          ⬇ Download Offline HTML file
        </button>
      )}

      {guideTarget && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setGuideTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border-[1.5px] p-5 text-left"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--accent)',
              color: 'var(--ink)',
              boxShadow: '0 24px 60px rgba(0,0,0,.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold m-0 mb-2">
              {guideTarget === 'homescreen'
                ? '📱 Add DHAAKIRA to Home Screen'
                : '🖥️ Install DHAAKIRA in an App Window'}
            </h3>

            {guideTarget === 'homescreen' ? (
              <div className="text-sm space-y-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
                {isIOS ? (
                  <p className="m-0">
                    1. Open this app directly in <b style={{ color: 'var(--ink)' }}>Safari</b> (if
                    inside an embedded preview, open in a full tab first).
                    <br />
                    2. Tap the <b style={{ color: 'var(--ink)' }}>Share</b> button in Safari&apos;s
                    toolbar.
                    <br />
                    3. Scroll down and tap <b style={{ color: 'var(--ink)' }}>Add to Home Screen</b>.
                  </p>
                ) : (
                  <p className="m-0">
                    1. Open the app in a full browser tab (not inside a preview frame) in{' '}
                    <b style={{ color: 'var(--ink)' }}>Chrome, Edge, or Samsung Internet</b>.
                    <br />
                    2. Tap the browser menu (<b style={{ color: 'var(--ink)' }}>⋮</b>) in the top
                    right.
                    <br />
                    3. Tap <b style={{ color: 'var(--ink)' }}>Add to Home screen</b> or{' '}
                    <b style={{ color: 'var(--ink)' }}>Install app</b>.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm space-y-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
                <p className="m-0">
                  1. Open DHAAKIRA in a full <b style={{ color: 'var(--ink)' }}>Chrome or Edge</b>{' '}
                  tab.
                  <br />
                  2. Click the <b style={{ color: 'var(--ink)' }}>Install DHAAKIRA</b> icon in the
                  address bar, or open menu (<b style={{ color: 'var(--ink)' }}>⋮</b>) →{' '}
                  <b style={{ color: 'var(--ink)' }}>Cast, save, and share</b> →{' '}
                  <b style={{ color: 'var(--ink)' }}>Install page as app…</b> (or{' '}
                  <b style={{ color: 'var(--ink)' }}>Create shortcut → Open as window</b>).
                  <br />
                  3. Or download the single offline HTML file below to launch directly from your
                  desktop.
                </p>
              </div>
            )}

            <div className="flex gap-2.5 flex-wrap mt-4">
              <button
                type="button"
                onClick={() => {
                  downloadOfflineHtml(onNotify);
                  setGuideTarget(null);
                }}
                className="flex-1 min-w-[140px] min-h-[44px] rounded-xl px-4 py-2 font-bold text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
              >
                ⬇ Download Offline HTML
              </button>
              <button
                type="button"
                onClick={() => setGuideTarget(null)}
                className="min-h-[44px] rounded-xl border px-4 py-2 font-bold cursor-pointer"
                style={{
                  background: 'var(--surface2)',
                  borderColor: 'var(--line)',
                  color: 'var(--ink)',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
