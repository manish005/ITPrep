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
        <button onClick={onGenerate} disabled={isLoading} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? "Generating..." : "Generate Report"}
        </button>
      </div>
      {isLoading && <p className="text-xs text-gray-500">Generating deep analysis...</p>}
      {report && !isLoading && (
        <div className="space-y-3">
          <div><h4 className="font-semibold text-xs text-gray-600">Overview</h4><p className="text-sm">{report.overview}</p></div>
          <div><h4 className="font-semibold text-xs text-gray-600">Key Events</h4><ul className="list-disc list-inside text-xs space-y-1">{report.keyEvents.map((event, i) => <li key={i}>{event}</li>)}</ul></div>
          <div><h4 className="font-semibold text-xs text-gray-600">Market Impact</h4><p className="text-sm">{report.marketImpact}</p></div>
          <div><h4 className="font-semibold text-xs text-gray-600">Outlook</h4><p className="text-sm">{report.outlook}</p></div>
          <div className="text-xs text-gray-400">{report.generatedAt}</div>
        </div>
      )}
    </div>
  );
}