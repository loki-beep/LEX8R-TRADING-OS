import { loadTrades } from "./tradeStore";

export interface DailyPerformance {
  date: string;
  trades: number;
  wins: number;
  losses: number;
  breakevens: number;

  pnl: number;
  netR: number;
  averageR: number;
  winRate: number;
}

export function getDailyPerformance(): DailyPerformance[] {
  const trades = loadTrades();

  const grouped = new Map<string, typeof trades>();

  for (const trade of trades) {
    if (!trade.date) continue;

    const existing = grouped.get(trade.date) ?? [];

    existing.push(trade);

    grouped.set(trade.date, existing);
  }

  return Array.from(grouped.entries())
    .map(([date, dayTrades]) => {
      const wins = dayTrades.filter(
        (trade) => Number(trade.resultR) > 0
      ).length;

      const losses = dayTrades.filter(
        (trade) => Number(trade.resultR) < 0
      ).length;

      const breakevens = dayTrades.filter(
        (trade) => Number(trade.resultR) === 0
      ).length;

      const pnl = dayTrades.reduce(
        (total, trade) =>
          total + Number(trade.pnl || 0),
        0
      );

      const netR = dayTrades.reduce(
        (total, trade) =>
          total + Number(trade.resultR || 0),
        0
      );

      return {
        date,
        trades: dayTrades.length,
        wins,
        losses,
        breakevens,
        pnl,
        netR,
        averageR:
          dayTrades.length > 0
            ? netR / dayTrades.length
            : 0,
        winRate:
          dayTrades.length > 0
            ? (wins / dayTrades.length) * 100
            : 0
      };
    })
    .sort((a, b) =>
      a.date.localeCompare(b.date)
    );
}

export function getDailyPerformanceForDate(
  date: string
): DailyPerformance | undefined {
  return getDailyPerformance().find(
    (day) => day.date === date
  );
}

export function getBestTradingDay():
  DailyPerformance | undefined {
  return getDailyPerformance().reduce<
    DailyPerformance | undefined
  >((best, day) => {
    if (!best || day.pnl > best.pnl) {
      return day;
    }

    return best;
  }, undefined);
}

export function getWorstTradingDay():
  DailyPerformance | undefined {
  return getDailyPerformance().reduce<
    DailyPerformance | undefined
  >((worst, day) => {
    if (!worst || day.pnl < worst.pnl) {
      return day;
    }

    return worst;
  }, undefined);
}

export function getProfitableDays(): number {
  return getDailyPerformance().filter(
    (day) => day.pnl > 0
  ).length;
}

export function getLosingDays(): number {
  return getDailyPerformance().filter(
    (day) => day.pnl < 0
  ).length;
}
