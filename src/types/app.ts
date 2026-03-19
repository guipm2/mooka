import { BrandPersonalization, BrandStrategy } from '../services/BrandService';

export type ViewMode = 'auth' | 'dashboard' | 'strategy' | 'identity' | 'mockups' | 'history';

export type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

export type ChatSessionSnapshot = {
  messages: ChatMessage[];
  memory: string[];
};

export type Project = {
  id: string;
  type: 'strategy' | 'logo' | 'mockup';
  url?: string;
  data?: {
    style?: string;
    product?: string;
    strategy?: BrandStrategy;
    personalization?: BrandPersonalization;
    chatSession?: ChatSessionSnapshot;
    [key: string]: any;
  };
  name: string;
  timestamp: number;
};

export type SegmentPreset = {
  id: string;
  title: string;
  description: string;
  conceptHint: string;
  personalization: BrandPersonalization;
};

export type FavoritePreset = {
  id: string;
  name: string;
  conceptHint: string;
  personalization: BrandPersonalization;
  createdAt: number;
};

export type BriefingAnswers = {
  positioning: 'premium' | 'disruptiva' | 'acessivel' | 'sustentavel';
  audience: 'jovem' | 'corporativo' | 'familias' | 'geral';
  personality: 'amigavel' | 'sofisticada' | 'ousada' | 'confiavel';
  visual: 'clean' | 'equilibrado' | 'expressivo';
};

export type HealthResponse = {
  aiConfigured?: boolean;
  authRequired?: boolean;
  supabaseAuthConfigured?: boolean;
};
