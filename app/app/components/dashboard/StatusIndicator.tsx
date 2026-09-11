import { cn } from "@/lib/utils";

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
      {lastUpdated && !isLoading && <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>}
    </div>
  );
}