import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="glass p-6 rounded-2xl border-white/5 flex items-center gap-4">
      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-brand-primary" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-display font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
}
