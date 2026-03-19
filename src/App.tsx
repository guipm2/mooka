/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  History, 
  Settings,
  ChevronRight,
  Layers,
  Zap,
  Palette,
  Monitor,
  Search,
  Target,
  MessageSquare,
  LogOut,
  User,
  ArrowRight,
  Download,
  Trash2,
  Globe,
  TrendingUp,
  ShieldCheck,
  X,
  SlidersHorizontal,
  Check,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { BrandService, BrandStrategy, BrandPersonalization } from './services/BrandService';
import { NavItem } from './components/ui/NavItem';
import { FeatureCard } from './components/ui/FeatureCard';
import { StatCard } from './components/ui/StatCard';
import { Section } from './components/ui/Section';
import { AuthView } from './components/auth/AuthView';
import { BriefingChatPanel } from './components/dashboard/BriefingChatPanel';
import { BrandControlsPanel } from './components/dashboard/BrandControlsPanel';
import { RecentProjectsPanel } from './components/dashboard/RecentProjectsPanel';
import { HistoryProjectsGrid } from './components/history/HistoryProjectsGrid';
import { IdentityView } from './components/identity/IdentityView';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppTopHeader } from './components/layout/AppTopHeader';
import { MockupsView } from './components/mockups/MockupsView';
import { FeedbackToast } from './components/overlays/FeedbackToast';
import { LoadingOverlay } from './components/overlays/LoadingOverlay';
import { SettingsModal } from './components/overlays/SettingsModal';
import { StrategyView } from './components/strategy/StrategyView';
import {
  BriefingAnswers,
  ChatMessage,
  ChatSessionSnapshot,
  FavoritePreset,
  HealthResponse,
  Project,
  SegmentPreset,
  ViewMode,
} from './types/app';

// --- Types ---

const LOCAL_PROJECTS_KEY = 'mooka_local_projects_v1';
const FAVORITE_PRESETS_KEY = 'mooka_favorite_presets_v1';
const CHAT_LONG_MEMORY_KEY = 'mooka_chat_long_memory_v1';

const createDefaultPersonalization = (): BrandPersonalization => ({
  controlLevel: 'auto',
  brandVibe: [],
});

const PALETTE_OPTIONS = ['Auto (IA recomenda)', 'Quente', 'Fria', 'Terrosa', 'Pastel', 'Luxuosa', 'Alto contraste'];
const ARCHETYPE_OPTIONS = ['Inovadora', 'Confiável', 'Minimalista', 'Premium', 'Acolhedora', 'Ousada'];
const VIBE_OPTIONS = ['Moderna', 'Humana', 'Sofisticada', 'Divertida', 'Tecnológica', 'Sustentável'];
const TYPOGRAPHY_OPTIONS = ['Neutra', 'Geométrica', 'Elegante', 'Orgânica', 'Impactante'];
const MOCKUP_SCENE_OPTIONS = ['Estúdio limpo', 'Lifestyle urbano', 'Corporate premium', 'Criativo colorido', 'Minimal escandinavo'];

type InferredBriefing = {
  palettePreference?: string;
  identityArchetype?: string;
  typographyMood?: string;
  mockupScene?: string;
  controlLevel?: BrandPersonalization['controlLevel'];
  logoElements?: string;
  avoidElements?: string;
  vibes: string[];
  briefingUpdates: Partial<BriefingAnswers>;
};

const SEGMENT_PRESETS: SegmentPreset[] = [
  {
    id: 'saas',
    title: 'SaaS B2B',
    description: 'Tecnologia confiável e moderna para empresas.',
    conceptHint: 'Plataforma SaaS para gestão e produtividade de equipes com foco em resultados.',
    personalization: {
      controlLevel: 'guided',
      palettePreference: 'Fria',
      identityArchetype: 'Confiável',
      brandVibe: ['Tecnológica', 'Moderna'],
      typographyMood: 'Geométrica',
      mockupScene: 'Corporate premium',
    },
  },
  {
    id: 'fashion',
    title: 'Moda & Lifestyle',
    description: 'Marca autoral, visual forte e aspiracional.',
    conceptHint: 'Marca de moda contemporânea com peças exclusivas e forte identidade visual.',
    personalization: {
      controlLevel: 'guided',
      palettePreference: 'Luxuosa',
      identityArchetype: 'Premium',
      brandVibe: ['Sofisticada', 'Moderna'],
      typographyMood: 'Elegante',
      mockupScene: 'Lifestyle urbano',
    },
  },
  {
    id: 'food',
    title: 'Food & Beverage',
    description: 'Presença acolhedora e memorável para consumo.',
    conceptHint: 'Marca de alimentos e bebidas com proposta artesanal e experiência acolhedora.',
    personalization: {
      controlLevel: 'guided',
      palettePreference: 'Quente',
      identityArchetype: 'Acolhedora',
      brandVibe: ['Humana', 'Divertida'],
      typographyMood: 'Orgânica',
      mockupScene: 'Criativo colorido',
    },
  },
  {
    id: 'health',
    title: 'Saúde & Bem-estar',
    description: 'Clareza, confiança e sensação de cuidado.',
    conceptHint: 'Serviço de saúde e bem-estar focado em prevenção, confiança e cuidado contínuo.',
    personalization: {
      controlLevel: 'guided',
      palettePreference: 'Pastel',
      identityArchetype: 'Confiável',
      brandVibe: ['Humana', 'Sustentável'],
      typographyMood: 'Neutra',
      mockupScene: 'Estúdio limpo',
    },
  },
];

