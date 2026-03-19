import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Send } from 'lucide-react';
import { ChatMessage } from '../../types/app';

type BriefingChatPanelProps = {
  chatMessages: ChatMessage[];
  isAssistantTyping: boolean;
  enableLongChatMemory: boolean;
  onToggleLongMemory: () => void;
  onClearChat: () => void;
  chatDraft: string;
  onChangeChatDraft: (value: string) => void;
  onSubmitChat: () => void;
  quickPrompts: string[];
  onUseQuickPrompt: (prompt: string) => void;
  chatMemory: string[];
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
};

export function BriefingChatPanel({
  chatMessages,
  isAssistantTyping,
  enableLongChatMemory,
  onToggleLongMemory,
  onClearChat,
  chatDraft,
  onChangeChatDraft,
  onSubmitChat,
  quickPrompts,
  onUseQuickPrompt,
  chatMemory,
  chatScrollRef,
}: BriefingChatPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
          <Bot className="w-4 h-4" />
          Chat de Briefing Criativo
        </label>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
            Memoria curta ativa
          </div>
          <button
            type="button"
            onClick={onToggleLongMemory}
            className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-widest font-bold transition-colors ${
              enableLongChatMemory
                ? 'bg-brand-primary/15 border-brand-primary/30 text-brand-primary'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            Memoria longa {enableLongChatMemory ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={onClearChat}
            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neutral-400 font-bold hover:text-white transition-colors"
          >
            Limpar chat
          </button>
        </div>
      </div>

      <div className="chatbox-shell rounded-3xl border border-white/10 overflow-hidden">
        <div ref={chatScrollRef} className="chatbox-messages p-4 md:p-6 space-y-3 max-h-[320px] overflow-y-auto">
          <AnimatePresence>
            {chatMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'assistant'
                    ? 'bg-white/5 border border-white/10 text-neutral-200'
                    : 'bg-brand-primary text-brand-dark font-medium'
                }`}>
                  {message.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isAssistantTyping && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-1 rounded-2xl px-3 py-2 bg-white/5 border border-white/10">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        <div className="chatbox-input border-t border-white/10 p-3 md:p-4 bg-brand-dark/40">
          <div className="flex items-end gap-3">
            <textarea
              value={chatDraft}
              onChange={(e) => onChangeChatDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmitChat();
                }
              }}
              placeholder="Descreva sua marca como se estivesse conversando com um estrategista..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm md:text-base text-white outline-none focus:border-brand-primary transition-all min-h-[80px] max-h-[180px] resize-y"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              type="button"
              onClick={onSubmitChat}
              disabled={!chatDraft.trim()}
              className="h-12 w-12 rounded-xl bg-brand-primary text-brand-dark flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onUseQuickPrompt(prompt)}
            className="px-3 py-2 rounded-full text-xs font-medium border border-white/15 bg-white/5 text-neutral-300 hover:border-brand-primary/40 hover:text-white transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {chatMemory.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Contexto da sessao</p>
          <div className="flex flex-wrap gap-2">
            {chatMemory.slice(-3).map((item, index) => (
              <span key={`${item}-${index}`} className="px-2 py-1 rounded-full bg-brand-dark/60 border border-white/10 text-[10px] text-neutral-300 max-w-[240px] truncate">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
