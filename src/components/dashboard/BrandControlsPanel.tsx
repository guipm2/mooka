import React from 'react';
import { motion } from 'motion/react';
import { Check, SlidersHorizontal, Star } from 'lucide-react';
import { BrandPersonalization } from '../../services/BrandService';
import { BriefingAnswers, FavoritePreset } from '../../types/app';

type SegmentPreset = {
  id: string;
  title: string;
  description: string;
};

type BrandControlsPanelProps = {
  segmentPresets: SegmentPreset[];
  selectedPresetId: string | null;
  onApplyPreset: (presetId: string) => void;
  onResetPersonalization: () => void;

  favoritePresets: FavoritePreset[];
  editingFavoriteId: string | null;
  editingFavoriteName: string;
  onEditingFavoriteNameChange: (value: string) => void;
  onStartRenameFavorite: (presetId: string) => void;
  onSaveFavoriteName: () => void;
  onSaveCurrentAsFavorite: () => void;
  onApplyFavoritePreset: (presetId: string) => void;
  onUpdateFavoriteFromCurrent: (presetId: string) => void;
  onRemoveFavoritePreset: (presetId: string) => void;

  showBriefingAssistant: boolean;
  onToggleBriefingAssistant: () => void;
  briefingAnswers: BriefingAnswers;
  onBriefingAnswersChange: (next: BriefingAnswers) => void;
  onApplyBriefing: () => void;

  personalization: BrandPersonalization;
  isGuidedPersonalization: boolean;
  isDetailedPersonalization: boolean;
  onUpdatePersonalization: <K extends keyof BrandPersonalization>(
    key: K,
    value: BrandPersonalization[K],
  ) => void;
  onToggleVibe: (vibe: string) => void;

  paletteOptions: string[];
  archetypeOptions: string[];
  vibeOptions: string[];
  typographyOptions: string[];
  mockupSceneOptions: string[];
};

