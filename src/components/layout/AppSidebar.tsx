import React from 'react';
import {
  History,
  LayoutDashboard,
  Layers,
  LogOut,
  Palette,
  Settings,
  Target,
  User,
} from 'lucide-react';
import { NavItem } from '../ui/NavItem';

type AppSidebarProps = {
  logo: React.ReactNode;
  view: 'dashboard' | 'strategy' | 'identity' | 'mockups' | 'history';
  showSettings: boolean;
  hasStrategy: boolean;
  hasActiveLogo: boolean;
  userEmail?: string;
  onSetView: (view: 'dashboard' | 'strategy' | 'identity' | 'mockups' | 'history') => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
};

export function AppSidebar({
  logo,
  view,
  showSettings,
  hasStrategy,
  hasActiveLogo,
  userEmail,
  onSetView,
  onOpenSettings,
  onSignOut,
}: AppSidebarProps) {
  return (
    <aside className="w-64 border-r border-brand-border flex flex-col bg-brand-surface/50 backdrop-blur-md relative z-10">
      <div className="p-6">{logo}</div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        <NavItem active={view === 'dashboard'} onClick={() => onSetView('dashboard')} icon={LayoutDashboard} label="Dashboard" />
        <NavItem active={view === 'strategy'} onClick={() => onSetView('strategy')} icon={Target} label="Estrategia" disabled={!hasStrategy} />
        <NavItem active={view === 'identity'} onClick={() => onSetView('identity')} icon={Palette} label="Identidade" disabled={!hasActiveLogo} />
        <NavItem active={view === 'mockups'} onClick={() => onSetView('mockups')} icon={Layers} label="Mockups" disabled={!hasActiveLogo} />
        <NavItem active={view === 'history'} onClick={() => onSetView('history')} icon={History} label="Historico" />
        <NavItem active={showSettings} onClick={onOpenSettings} icon={Settings} label="Configuracoes" />
      </nav>

      <div className="p-4 border-t border-brand-border space-y-4">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30">
            <User className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userEmail || 'Usuario local'}</p>
            <p className="text-[10px] text-neutral-500">Plano Enterprise</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair da Plataforma
        </button>
      </div>
    </aside>
  );
}
