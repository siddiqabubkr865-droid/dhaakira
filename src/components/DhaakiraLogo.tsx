import React, { useState } from 'react';

interface DhaakiraLogoProps {
  size?: number;
  className?: string;
}

export const DhaakiraLogo: React.FC<DhaakiraLogoProps> = ({ size = 64, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-2xl border-2 font-arabic font-bold ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: Math.round(size * 0.45),
          background: 'var(--surface2)',
          borderColor: 'var(--accent)',
          color: 'var(--ink)',
        }}
        aria-label="DHAAKIRA Logo"
      >
        ذ
      </div>
    );
  }

  return (
    <img
      src="/assets/aistudio/image_3b65b84d.png"
      alt="DHAAKIRA Logo"
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
      className={`inline-block object-contain select-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
      }}
    />
  );
};
