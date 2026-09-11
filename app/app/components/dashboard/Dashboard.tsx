"use client";
import { ErrorBoundary } from "./ErrorBoundary";
import { PairSelector } from "./PairSelector";
import { NewsFeed } from "./NewsFeed";
import { AIInsight } from "./AIInsight";
import { ResearchReport } from "./ResearchReport";
import { StatusIndicator } from "./StatusIndicator";
import { useState } from "react";
import { PairName } from "@/lib/types";
import { PAIRS } from "@/lib/pairs";
import { useNews } from "@/hooks/useNews";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useReport } from "@/hooks/useReport";

export function Dashboard() {
  const [activePair, setActivePair] = useState<PairName>("XAUUSD");
  const { articles, timestamp, isLoading: newsLoading, error: newsError } = useNews();
  const { analyze, insight, isLoading: insightLoading } = useAnalysis();
  const { generate, report, isLoading: reportLoading } = useReport();

  const pairArticles = articles.filter((a) => a.relevantPairs?.includes(activePair));

  const handleAnalyze = () => {
    if (pairArticles.length > 0) analyze(activePair, pairArticles);
  };

  const handleGenerateReport = () => {
    if (insight && pairArticles.length > 0) generate(activePair, pairArticles, insight);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Forex Research Dashboard</h1>
        <StatusIndicator lastUpdated={timestamp} isLoading={newsLoading} error={newsError} />
      </header>
      <PairSelector activePair={activePair} onSelectPair={setActivePair} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">News Feed</h2>
          <ErrorBoundary>
            <NewsFeed articles={pairArticles} />
          </ErrorBoundary>
          {pairArticles.length > 0 && (
            <button onClick={handleAnalyze} disabled={insightLoading} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
              {insightLoading ? "Analyzing..." : `Analyze ${activePair} News`}
            </button>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">AI Insight</h2>
          <ErrorBoundary>
            <AIInsight insight={insight} isLoading={insightLoading} />
            <div className="mt-4">
              <ResearchReport report={report} isLoading={reportLoading} onGenerate={handleGenerateReport} />
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}