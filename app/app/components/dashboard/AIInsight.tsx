import { AIInsight as AIInsightType } from "@/lib/types";

interface AIInsightProps {
  insight: AIInsightType | null;
  isLoading: boolean;
}

export function AIInsight({ insight, isLoading }: AIInsightProps) {
  if (isLoading) {
    return <div className="flex items-center gap-2 text-gray-500 text-sm"><span className="animate-spin">⟳</span> Analyzing with ling-3.0-flash-fin-free...</div>;
  }
  if (!insight) {
    return <div className="text-gray-400 text-sm">Awaiting analysis...</div>;
  }
  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">Impact: {insight.impactScore}/5</span>
        <span className="text-xs text-gray-400">{insight.analyzedAt}</span>
      </div>
      <h3 className="font-bold text-sm mb-2">AI Summary</h3>
      <p className="text-sm text-gray-700 mb-3">{insight.summary}</p>
      <div className="mb-3">
        <h4 className="font-semibold text-xs text-gray-600 mb-1">Key Drivers</h4>
        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
          {insight.keyDrivers.map((driver, i) => <li key={i}>{driver}</li>)}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-xs text-gray-600 mb-1">Trading Implications</h4>
        <p className="text-sm text-gray-700">{insight.tradingImplications}</p>
      </div>
    </div>
  );
}