import type { Trade } from "./trades";

const STORAGE_KEY = "lex8r_trades";

export function loadTrades(): Trade[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    return JSON.parse(stored) as Trade[];
  } catch {
    return [];
  }
}

export function saveTrades(trades: Trade[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(trades)
  );
}

export function addTrade(trade: Trade) {
  const trades = loadTrades();

  trades.unshift(trade);

  saveTrades(trades);

  return trades;
}

export function deleteTrade(id: string) {
  const trades = loadTrades();

  const updated = trades.filter(
    (trade) => trade.id !== id
  );

  saveTrades(updated);

  return updated;
}

export function clearTrades() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
}