export function BrandControlsPanel({
  segmentPresets,
  selectedPresetId,
  onApplyPreset,
  onResetPersonalization,
  favoritePresets,
  editingFavoriteId,
  editingFavoriteName,
  onEditingFavoriteNameChange,
  onStartRenameFavorite,
  onSaveFavoriteName,
  onSaveCurrentAsFavorite,
  onApplyFavoritePreset,
  onUpdateFavoriteFromCurrent,
  onRemoveFavoritePreset,
  showBriefingAssistant,
  onToggleBriefingAssistant,
  briefingAnswers,
  onBriefingAnswersChange,
  onApplyBriefing,
  personalization,
  isGuidedPersonalization,
  isDetailedPersonalization,
  onUpdatePersonalization,
  onToggleVibe,
  paletteOptions,
  archetypeOptions,
  vibeOptions,
  typographyOptions,
  mockupSceneOptions,
}: BrandControlsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-[0.2em]">Comecar rapido por segmento</label>
          <button
            type="button"
            onClick={onResetPersonalization}
            className="text-[10px] font-bold text-neutral-500 hover:text-white transition-colors"
          >
            Limpar escolhas
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {segmentPresets.map((preset) => {
            const isActive = selectedPresetId === preset.id;
            return (
              <motion.button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset.id)}
                whileHover={{ y: -2 }}
                className={`text-left rounded-xl border px-4 py-3 transition-all ${
                  isActive
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <p className="text-sm font-bold text-white">{preset.title}</p>
                <p className="text-xs text-neutral-400 mt-1">{preset.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-brand-primary" />
            <p className="text-xs font-bold text-neutral-300 uppercase tracking-[0.2em]">Presets Favoritos</p>
          </div>
          <button
            type="button"
            onClick={onSaveCurrentAsFavorite}
            className="px-3 py-1.5 rounded-lg bg-brand-primary/15 border border-brand-primary/30 text-[11px] font-bold text-brand-primary hover:bg-brand-primary/25 transition-all"
          >
            Salvar atual
          </button>
        </div>

        {favoritePresets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {favoritePresets.map((preset) => (
              <motion.div
                key={preset.id}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-white/10 bg-brand-dark/40 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  {editingFavoriteId === preset.id ? (
                    <input
                      value={editingFavoriteName}
                      onChange={(e) => onEditingFavoriteNameChange(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-brand-primary"
                      placeholder="Nome do favorito"
                    />
                  ) : (
                    <p className="text-sm font-bold text-white truncate">{preset.name}</p>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{preset.conceptHint || 'Sem descricao salva.'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onApplyFavoritePreset(preset.id)}
                    className="px-3 py-2 text-[11px] font-bold rounded-lg bg-white/5 border border-white/10 text-neutral-200 hover:border-brand-primary/40 hover:text-white transition-all"
                  >
                    Aplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateFavoriteFromCurrent(preset.id)}
                    className="px-3 py-2 text-[11px] font-bold rounded-lg bg-white/5 border border-white/10 text-neutral-200 hover:border-brand-primary/40 hover:text-white transition-all"
                  >
                    Atualizar
                  </button>
                  {editingFavoriteId === preset.id ? (
                    <button
                      type="button"
                      onClick={onSaveFavoriteName}
                      className="px-3 py-2 text-[11px] font-bold rounded-lg bg-brand-primary/15 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/25 transition-all"
                    >
                      Salvar nome
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStartRenameFavorite(preset.id)}
                      className="px-3 py-2 text-[11px] font-bold rounded-lg bg-white/5 border border-white/10 text-neutral-200 hover:border-brand-primary/40 hover:text-white transition-all"
                    >
                      Renomear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveFavoritePreset(preset.id)}
                    className="px-3 py-2 text-[11px] font-bold rounded-lg bg-white/5 border border-white/10 text-red-300 hover:border-red-400/40 transition-all"
                  >
                    Remover
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500">Nenhum favorito salvo ainda. Configure seu estilo e clique em Salvar atual.</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-neutral-300 uppercase tracking-[0.2em]">Assistente de briefing</p>
            <p className="text-xs text-neutral-500 mt-1">Responda 4 perguntas e a IA monta sua direcao de marca.</p>
          </div>
          <button
            type="button"
            onClick={onToggleBriefingAssistant}
            className="px-4 py-2 rounded-lg bg-brand-primary/15 border border-brand-primary/30 text-[11px] font-bold text-brand-primary hover:bg-brand-primary/25 transition-all"
          >
            {showBriefingAssistant ? 'Fechar' : 'Iniciar'}
          </button>
        </div>

        {showBriefingAssistant && (
          <div className="space-y-4 pt-3 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-300">1. Como quer se posicionar?</label>
                <select
                  value={briefingAnswers.positioning}
                  onChange={(e) => onBriefingAnswersChange({ ...briefingAnswers, positioning: e.target.value as BriefingAnswers['positioning'] })}
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
                >
                  <option value="premium">Premium</option>
                  <option value="disruptiva">Disruptiva</option>
                  <option value="acessivel">Acessivel</option>
                  <option value="sustentavel">Sustentavel</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-300">2. Publico principal?</label>
                <select
                  value={briefingAnswers.audience}
                  onChange={(e) => onBriefingAnswersChange({ ...briefingAnswers, audience: e.target.value as BriefingAnswers['audience'] })}
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
                >
                  <option value="geral">Geral</option>
                  <option value="jovem">Jovem</option>
                  <option value="corporativo">Corporativo</option>
                  <option value="familias">Familias</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-300">3. Personalidade da marca?</label>
                <select
                  value={briefingAnswers.personality}
                  onChange={(e) => onBriefingAnswersChange({ ...briefingAnswers, personality: e.target.value as BriefingAnswers['personality'] })}
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
                >
                  <option value="confiavel">Confiavel</option>
                  <option value="amigavel">Amigavel</option>
                  <option value="sofisticada">Sofisticada</option>
                  <option value="ousada">Ousada</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-300">4. Intensidade visual?</label>
                <select
                  value={briefingAnswers.visual}
                  onChange={(e) => onBriefingAnswersChange({ ...briefingAnswers, visual: e.target.value as BriefingAnswers['visual'] })}
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
                >
                  <option value="clean">Clean</option>
                  <option value="equilibrado">Equilibrado</option>
                  <option value="expressivo">Expressivo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onApplyBriefing}
                className="px-5 py-2 bg-white text-brand-dark font-bold rounded-lg hover:bg-brand-primary transition-colors"
              >
                Aplicar briefing
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
        <label className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em]">Nivel de personalizacao</label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { value: 'auto', title: 'Automatico', desc: 'A IA decide por voce.' },
          { value: 'guided', title: 'Guiado', desc: 'Voce escolhe os pontos-chave.' },
          { value: 'detailed', title: 'Detalhado', desc: 'Controle fino sem complexidade.' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onUpdatePersonalization('controlLevel', option.value as BrandPersonalization['controlLevel'])}
            className={`text-left rounded-xl border px-4 py-3 transition-all ${
              personalization.controlLevel === option.value
                ? 'border-brand-primary bg-brand-primary/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <p className="text-sm font-bold text-white">{option.title}</p>
            <p className="text-xs text-neutral-400 mt-1">{option.desc}</p>
          </button>
        ))}
      </div>

      {isGuidedPersonalization && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-300">Paleta preferida</label>
              <select
                value={personalization.palettePreference || ''}
                onChange={(e) => onUpdatePersonalization('palettePreference', e.target.value)}
                className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
              >
                <option value="">Deixar a IA recomendar</option>
                {paletteOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-300">Tipo de identidade</label>
              <select
                value={personalization.identityArchetype || ''}
                onChange={(e) => onUpdatePersonalization('identityArchetype', e.target.value)}
                className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
              >
                <option value="">Deixar a IA sugerir</option>
                {archetypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-neutral-300">Vibe da marca</label>
            <div className="flex flex-wrap gap-2">
              {vibeOptions.map((vibe) => {
                const active = (personalization.brandVibe || []).includes(vibe);
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => onToggleVibe(vibe)}
                    className={`px-3 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      active
                        ? 'border-brand-primary bg-brand-primary/15 text-brand-primary'
                        : 'border-white/15 bg-white/5 text-neutral-300 hover:border-white/30'
                    }`}
                  >
                    {active && <Check className="w-3 h-3" />}
                    {vibe}
                  </button>
                );
              })}
            </div>
          </div>

          {isDetailedPersonalization && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-300">Tipografia desejada</label>
                  <select
                    value={personalization.typographyMood || ''}
                    onChange={(e) => onUpdatePersonalization('typographyMood', e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
                  >
                    <option value="">Sem preferencia</option>
                    {typographyOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-300">Cena dos mockups</label>
                  <select
                    value={personalization.mockupScene || ''}
                    onChange={(e) => onUpdatePersonalization('mockupScene', e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
                  >
                    <option value="">Sem preferencia</option>
                    {mockupSceneOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-300">Elementos que devem aparecer</label>
                  <input
                    value={personalization.logoElements || ''}
                    onChange={(e) => onUpdatePersonalization('logoElements', e.target.value)}
                    placeholder="Ex: folha, circulo, conexao"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-300">Elementos a evitar</label>
                  <input
                    value={personalization.avoidElements || ''}
                    onChange={(e) => onUpdatePersonalization('avoidElements', e.target.value)}
                    placeholder="Ex: icone generico, excesso de detalhe"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-300">Paleta personalizada (opcional)</label>
                <input
                  value={personalization.customPalette || ''}
                  onChange={(e) => onUpdatePersonalization('customPalette', e.target.value)}
                  placeholder="Ex: #102A43, #243B53, #F0B429"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          )}

          <p className="text-xs text-neutral-400">
            Dica: quanto menos voce preencher, mais liberdade criativa a IA tera. Quanto mais voce preencher, maior sera o controle da direcao.
          </p>
        </div>
      )}
    </div>
  );
}
