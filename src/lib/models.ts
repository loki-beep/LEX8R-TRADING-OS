/**
 * LEX₈R Trading OS
 * Core domain models
 *
 * These models define ownership boundaries for the
 * future multi-user database architecture.
 */

export interface User {
  id: string;
  username: string;
  email: string;

  displayName?: string;
  avatarUrl?: string;

  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;

  bio?: string;
  country?: string;
  timezone?: string;

  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;

  theme: "dark" | "light" | "system";
  defaultAccountId?: string;
  defaultInstrument?: string;
  defaultRiskPercent?: number;

  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;

  accountId?: string;
  tradeId?: string;

  title: string;
  content: string;

  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;

  type: string;
  title: string;
  message: string;

  read: boolean;

  createdAt: string;
}

export interface Integration {
  id: string;
  userId: string;

  provider: "MT5" | "TradingView" | "LEX8R_API";
  status: "CONNECTED" | "DISCONNECTED" | "ERROR";

  connectedAt?: string;
  lastSyncAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ActivityEvent {
  id: string;
  userId: string;

  action: string;
  entityType: string;
  entityId?: string;

  metadata?: Record<string, unknown>;

  createdAt: string;
}
