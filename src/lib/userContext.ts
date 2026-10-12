/**
 * LEX₈R Trading OS
 * Current user context
 *
 * Temporary development implementation.
 * This will later be replaced by the authenticated
 * user's session from the production auth provider.
 */

import type { User } from "./models";

export const DEV_USER_ID = "dev-user-001";

export const currentUser: User = {
  id: DEV_USER_ID,
  username: "lex8r",
  email: "dev@lex8r.local",
  displayName: "LEX₈R Trader",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function getCurrentUserId(): string {
  return currentUser.id;
}

export function getCurrentUser(): User {
  return currentUser;
}
