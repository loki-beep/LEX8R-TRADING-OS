/**
 * LEX₈R Trading OS
 * Account repository
 *
 * Centralizes user-owned account access.
 *
 * Temporary development implementation:
 * data comes from the existing in-memory accounts.ts file.
 *
 * Production:
 * this repository will become the boundary between
 * the application and the database.
 */

import { accounts, resolveAccountId } from "./accounts";
import { getCurrentUserId } from "./userContext";
import type { TradingAccount } from "./accounts";

export function getCurrentUserAccounts(): TradingAccount[] {
  const userId = getCurrentUserId();

  return accounts.filter((account) => account.userId === userId);
}

export function getUserAccount(accountId: string): TradingAccount | undefined {
  const userId = getCurrentUserId();
  const resolvedId = resolveAccountId(accountId);

  return accounts.find(
    (account) =>
      account.userId === userId &&
      account.id === resolvedId
  );
}

export function accountBelongsToCurrentUser(accountId: string): boolean {
  return getUserAccount(accountId) !== undefined;
}
