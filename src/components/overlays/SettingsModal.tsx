import React from 'react';
import { Globe, ShieldCheck, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  if (!open) return null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-brand-dark/80 backdrop-blur-md">
      <div className="glass w-full max-w-2xl rounded-[2.5rem] p-12 space-y-8 relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-neutral-500 hover:text-white transition-colors">
          <Trash2 className="w-6 h-6 rotate-45" />
        </button>

        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold text-white">Configuracoes do Sistema</h2>
          <p className="text-neutral-500">Gerencie sua conexao com o ecossistema Mooka.</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="font-bold text-white">Supabase MCP Connection</p>
                <p className="text-xs text-neutral-500">Conecte sua infraestrutura de dados avancada.</p>
              </div>
            </div>
            <button className="px-6 py-2 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary hover:text-brand-dark transition-all">
              MCP GERENCIADO NO BACKEND
            </button>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="font-bold text-white">Seguranca de Dados</p>
                <p className="text-xs text-neutral-500">Criptografia ponta-a-ponta ativa.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Ativo</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-white text-brand-dark font-bold rounded-xl">
            FECHAR
          </button>
        </div>
      </div>
    </motion.div>
  );
}
