# Forex Research Dashboard — Design Spec

## Overview

Self-hosted Next.js web app that aggregates forex news from Forex Factory and global financial sources, filters by currency pairs, and uses the ling-3.0-flash-fin-free AI model via OpenRouter API to generate summaries and impact analysis per pair.

## Pairs Tracked

- XAUUSD (Gold/USD)
- BTCUSD (Bitcoin/USD)
- EURUSD (Euro/USD)
- GBPJPY (British Pound/Japanese Yen)
- GBPUSD (British Pound/USD)
- USDJPY (USD/Japanese Yen)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Data Fetching | SWR (client-side polling) |
| News Fetching | Firecrawl CLI |
| AI Model | ling-3.0-flash-fin-free via OpenRouter API |
| Backend | Next.js API Routes + Server Actions |
| Testing | Jest + React Testing Library + Playwright |

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Dashboard home
│   ├── api/
│   │   ├── news/           # Route handler: fetch + filter news
│   │   ├── analyze/        # Route handler: call ling model
│   │   └── report/         # Route handler: generate research report
│   └── dashboard/          # Dashboard page
│       └── [pair]/         # Per-pair page
├── components/
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── PairSelector.tsx
│   │   ├── NewsFeed.tsx
│   │   ├── AIInsight.tsx
│   │   └── ResearchReport.tsx
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── firecrawl.ts        # Firecrawl integration
│   ├── openrouter.ts       # OpenRouter API client
│   ├── pairs.ts            # Pair config & filtering logic
│   └── types.ts            # Shared TypeScript types
├── hooks/
│   ├── useNews.ts          # SWR hook for news
│   └── useAnalysis.ts      # SWR hook for AI analysis
└── utils/
    └── formatters.ts       # Date, price formatters
```

## Data Flow

1. **News Fetching (Server):** Next.js API route calls Firecrawl to scrape Forex Factory news feed and global financial news sources. Articles are parsed and tagged by relevant pair.
2. **Filtering (Server):** Articles matched to the 6 tracked pairs are collected and deduplicated.
3. **AI Analysis (Server):** Each batch of news is sent to ling-3.0-flash-fin-free via OpenRouter API with a structured prompt requesting: summary, impact score (1-5), key drivers, and trading implications.
4. **Client Rendering (Browser):** SWR polls the API every 60s. Dashboard renders pair tabs with news cards and AI insight panels.
5. **Reports (Server):** User can request a deeper research report; the server calls the model with expanded context and returns a structured document.

## Key Components

### Dashboard (`components/dashboard/Dashboard.tsx`)
- Tab-based navigation for 6 pairs
- Each tab shows: news feed + AI insight panel
- Real-time status indicator (last updated, polling status)

### NewsFeed (`components/dashboard/NewsFeed.tsx`)
- Cards with: source, headline, timestamp, relevance tag
- Filter by relevance score
- Expandable article preview

### AIInsight (`components/dashboard/AIInsight.tsx`)
- Impact score badge (1-5)
- AI summary paragraph
- Key drivers listed
- Trading implications callout

### ResearchReport (`components/dashboard/ResearchReport.tsx`)
- Longer-form analysis
- Structured sections: Overview, Key Events, Market Impact, Outlook
- Downloadable/exportable

### PairSelector (`components/dashboard/PairSelector.tsx`)
- Toggle buttons for 6 pairs
- Active pair highlighted
- Quick-switch navigation

## Error Handling

- **API failure:** Display cached data with stale badge; retry on next poll cycle
- **Firecrawl failure:** Log error, retry once, fall back to last successful fetch
- **Model timeout (>30s):** Show "analyzing" spinner, allow manual retry
- **Rate limits:** Exponential backoff on retry
- **Error boundaries:** Per-pair tab isolation; one tab failing doesn't break others

## Environment Variables

```env
OPENROUTER_API_KEY=sk-or-v1-...
FIRECRAWL_API_KEY=...
```

## Testing Strategy

- **Unit tests:** Pair filtering logic, data parsing, formatters (`lib/`, `utils/`)
- **Integration tests:** API route handlers mock Firecrawl and OpenRouter responses
- **E2E tests:** Playwright — dashboard loads, pair switching, news rendering

## Assumptions & Constraints

- ling-3.0-flash-fin-free free tier expires Sept 25, 2026; app will need to switch to `inclusionai/ling-3.0-flash-fin` after that
- Firecrawl free tier has rate limits; aggressive scraping should be avoided
- Local self-hosted; no CDN, no load balancer needed
- Polling interval of 60s is a reasonable compromise between real-time feel and API rate limits
