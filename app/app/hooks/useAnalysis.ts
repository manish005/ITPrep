import { useState, useCallback } from "react";
import { AIInsight } from "@/lib/types";

export function useAnalysis() {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (pair: string, articles: any[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pair, articles }),
      });
      const data = await res.json();
      setInsight(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analyze, insight, isLoading, error };
}