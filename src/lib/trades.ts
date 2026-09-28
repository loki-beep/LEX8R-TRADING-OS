export type TradeDirection = "LONG" | "SHORT";
export type TradeStatus = "WIN" | "LOSS" | "BREAKEVEN";

export interface Trade {
  id: string;
  date: string;
  accountId: string;

  instrument: string;
  direction: TradeDirection;

  entry: number;
  stopLoss: number;
  takeProfit: number;

  riskPercent: number;
  resultR: number;
  pnl: number;

  session: string;
  setup: string;
  status: TradeStatus;

  confluence: {
    liquiditySweep: boolean;
    poi: boolean;
    mss: boolean;
    displacement: boolean;
    htfAlignment: boolean;
    volumeConfirmation: boolean;
  };

  notes: string;
  createdAt: string;
}

export const trades: Trade[] = [
  {
    id: "LEX-0001",
    date: "2026-09-28",
    accountId: "prop-5000",

    instrument: "XAUUSD",
    direction: "LONG",

    entry: 2654.50,
    stopLoss: 2650.00,
    takeProfit: 2676.10,

    riskPercent: 1,
    resultR: 4.8,
    pnl: 240,

    session: "London",
    setup: "Liquidity Sweep + MSS",
    status: "WIN",

    confluence: {
      liquiditySweep: true,
      poi: true,
      mss: true,
      displacement: true,
      htfAlignment: true,
      volumeConfirmation: true
    },

    notes: "Liquidity sweep into POI followed by MSS and displacement.",

    createdAt: "2026-09-28T09:30:00"
  }
];

export function getWinningTrades() {
  return trades.filter((trade) => trade.status === "WIN");
}

export function getLosingTrades() {
  return trades.filter((trade) => trade.status === "LOSS");
}

export function getNetR() {
  return trades.reduce((total, trade) => total + trade.resultR, 0);
}

export function getWinRate() {
  if (!trades.length) return 0;

  return (
    (getWinningTrades().length / trades.length) *
    100
  );
}

export function getProfitFactor() {
  const grossProfit = trades
    .filter((trade) => trade.pnl > 0)
    .reduce((total, trade) => total + trade.pnl, 0);

  const grossLoss = Math.abs(
    trades
      .filter((trade) => trade.pnl < 0)
      .reduce((total, trade) => total + trade.pnl, 0)
  );

  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;

  return grossProfit / grossLoss;
}

export function getAverageR() {
  if (!trades.length) return 0;

  return getNetR() / trades.length;
}
