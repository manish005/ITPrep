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