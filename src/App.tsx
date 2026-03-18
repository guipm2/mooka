/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  Loader2,
  Globe,
  TrendingUp,
  ShieldCheck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { BrandService, BrandStrategy } from './services/BrandService';

// --- Types ---

type ViewMode = 'auth' | 'dashboard' | 'strategy' | 'identity' | 'mockups' | 'history';

interface Project {
  id: string;
  type: 'strategy' | 'logo' | 'mockup';
  url?: string;
  data?: {
    style?: string;
    product?: string;
    strategy?: BrandStrategy;
    [key: string]: any;
  };
  name: string;
  timestamp: number;
}

interface HealthResponse {
  aiConfigured?: boolean;
  authRequired?: boolean;
  supabaseAuthConfigured?: boolean;
}

const LOCAL_PROJECTS_KEY = 'mooka_local_projects_v1';

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
  const [activeLogo, setActiveLogo] = useState<string | null>(null);
  const [mockups, setMockups] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

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
      const result = await BrandService.generateStrategy(concept);
      setStrategy(result);
      await saveProject({
        type: 'strategy',
        name: result.name,
        data: result
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
      const logoUrl = await BrandService.generateLogo(strategy.name, strategy, style);
      setActiveLogo(logoUrl);
      await saveProject({
        type: 'logo',
        url: logoUrl,
        name: `Logo ${strategy.name} (${style})`,
        data: { style, strategy }
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
      const mockupUrl = await BrandService.generateMockup(activeLogo, product, strategy.name);
      setMockups(prev => [mockupUrl, ...prev]);
      await saveProject({
        type: 'mockup',
        url: mockupUrl,
        name: `Mockup ${product} - ${strategy.name}`,
        data: { product, strategy }
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

  if (view === 'auth' && isSupabaseConfigured) return <AuthView />;

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
    <div className="flex h-screen overflow-hidden bg-brand-dark font-sans">
      
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
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-brand-border flex flex-col bg-brand-surface/50 backdrop-blur-md">
        <div className="p-6">
          <Logo />
        </div>
        
        <nav className="flex-1 px-4 space-y-2 py-4">
          <NavItem active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={LayoutDashboard} label="Dashboard" />
          <NavItem active={view === 'strategy'} onClick={() => setView('strategy')} icon={Target} label="Estratégia" disabled={!strategy} />
          <NavItem active={view === 'identity'} onClick={() => setView('identity')} icon={Palette} label="Identidade" disabled={!activeLogo} />
          <NavItem active={view === 'mockups'} onClick={() => setView('mockups')} icon={Layers} label="Mockups" disabled={!activeLogo} />
          <NavItem active={view === 'history'} onClick={() => setView('history')} icon={History} label="Histórico" />
          <NavItem active={showSettings} onClick={() => setShowSettings(true)} icon={Settings} label="Configurações" />
        </nav>

        <div className="p-4 border-t border-brand-border space-y-4">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30">
              <User className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{session?.user?.email}</p>
              <p className="text-[10px] text-neutral-500">Plano Enterprise</p>
            </div>
          </div>
          <button 
            onClick={() => isSupabaseConfigured ? supabase.auth.signOut() : setSession(null)}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair da Plataforma
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        <header className="h-16 border-b border-brand-border flex items-center justify-between px-8 sticky top-0 bg-brand-dark/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span>Mooka Intelligence</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium capitalize">{view}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">AI Engine Online</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            
            {view === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl font-display font-bold text-white">Bem-vindo ao Futuro do Branding</h2>
                  <p className="text-neutral-400 max-w-2xl">
                    Nossa IA não apenas desenha, ela pensa. Analisamos tendências globais em tempo real para posicionar sua marca no topo.
                  </p>
                </div>

                <div className="glass rounded-[2.5rem] p-12 border-brand-primary/20 relative overflow-hidden">
                  <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em]">O que você está construindo?</label>
                      <textarea 
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        placeholder="Descreva seu negócio, valores e o que te torna único..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl text-white outline-none focus:border-brand-primary transition-all min-h-[150px]"
                      />
                    </div>
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
              </motion.div>
            )}

            {view === 'strategy' && strategy && (
              <motion.div key="strat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-display font-bold text-white">Estratégia de Marca: <span className="text-brand-primary">{strategy.name}</span></h2>
                  <button onClick={() => setView('dashboard')} className="text-xs font-bold text-neutral-500 hover:text-white transition-colors">Nova Análise</button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-8 space-y-6">
                    <div className="glass rounded-3xl p-8 space-y-6">
                      <Section title="Tagline" content={strategy.tagline} icon={Sparkles} />
                      <Section title="Missão" content={strategy.mission} icon={Target} />
                      <Section title="Público-Alvo" content={strategy.targetAudience} icon={User} />
                      <Section title="Tom de Voz" content={strategy.toneOfVoice} icon={MessageSquare} />
                      
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Principais Concorrentes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {strategy.competitors.map(comp => (
                            <span key={comp} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-neutral-400">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 space-y-6">
                    <div className="glass rounded-3xl p-6 space-y-4">
                      <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Paleta Sugerida</h4>
                      <div className="flex gap-2">
                        {strategy.colorPalette.map(color => (
                          <div key={color} className="w-full aspect-square rounded-xl border border-white/10" style={{ backgroundColor: color }} title={color} />
                        ))}
                      </div>
                    </div>
                    <div className="glass rounded-3xl p-6 space-y-4">
                      <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Tendências de Mercado</h4>
                      <div className="space-y-2">
                        {strategy.marketTrends.map(trend => (
                          <div key={trend} className="flex items-center gap-2 text-xs text-neutral-400">
                            <TrendingUp className="w-3 h-3 text-brand-primary" />
                            {trend}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <button 
                    onClick={() => handleGenerateLogo('Minimalist')}
                    className="px-12 py-5 bg-white text-brand-dark font-black rounded-2xl hover:bg-brand-primary transition-colors flex items-center gap-3"
                  >
                    PROSSEGUIR PARA IDENTIDADE VISUAL
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'identity' && activeLogo && strategy && (
              <motion.div key="identity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-display font-bold text-white">Identidade Visual</h2>
                  <div className="flex gap-4">
                    <button onClick={() => setView('strategy')} className="text-xs font-bold text-neutral-500 hover:text-white transition-colors">Voltar para Estratégia</button>
                    <button onClick={() => setView('mockups')} className="px-6 py-2 bg-brand-primary text-brand-dark font-bold rounded-lg hover:brightness-110 transition-all">Ir para Mockups</button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-12">
                  <div className="col-span-6 space-y-8">
                    <div className="glass rounded-[2rem] p-12 flex items-center justify-center relative group overflow-hidden">
                      <img src={activeLogo} alt="Logo" className="w-full max-w-[300px] relative z-10" />
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <a href={activeLogo} download={`${strategy.name}-logo.png`} className="p-4 bg-brand-primary text-brand-dark rounded-full shadow-xl">
                          <Download className="w-6 h-6" />
                        </a>
                      </div>
                      <div className="absolute top-4 right-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Master Asset v1.0</div>
                    </div>

                    <div className="glass rounded-3xl p-8 space-y-6">
                      <h4 className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em]">Regenerar com Estilo</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {['Minimalist', 'Modern Tech', 'Luxury', 'Playful', 'Brutalism'].map(style => (
                          <button 
                            key={style}
                            onClick={() => handleGenerateLogo(style)}
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-neutral-400 hover:border-brand-primary hover:text-white transition-all"
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-6 space-y-8">
                    <div className="glass rounded-3xl p-8 space-y-8">
                      <h3 className="text-xl font-display font-bold text-white">Brand Guidelines</h3>
                      
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tipografia Sugerida</h4>
                        <div className="space-y-4">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-2xl font-display text-white">Space Grotesk</p>
                            <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">Display & Headings</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-lg font-sans text-white">Inter</p>
                            <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">Body & UI</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Uso Correto</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white rounded-xl flex items-center justify-center aspect-video">
                            <img src={activeLogo} alt="Logo Light" className="w-16 opacity-80" />
                          </div>
                          <div className="p-4 bg-brand-dark rounded-xl flex items-center justify-center aspect-video border border-white/10">
                            <img src={activeLogo} alt="Logo Dark" className="w-16 brightness-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'mockups' && activeLogo && strategy && (
              <motion.div key="mockups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-display font-bold text-white">Mockups de Produtos</h2>
                  <button onClick={() => setView('identity')} className="text-xs font-bold text-neutral-500 hover:text-white transition-colors">Voltar para Identidade</button>
                </div>

                <div className="grid grid-cols-12 gap-12">
                  <div className="col-span-4 space-y-6">
                    <div className="glass rounded-3xl p-8 space-y-6">
                      <h4 className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em]">Selecione o Produto</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {['T-Shirt', 'Hoodie', 'Cap', 'Mug', 'Tote Bag', 'Phone Case'].map(product => (
                          <button 
                            key={product}
                            onClick={() => handleGenerateMockup(product)}
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-neutral-300 hover:bg-brand-primary hover:text-brand-dark hover:border-brand-primary transition-all flex items-center justify-between group"
                          >
                            {product}
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-8">
                    <div className="grid grid-cols-1 gap-8">
                      {mockups.length > 0 ? (
                        mockups.map((url, i) => (
                          <motion.div 
                            key={url} 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass rounded-[2rem] overflow-hidden relative group"
                          >
                            <img src={url} alt={`Mockup ${i}`} className="w-full aspect-video object-cover" />
                            <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <a href={url} download={`${strategy.name}-mockup-${i}.png`} className="px-8 py-4 bg-brand-primary text-brand-dark font-black rounded-xl flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                DOWNLOAD MOCKUP HD
                              </a>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="h-[400px] glass rounded-[2rem] border-dashed border-white/10 flex flex-col items-center justify-center text-neutral-500 space-y-4">
                          <Monitor className="w-12 h-12 opacity-20" />
                          <p className="text-sm font-medium">Selecione um produto para gerar o primeiro mockup</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
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

                <div className="grid grid-cols-3 gap-6">
                  {projects.map(project => (
                    <motion.div 
                      key={project.id}
                      whileHover={{ y: -5 }}
                      className="glass rounded-2xl overflow-hidden border-white/5 group"
                    >
                      {project.url ? (
                        <div className="aspect-video bg-white/5 relative overflow-hidden">
                          <img src={project.url} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => {
                                if (project.type === 'logo') {
                                  setActiveLogo(project.url!);
                                  if (project.data?.strategy) setStrategy(project.data.strategy);
                                  setView('identity');
                                } else if (project.type === 'mockup') {
                                  setMockups(prev => [project.url!, ...prev]);
                                  if (project.data?.strategy) setStrategy(project.data.strategy);
                                  setView('mockups');
                                }
                              }}
                              className="p-3 bg-white text-brand-dark rounded-full shadow-xl"
                            >
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
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full 
                            ${project.type === 'strategy' ? 'bg-blue-500/20 text-blue-400' : 
                              project.type === 'logo' ? 'bg-brand-primary/20 text-brand-primary' : 
                              'bg-purple-500/20 text-purple-400'}`}
                          >
                            {project.type}
                          </span>
                          <span className="text-[10px] text-neutral-600">{new Date(project.timestamp).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{project.name}</h4>
                        <div className="flex items-center justify-between">
                          {project.type === 'strategy' && (
                            <button 
                              onClick={() => {
                                setStrategy(project.data as BrandStrategy);
                                setView('strategy');
                              }}
                              className="text-[10px] font-bold text-brand-primary hover:underline"
                            >
                              Ver Estratégia Completa
                            </button>
                          )}
                          <button
                            onClick={() => deleteProject(project)}
                            className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {projects.length === 0 && (
                    <div className="col-span-3 h-64 glass rounded-3xl border-dashed border-white/10 flex flex-col items-center justify-center text-neutral-500 space-y-4">
                      <History className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">Nenhum projeto encontrado ainda.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {showSettings && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-brand-dark/80 backdrop-blur-md">
                <div className="glass w-full max-w-2xl rounded-[2.5rem] p-12 space-y-8 relative">
                  <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-neutral-500 hover:text-white transition-colors">
                    <Trash2 className="w-6 h-6 rotate-45" />
                  </button>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-display font-bold text-white">Configurações do Sistema</h2>
                    <p className="text-neutral-500">Gerencie sua conexão com o ecossistema Mooka.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center">
                          <Globe className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-white">Supabase MCP Connection</p>
                          <p className="text-xs text-neutral-500">Conecte sua infraestrutura de dados avançada.</p>
                        </div>
                      </div>
                      <button className="px-6 py-2 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary hover:text-brand-dark transition-all">
                        MCP GERENCIADO NO BACKEND
                      </button>
                    </div>

                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center">
                          <ShieldCheck className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-white">Segurança de Dados</p>
                          <p className="text-xs text-neutral-500">Criptografia ponta-a-ponta ativa.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Ativo</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <button onClick={() => setShowSettings(false)} className="px-8 py-3 bg-white text-brand-dark font-bold rounded-xl">FECHAR</button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8">
            <div className="relative w-40 h-40 mb-12">
              <div className="absolute inset-0 border-2 border-brand-primary/10 rounded-full" />
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-t-brand-primary rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-brand-primary/20 rounded-full blur-2xl animate-pulse" />
                <Zap className="w-12 h-12 text-brand-primary relative z-10 fill-brand-primary" />
              </div>
            </div>
            <motion.p key={loadingMessage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-display font-medium text-white text-center max-w-xl leading-relaxed">
              {loadingMessage}
            </motion.p>
            <div className="mt-8 flex items-center gap-4 text-neutral-600">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Neural Engine v3.1</span>
              <div className="w-1 h-1 rounded-full bg-neutral-800" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Market Grounding Active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[210]"
          >
            <div className={`glass rounded-xl px-4 py-3 min-w-[280px] border ${feedback.type === 'error' ? 'border-red-500/40' : 'border-emerald-500/40'}`}>
              <div className="flex items-start gap-3">
                <div className={`text-xs font-black uppercase tracking-wider ${feedback.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {feedback.type === 'error' ? 'Erro' : 'Sucesso'}
                </div>
                <p className="text-sm text-neutral-200 flex-1 leading-relaxed">{feedback.message}</p>
                <button onClick={() => setFeedback(null)} className="text-neutral-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Views ---

function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Verifique seu e-mail para confirmar o cadastro.');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[150px] rounded-full" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <Logo />
          <h2 className="text-2xl font-display font-bold text-white mt-8">Bem-vindo ao Mooka</h2>
          <p className="text-neutral-500 mt-2">A plataforma definitiva para branding inteligente.</p>
        </div>

        <form onSubmit={handleAuth} className="glass rounded-3xl p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-primary outline-none transition-all"
                placeholder="nome@empresa.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Senha</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-primary text-brand-dark font-black rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'ENTRAR NA PLATAFORMA' : 'CRIAR MINHA CONTA')}
          </button>

          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-xs font-bold text-neutral-500 hover:text-white transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// --- Helpers ---

function NavItem({ active, onClick, icon: Icon, label, disabled }: any) {
  return (
    <button
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
    </button>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="glass p-8 rounded-3xl border-white/5 space-y-4 hover:border-brand-primary/30 transition-colors group">
      <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-brand-primary" />
      </div>
      <div className="space-y-2">
        <h4 className="text-lg font-display font-bold text-white">{title}</h4>
        <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="glass p-6 rounded-2xl border-white/5 flex items-center gap-4">
      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-brand-primary" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-display font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, content, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-brand-primary">
        <Icon className="w-4 h-4" />
        <h4 className="text-xs font-bold uppercase tracking-widest">{title}</h4>
      </div>
      <p className="text-neutral-300 leading-relaxed">{content}</p>
    </div>
  );
}
