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