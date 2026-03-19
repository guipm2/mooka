import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { createServer as createViteServer } from "vite";

dotenv.config({ path: ".env.local" });
dotenv.config();

type BrandStrategy = {
  name: string;
  tagline: string;
  mission: string;
  targetAudience: string;
  toneOfVoice: string;
  colorPalette: string[];
  marketTrends: string[];
  competitors: string[];
};

type BrandPersonalization = {
  controlLevel?: "auto" | "guided" | "detailed";
  palettePreference?: string;
  customPalette?: string;
  identityArchetype?: string;
  brandVibe?: string[];
  typographyMood?: string;
  logoElements?: string;
  avoidElements?: string;
  mockupScene?: string;
};

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";
const openAIKey = process.env.OPENAI_API_KEY || "";
const isOpenAIConfigured = Boolean(openAIKey);
const strategyModel = process.env.OPENAI_STRATEGY_MODEL || "gpt-4.1-mini";
const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const requireAuth = process.env.REQUIRE_AUTH === "true";
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const isSupabaseAuthConfigured = Boolean(supabaseUrl && supabaseAnonKey);
const supabaseAuth = isSupabaseAuthConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
const openai = isOpenAIConfigured ? new OpenAI({ apiKey: openAIKey }) : null;

const stylePrompts: Record<string, string> = {
  Minimalist: "Clean, simple, geometric, negative space, premium minimalist aesthetic.",
  "Modern Tech": "Futuristic, sleek, gradients, sharp edges, tech-oriented, dynamic.",
  Luxury: "Elegant, refined, high-contrast composition, sophisticated premium feel.",
  Playful: "Vibrant colors, rounded shapes, friendly, approachable, energetic.",
  Brutalism: "Bold, raw, high contrast, industrial, experimental, unconventional.",
};

const productPrompts: Record<string, string> = {
  "T-Shirt": "A high-quality cotton t-shirt worn by a model in a professional studio setting.",
  Hoodie: "A premium heavy-weight hoodie with realistic fabric texture.",
  Cap: "A modern baseball cap with realistic embroidered thread details.",
  Mug: "A sleek ceramic coffee mug in a modern office environment with realistic reflections.",
  "Tote Bag": "An eco-friendly canvas tote bag with realistic canvas texture.",
  "Phone Case": "A premium smartphone case on a marble surface with high-end finish.",
};

function getAllowedOrigins(): string[] {
  const value = process.env.ALLOWED_ORIGINS || "";
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseDataUrl(base64DataUrl: string): { buffer: Buffer; mimeType: string } {
  const [meta, data] = base64DataUrl.split(",");
  if (!meta || !data || !meta.startsWith("data:")) {
    throw new Error("Invalid image payload.");
  }

  const mimeType = meta.split(";")[0]?.replace("data:", "") || "image/png";
  return {
    buffer: Buffer.from(data, "base64"),
    mimeType,
  };
}

function toDataUrl(base64Png: string): string {
  return `data:image/png;base64,${base64Png}`;
}

function getSafeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected server error.";
}

function buildPersonalizationPrompt(personalization?: BrandPersonalization): string {
  if (!personalization || personalization.controlLevel === "auto") return "";

  const lines: string[] = [];
  if (personalization.palettePreference) lines.push(`Preferred palette mood: ${personalization.palettePreference}`);
  if (personalization.customPalette) lines.push(`Custom palette hints: ${personalization.customPalette}`);
  if (personalization.identityArchetype) lines.push(`Identity archetype: ${personalization.identityArchetype}`);
  if (personalization.brandVibe?.length) lines.push(`Brand vibe keywords: ${personalization.brandVibe.join(", ")}`);
  if (personalization.typographyMood) lines.push(`Typography mood: ${personalization.typographyMood}`);
  if (personalization.logoElements) lines.push(`Elements to include: ${personalization.logoElements}`);
  if (personalization.avoidElements) lines.push(`Elements to avoid: ${personalization.avoidElements}`);
  if (personalization.mockupScene) lines.push(`Preferred mockup scene: ${personalization.mockupScene}`);

  if (lines.length === 0) return "";

  return `\nPersonalization preferences (must influence result):\n- ${lines.join("\n- ")}`;
}

