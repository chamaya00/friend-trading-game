import type { User, Transaction, LedgerEntry, Notification } from '@prisma/client';

// Re-export Prisma types
export type { User, Transaction, LedgerEntry, Notification };

// User with relations
export type UserWithOwner = User & {
  owner: User | null;
};

export type UserWithOwnedUsers = User & {
  ownedUsers: User[];
};

export type UserWithRelations = User & {
  owner: User | null;
  ownedUsers: User[];
};

// Transaction with relations
export type TransactionWithUsers = Transaction & {
  buyer: User;
  seller: User | null;
  target: User;
};

// Purchase error types
export type PurchaseErrorCode =
  | 'USER_NOT_FOUND'
  | 'USER_DEACTIVATED'
  | 'CANNOT_BUY_SELF'
  | 'ALREADY_OWN'
  | 'INSUFFICIENT_FUNDS'
  | 'STALE_DATA'
  | 'PRICE_CHANGED'
  | 'OWNER_CHANGED';

export type PurchaseError =
  | { code: 'USER_NOT_FOUND' }
  | { code: 'USER_DEACTIVATED' }
  | { code: 'CANNOT_BUY_SELF' }
  | { code: 'ALREADY_OWN' }
  | { code: 'INSUFFICIENT_FUNDS'; balance: number; price: number }
  | { code: 'STALE_DATA'; currentPrice: number; currentOwner: string | null; currentVersion: number }
  | { code: 'PRICE_CHANGED'; currentPrice: number }
  | { code: 'OWNER_CHANGED'; currentOwner: string | null };

// API response types
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: Record<string, unknown> };

// Notification data types
export type YouWereBoughtData = {
  buyerId: string;
  buyerUsername: string;
  price: number;
  newPrice: number;
  bonus: number;
};

export type YourPersonSoldData = {
  buyerId: string;
  buyerUsername: string;
  targetId: string;
  targetUsername: string;
  price: number;
};

export type DailyBonusData = {
  amount: number;
  newBalance: number;
};

export type StreakBonusData = {
  streakDays: number;
  amount: number;
  newBalance: number;
};
