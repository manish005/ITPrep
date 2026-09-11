import { useState, useCallback } from "react";
import { ResearchReport } from "@/lib/types";

export function useReport() {
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = useCallback(async (pair: string, articles: any[], insight: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pair, articles, insight }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generate, report, isLoading };
}