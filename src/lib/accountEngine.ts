import {
  accounts,
  resolveAccountId
} from "./accounts";

import type { TradingAccount } from "./accounts";

export function getAccount(
  accountId: string
): TradingAccount | undefined {
  const resolvedId = resolveAccountId(accountId);

  return accounts.find(
    (account) => account.id === resolvedId
  );
}

export function calculateRiskAmount(
  accountId: string,
  riskPercent: number
): number {
  const account = getAccount(accountId);

  if (!account) return 0;

  return account.currentBalance * (riskPercent / 100);
}

export function calculateTradePnL(
  accountId: string,
  riskPercent: number,
  resultR: number
): number {
  const riskAmount = calculateRiskAmount(
    accountId,
    riskPercent
  );

  return riskAmount * resultR;
}

export function calculateDrawdown(
  account: TradingAccount
): number {
  if (account.currentBalance >= account.startingBalance) {
    return 0;
  }

  return account.startingBalance - account.currentBalance;
}

export function calculateDrawdownPercent(
  account: TradingAccount
): number {
  const drawdown = calculateDrawdown(account);

  if (!account.startingBalance) return 0;

  return (drawdown / account.startingBalance) * 100;
}

export function calculateDailyLossRemaining(
  account: TradingAccount
): number {
  return Math.max(
    account.dailyLossLimit + account.dailyProfitLoss,
    0
  );
}

export function calculateProfitTargetProgress(
  account: TradingAccount
): number {
  if (account.profitTarget <= 0) return 0;

  return Math.min(
    (account.totalProfitLoss / account.profitTarget) * 100,
    100
  );
}
