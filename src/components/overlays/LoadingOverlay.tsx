import React from 'react';
import { Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type LoadingOverlayProps = {
  open: boolean;
  loadingMessage: string;
};

export function LoadingOverlay({ open, loadingMessage }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8">
          <div className="relative w-40 h-40 mb-12">
            <div className="absolute inset-0 border-2 border-brand-primary/10 rounded-full" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border-2 border-t-brand-primary rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-brand-primary/20 rounded-full blur-2xl animate-pulse" />
              <Zap className="w-12 h-12 text-brand-primary relative z-10 fill-brand-primary" />
            </div>
          </div>
          <motion.p key={loadingMessage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-display font-medium text-white text-center max-w-xl leading-relaxed">
            {loadingMessage}
          </motion.p>
          <div className="mt-8 flex items-center gap-4 text-neutral-600">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Neural Engine v3.1</span>
            <div className="w-1 h-1 rounded-full bg-neutral-800" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Market Grounding Active</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
