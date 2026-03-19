import React from 'react';
import { ArrowRight, Download, Monitor } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandStrategy } from '../../services/BrandService';

type MockupsViewProps = {
  mockups: string[];
  strategy: BrandStrategy;
  onBackToIdentity: () => void;
  onGenerateMockup: (product: string) => void;
};

const PRODUCTS = ['T-Shirt', 'Hoodie', 'Cap', 'Mug', 'Tote Bag', 'Phone Case'];

export function MockupsView({ mockups, strategy, onBackToIdentity, onGenerateMockup }: MockupsViewProps) {
  return (
    <motion.div key="mockups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display font-bold text-white">Mockups de Produtos</h2>
        <button onClick={onBackToIdentity} className="text-xs font-bold text-neutral-500 hover:text-white transition-colors">
          Voltar para Identidade
        </button>
      </div>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-4 space-y-6">
          <div className="glass rounded-3xl p-8 space-y-6">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em]">Selecione o Produto</h4>
            <div className="grid grid-cols-1 gap-3">
              {PRODUCTS.map((product) => (
                <button
                  key={product}
                  onClick={() => onGenerateMockup(product)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-neutral-300 hover:bg-brand-primary hover:text-brand-dark hover:border-brand-primary transition-all flex items-center justify-between group"
                >
                  {product}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-8">
          <div className="grid grid-cols-1 gap-8">
            {mockups.length > 0 ? (
              mockups.map((url, i) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-[2rem] overflow-hidden relative group"
                >
                  <img src={url} alt={`Mockup ${i}`} className="w-full aspect-video object-cover" />
                  <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <a href={url} download={`${strategy.name}-mockup-${i}.png`} className="px-8 py-4 bg-brand-primary text-brand-dark font-black rounded-xl flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      DOWNLOAD MOCKUP HD
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-[400px] glass rounded-[2rem] border-dashed border-white/10 flex flex-col items-center justify-center text-neutral-500 space-y-4">
                <Monitor className="w-12 h-12 opacity-20" />
                <p className="text-sm font-medium">Selecione um produto para gerar o primeiro mockup</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
