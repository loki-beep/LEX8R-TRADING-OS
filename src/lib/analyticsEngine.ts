import type { Trade } from "./trades";
import { getCurrentUserTrades } from "./tradeRepository";

export interface TradeAnalytics {
  trades: Trade[];
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;

  winRate: number;
  lossRate: number;

  netR: number;
  averageR: number;

  grossProfit: number;
  grossLoss: number;
  profitFactor: number;

  totalPnL: number;
  averagePnL: number;

  bestTradeR: number;
  worstTradeR: number;

  averageWinR: number;
  averageLossR: number;
}

export interface AccountAnalytics extends TradeAnalytics {
  accountId: string;
}

/**
 * Get all currently stored trades.
 */
export function getAllTrades(): Trade[] {
  return getCurrentUserTrades();
}

/**
 * Calculate analytics for a supplied collection of trades.
 */
export function calculateAnalytics(
  trades: Trade[]
): TradeAnalytics {
  const totalTrades = trades.length;

  const winningTrades = trades.filter(
    (trade) => trade.resultR > 0
  );

  const losingTrades = trades.filter(
    (trade) => trade.resultR < 0
  );

  const breakevenTrades = trades.filter(
    (trade) => trade.resultR === 0
  );

  const totalPnL = trades.reduce(
    (total, trade) => total + Number(trade.pnl || 0),
    0
  );

  const netR = trades.reduce(
    (total, trade) => total + Number(trade.resultR || 0),
    0
  );

  const grossProfit = winningTrades.reduce(
    (total, trade) =>
      total + Math.max(Number(trade.pnl || 0), 0),
    0
  );

  const grossLoss = Math.abs(
    losingTrades.reduce(
      (total, trade) =>
        total + Math.min(Number(trade.pnl || 0), 0),
      0
    )
  );

  const winRate =
    totalTrades > 0
      ? (winningTrades.length / totalTrades) * 100
      : 0;

  const lossRate =
    totalTrades > 0
      ? (losingTrades.length / totalTrades) * 100
      : 0;

  const averageR =
    totalTrades > 0
      ? netR / totalTrades
      : 0;

  const averagePnL =
    totalTrades > 0
      ? totalPnL / totalTrades
      : 0;

  const profitFactor =
    grossLoss === 0
      ? grossProfit > 0
        ? Infinity
        : 0
      : grossProfit / grossLoss;

  const bestTradeR =
    totalTrades > 0
      ? Math.max(
          ...trades.map(
            (trade) => Number(trade.resultR || 0)
          )
        )
      : 0;

  const worstTradeR =
    totalTrades > 0
      ? Math.min(
          ...trades.map(
            (trade) => Number(trade.resultR || 0)
          )
        )
      : 0;

  const averageWinR =
    winningTrades.length > 0
      ? winningTrades.reduce(
          (total, trade) =>
            total + Number(trade.resultR || 0),
          0
        ) / winningTrades.length
      : 0;

  const averageLossR =
    losingTrades.length > 0
      ? losingTrades.reduce(
          (total, trade) =>
            total + Number(trade.resultR || 0),
          0
        ) / losingTrades.length
      : 0;

  return {
    trades,
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    breakevenTrades: breakevenTrades.length,

    winRate,
    lossRate,

    netR,
    averageR,

    grossProfit,
    grossLoss,
    profitFactor,

    totalPnL,
    averagePnL,

    bestTradeR,
    worstTradeR,

    averageWinR,
    averageLossR
  };
}

/**
 * Calculate analytics for one trading account.
 */
export function getAccountAnalytics(
  accountId: string
): AccountAnalytics {
  const accountTrades = getAllTrades().filter(
    (trade) => trade.accountId === accountId
  );

  return {
    accountId,
    ...calculateAnalytics(accountTrades)
  };
}

/**
 * Calculate analytics for every account represented
 * in the stored trade history.
 */
export function getAccountAnalyticsMap(): Record<
  string,
  AccountAnalytics
> {
  const trades = getAllTrades();

  const accountIds = [
    ...new Set(
      trades.map((trade) => trade.accountId)
    )
  ];

  return Object.fromEntries(
    accountIds.map((accountId) => [
      accountId,
      getAccountAnalytics(accountId)
    ])
  );
}

/**
 * Calculate analytics for a specific date.
 */
export function getDailyAnalytics(
  date: string
): TradeAnalytics {
  const trades = getAllTrades().filter(
    (trade) => trade.date === date
  );

  return calculateAnalytics(trades);
}

/**
 * Calculate analytics for a trading session.
 */
export function getSessionAnalytics(
  session: string
): TradeAnalytics {
  const trades = getAllTrades().filter(
    (trade) =>
      trade.session.toLowerCase() ===
      session.toLowerCase()
  );

  return calculateAnalytics(trades);
}

/**
 * Calculate analytics for a setup.
 */
export function getSetupAnalytics(
  setup: string
): TradeAnalytics {
  const trades = getAllTrades().filter(
    (trade) =>
      trade.setup.toLowerCase() ===
      setup.toLowerCase()
  );

  return calculateAnalytics(trades);
}
