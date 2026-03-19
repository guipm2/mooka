import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

type FeedbackState = {
  type: 'error' | 'success';
  message: string;
} | null;

type FeedbackToastProps = {
  feedback: FeedbackState;
  onClose: () => void;
};

export function FeedbackToast({ feedback, onClose }: FeedbackToastProps) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-[210]"
        >
          <div className={`glass rounded-xl px-4 py-3 min-w-[280px] border ${feedback.type === 'error' ? 'border-red-500/40' : 'border-emerald-500/40'}`}>
            <div className="flex items-start gap-3">
              <div className={`text-xs font-black uppercase tracking-wider ${feedback.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                {feedback.type === 'error' ? 'Erro' : 'Sucesso'}
              </div>
              <p className="text-sm text-neutral-200 flex-1 leading-relaxed">{feedback.message}</p>
              <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
