import React from 'react';
import { ChevronRight } from 'lucide-react';

type AppTopHeaderProps = {
  viewLabel: string;
};

export function AppTopHeader({ viewLabel }: AppTopHeaderProps) {
  return (
    <header className="h-16 border-b border-brand-border flex items-center justify-between px-8 sticky top-0 bg-brand-dark/80 backdrop-blur-md z-20">
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <span>Mooka Intelligence</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white font-medium capitalize">{viewLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">AI Engine Online</span>
        </div>
      </div>
    </header>
  );
}
