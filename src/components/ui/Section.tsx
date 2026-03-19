import React from 'react';
import { LucideIcon } from 'lucide-react';

type SectionProps = {
  title: string;
  content: string;
  icon: LucideIcon;
};

export function Section({ title, content, icon: Icon }: SectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-brand-primary">
        <Icon className="w-4 h-4" />
        <h4 className="text-xs font-bold uppercase tracking-widest">{title}</h4>
      </div>
      <p className="text-neutral-300 leading-relaxed">{content}</p>
    </div>
  );
}
