import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className="glass p-8 rounded-3xl border-white/5 space-y-4 hover:border-brand-primary/30 transition-colors group"
    >
      <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-brand-primary" />
      </div>
      <div className="space-y-2">
        <h4 className="text-lg font-display font-bold text-white">{title}</h4>
        <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