async function startServer() {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.use(express.json({ limit: "10mb" }));
  app.use(morgan(isProduction ? "combined" : "dev"));

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || !isProduction || allowedOrigins.length === 0) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by CORS."));
      },
    }),
  );

  app.use(
    helmet(
      isProduction
        ? {
            contentSecurityPolicy: {
              directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "blob:", "https:"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
              },
            },
            crossOriginEmbedderPolicy: false,
          }
        : {
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
          },
    ),
  );

  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 60,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use("/api", async (req, res, next) => {
    if (req.path === "/health" || !requireAuth) {
      next();
      return;
    }

    if (!supabaseAuth) {
      res.status(500).json({ error: "REQUIRE_AUTH is enabled, but Supabase auth env vars are missing." });
      return;
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) {
      res.status(401).json({ error: "Missing bearer token." });
      return;
    }

    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired token." });
      return;
    }

    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Mooka Backend",
      aiConfigured: isOpenAIConfigured,
      authRequired: requireAuth,
      supabaseAuthConfigured: isSupabaseAuthConfigured,
      models: {
        strategy: strategyModel,
        image: imageModel,
      },
    });
  });

  app.post("/api/strategy", async (req, res) => {
    const concept = String(req.body?.concept || "").trim();
    const personalization = req.body?.personalization as BrandPersonalization | undefined;
    if (!concept) {
      res.status(400).json({ error: "Brand concept is required." });
      return;
    }
    if (!openai) {
      res.status(503).json({ error: "OpenAI is not configured." });
      return;
    }

    try {
      const response = await openai.responses.create({
        model: strategyModel,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: "You are an expert brand strategist. Return only valid JSON matching the provided schema.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Create a complete brand strategy for this concept: ${concept}${buildPersonalizationPrompt(personalization)}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "brand_strategy",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                name: { type: "string" },
                tagline: { type: "string" },
                mission: { type: "string" },
                targetAudience: { type: "string" },
                toneOfVoice: { type: "string" },
                colorPalette: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 4,
                  maxItems: 5,
                },
                marketTrends: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 5,
                },
                competitors: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 5,
                },
              },
              required: [
                "name",
                "tagline",
                "mission",
                "targetAudience",
                "toneOfVoice",
                "colorPalette",
                "marketTrends",
                "competitors",
              ],
            },
          },
        },
      });

      const content = (response as { output_text?: string }).output_text;
      if (!content) {
        throw new Error("Model returned an empty strategy payload.");
      }

      const strategy = JSON.parse(content) as BrandStrategy;
      res.json(strategy);
    } catch (error) {
      res.status(500).json({ error: getSafeError(error) });
    }
  });

  app.post("/api/logo", async (req, res) => {
    const brandName = String(req.body?.brandName || "").trim();
    const style = String(req.body?.style || "Minimalist").trim();
    const strategy = req.body?.strategy as BrandStrategy | undefined;
    const personalization = req.body?.personalization as BrandPersonalization | undefined;

    if (!brandName || !strategy) {
      res.status(400).json({ error: "brandName and strategy are required." });
      return;
    }
    if (!openai) {
      res.status(503).json({ error: "OpenAI is not configured." });
      return;
    }

    try {
      const styleDetail = stylePrompts[style] || stylePrompts.Minimalist;
      const personalizationPrompt = buildPersonalizationPrompt(personalization);
      const prompt = `Professional logo design for "${brandName}".
Brand mission: ${strategy.mission}
Target audience: ${strategy.targetAudience}
Style direction: ${styleDetail}
Color palette: ${strategy.colorPalette.join(", ")}
    ${personalizationPrompt}
Requirements: isolated on pure white background, centered composition, clean vector-like style, no watermark, no extra text.`;

      const image = await openai.images.generate({
        model: imageModel,
        prompt,
        size: "1024x1024",
      });

      const b64 = image.data?.[0]?.b64_json;
      if (!b64) {
        throw new Error("Image model did not return a logo.");
      }

      res.json({ imageUrl: toDataUrl(b64) });
    } catch (error) {
      res.status(500).json({ error: getSafeError(error) });
    }
  });

  app.post("/api/mockup", async (req, res) => {
    const logoBase64 = String(req.body?.logoBase64 || "");
    const product = String(req.body?.product || "").trim();
    const brandName = String(req.body?.brandName || "").trim();
    const personalization = req.body?.personalization as BrandPersonalization | undefined;

    if (!logoBase64 || !product || !brandName) {
      res.status(400).json({ error: "logoBase64, product and brandName are required." });
      return;
    }
    if (!openai) {
      res.status(503).json({ error: "OpenAI is not configured." });
      return;
    }

    try {
      const { buffer, mimeType } = parseDataUrl(logoBase64);
      const extension = mimeType.includes("jpeg") ? "jpg" : "png";
      const file = await toFile(buffer, `logo.${extension}`, { type: mimeType });

      const productDetail = productPrompts[product] || `A professional mockup for ${product}.`;
      const personalizationPrompt = buildPersonalizationPrompt(personalization);
      const prompt = `Create an ultra-realistic commercial mockup for the brand "${brandName}".
Product: ${product}.
Scene: ${productDetail}
    ${personalizationPrompt}
Integrate the provided logo naturally with correct perspective, material response, shadows and highlights.
Output style: premium product photography.`;

      const image = await openai.images.edit({
        model: imageModel,
        image: file,
        prompt,
        size: "1536x1024",
      });

      const b64 = image.data?.[0]?.b64_json;
      if (!b64) {
        throw new Error("Image model did not return a mockup.");
      }

      res.json({ imageUrl: toDataUrl(b64) });
    } catch (error) {
      res.status(500).json({ error: getSafeError(error) });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mooka server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
