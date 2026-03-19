import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

type NavItemProps = {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
};

export function NavItem({ active, onClick, icon: Icon, label, disabled }: NavItemProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { x: 3 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
        ${active
          ? 'bg-brand-primary text-brand-dark font-bold shadow-lg shadow-brand-primary/20'
          : 'text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed'}
      `}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-brand-dark' : 'text-neutral-500 group-hover:text-brand-primary'}`} />
      <span className="text-sm">{label}</span>
    </motion.button>
  );
}
