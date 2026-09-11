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
            activePair === pair ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {PAIR_LABELS[pair]}
        </button>
      ))}
    </div>
  );
}