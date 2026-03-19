import React from 'react';
import { motion } from 'motion/react';
import { ChatMemoryBadge } from '../ui/ChatMemoryBadge';
import { ProjectTypeBadge } from '../ui/ProjectTypeBadge';
import { Project } from '../../types/app';

type RecentProjectsPanelProps = {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onViewHistory: () => void;
};

export function RecentProjectsPanel({ projects, onOpenProject, onViewHistory }: RecentProjectsPanelProps) {
  return (
    <div className="glass rounded-3xl p-6 space-y-5 border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-bold text-white">Projetos Recentes</h3>
        <button
          onClick={onViewHistory}
          className="text-[11px] font-bold text-brand-primary hover:text-white transition-colors"
        >
          Ver histórico completo
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.slice(0, 6).map((project) => {
            const hasChatMemory = Boolean(project.data?.chatSession?.messages?.length);
            return (
              <motion.button
                key={`recent-${project.id}`}
                whileHover={{ y: -3 }}
                onClick={() => onOpenProject(project)}
                className="text-left rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 hover:border-brand-primary/30 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <ProjectTypeBadge type={project.type} />
                  {hasChatMemory && <ChatMemoryBadge />}
                </div>

                <p className="text-sm font-bold text-white truncate">{project.name}</p>
                <p className="text-[10px] text-neutral-500">{new Date(project.timestamp).toLocaleDateString()}</p>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm text-neutral-400">Ainda não há projetos recentes para exibir.</p>
        </div>
      )}
    </div>
  );
}
