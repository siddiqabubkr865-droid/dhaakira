import React from 'react';
import { avatarDesc, charFor, danceTier } from '../data/characters';

interface AvatarProps {
  adno: number | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ adno, size = 'md', className = '' }) => {
  const c = charFor(adno);
  const sizeStyles =
    size === 'sm'
      ? 'w-[34px] h-[34px] border-2 text-[20px]'
      : size === 'lg'
        ? 'w-[96px] h-[96px] border-[3px] text-[58px]'
        : 'w-[46px] h-[46px] border-[2.5px] text-[27px]';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden align-middle select-none ${sizeStyles} ${className}`}
      style={{
        borderColor: 'var(--accent2)',
        background: `linear-gradient(135deg, ${c.grad[0]}, ${c.grad[1]})`,
        boxShadow: '0 0 14px color-mix(in srgb, var(--accent2) 35%, transparent)',
      }}
      title={`Character avatar of Ad.No ${adno} — ${avatarDesc(adno)}`}
    >
      <span className="leading-none" aria-hidden="true">
        {c.emoji}
      </span>
    </span>
  );
};

interface DancerAvatarProps {
  adno: number | string;
  pct: number;
}

export const DancerAvatar: React.FC<DancerAvatarProps> = ({ adno, pct }) => {
  const tier = danceTier(pct);
  return (
    <span className={`relative inline-block leading-none dancer-${tier}`}>
      <Avatar adno={adno} size="lg" className="dancer-avatar" />
      {tier === 'cry' && (
        <>
          <span className="dancer-tear pointer-events-none absolute left-[6%] top-[52%] z-[2] text-[20px] leading-none" aria-hidden="true">
            💧
          </span>
          <span
            className="dancer-tear pointer-events-none absolute right-[6%] top-[52%] z-[2] text-[20px] leading-none"
            style={{ animationDelay: '0.45s' }}
            aria-hidden="true"
          >
            💧
          </span>
          <span
            className="dancer-tear pointer-events-none absolute left-[44%] top-[52%] z-[2] text-[15px] leading-none"
            style={{ animationDelay: '0.85s' }}
            aria-hidden="true"
          >
            💧
          </span>
        </>
      )}
      {(tier === 'smile' || tier === 'mega') && (
        <>
          <span
            className={`dancer-spark pointer-events-none absolute -left-[14px] top-[2px] z-[2] leading-none ${tier === 'mega' ? 'text-[22px]' : 'text-[19px]'}`}
            aria-hidden="true"
          >
            ✨
          </span>
          <span
            className={`dancer-spark pointer-events-none absolute -right-[14px] top-[10px] z-[2] leading-none ${tier === 'mega' ? 'text-[22px]' : 'text-[19px]'}`}
            style={{ animationDelay: '0.4s' }}
            aria-hidden="true"
          >
            ✨
          </span>
          <span
            className={`dancer-spark pointer-events-none absolute -right-[6px] -bottom-[4px] z-[2] leading-none ${tier === 'mega' ? 'text-[22px]' : 'text-[15px]'}`}
            style={{ animationDelay: '0.8s' }}
            aria-hidden="true"
          >
            ✨
          </span>
        </>
      )}
    </span>
  );
};
