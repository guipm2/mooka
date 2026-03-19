import React from 'react';
import { Download } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandStrategy } from '../../services/BrandService';

type IdentityViewProps = {
  activeLogo: string;
  strategy: BrandStrategy;
  onBackToStrategy: () => void;
  onGoToMockups: () => void;
  onGenerateLogo: (style: string) => void;
};

const LOGO_STYLES = ['Minimalist', 'Modern Tech', 'Luxury', 'Playful', 'Brutalism'];

export function IdentityView({
  activeLogo,
  strategy,
  onBackToStrategy,
  onGoToMockups,
  onGenerateLogo,
}: IdentityViewProps) {
  return (
    <motion.div key="identity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display font-bold text-white">Identidade Visual</h2>
        <div className="flex gap-4">
          <button onClick={onBackToStrategy} className="text-xs font-bold text-neutral-500 hover:text-white transition-colors">
            Voltar para Estrategia
          </button>
          <button onClick={onGoToMockups} className="px-6 py-2 bg-brand-primary text-brand-dark font-bold rounded-lg hover:brightness-110 transition-all">
            Ir para Mockups
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-6 space-y-8">
          <div className="glass rounded-[2rem] p-12 flex items-center justify-center relative group overflow-hidden">
            <img src={activeLogo} alt="Logo" className="w-full max-w-[300px] relative z-10" />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <a href={activeLogo} download={`${strategy.name}-logo.png`} className="p-4 bg-brand-primary text-brand-dark rounded-full shadow-xl">
                <Download className="w-6 h-6" />
              </a>
            </div>
            <div className="absolute top-4 right-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Master Asset v1.0</div>
          </div>

          <div className="glass rounded-3xl p-8 space-y-6">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em]">Regenerar com Estilo</h4>
            <div className="grid grid-cols-3 gap-3">
              {LOGO_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => onGenerateLogo(style)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-neutral-400 hover:border-brand-primary hover:text-white transition-all"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-6 space-y-8">
          <div className="glass rounded-3xl p-8 space-y-8">
            <h3 className="text-xl font-display font-bold text-white">Brand Guidelines</h3>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tipografia Sugerida</h4>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-2xl font-display text-white">Space Grotesk</p>
                  <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">Display & Headings</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-lg font-sans text-white">Inter</p>
                  <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">Body & UI</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Uso Correto</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl flex items-center justify-center aspect-video">
                  <img src={activeLogo} alt="Logo Light" className="w-16 opacity-80" />
                </div>
                <div className="p-4 bg-brand-dark rounded-xl flex items-center justify-center aspect-video border border-white/10">
                  <img src={activeLogo} alt="Logo Dark" className="w-16 brightness-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