const DEFAULT_BRIEFING_ANSWERS: BriefingAnswers = {
  positioning: 'acessivel',
  audience: 'geral',
  personality: 'confiavel',
  visual: 'equilibrado',
};

// --- Components ---

const Logo = () => (
  <div className="flex items-center gap-2 group">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-brand-primary/20 blur-lg group-hover:bg-brand-primary/40 transition-all" />
      <div className="relative w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500">
        <Zap className="w-5 h-5 text-brand-dark fill-brand-dark" />
      </div>
    </div>
    <span className="text-xl font-display font-bold tracking-tighter text-white">MOOKA<span className="text-brand-primary">.</span></span>
  </div>
);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<ViewMode>('auth');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isAIConfigured, setIsAIConfigured] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [supabaseAuthConfigured, setSupabaseAuthConfigured] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  
  // Branding State
  const [concept, setConcept] = useState('');
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null);
  const [personalization, setPersonalization] = useState<BrandPersonalization>(createDefaultPersonalization());
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [favoritePresets, setFavoritePresets] = useState<FavoritePreset[]>([]);
  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(null);
  const [editingFavoriteName, setEditingFavoriteName] = useState('');
  const [chatDraft, setChatDraft] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-intro',
      role: 'assistant',
      text: 'Olá. Eu sou sua diretora criativa de IA. Me conte o que sua marca faz e o sentimento que você quer transmitir.',
    },
  ]);
  const [chatMemory, setChatMemory] = useState<string[]>([]);
  const [enableLongChatMemory, setEnableLongChatMemory] = useState(true);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [showBriefingAssistant, setShowBriefingAssistant] = useState(false);
  const [briefingAnswers, setBriefingAnswers] = useState<BriefingAnswers>(DEFAULT_BRIEFING_ANSWERS);
  const [activeLogo, setActiveLogo] = useState<string | null>(null);
  const [mockups, setMockups] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const typingIntervalRef = useRef<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const isGuidedPersonalization = personalization.controlLevel !== 'auto';
  const isDetailedPersonalization = personalization.controlLevel === 'detailed';

  const updatePersonalization = <K extends keyof BrandPersonalization>(
    key: K,
    value: BrandPersonalization[K],
  ) => {
    setPersonalization((prev) => ({ ...prev, [key]: value }));
  };

  const toggleVibe = (vibe: string) => {
    setPersonalization((prev) => {
      const current = prev.brandVibe || [];
      const exists = current.includes(vibe);
      return {
        ...prev,
        brandVibe: exists ? current.filter((item) => item !== vibe) : [...current, vibe],
      };
    });
  };

  const mergeUnique = (base: string[] = [], incoming: string[] = []) => Array.from(new Set([...base, ...incoming]));

  const getChatSessionSnapshot = (): ChatSessionSnapshot => ({
    messages: chatMessages.slice(-12),
    memory: chatMemory.slice(-6),
  });

  const restoreChatSessionSnapshot = (snapshot?: ChatSessionSnapshot) => {
    if (!snapshot?.messages?.length) return;
    setChatMessages(snapshot.messages);
    setChatMemory(snapshot.memory || []);
  };

  const inferBriefingFromText = (text: string): InferredBriefing => {
    const normalized = text.toLowerCase();
    const vibes: string[] = [];
    const briefingUpdates: Partial<BriefingAnswers> = {};

    const hasAny = (keywords: string[]) => keywords.some((keyword) => normalized.includes(keyword));

    const inferred: InferredBriefing = {
      vibes,
      briefingUpdates,
    };

    if (hasAny(['premium', 'luxo', 'sofisticad'])) {
      inferred.palettePreference = 'Luxuosa';
      inferred.identityArchetype = 'Premium';
      inferred.mockupScene = 'Corporate premium';
      vibes.push('Sofisticada');
      briefingUpdates.positioning = 'premium';
    }

    if (hasAny(['tecnologia', 'tech', 'saas', 'inov', 'digital'])) {
      inferred.identityArchetype = inferred.identityArchetype || 'Inovadora';
      inferred.palettePreference = inferred.palettePreference || 'Fria';
      inferred.typographyMood = inferred.typographyMood || 'Geométrica';
      vibes.push('Tecnológica', 'Moderna');
      briefingUpdates.audience = briefingUpdates.audience || 'corporativo';
    }

    if (hasAny(['acess', 'popular', 'simples', 'humana', 'próxim'])) {
      inferred.identityArchetype = inferred.identityArchetype || 'Acolhedora';
      inferred.palettePreference = inferred.palettePreference || 'Pastel';
      vibes.push('Humana');
      briefingUpdates.positioning = briefingUpdates.positioning || 'acessivel';
    }

    if (hasAny(['sustent', 'eco', 'natureza', 'orgân'])) {
      inferred.palettePreference = inferred.palettePreference || 'Terrosa';
      inferred.typographyMood = inferred.typographyMood || 'Orgânica';
      inferred.logoElements = inferred.logoElements || 'Elementos orgânicos e referência à natureza';
      vibes.push('Sustentável');
      briefingUpdates.positioning = briefingUpdates.positioning || 'sustentavel';
    }

    if (hasAny(['jovem', 'gen z', 'descolad', 'trendy'])) {
      vibes.push('Divertida', 'Moderna');
      briefingUpdates.audience = 'jovem';
    }

    if (hasAny(['corporativo', 'empresa', 'b2b'])) {
      vibes.push('Confiável');
      briefingUpdates.audience = 'corporativo';
    }

    if (hasAny(['família', 'famílias', 'infantil'])) {
      vibes.push('Humana');
      briefingUpdates.audience = 'familias';
    }

    if (hasAny(['ousad', 'disrupt', 'fora da caixa', 'impact'])) {
      inferred.palettePreference = inferred.palettePreference || 'Alto contraste';
      inferred.identityArchetype = inferred.identityArchetype || 'Ousada';
      inferred.controlLevel = 'detailed';
      vibes.push('Ousada');
      briefingUpdates.personality = 'ousada';
      briefingUpdates.positioning = briefingUpdates.positioning || 'disruptiva';
    }

    if (hasAny(['minimal', 'clean', 'elegante', 'sofistic'])) {
      inferred.typographyMood = inferred.typographyMood || 'Elegante';
      inferred.avoidElements = 'Excesso de detalhes, visual poluído, texturas complexas';
      briefingUpdates.visual = 'clean';
      if (!briefingUpdates.personality) briefingUpdates.personality = 'sofisticada';
    }

    if (hasAny(['amig', 'acolhed', 'leve'])) {
      briefingUpdates.personality = briefingUpdates.personality || 'amigavel';
    }

    if (hasAny(['confi', 'segur', 'credib'])) {
      briefingUpdates.personality = briefingUpdates.personality || 'confiavel';
      vibes.push('Confiável');
    }

    if (hasAny(['mockup', 'produto', 'lifestyle', 'urbano', 'estúdio'])) {
      if (hasAny(['lifestyle', 'urbano'])) inferred.mockupScene = 'Lifestyle urbano';
      if (hasAny(['estúdio', 'studio'])) inferred.mockupScene = inferred.mockupScene || 'Estúdio limpo';
    }

    inferred.vibes = Array.from(new Set(vibes));
    return inferred;
  };

  const applyInferredBriefing = (inferred: InferredBriefing) => {
    const hasSignals = Boolean(
      inferred.palettePreference ||
      inferred.identityArchetype ||
      inferred.typographyMood ||
      inferred.mockupScene ||
      inferred.logoElements ||
      inferred.avoidElements ||
      inferred.vibes.length ||
      Object.keys(inferred.briefingUpdates).length,
    );

    if (!hasSignals) return false;

    setPersonalization((prev) => ({
      ...prev,
      controlLevel: inferred.controlLevel || (prev.controlLevel === 'auto' ? 'guided' : prev.controlLevel),
      palettePreference: inferred.palettePreference || prev.palettePreference,
      identityArchetype: inferred.identityArchetype || prev.identityArchetype,
      typographyMood: inferred.typographyMood || prev.typographyMood,
      mockupScene: inferred.mockupScene || prev.mockupScene,
      logoElements: inferred.logoElements || prev.logoElements,
      avoidElements: inferred.avoidElements || prev.avoidElements,
      brandVibe: mergeUnique(prev.brandVibe || [], inferred.vibes),
    }));

    if (Object.keys(inferred.briefingUpdates).length > 0) {
      setBriefingAnswers((prev) => ({ ...prev, ...inferred.briefingUpdates }));
    }

    return true;
  };

  const buildContextualAssistantReply = (latestUserText: string, appliedSignals: boolean, memory: string[]) => {
    const contextualBase = appliedSignals
      ? 'Captei sua intenção e já atualizei automaticamente as preferências de branding com base no histórico da conversa.'
      : 'Entendi seu ponto. Ainda não detectei sinais fortes o suficiente para ajustar automaticamente a direção visual.';

    const shortMemory = memory.slice(-2).map((item) => item.slice(0, 90)).join(' | ');
    const suggestion = appliedSignals
      ? 'Se quiser, posso refinar mais: descreva uma referência visual ou diga o que você quer evitar no logo.'
      : 'Me diga 2 coisas: qual sensação sua marca deve transmitir e qual estilo visual você não quer.';

    return `${contextualBase}\nResumo recente: ${shortMemory || latestUserText.slice(0, 100)}\n${suggestion}`;
  };

  const pushChatMessage = (role: ChatMessage['role'], text: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        role,
        text,
      },
    ].slice(-12));
  };

  const streamAssistantMessage = (fullText: string) => {
    if (typingIntervalRef.current) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    const id = Math.random().toString(36).slice(2, 9);
    let cursor = 0;
    setIsAssistantTyping(true);

    setChatMessages((prev) => [
      ...prev,
      { id, role: 'assistant', text: '' },
    ].slice(-12));

    typingIntervalRef.current = window.setInterval(() => {
      cursor += 2;
      const next = fullText.slice(0, cursor);

      setChatMessages((prev) => prev.map((item) => (
        item.id === id ? { ...item, text: next } : item
      )));

      if (cursor >= fullText.length) {
        if (typingIntervalRef.current) {
          window.clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsAssistantTyping(false);
      }
    }, 20);
  };

  const applyPreset = (preset: SegmentPreset) => {
    setPersonalization((prev) => ({
      ...createDefaultPersonalization(),
      ...preset.personalization,
      brandVibe: mergeUnique(prev.brandVibe, preset.personalization.brandVibe),
    }));
    setSelectedPresetId(preset.id);
    if (!concept.trim()) setConcept(preset.conceptHint);
    showSuccess(`Preset "${preset.title}" aplicado.`);
    streamAssistantMessage(`Ótima escolha. Apliquei o preset ${preset.title}. Você já pode gerar a estratégia ou ajustar detalhes finos abaixo.`);
  };

  const applyBriefing = () => {
    const next: BrandPersonalization = {
      controlLevel: briefingAnswers.visual === 'expressivo' ? 'detailed' : 'guided',
      brandVibe: [],
    };

    if (briefingAnswers.positioning === 'premium') {
      next.identityArchetype = 'Premium';
      next.palettePreference = 'Luxuosa';
      next.mockupScene = 'Corporate premium';
      next.brandVibe = mergeUnique(next.brandVibe, ['Sofisticada']);
    }
    if (briefingAnswers.positioning === 'disruptiva') {
      next.identityArchetype = 'Ousada';
      next.palettePreference = 'Alto contraste';
      next.brandVibe = mergeUnique(next.brandVibe, ['Moderna', 'Tecnológica']);
    }
    if (briefingAnswers.positioning === 'acessivel') {
      next.identityArchetype = 'Acolhedora';
      next.palettePreference = 'Pastel';
      next.brandVibe = mergeUnique(next.brandVibe, ['Humana']);
    }
    if (briefingAnswers.positioning === 'sustentavel') {
      next.identityArchetype = 'Confiável';
      next.palettePreference = 'Terrosa';
      next.typographyMood = 'Orgânica';
      next.brandVibe = mergeUnique(next.brandVibe, ['Sustentável']);
    }

    if (briefingAnswers.audience === 'jovem') next.brandVibe = mergeUnique(next.brandVibe, ['Divertida', 'Moderna']);
    if (briefingAnswers.audience === 'corporativo') next.brandVibe = mergeUnique(next.brandVibe, ['Confiável', 'Sofisticada']);
    if (briefingAnswers.audience === 'familias') next.brandVibe = mergeUnique(next.brandVibe, ['Humana', 'Acolhedora']);

    if (briefingAnswers.personality === 'amigavel') next.brandVibe = mergeUnique(next.brandVibe, ['Humana']);
    if (briefingAnswers.personality === 'sofisticada') {
      next.brandVibe = mergeUnique(next.brandVibe, ['Sofisticada']);
      next.typographyMood = next.typographyMood || 'Elegante';
    }
    if (briefingAnswers.personality === 'ousada') {
      next.brandVibe = mergeUnique(next.brandVibe, ['Ousada']);
      next.identityArchetype = next.identityArchetype || 'Ousada';
    }
    if (briefingAnswers.personality === 'confiavel') {
      next.brandVibe = mergeUnique(next.brandVibe, ['Confiável']);
      next.identityArchetype = next.identityArchetype || 'Confiável';
    }

    if (briefingAnswers.visual === 'clean') {
      next.avoidElements = 'Excesso de detalhes, visual poluído, texturas complexas';
      next.typographyMood = next.typographyMood || 'Neutra';
    }
    if (briefingAnswers.visual === 'equilibrado') {
      next.typographyMood = next.typographyMood || 'Geométrica';
    }
    if (briefingAnswers.visual === 'expressivo') {
      next.logoElements = 'Composição marcante com símbolo protagonista';
      next.palettePreference = next.palettePreference || 'Alto contraste';
    }

    setPersonalization((prev) => ({
      ...prev,
      ...next,
      brandVibe: mergeUnique(prev.brandVibe, next.brandVibe),
    }));
    setSelectedPresetId(null);
    setShowBriefingAssistant(false);
    showSuccess('Briefing aplicado às preferências de branding.');
    streamAssistantMessage('Briefing aplicado com sucesso. Direção estratégica atualizada para refletir suas respostas.');
  };

  const resetPersonalization = () => {
    setPersonalization(createDefaultPersonalization());
    setSelectedPresetId(null);
    setBriefingAnswers(DEFAULT_BRIEFING_ANSWERS);
    setShowBriefingAssistant(false);
    showSuccess('Preferências redefinidas para modo automático.');
    streamAssistantMessage('Tudo certo. Voltei para o modo automático para você começar com uma folha em branco.');
  };

  const loadFavoritePresets = () => {
    try {
      const raw = localStorage.getItem(FAVORITE_PRESETS_KEY);
      if (!raw) return [] as FavoritePreset[];
      const parsed = JSON.parse(raw) as FavoritePreset[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [] as FavoritePreset[];
    }
  };

  const saveFavoritePresets = (next: FavoritePreset[]) => {
    try {
      localStorage.setItem(FAVORITE_PRESETS_KEY, JSON.stringify(next));
    } catch {
      // Ignore local storage quota issues.
    }
  };

  const loadLongMemoryPreference = () => {
    try {
      const raw = localStorage.getItem(CHAT_LONG_MEMORY_KEY);
      if (!raw) return true;
      return raw === 'true';
    } catch {
      return true;
    }
  };

  const saveLongMemoryPreference = (enabled: boolean) => {
    try {
      localStorage.setItem(CHAT_LONG_MEMORY_KEY, String(enabled));
    } catch {
      // Ignore local storage quota issues.
    }
  };

  const applyFavoritePreset = (preset: FavoritePreset) => {
    setPersonalization({
      ...createDefaultPersonalization(),
      ...preset.personalization,
      brandVibe: preset.personalization.brandVibe || [],
    });
    setSelectedPresetId(null);
    if (!concept.trim() && preset.conceptHint) setConcept(preset.conceptHint);
    showSuccess(`Favorito "${preset.name}" aplicado.`);
    streamAssistantMessage(`Favorito ${preset.name} aplicado. Se quiser, eu também posso refinar essa direção com seu novo objetivo.`);
  };

  const removeFavoritePreset = (id: string) => {
    setFavoritePresets((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveFavoritePresets(next);
      return next;
    });
  };

  const renameFavoritePreset = () => {
    if (!editingFavoriteId) return;
    const cleanName = editingFavoriteName.trim();
    if (!cleanName) {
      showError('Informe um nome válido para o favorito.');
      return;
    }

    setFavoritePresets((prev) => {
      const next = prev.map((item) => (
        item.id === editingFavoriteId ? { ...item, name: cleanName } : item
      ));
      saveFavoritePresets(next);
      return next;
    });

    setEditingFavoriteId(null);
    setEditingFavoriteName('');
    showSuccess('Nome do favorito atualizado.');
  };

  const updateFavoriteFromCurrent = (id: string) => {
    const payload = getPersonalizationPayload();
    if (!payload) {
      showError('Ative ao menos o modo Guiado para atualizar o favorito.');
      return;
    }

    setFavoritePresets((prev) => {
      const next = prev.map((item) => (
        item.id === id
          ? {
              ...item,
              personalization: payload,
              conceptHint: concept.trim(),
              createdAt: Date.now(),
            }
          : item
      ));
      saveFavoritePresets(next);
      return next;
    });

    showSuccess('Favorito atualizado com sua configuração atual.');
  };

  const saveCurrentAsFavorite = () => {
    const payload = getPersonalizationPayload();
    if (!payload) {
      showError('Ative ao menos o modo Guiado para salvar um favorito.');
      return;
    }

    const favorite: FavoritePreset = {
      id: Math.random().toString(36).slice(2, 9),
      name: payload.identityArchetype || payload.palettePreference || 'Preset personalizado',
      conceptHint: concept.trim(),
      personalization: payload,
      createdAt: Date.now(),
    };

    setFavoritePresets((prev) => {
      const next = [favorite, ...prev].slice(0, 8);
      saveFavoritePresets(next);
      return next;
    });

    showSuccess('Preset salvo em Favoritos.');
    streamAssistantMessage('Preset salvo em Favoritos. Agora você pode reutilizar essa direção com um clique.');
  };

  const submitChatConcept = () => {
    const next = chatDraft.trim();
    if (!next) return;

    const nextMemory = [...chatMemory, next].slice(-6);
    pushChatMessage('user', next);
    setChatMemory(nextMemory);
    setConcept((prev) => (prev ? `${prev}\n${next}` : next));
    setChatDraft('');

    const inferred = inferBriefingFromText(nextMemory.join(' '));
    const appliedSignals = applyInferredBriefing(inferred);
    streamAssistantMessage(buildContextualAssistantReply(next, appliedSignals, nextMemory));
  };

  const clearChatSession = () => {
    setChatMemory([]);
    setChatMessages([
      {
        id: 'assistant-intro-reset',
        role: 'assistant',
        text: 'Sessão reiniciada. Me conte novamente o que você está construindo e qual sensação sua marca deve passar.',
      },
    ]);
    setChatDraft('');
  };

  const openProject = (project: Project) => {
    if (project.type === 'strategy') {
      setStrategy(project.data as BrandStrategy);
      setPersonalization(project.data?.personalization || createDefaultPersonalization());
      restoreChatSessionSnapshot(project.data?.chatSession);
      setView('strategy');
      return;
    }

    if (project.type === 'logo' && project.url) {
      setActiveLogo(project.url);
      if (project.data?.strategy) setStrategy(project.data.strategy);
      setPersonalization(project.data?.personalization || createDefaultPersonalization());
      restoreChatSessionSnapshot(project.data?.chatSession);
      setView('identity');
      return;
    }

    if (project.type === 'mockup' && project.url) {
      setMockups((prev) => [project.url!, ...prev]);
      if (project.data?.strategy) setStrategy(project.data.strategy);
      setPersonalization(project.data?.personalization || createDefaultPersonalization());
      restoreChatSessionSnapshot(project.data?.chatSession);
      setView('mockups');
    }
  };

  const getPersonalizationPayload = (): BrandPersonalization | undefined => {
    if (personalization.controlLevel === 'auto') return undefined;

    const payload: BrandPersonalization = {
      controlLevel: personalization.controlLevel,
    };

    if (personalization.palettePreference?.trim()) payload.palettePreference = personalization.palettePreference.trim();
    if (personalization.customPalette?.trim()) payload.customPalette = personalization.customPalette.trim();
    if (personalization.identityArchetype?.trim()) payload.identityArchetype = personalization.identityArchetype.trim();
    if (personalization.brandVibe?.length) payload.brandVibe = personalization.brandVibe;
    if (personalization.typographyMood?.trim()) payload.typographyMood = personalization.typographyMood.trim();
    if (personalization.logoElements?.trim()) payload.logoElements = personalization.logoElements.trim();
    if (personalization.avoidElements?.trim()) payload.avoidElements = personalization.avoidElements.trim();
    if (personalization.mockupScene?.trim()) payload.mockupScene = personalization.mockupScene.trim();

    return payload;
  };

  const personalizationSummary = (() => {
    const payload = getPersonalizationPayload();
    if (!payload) return [] as string[];

    const chips: string[] = [];
    if (payload.palettePreference) chips.push(`Paleta: ${payload.palettePreference}`);
    if (payload.identityArchetype) chips.push(`Identidade: ${payload.identityArchetype}`);
    if (payload.brandVibe?.length) chips.push(`Vibe: ${payload.brandVibe.join(', ')}`);
    if (payload.typographyMood) chips.push(`Tipografia: ${payload.typographyMood}`);
    if (payload.logoElements) chips.push(`Elementos: ${payload.logoElements}`);
    if (payload.avoidElements) chips.push(`Evitar: ${payload.avoidElements}`);
    if (payload.mockupScene) chips.push(`Cena: ${payload.mockupScene}`);
    return chips;
  })();

  const showError = (message: string) => setFeedback({ type: 'error', message });
  const showSuccess = (message: string) => setFeedback({ type: 'success', message });

  const loadLocalProjects = () => {
    try {
      const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
      if (!raw) return [] as Project[];
      const parsed = JSON.parse(raw) as Project[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [] as Project[];
    }
  };

  const saveLocalProjects = (nextProjects: Project[]) => {
    try {
      localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(nextProjects));
    } catch {
      // Ignore storage quota errors in local mode.
    }
  };

  const loadProjects = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, type, name, data, url, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('Failed to load projects from Supabase:', error.message);
        return;
      }

      const mapped: Project[] = (data || []).map((item: any) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        data: item.data,
        url: item.url,
        timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
      }));

      setProjects(mapped);
    } catch {
      console.warn('Supabase table might not exist yet.');
    }
  };

  const deleteProject = async (project: Project) => {
    setProjects((prev) => {
      const next = prev.filter((item) => item.id !== project.id);
      if (!isSupabaseConfigured) saveLocalProjects(next);
      return next;
    });

    if (session?.user && isSupabaseConfigured) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)
        .eq('user_id', session.user.id);

      if (error) {
        showError(`Falha ao excluir projeto: ${error.message}`);
      }
    }
  };

  // Persistence
  const saveProject = async (project: Omit<Project, 'id' | 'timestamp'>) => {
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    
    setProjects(prev => [newProject, ...prev]);

    if (session?.user && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([{ 
            user_id: session.user.id,
            type: project.type,
            name: project.name,
            data: project.data,
            url: project.url
          }])
          .select('id, created_at')
          .single();

        if (error) {
          console.warn('Failed to save to Supabase:', error.message);
          showError(`Não foi possível salvar no histórico: ${error.message}`);
          return;
        }

        if (data?.id) {
          setProjects((prev) => prev.map((item) => (
            item.id === newProject.id
              ? {
                  ...item,
                  id: data.id,
                  timestamp: data.created_at ? new Date(data.created_at).getTime() : item.timestamp,
                }
              : item
          )));
        }
      } catch {
        console.warn('Supabase table might not exist yet.');
      }
    } else {
      setProjects((prev) => {
        saveLocalProjects(prev);
        return prev;
      });
    }
  };

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((data: HealthResponse) => {
        setIsAIConfigured(Boolean(data?.aiConfigured));
        setAuthRequired(Boolean(data?.authRequired));
        setSupabaseAuthConfigured(Boolean(data?.supabaseAuthConfigured));
      })
      .catch(() => setIsAIConfigured(false));
  }, []);

  useEffect(() => {
    setFavoritePresets(loadFavoritePresets());
    setEnableLongChatMemory(loadLongMemoryPreference());

    if (!isSupabaseConfigured) {
      setProjects(loadLocalProjects());
      setView('dashboard'); // Allow using the app without Supabase (local only)
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setView('dashboard');
        loadProjects(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setView('dashboard');
        loadProjects(session.user.id);
      } else {
        setProjects([]);
        setView('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, isAssistantTyping]);

  useEffect(() => {
    saveLongMemoryPreference(enableLongChatMemory);
  }, [enableLongChatMemory]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        window.clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const handleGenerateStrategy = async () => {
    if (!concept) return;
    if (authRequired && !session) {
      showError('Faça login para gerar estratégias com autenticação ativa.');
      setView('auth');
      return;
    }
    setIsGenerating(true);
    setLoadingMessage("Analisando o mercado e tendências globais...");
    try {
      const personalizationPayload = getPersonalizationPayload();
      const result = await BrandService.generateStrategy(concept, personalizationPayload);
      setStrategy(result);
      await saveProject({
        type: 'strategy',
        name: result.name,
        data: {
          ...result,
          personalization: personalizationPayload,
          chatSession: enableLongChatMemory ? getChatSessionSnapshot() : undefined,
        }
      });
      setView('strategy');
      showSuccess('Estratégia gerada com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao gerar estratégia.';
      showError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLogo = async (style: string) => {
    if (!strategy) return;
    if (authRequired && !session) {
      showError('Faça login para gerar logo com autenticação ativa.');
      setView('auth');
      return;
    }
    setIsGenerating(true);
    setLoadingMessage("Esculpindo sua identidade visual...");
    try {
      const personalizationPayload = getPersonalizationPayload();
      const logoUrl = await BrandService.generateLogo(strategy.name, strategy, style, personalizationPayload);
      setActiveLogo(logoUrl);
      await saveProject({
        type: 'logo',
        url: logoUrl,
        name: `Logo ${strategy.name} (${style})`,
        data: {
          style,
          strategy,
          personalization: personalizationPayload,
          chatSession: enableLongChatMemory ? getChatSessionSnapshot() : undefined,
        }
      });
      setView('identity');
      showSuccess('Logo gerado com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao gerar logo.';
      showError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMockup = async (product: string) => {
    if (!activeLogo || !strategy) return;
    if (authRequired && !session) {
      showError('Faça login para gerar mockups com autenticação ativa.');
      setView('auth');
      return;
    }
    setIsGenerating(true);
    setLoadingMessage(`Criando mockup de ${product} ultra-realista...`);
    try {
      const personalizationPayload = getPersonalizationPayload();
      const mockupUrl = await BrandService.generateMockup(activeLogo, product, strategy.name, personalizationPayload);
      setMockups(prev => [mockupUrl, ...prev]);
      await saveProject({
        type: 'mockup',
        url: mockupUrl,
        name: `Mockup ${product} - ${strategy.name}`,
        data: {
          product,
          strategy,
          personalization: personalizationPayload,
          chatSession: enableLongChatMemory ? getChatSessionSnapshot() : undefined,
        }
      });
      setView('mockups');
      showSuccess('Mockup gerado com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao gerar mockup.';
      showError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (view === 'auth' && isSupabaseConfigured) return <AuthView logo={<Logo />} />;

  if (!isAIConfigured) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-8">
        <div className="glass max-w-md w-full p-12 rounded-[2.5rem] text-center space-y-8">
          <div className="w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-brand-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-white">Configuração Necessária</h2>
            <p className="text-neutral-400">Para iniciar a criação de marcas inteligentes, você precisa configurar sua <strong>OPENAI_API_KEY</strong> no servidor.</p>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-left space-y-4">
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Como configurar:</p>
            <ol className="text-sm text-neutral-300 space-y-2 list-decimal list-inside">
              <li>Crie um arquivo <strong>.env.local</strong> na raiz do projeto.</li>
              <li>Adicione <code>OPENAI_API_KEY</code> com sua chave da OpenAI.</li>
              <li>(Opcional) defina <code>OPENAI_STRATEGY_MODEL</code> e <code>OPENAI_IMAGE_MODEL</code>.</li>
              <li>Aguarde o reinício automático.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark font-sans relative premium-bg">
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          className="orb orb-a"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="orb orb-b"
          animate={{ x: [0, -35, 0], y: [0, 24, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="orb orb-c"
          animate={{ x: [0, 28, 0], y: [0, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      
      {!isSupabaseConfigured && (
        <div className="fixed top-4 right-4 z-[200] animate-bounce">
          <div className="bg-amber-500 text-brand-dark px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-xl">
            <ShieldCheck className="w-3 h-3" />
            MODO OFFLINE: CONFIGURE SUPABASE PARA SALVAR PROJETOS
          </div>
        </div>
      )}

      {authRequired && !isSupabaseConfigured && (
        <div className="fixed top-16 right-4 z-[200]">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold shadow-xl max-w-xs">
            AUTH ATIVA NO BACKEND: configure SUPABASE_URL/SUPABASE_ANON_KEY e faça login para gerar com IA.
          </div>
        </div>
      )}
      
      <AppSidebar
        logo={<Logo />}
        view={view === 'auth' ? 'dashboard' : view}
        showSettings={showSettings}
        hasStrategy={Boolean(strategy)}
        hasActiveLogo={Boolean(activeLogo)}
        userEmail={session?.user?.email}
        onSetView={(nextView) => setView(nextView)}
        onOpenSettings={() => setShowSettings(true)}
        onSignOut={() => (isSupabaseConfigured ? supabase.auth.signOut() : setSession(null))}
      />

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto z-10">
        <AppTopHeader viewLabel={view} />

        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            
            {view === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">Crie sua marca com direção criativa de alto nível</h2>
                  <p className="text-neutral-400 max-w-2xl">
                    Você conduz cada escolha e a IA executa com precisão. Simples para iniciantes, poderoso para quem quer controle total.
                  </p>
                </div>

                <div className="glass premium-panel rounded-[2.5rem] p-6 md:p-10 border-brand-primary/20 relative overflow-hidden">
                  <div className="relative z-10 space-y-8">
                    <BriefingChatPanel
                      chatMessages={chatMessages}
                      isAssistantTyping={isAssistantTyping}
                      enableLongChatMemory={enableLongChatMemory}
                      onToggleLongMemory={() => setEnableLongChatMemory((prev) => !prev)}
                      onClearChat={clearChatSession}
                      chatDraft={chatDraft}
                      onChangeChatDraft={setChatDraft}
                      onSubmitChat={submitChatConcept}
                      quickPrompts={[
                        'Quero uma marca premium e minimalista para consultoria de tecnologia',
                        'Minha marca precisa parecer acessível, humana e confiável',
                        'Busco identidade ousada para público jovem e digital',
                      ]}
                      onUseQuickPrompt={(prompt) => setChatDraft(prompt)}
                      chatMemory={chatMemory}
                      chatScrollRef={chatScrollRef}
                    />

                    <BrandControlsPanel
                      segmentPresets={SEGMENT_PRESETS}
                      selectedPresetId={selectedPresetId}
                      onApplyPreset={(presetId) => {
                        const preset = SEGMENT_PRESETS.find((item) => item.id === presetId);
                        if (preset) applyPreset(preset);
                      }}
                      onResetPersonalization={resetPersonalization}
                      favoritePresets={favoritePresets}
                      editingFavoriteId={editingFavoriteId}
                      editingFavoriteName={editingFavoriteName}
                      onEditingFavoriteNameChange={setEditingFavoriteName}
                      onStartRenameFavorite={(presetId) => {
                        const preset = favoritePresets.find((item) => item.id === presetId);
                        if (!preset) return;
                        setEditingFavoriteId(preset.id);
                        setEditingFavoriteName(preset.name);
                      }}
                      onSaveFavoriteName={renameFavoritePreset}
                      onSaveCurrentAsFavorite={saveCurrentAsFavorite}
                      onApplyFavoritePreset={(presetId) => {
                        const preset = favoritePresets.find((item) => item.id === presetId);
                        if (preset) applyFavoritePreset(preset);
                      }}
                      onUpdateFavoriteFromCurrent={updateFavoriteFromCurrent}
                      onRemoveFavoritePreset={removeFavoritePreset}
                      showBriefingAssistant={showBriefingAssistant}
                      onToggleBriefingAssistant={() => setShowBriefingAssistant((prev) => !prev)}
                      briefingAnswers={briefingAnswers}
                      onBriefingAnswersChange={setBriefingAnswers}
                      onApplyBriefing={applyBriefing}
                      personalization={personalization}
                      isGuidedPersonalization={isGuidedPersonalization}
                      isDetailedPersonalization={isDetailedPersonalization}
                      onUpdatePersonalization={updatePersonalization}
                      onToggleVibe={toggleVibe}
                      paletteOptions={PALETTE_OPTIONS}
                      archetypeOptions={ARCHETYPE_OPTIONS}
                      vibeOptions={VIBE_OPTIONS}
                      typographyOptions={TYPOGRAPHY_OPTIONS}
                      mockupSceneOptions={MOCKUP_SCENE_OPTIONS}
                    />

                    <button 
                      onClick={handleGenerateStrategy}
                      disabled={!concept || isGenerating}
                      className="px-10 py-5 bg-brand-primary text-brand-dark font-black rounded-2xl shadow-2xl shadow-brand-primary/30 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                      <Sparkles className="w-6 h-6" />
                      INICIAR CONSULTORIA INTELIGENTE
                    </button>
                  </div>
                  <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full" />
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <FeatureCard 
                    icon={Zap} 
                    title="Branding Instantâneo" 
                    description="De uma ideia a uma marca completa em segundos com IA de ponta."
                  />
                  <FeatureCard 
                    icon={Search} 
                    title="Market Grounding" 
                    description="Análise em tempo real de tendências e concorrentes globais."
                  />
                  <FeatureCard 
                    icon={Layers} 
                    title="Mockups Realistas" 
                    description="Visualize sua marca em produtos físicos com fidelidade ultra-HD."
                  />
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <StatCard icon={Globe} label="Market Intelligence" value="Real-time" />
                  <StatCard icon={TrendingUp} label="Trend Analysis" value="Active" />
                  <StatCard icon={ShieldCheck} label="Brand Protection" value="Secure" />
                </div>

                <RecentProjectsPanel
                  projects={projects}
                  onOpenProject={openProject}
                  onViewHistory={() => setView('history')}
                />
              </motion.div>
            )}

            {view === 'strategy' && strategy && (
              <StrategyView
                strategy={strategy}
                personalizationSummary={personalizationSummary}
                onBackToDashboard={() => setView('dashboard')}
                onProceedToIdentity={() => handleGenerateLogo('Minimalist')}
              />
            )}

            {view === 'identity' && activeLogo && strategy && (
              <IdentityView
                activeLogo={activeLogo}
                strategy={strategy}
                onBackToStrategy={() => setView('strategy')}
                onGoToMockups={() => setView('mockups')}
                onGenerateLogo={handleGenerateLogo}
              />
            )}

            {view === 'mockups' && activeLogo && strategy && (
              <MockupsView
                mockups={mockups}
                strategy={strategy}
                onBackToIdentity={() => setView('identity')}
                onGenerateMockup={handleGenerateMockup}
              />
            )}

            {view === 'history' && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-display font-bold text-white">Histórico de Projetos</h2>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <History className="w-4 h-4" />
                    <span>{projects.length} itens salvos</span>
                  </div>
                </div>

                <HistoryProjectsGrid
                  projects={projects}
                  onOpenProject={openProject}
                  onDeleteProject={deleteProject}
                />
              </motion.div>
            )}

            <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

          </AnimatePresence>
        </div>
      </main>

      <LoadingOverlay open={isGenerating} loadingMessage={loadingMessage} />

      <FeedbackToast feedback={feedback} onClose={() => setFeedback(null)} />
    </div>
  );
}


