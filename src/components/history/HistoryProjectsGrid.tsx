import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, History, Target } from 'lucide-react';
import { ChatMemoryBadge } from '../ui/ChatMemoryBadge';
import { ProjectTypeBadge } from '../ui/ProjectTypeBadge';
import { Project } from '../../types/app';

type HistoryProjectsGridProps = {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
};

export function HistoryProjectsGrid({ projects, onOpenProject, onDeleteProject }: HistoryProjectsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {projects.map((project) => {
        const hasChatMemory = Boolean(project.data?.chatSession?.messages?.length);
        return (
          <motion.div
            key={project.id}
            whileHover={{ y: -5 }}
            className="glass rounded-2xl overflow-hidden border-white/5 group"
          >
            {project.url ? (
              <div className="aspect-video bg-white/5 relative overflow-hidden">
                <img src={project.url} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => onOpenProject(project)} className="p-3 bg-white text-brand-dark rounded-full shadow-xl">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-brand-primary/10 flex items-center justify-center">
                <Target className="w-12 h-12 text-brand-primary opacity-30" />
              </div>
            )}

            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <ProjectTypeBadge type={project.type} />
                <div className="flex items-center gap-2">
                  {hasChatMemory && <ChatMemoryBadge />}
                  <span className="text-[10px] text-neutral-600">{new Date(project.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white truncate">{project.name}</h4>
              <div className="flex items-center justify-between">
                {project.type === 'strategy' ? (
                  <button
                    onClick={() => onOpenProject(project)}
                    className="text-[10px] font-bold text-brand-primary hover:underline"
                  >
                    Ver Estratégia Completa
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={() => onDeleteProject(project)}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}

      {projects.length === 0 && (
        <div className="col-span-3 h-64 glass rounded-3xl border-dashed border-white/10 flex flex-col items-center justify-center text-neutral-500 space-y-4">
          <History className="w-12 h-12 opacity-20" />
          <p className="text-sm font-medium">Nenhum projeto encontrado ainda.</p>
        </div>
      )}
    </div>
  );
}
