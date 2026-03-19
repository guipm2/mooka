import React from 'react';

type ProjectTypeBadgeProps = {
  type: 'strategy' | 'logo' | 'mockup';
};

export function ProjectTypeBadge({ type }: ProjectTypeBadgeProps) {
  return (
    <span
      className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
        type === 'strategy'
          ? 'bg-blue-500/20 text-blue-400'
          : type === 'logo'
            ? 'bg-brand-primary/20 text-brand-primary'
            : 'bg-purple-500/20 text-purple-400'
      }`}
    >
      {type}
    </span>
  );
}
