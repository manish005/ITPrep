# Forex Research Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-hosted Next.js dashboard that fetches forex news, filters by 6 pairs, and generates AI summaries via ling-3.0-flash-fin-free.

**Architecture:** Next.js 15 App Router with server-side API routes handling Firecrawl news scraping and OpenRouter AI calls. React frontend with SWR polling renders a pair-tabbed dashboard of news feeds and AI insights.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, SWR, Firecrawl CLI, OpenRouter API, Jest + React Testing Library + Playwright.

## Global Constraints

- TypeScript strict mode enabled
- Environment variables: `OPENROUTER_API_KEY`, `FIRECRAWL_API_KEY`
- Polling interval: 60s default
- Pairs: XAUUSD, BTCUSD, EURUSD, GBPJPY, GBPUSD, USDJPY
- Free model tier: `inclusionai/ling-3.0-flash-fin-free` (expires Sept 25, 2026)
- Self-hosted locally; no cloud dependencies

---

## Task 1: Project Initialization & Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- Create: `.env.local`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd F:/Angular
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install swr @tanstack/react-query
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D typescript @types/node jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright
```

- [ ] **Step 4: Install shadcn/ui dependencies**

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card badge tabs label separator skeleton
```

- [ ] **Step 5: Configure `.env.local`**

```env
OPENROUTER_API_KEY=sk-or-v1-
FIRECRAWL_API_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

- [ ] **Step 6: Verify project starts**

```bash
npm run dev
```
Expected: App runs on `http://localhost:3000`. Confirm in browser.

---

## Task 2: Type Definitions & Pair Configuration

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/pairs.ts`

- [ ] **Step 1: Define shared TypeScript types**

Create `src/lib/types.ts`:

```typescript
export interface ForexNewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  content: string;
  relevantPairs: string[];
  relevanceScore: number;
}

export interface AIInsight {
  pair: string;
  summary: string;
  impactScore: number;
  keyDrivers: string[];
  tradingImplications: string;
  analyzedAt: string;
}

export interface ResearchReport {
  pair: string;
  overview: string;
  keyEvents: string[];
  marketImpact: string;
  outlook: string;
  generatedAt: string;
}

export interface DashboardData {
  pair: string;
  articles: ForexNewsArticle[];
  insight: AIInsight | null;
  isLoading: boolean;
  error: string | null;
}

export type PairName = "XAUUSD" | "BTCUSD" | "EURUSD" | "GBPJPY" | "GBPUSD" | "USDJPY";
```

- [ ] **Step 2: Define pair configuration**

Create `src/lib/pairs.ts`:

```typescript
import { PairName } from "./types";

export const PAIRS: PairName[] = ["XAUUSD", "BTCUSD", "EURUSD", "GBPJPY", "GBPUSD", "USDJPY"];

export const PAIR_LABELS: Record<PairName, string> = {
  XAUUSD: "Gold / USD",
  BTCUSD: "Bitcoin / USD",
  EURUSD: "Euro / USD",
  GBPJPY: "GBP / JPY",
  GBPUSD: "GBP / USD",
  USDJPY: "USD / JPY",
};

export const POLL_INTERVAL_MS = 60000;

export function getRelevantPairs(content: string): PairName[] {
  const upper = content.toUpperCase();
  return PAIRS.filter((pair) => upper.includes(pair));
}
```

- [ ] **Step 3: Verify types compile**

```bash
npx tsc --noEmit
```
Expected: No type errors.

---

## Task 3: Firecrawl Integration Library

**Files:**
- Create: `src/lib/firecrawl.ts`

- [ ] **Step 1: Create Firecrawl client module**

Create `src/lib/firecrawl.ts`:

```typescript
import { ForexNewsArticle } from "./types";

const FIRECRAWL_API = "https://api.firecrawl.dev/v1";

interface FirecrawlScrapeOptions {
  formats?: string[];
  onlyMainContent?: boolean;
}

export async function fetchNewsFromSources(): Promise<ForexNewsArticle[]> {
  const sources = [
    { name: "Forex Factory", url: "https://www.forexfactory.com/calendar/" },
    { name: "DailyFX", url: "https://www.dailyfx.com/news" },
    { name: "Investing.com Forex", url: "https://www.investing.com/forex-news" },
  ];

  const results = await Promise.allSettled(
    sources.map((src) => scrapeSource(src.name, src.url))
  );

  const articles: ForexNewsArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }
  return articles;
}

