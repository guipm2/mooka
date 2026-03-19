import React from 'react';
import { MessageSquare } from 'lucide-react';

type ChatMemoryBadgeProps = {
  title?: string;
};

export function ChatMemoryBadge({ title = 'Este projeto possui memória longa de chat salva.' }: ChatMemoryBadgeProps) {
  return (
    <div
      title={title}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300"
    >
      <MessageSquare className="w-3 h-3" />
      <span className="text-[8px] font-bold uppercase tracking-widest">Chat</span>
    </div>
  );
}
