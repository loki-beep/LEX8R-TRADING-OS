/**
 * LEX₈R Trading OS
 * Trade repository
 *
 * Centralizes user-owned trade access.
 *
 * Temporary development implementation:
 * data comes from the existing tradeStore/local data layer.
 *
 * Production:
 * this repository becomes the boundary between the
 * application and the database.
 */

import {
  loadTrades,
  saveTrades,
} from "./tradeStore";

import { getCurrentUserId } from "./userContext";
import { accountBelongsToCurrentUser } from "./accountRepository";

import type { Trade } from "./trades";

export function getCurrentUserTrades(): Trade[] {
  const userId = getCurrentUserId();

  return loadTrades().filter(
    (trade) => trade.userId === userId
  );
}

export function getUserTradesForAccount(accountId: string): Trade[] {
  const userId = getCurrentUserId();

  if (!accountBelongsToCurrentUser(accountId)) {
    return [];
  }

  return loadTrades().filter(
    (trade) =>
      trade.userId === userId &&
      trade.accountId === accountId
  );
}

export function getUserTrade(tradeId: string): Trade | undefined {
  const userId = getCurrentUserId();

  return loadTrades().find(
    (trade) =>
      trade.userId === userId &&
      trade.id === tradeId
  );
}

export function tradeBelongsToCurrentUser(tradeId: string): boolean {
  return getUserTrade(tradeId) !== undefined;
}

export function addUserTrade(trade: Trade): void {
  const userId = getCurrentUserId();

  if (trade.userId !== userId) {
    throw new Error("Cannot add a trade owned by another user.");
  }

  if (!accountBelongsToCurrentUser(trade.accountId)) {
    throw new Error(
      "Cannot add a trade to an account that does not belong to the current user."
    );
  }

  const trades = loadTrades();

  saveTrades([...trades, trade]);
}

export function deleteUserTrade(tradeId: string): void {
  const userId = getCurrentUserId();

  const trades = loadTrades();

  const trade = trades.find(
    (item) =>
      item.id === tradeId &&
      item.userId === userId
  );

  if (!trade) {
    throw new Error(
      "Trade not found or does not belong to the current user."
    );
  }

  saveTrades(
    trades.filter(
      (item) =>
        !(item.id === tradeId && item.userId === userId)
    )
  );
}
