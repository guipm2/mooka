# Mooka

Plataforma de branding inteligente com IA para:
- gerar estrategia de marca
- criar logos
- criar mockups de produtos

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- IA: OpenAI (server-side)
- Dados/Auth: Supabase

## Requisitos

- Node.js 20+
- Projeto no Supabase
- Chave da OpenAI

## Configuracao

1. Instale dependencias:

```bash
npm install
```

2. Crie o arquivo `.env.local` na raiz com base em `.env.example`.

Exemplo minimo:

```env
OPENAI_API_KEY=sk-proj-...
OPENAI_STRATEGY_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-1
REQUIRE_AUTH=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ALLOWED_ORIGINS=http://localhost:3000
```

## Banco de dados (Supabase)

Aplique a migration em `supabase/migrations/20260318_create_projects.sql`.

Ela cria a tabela `projects`, indices e policies de RLS por usuario autenticado.

## Rodando localmente

```bash
npm run dev
```

Servidor em `http://localhost:3000`.

## Build de producao

```bash
npm run build
```

## Endpoints de IA

- `POST /api/strategy`
- `POST /api/logo`
- `POST /api/mockup`
- `GET /api/health`

Todos os endpoints de IA usam rate limit e executam no backend.

## Modelos escolhidos

- Estrategia de marca: `gpt-4.1-mini`
- Logo e mockup: `gpt-image-1`

Racional:
- `gpt-4.1-mini` entrega boa qualidade de estrategia com custo e latencia melhores para SaaS.
- `gpt-image-1` eh adequado para geracao e edicao de imagem no mesmo fluxo.
