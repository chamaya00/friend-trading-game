/**
 * MOCK TYPES - Local copies of Prisma types
 *
 * These are copies of the enum types from the Prisma schema.
 * Used to avoid requiring @prisma/client to be generated for mock mode.
 *
 * If you update the enums in prisma/schema.prisma, update these as well.
 */

export const LedgerEntryType = {
  SIGNUP_BONUS: 'SIGNUP_BONUS',
  DAILY_LOGIN: 'DAILY_LOGIN',
  STREAK_BONUS_3: 'STREAK_BONUS_3',
  STREAK_BONUS_7: 'STREAK_BONUS_7',
  PURCHASE_PAYMENT: 'PURCHASE_PAYMENT',
  SALE_REVENUE: 'SALE_REVENUE',
  OWNERSHIP_BONUS: 'OWNERSHIP_BONUS',
} as const;

export type LedgerEntryType = typeof LedgerEntryType[keyof typeof LedgerEntryType];

export const NotificationType = {
  YOU_WERE_BOUGHT: 'YOU_WERE_BOUGHT',
  YOUR_PERSON_SOLD: 'YOUR_PERSON_SOLD',
  DAILY_BONUS: 'DAILY_BONUS',
  STREAK_BONUS: 'STREAK_BONUS',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// User type for mock data
export interface MockUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  tags: string[];
  balance: number;
  price: number;
  purchaseCount: number;
  currentStreak: number;
  lastLoginDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  ownerId: string | null;
  deactivatedAt: Date | null;
}

// Transaction type for mock data
export interface MockTransaction {
  id: string;
  buyerId: string;
  sellerId: string | null;
  targetId: string;
  price: number;
  sellerReceived: number;
  targetBonus: number;
  buyerBalanceBefore: number;
  buyerBalanceAfter: number;
  sellerBalanceBefore: number | null;
  sellerBalanceAfter: number | null;
  targetPriceBefore: number;
  targetPriceAfter: number;
  targetVersionBefore: number;
  targetVersionAfter: number;
  createdAt: Date;
}

// Ledger entry type for mock data
export interface MockLedgerEntry {
  id: string;
  userId: string;
  amount: number;
  balanceAfter: number;
  type: LedgerEntryType;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: Date;
}

// Notification type for mock data
export interface MockNotification {
  id: string;
  userId: string;
  type: NotificationType;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}
