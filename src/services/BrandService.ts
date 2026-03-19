import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const isAIConfigured = true;

export interface BrandStrategy {
  name: string;
  tagline: string;
  mission: string;
  targetAudience: string;
  toneOfVoice: string;
  colorPalette: string[];
  marketTrends: string[];
  competitors: string[];
}

export interface BrandPersonalization {
  controlLevel: 'auto' | 'guided' | 'detailed';
  palettePreference?: string;
  customPalette?: string;
  identityArchetype?: string;
  brandVibe?: string[];
  typographyMood?: string;
  logoElements?: string;
  avoidElements?: string;
  mockupScene?: string;
}

export const BrandService = {
  async buildHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (isSupabaseConfigured) {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return headers;
  },

  async generateStrategy(concept: string, personalization?: BrandPersonalization): Promise<BrandStrategy> {
    const headers = await this.buildHeaders();
    const response = await fetch('/api/strategy', {
      method: 'POST',
      headers,
      body: JSON.stringify({ concept, personalization }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to generate strategy.');
    }

    return response.json();
  },

  async generateLogo(
    brandName: string,
    strategy: BrandStrategy,
    style: string,
    personalization?: BrandPersonalization,
  ): Promise<string> {
    const headers = await this.buildHeaders();
    const response = await fetch('/api/logo', {
      method: 'POST',
      headers,
      body: JSON.stringify({ brandName, strategy, style, personalization }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to generate logo.');
    }

    const data = await response.json();
    if (!data.imageUrl) throw new Error('Failed to generate logo.');
    return data.imageUrl;
  },

  async generateMockup(
    logoBase64: string,
    product: string,
    brandName: string,
    personalization?: BrandPersonalization,
  ): Promise<string> {
    const headers = await this.buildHeaders();
    const response = await fetch('/api/mockup', {
      method: 'POST',
      headers,
      body: JSON.stringify({ logoBase64, product, brandName, personalization }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to generate mockup.');
    }

    const data = await response.json();
    if (!data.imageUrl) throw new Error('Failed to generate mockup.');
    return data.imageUrl;
  }
};
