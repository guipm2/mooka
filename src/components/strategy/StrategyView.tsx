import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, MessageSquare, Sparkles, Target, TrendingUp, User } from 'lucide-react';
import { BrandStrategy } from '../../services/BrandService';
import { Section } from '../ui/Section';

type StrategyViewProps = {
  strategy: BrandStrategy;
  personalizationSummary: string[];
  onBackToDashboard: () => void;
  onProceedToIdentity: () => void;
};

export function StrategyView({
  strategy,
  personalizationSummary,
  onBackToDashboard,
  onProceedToIdentity,
}: StrategyViewProps) {
  return (
    <motion.div key="strat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display font-bold text-white">
          Estrategia de Marca: <span className="text-brand-primary">{strategy.name}</span>
        </h2>
        <button onClick={onBackToDashboard} className="text-xs font-bold text-neutral-500 hover:text-white transition-colors">
          Nova Analise
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-6">
          <div className="glass rounded-3xl p-8 space-y-6">
            <Section title="Tagline" content={strategy.tagline} icon={Sparkles} />
            <Section title="Missao" content={strategy.mission} icon={Target} />
            <Section title="Publico-Alvo" content={strategy.targetAudience} icon={User} />
            <Section title="Tom de Voz" content={strategy.toneOfVoice} icon={MessageSquare} />

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4" />
                Principais Concorrentes
              </h4>
              <div className="flex flex-wrap gap-2">
                {strategy.competitors.map((comp) => (
                  <span key={comp} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-neutral-400">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          {personalizationSummary.length > 0 && (
            <div className="glass rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Preferencias Aplicadas</h4>
              <div className="flex flex-wrap gap-2">
                {personalizationSummary.map((item) => (
                  <span key={item} className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] text-brand-primary">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="glass rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Paleta Sugerida</h4>
            <div className="flex gap-2">
              {strategy.colorPalette.map((color) => (
                <div key={color} className="w-full aspect-square rounded-xl border border-white/10" style={{ backgroundColor: color }} title={color} />
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Tendencias de Mercado</h4>
            <div className="space-y-2">
              {strategy.marketTrends.map((trend) => (
                <div key={trend} className="flex items-center gap-2 text-xs text-neutral-400">
                  <TrendingUp className="w-3 h-3 text-brand-primary" />
                  {trend}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onProceedToIdentity}
          className="px-12 py-5 bg-white text-brand-dark font-black rounded-2xl hover:bg-brand-primary transition-colors flex items-center gap-3"
        >
          PROSSEGUIR PARA IDENTIDADE VISUAL
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
