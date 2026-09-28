import { accounts } from "./accounts";
import { loadTrades } from "./tradeStore";

export function getAccountTrades(accountId: string) {
  return loadTrades().filter(
    (trade) => trade.accountId === accountId
  );
}

export function getAccountPnL(accountId: string) {
  return getAccountTrades(accountId).reduce(
    (total, trade) => total + trade.pnl,
    0
  );
}

export function getAccountEquity(accountId: string) {
  const account = accounts.find(
    (account) => account.id === accountId
  );

  if (!account) return 0;

  return account.startingBalance + getAccountPnL(accountId);
}

export function getAccountDrawdown(accountId: string) {
  const account = accounts.find(
    (account) => account.id === accountId
  );

  if (!account) return 0;

  const equity = getAccountEquity(accountId);

  return Math.max(
    account.startingBalance - equity,
    0
  );
}

export function getAccountDrawdownPercent(accountId: string) {
  const account = accounts.find(
    (account) => account.id === accountId
  );

  if (!account || account.startingBalance <= 0) return 0;

  return (
    (getAccountDrawdown(accountId) /
      account.startingBalance) *
    100
  );
}