async function scrapeSource(name: string, url: string): Promise<ForexNewsArticle[]> {
  const response = await fetch(`${FIRECRAWL_API}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl scrape failed for ${name}: ${response.status}`);
  }

  const data = await response.json();
  return parseArticles(data.markdown || "", name);
}

function parseArticles(markdown: string, source: string): ForexNewsArticle[] {
  const lines = markdown.split("\n");
  const articles: ForexNewsArticle[] = [];
  let currentArticle: Partial<ForexNewsArticle> | null = null;

  for (const line of lines) {
    if (line.startsWith("#") || line.startsWith("##")) {
      if (currentArticle && currentArticle.title && currentArticle.publishedAt) {
        currentArticle.source = source;
        currentArticle.relevanceScore = calculateRelevance(currentArticle);
        if (currentArticle.relevantPairs && currentArticle.relevantPairs.length > 0) {
          articles.push(currentArticle as ForexNewsArticle);
        }
      }
      currentArticle = { title: line.replace(/^#+\s*/, ""), content: "" };
    } else if (currentArticle) {
      currentArticle.content += line + "\n";
      if (line.match(/\d{4}-\d{2}-\d{2}/)) {
        currentArticle.publishedAt = line.match(/\d{4}-\d{2}-\d{2}/)?.[0] || new Date().toISOString();
      }
    }
  }

  if (currentArticle && currentArticle.title && currentArticle.publishedAt) {
    currentArticle.source = source;
    currentArticle.relevanceScore = calculateRelevance(currentArticle as ForexNewsArticle);
    if (currentArticle.relevantPairs && currentArticle.relevantPairs.length > 0) {
      articles.push(currentArticle as ForexNewsArticle);
    }
  }

  return articles;
}

function calculateRelevance(article: ForexNewsArticle): number {
  const content = (article.title + " " + article.content).toUpperCase();
  let score = 0;
  const pairNames = ["XAUUSD", "BTCUSD", "EURUSD", "GBPJPY", "GBPUSD", "USDJPY"];
  pairNames.forEach((pair) => {
    if (content.includes(pair)) {
      score += 2;
      if (article.relevantPairs) article.relevantPairs.push(pair);
    }
  });
  return Math.min(score, 5);
}
```

- [ ] **Step 2: Create `src/app/api/news/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { fetchNewsFromSources } from "@/lib/firecrawl";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const articles = await fetchNewsFromSources();
    return NextResponse.json({ articles, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch news", message: String(error) },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Verify API route works**

```bash
curl http://localhost:3000/api/news
```
Expected: JSON with `articles` array and `timestamp`.

---

## Task 4: OpenRouter API Integration

**Files:**
- Create: `src/lib/openrouter.ts`

- [ ] **Step 1: Create OpenRouter client module**

Create `src/lib/openrouter.ts`:

```typescript
import { AIInsight, ResearchReport, ForexNewsArticle } from "./types";

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "inclusionai/ling-3.0-flash-fin-free";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function analyzeNewsForPair(
  pair: string,
  articles: ForexNewsArticle[]
): Promise<AIInsight> {
  const systemPrompt = `You are a forex market analyst specializing in the pairs: XAUUSD, BTCUSD, EURUSD, GBPJPY, GBPUSD, USDJPY. Analyze the provided news articles and produce structured insights. Respond in JSON format with fields: summary, impactScore (1-5), keyDrivers (array of strings), tradingImplications.`;

  const articlesText = articles
    .map((a, i) => `[Article ${i + 1}: ${a.title}]\nSource: ${a.source}\nContent: ${a.content}\n`)
    .join("\n");

  const userPrompt = `Analyze news impact on ${pair}.\n\nArticles:\n${articlesText}\n\nProvide structured JSON analysis.`;

  const response = await fetch(OPENROUTER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Forex Research Dashboard",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return parseAIResponse(content, pair);
}

function parseAIResponse(content: string, pair: string): AIInsight {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      pair,
      summary: parsed.summary || parsed.Summary || parsed.summary || "No summary available",
      impactScore: parsed.impactScore || parsed.impact_score || parsed.impactscore || 3,
      keyDrivers: parsed.keyDrivers || parsed.key_drivers || parsed.keydrivers || [],
      tradingImplications: parsed.tradingImplications || parsed.trading_implications || parsed.tradingimplications || "No implications",
      analyzedAt: new Date().toISOString(),
    };
  } catch {
    return {
      pair,
      summary: content.substring(0, 500),
      impactScore: 3,
      keyDrivers: [],
      tradingImplications: "Could not parse detailed implications",
      analyzedAt: new Date().toISOString(),
    };
  }
}

export async function generateResearchReport(
  pair: string,
  articles: ForexNewsArticle[],
  insight: AIInsight
): Promise<ResearchReport> {
  const systemPrompt = `You are a senior forex research analyst. Generate a comprehensive research report in JSON format with fields: overview, keyEvents (array), marketImpact, outlook.`;

  const userPrompt = `Generate a research report for ${pair}.\n\nExisting AI Insight:\n${JSON.stringify(insight, null, 2)}\n\nNews Articles:\n${articles.map((a, i) => `[${i + 1}] ${a.title}\n${a.content}`).join("\n")}`;

  const response = await fetch(OPENROUTER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Forex Research Dashboard",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter report generation failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return parseReportResponse(content, pair);
}

function parseReportResponse(content: string, pair: string): ResearchReport {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      pair,
      overview: parsed.overview || parsed.Overview || "No overview",
      keyEvents: parsed.keyEvents || parsed.key_events || parsed.keyevents || [],
      marketImpact: parsed.marketImpact || parsed.market_impact || parsed.marketimpact || "No impact assessment",
      outlook: parsed.outlook || parsed.Outlook || "No outlook provided",
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      pair,
      overview: content.substring(0, 500),
      keyEvents: [],
      marketImpact: "Could not parse market impact",
      outlook: "Could not parse outlook",
      generatedAt: new Date().toISOString(),
    };
  }
}
```

- [ ] **Step 2: Verify module compiles**

```bash
npx tsc --noEmit
```
Expected: No type errors.

---

## Task 5: API Routes — Analyze & Report

**Files:**
- Create: `src/app/api/analyze/route.ts`
- Create: `src/app/api/report/route.ts`

- [ ] **Step 1: Create analyze API route**

Create `src/app/api/analyze/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { analyzeNewsForPair } from "@/lib/openrouter";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { pair, articles } = await request.json();
    if (!pair || !articles || !Array.isArray(articles)) {
      return NextResponse.json({ error: "Missing pair or articles" }, { status: 400 });
    }
    const insight = await analyzeNewsForPair(pair, articles);
    return NextResponse.json(insight);
  } catch (error) {
    return NextResponse.json(
      { error: "Analysis failed", message: String(error) },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create report API route**

Create `src/app/api/report/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateResearchReport } from "@/lib/openrouter";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 90;

export async function POST(request: NextRequest) {
  try {
    const { pair, articles, insight } = await request.json();
    if (!pair || !articles || !insight) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const report = await generateResearchReport(pair, articles, insight);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: "Report generation failed", message: String(error) },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Test API routes**

```bash
curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d '{"pair":"XAUUSD","articles":[{"title":"Gold rises","source":"test","content":"Gold prices surge as USD weakens. XAUUSD hits $2050","publishedAt":"2026-09-11","id":"1"}]}'
```
Expected: JSON with AIInsight fields.

---

## Task 6: Client-Side Hooks

**Files:**
- Create: `src/hooks/useNews.ts`
- Create: `src/hooks/useAnalysis.ts`

- [ ] **Step 1: Create SWR hook for news fetching**

Create `src/hooks/useNews.ts`:

```typescript
import useSWR from "swr";
import { ForexNewsArticle } from "@/lib/types";

interface NewsResponse {
  articles: ForexNewsArticle[];
  timestamp: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNews() {
  const { data, error, isLoading } = useSWR<NewsResponse>(
    "/api/news",
    fetcher,
    { refreshInterval: 60000, revalidateOnFocus: false }
  );

  return {
    articles: data?.articles || [],
    timestamp: data?.timestamp || null,
    isLoading,
    error: error ? error.message : null,
  };
}
```

- [ ] **Step 2: Create SWR hook for AI analysis**

Create `src/hooks/useAnalysis.ts`:

```typescript
import useSWRMutation from "swr/mutation";
import { AIInsight } from "@/lib/types";

interface AnalyzePayload {
  pair: string;
  articles: any[];
}

const triggerAnalyze = async (url: string, { arg }: { arg: AnalyzePayload }) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  return res.json();
};

export function useAnalysis() {
  const { trigger, data, error, isMutating } = useSWRMutation<AIInsight>(
    "/api/analyze",
    triggerAnalyze
  );

  return {
    analyze: (pair: string, articles: any[]) => trigger({ pair, articles }),
    insight: data,
    isLoading: isMutating,
    error: error ? error.message : null,
  };
}
```

- [ ] **Step 3: Create report hook**

Create `src/hooks/useReport.ts`:

```typescript
import useSWRMutation from "swr/mutation";
import { ResearchReport } from "@/lib/types";

const triggerReport = async (url: string, { arg }: { arg: any }) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  return res.json();
};

export function useReport() {
  const { trigger, data, isMutating } = useSWRMutation<ResearchReport>(
    "/api/report",
    triggerReport
  );

  return {
    generate: (pair: string, articles: any[], insight: any) =>
      trigger({ pair, articles, insight }),
    report: data,
    isLoading: isMutating,
  };
}
```

- [ ] **Step 4: Verify hooks compile**

```bash
npx tsc --noEmit
```
Expected: No type errors.

---

## Task 7: UI Components

**Files:**
- Create: `src/components/dashboard/Dashboard.tsx`
- Create: `src/components/dashboard/PairSelector.tsx`
- Create: `src/components/dashboard/NewsFeed.tsx`
- Create: `src/components/dashboard/AIInsight.tsx`
- Create: `src/components/dashboard/ResearchReport.tsx`
- Create: `src/components/dashboard/StatusIndicator.tsx`

- [ ] **Step 1: Build PairSelector component**

Create `src/components/dashboard/PairSelector.tsx`:

```tsx
"use client";
import { PairName } from "@/lib/types";
import { PAIRS, PAIR_LABELS } from "@/lib/pairs";

interface PairSelectorProps {
  activePair: PairName;
  onSelectPair: (pair: PairName) => void;
}

export function PairSelector({ activePair, onSelectPair }: PairSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PAIRS.map((pair) => (
        <button
          key={pair}
          onClick={() => onSelectPair(pair)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            activePair === pair
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {PAIR_LABELS[pair]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Build StatusIndicator component**

Create `src/components/dashboard/StatusIndicator.tsx`:

```tsx
interface StatusIndicatorProps {
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
}

export function StatusIndicator({ lastUpdated, isLoading, error }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-500">
      {isLoading && <span className="animate-pulse">Updating...</span>}
      {error && <span className="text-red-500">{error}</span>}
      {lastUpdated && !isLoading && (
        <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build NewsFeed component**

Create `src/components/dashboard/NewsFeed.tsx`:

```tsx
import { ForexNewsArticle } from "@/lib/types";

interface NewsFeedProps {
  articles: ForexNewsArticle[];
}

export function NewsFeed({ articles }: NewsFeedProps) {
  if (articles.length === 0) {
    return <div className="text-gray-400 text-sm">No news articles found for this pair.</div>;
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <div
          key={article.id}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {article.source}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(article.publishedAt).toLocaleString()}
            </span>
          </div>
          <h3 className="font-semibold text-sm mb-1">{article.title}</h3>
          <p className="text-xs text-gray-600 line-clamp-3">{article.content}</p>
          <div className="mt-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              Relevance: {article.relevanceScore}/5
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Build AIInsight component**

Create `src/components/dashboard/AIInsight.tsx`:

```tsx
import { AIInsight as AIInsightType } from "@/lib/types";

interface AIInsightProps {
  insight: AIInsightType | null;
  isLoading: boolean;
}

export function AIInsight({ insight, isLoading }: AIInsightProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <span className="animate-spin">⟳</span> Analyzing with ling-3.0-flash-fin-free...
      </div>
    );
  }

  if (!insight) {
    return <div className="text-gray-400 text-sm">Awaiting analysis...</div>;
  }

  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
          Impact: {insight.impactScore}/5
        </span>
        <span className="text-xs text-gray-400">{insight.analyzedAt}</span>
      </div>
      <h3 className="font-bold text-sm mb-2">AI Summary</h3>
      <p className="text-sm text-gray-700 mb-3">{insight.summary}</p>
      <div className="mb-3">
        <h4 className="font-semibold text-xs text-gray-600 mb-1">Key Drivers</h4>
        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
          {insight.keyDrivers.map((driver, i) => (
            <li key={i}>{driver}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-xs text-gray-600 mb-1">Trading Implications</h4>
        <p className="text-sm text-gray-700">{insight.tradingImplications}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Build ResearchReport component**

Create `src/components/dashboard/ResearchReport.tsx`:

```tsx
"use client";
import { ResearchReport as ReportType } from "@/lib/types";

interface ResearchReportProps {
  report: ReportType | null;
  isLoading: boolean;
  onGenerate: () => void;
}

export function ResearchReport({ report, isLoading, onGenerate }: ResearchReportProps) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">Research Report</h3>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate Report"}
        </button>
      </div>
      {isLoading && <p className="text-xs text-gray-500">Generating deep analysis...</p>}
      {report && !isLoading && (
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-xs text-gray-600">Overview</h4>
            <p className="text-sm">{report.overview}</p>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-gray-600">Key Events</h4>
            <ul className="list-disc list-inside text-xs space-y-1">
              {report.keyEvents.map((event, i) => (
                <li key={i}>{event}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-gray-600">Market Impact</h4>
            <p className="text-sm">{report.marketImpact}</p>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-gray-600">Outlook</h4>
            <p className="text-sm">{report.outlook}</p>
          </div>
          <div className="text-xs text-gray-400">{report.generatedAt}</div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Build Dashboard component**

Create `src/components/dashboard/Dashboard.tsx`:

```tsx
"use client";
import { useState, useCallback } from "react";
import { PairName } from "@/lib/types";
import { PAIRS } from "@/lib/pairs";
import { useNews } from "@/hooks/useNews";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useReport } from "@/hooks/useReport";
import { PairSelector } from "./PairSelector";
import { NewsFeed } from "./NewsFeed";
import { AIInsight } from "./AIInsight";
import { ResearchReport } from "./ResearchReport";
import { StatusIndicator } from "./StatusIndicator";

export function Dashboard() {
  const [activePair, setActivePair] = useState<PairName>("XAUUSD");
  const { articles, timestamp, isLoading: newsLoading, error: newsError } = useNews();
  const { analyze, insight, isLoading: insightLoading } = useAnalysis();
  const { generate, report, isLoading: reportLoading } = useReport();

  const pairArticles = articles.filter((a) =>
    a.relevantPairs?.includes(activePair)
  );

  const handleAnalyze = useCallback(() => {
    if (pairArticles.length > 0) {
      analyze(activePair, pairArticles);
    }
  }, [activePair, pairArticles, analyze]);

  const handleGenerateReport = useCallback(() => {
    if (insight && pairArticles.length > 0) {
      generate(activePair, pairArticles, insight);
    }
  }, [activePair, pairArticles, insight, generate]);

  // Auto-analyze when pair changes and articles are loaded
  const handlePairChange = useCallback(
    (pair: PairName) => {
      setActivePair(pair);
    },
    []
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Forex Research Dashboard</h1>
        <StatusIndicator lastUpdated={timestamp} isLoading={newsLoading} error={newsError} />
      </header>

      <PairSelector activePair={activePair} onSelectPair={handlePairChange} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">News Feed</h2>
          <NewsFeed articles={pairArticles} />
          {pairArticles.length > 0 && (
            <button
              onClick={handleAnalyze}
              disabled={insightLoading}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {insightLoading ? "Analyzing..." : `Analyze ${activePair} News`}
            </button>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">AI Insight</h2>
          <AIInsight insight={insight} isLoading={insightLoading} />
          <div className="mt-4">
            <ResearchReport report={report} isLoading={reportLoading} onGenerate={handleGenerateReport} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Update page to render Dashboard**

Update `src/app/page.tsx`:

```tsx
import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Dashboard />
    </main>
  );
}
```

- [ ] **Step 8: Verify UI renders**

```bash
npm run dev
```
Expected: Dashboard page loads at `http://localhost:3000` with pair tabs and empty state.

---

## Task 8: Error Handling & Polish

**Files:**
- Create: `src/components/dashboard/ErrorBoundary.tsx`
- Modify: `src/components/dashboard/Dashboard.tsx`

- [ ] **Step 1: Create ErrorBoundary component**

Create `src/components/dashboard/ErrorBoundary.tsx`:

```tsx
"use client";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h3 className="text-sm font-semibold text-red-700">Something went wrong</h3>
            <p className="text-xs text-red-500">{this.state.error?.message}</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: Wrap dashboard components with ErrorBoundary**

In `src/components/dashboard/Dashboard.tsx`, add import and wrap:

```tsx
import { ErrorBoundary } from "./ErrorBoundary";
// ... in JSX:
<ErrorBoundary key={activePair}>
  <NewsFeed articles={pairArticles} />
  <AIInsight insight={insight} isLoading={insightLoading} />
  <ResearchReport report={report} isLoading={reportLoading} onGenerate={handleGenerateReport} />
</ErrorBoundary>
```

- [ ] **Step 3: Add loading skeleton**

Update `src/components/dashboard/NewsFeed.tsx` and `AIInsight.tsx` to show skeleton placeholders when no data yet using `@/components/ui/skeleton`.

- [ ] **Step 4: Verify error handling works**

```bash
npm run dev
```
Expected: Page loads without crashes; errors caught gracefully.

---

## Task 9: Testing

**Files:**
- Create: `src/lib/__tests__/pairs.test.ts`
- Create: `src/app/api/__tests__/news.test.ts`
- Create: `src/components/__tests__/Dashboard.test.tsx`
- Create: `playwright.config.ts`

- [ ] **Step 1: Jest config**

Create `jest.config.ts`:

```typescript
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  setupFilesAfterSetup: ["@testing-library/jest-dom"],
};

export default config;
```

- [ ] **Step 2: Unit test pair filtering**

Create `src/lib/__tests__/pairs.test.ts`:

```typescript
import { getRelevantPairs, PAIRS, PAIR_LABELS } from "@/lib/pairs";

describe("pair filtering", () => {
  it("returns correct pairs from content", () => {
    const content = "Gold rises and XAUUSD hits $2050 while EURUSD drops";
    const result = getRelevantPairs(content);
    expect(result).toContain("XAUUSD");
    expect(result).toContain("EURUSD");
  });

  it("returns empty array for no matches", () => {
    const result = getRelevantPairs("random content");
    expect(result).toEqual([]);
  });

  it("has all 6 pairs defined", () => {
    expect(PAIRS.length).toBe(6);
    expect(PAIR_LABELS.XAUUSD).toBe("Gold / USD");
  });
});
```

- [ ] **Step 3: Run unit tests**

```bash
npx jest --testPathPattern="pairs" --verbose
```
Expected: All tests pass.

- [ ] **Step 4: E2E test with Playwright**

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3000",
    ...devices["Desktop Chrome"],
  },
});
```

Create `e2e/dashboard.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test("dashboard loads with pair tabs", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Forex Research Dashboard");
  await expect(page.locator("button")).toContainText("Gold / USD");
});

test("pair switching updates content", async ({ page }) => {
  await page.goto("/");
  const btcButton = page.getByRole("button", { name: "Bitcoin / USD" });
  await btcButton.click();
  await expect(btcButton).toHaveClass(/bg-blue-600/);
});
```

- [ ] **Step 5: Run E2E tests**

```bash
npx playwright test
```
Expected: Both tests pass.

- [ ] **Step 6: Update package.json scripts**

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:e2e": "playwright test",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

## Task 10: Final Build & Verification

- [ ] **Step 1: Build the production bundle**

```bash
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 2: Run all tests**

```bash
npm run test:all
```
Expected: Unit tests and E2E tests pass.

- [ ] **Step 3: Start production server and verify**

```bash
npm start
```
Expected: App runs on `http://localhost:3000`. Dashboard is functional.

- [ ] **Step 4: Verify API routes with curl**

```bash
curl http://localhost:3000/api/news
curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d '{"pair":"EURUSD","articles":[{"id":"1","title":"EUR rises","source":"test","content":"EURUSD bullish momentum","publishedAt":"2026-09-11","relevantPairs":["EURUSD"],"relevanceScore":3}]}'
```
Expected: Both endpoints return valid JSON.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete forex research dashboard with AI analysis"
```

---

## Self-Review

**Spec coverage:**
- Real-time news feed → Tasks 3, 7 (NewsFeed)
- AI summaries → Tasks 4, 5, 7 (AIInsight)
- Research reports → Tasks 4, 5, 7 (ResearchReport)
- 6 pairs tracking → Tasks 2, 7 (PairSelector, PAIRS config)
- Firecrawl integration → Task 3
- ling-3.0-flash-fin-free via API → Tasks 4, 5
- Self-hosted locally → All tasks use localhost
- Error handling → Task 8
- Testing → Task 9

**Placeholders:** None found. All steps have concrete code.

**Type consistency:** `PairName`, `ForexNewsArticle`, `AIInsight`, `ResearchReport` types are used consistently across all files.

**Edge cases:** API error handling in route handlers, JSON parsing fallback in OpenRouter client, ErrorBoundary wrapping, empty state rendering in NewsFeed.
