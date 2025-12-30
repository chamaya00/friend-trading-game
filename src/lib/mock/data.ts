/**
 * MOCK DATA FOR LOCAL DEVELOPMENT
 *
 * This file contains placeholder data to run the app without a real database.
 *
 * To remove mock mode and use real systems:
 * 1. Set MOCK_DATA=false in your .env.local (or remove the variable)
 * 2. Set up your PostgreSQL database
 * 3. Set up Google OAuth credentials
 * 4. Run: npx prisma migrate dev
 *
 * You can safely delete the entire src/lib/mock/ folder when ready for production.
 */

import {
  LedgerEntryType,
  NotificationType,
  MockUser,
  MockTransaction,
  MockLedgerEntry,
  MockNotification,
} from './types';

// Mock user IDs (use consistent CUIDs for relations)
const USER_IDS = {
  CURRENT_USER: 'clmock_current_user_001',
  ALICE: 'clmock_alice_002',
  BOB: 'clmock_bob_003',
  CHARLIE: 'clmock_charlie_004',
  DANA: 'clmock_dana_005',
  EVE: 'clmock_eve_006',
  FRANK: 'clmock_frank_007',
  GRACE: 'clmock_grace_008',
};

// The mock current user (the "logged in" user)
export const MOCK_CURRENT_USER: MockUser = {
  id: USER_IDS.CURRENT_USER,
  email: 'you@example.com',
  username: 'you',
  displayName: 'You (Demo User)',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
  bio: 'This is your demo account! Try buying and selling friends.',
  tags: ['tech', 'gaming', 'coffee'],
  balance: 150000, // $1500
  price: 15000, // $150 (you've been bought once)
  purchaseCount: 1,
  currentStreak: 3,
  lastLoginDate: new Date(),
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  updatedAt: new Date(),
  version: 2,
  ownerId: USER_IDS.ALICE, // Alice owns you
  deactivatedAt: null,
};

// All mock users (including current user)
export const MOCK_USERS: MockUser[] = [
  MOCK_CURRENT_USER,
  {
    id: USER_IDS.ALICE,
    email: 'alice@example.com',
    username: 'alice',
    displayName: 'Alice Anderson',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    bio: 'Building cool stuff 🚀',
    tags: ['tech', 'startups', 'sf'],
    balance: 250000, // $2500
    price: 22500, // $225 (bought twice)
    purchaseCount: 2,
    currentStreak: 5,
    lastLoginDate: new Date(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    version: 3,
    ownerId: null, // Self-owned
    deactivatedAt: null,
  },
  {
    id: USER_IDS.BOB,
    email: 'bob@example.com',
    username: 'bob',
    displayName: 'Bob Builder',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    bio: 'Can we fix it? Yes we can!',
    tags: ['design', 'creative', 'nyc'],
    balance: 85000, // $850
    price: 10000, // $100 (never bought)
    purchaseCount: 0,
    currentStreak: 1,
    lastLoginDate: new Date(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    version: 1,
    ownerId: null,
    deactivatedAt: null,
  },
  {
    id: USER_IDS.CHARLIE,
    email: 'charlie@example.com',
    username: 'charlie',
    displayName: 'Charlie Crypto',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    bio: 'To the moon! 🌙',
    tags: ['crypto', 'tech', 'night-owl'],
    balance: 500000, // $5000
    price: 50625, // $506.25 (bought 4 times)
    purchaseCount: 4,
    currentStreak: 7,
    lastLoginDate: new Date(),
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    version: 5,
    ownerId: USER_IDS.CURRENT_USER, // You own Charlie!
    deactivatedAt: null,
  },
  {
    id: USER_IDS.DANA,
    email: 'dana@example.com',
    username: 'dana',
    displayName: 'Dana Designer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dana',
    bio: 'Pixels are my passion ✨',
    tags: ['design', 'art', 'photography', 'remote'],
    balance: 120000, // $1200
    price: 15000, // $150
    purchaseCount: 1,
    currentStreak: 2,
    lastLoginDate: new Date(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    version: 2,
    ownerId: USER_IDS.CURRENT_USER, // You own Dana too!
    deactivatedAt: null,
  },
  {
    id: USER_IDS.EVE,
    email: 'eve@example.com',
    username: 'eve',
    displayName: 'Eve Engineer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eve',
    bio: 'Breaking things since 1999',
    tags: ['tech', 'science', 'coffee', 'seattle'],
    balance: 180000, // $1800
    price: 33750, // $337.50 (bought 3 times)
    purchaseCount: 3,
    currentStreak: 0,
    lastLoginDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    version: 4,
    ownerId: USER_IDS.ALICE,
    deactivatedAt: null,
  },
  {
    id: USER_IDS.FRANK,
    email: 'frank@example.com',
    username: 'frank',
    displayName: 'Frank Fitness',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frank',
    bio: 'Gym, code, repeat 💪',
    tags: ['fitness', 'sports', 'early-bird', 'la'],
    balance: 95000, // $950
    price: 10000, // $100
    purchaseCount: 0,
    currentStreak: 4,
    lastLoginDate: new Date(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    version: 1,
    ownerId: null,
    deactivatedAt: null,
  },
  {
    id: USER_IDS.GRACE,
    email: 'grace@example.com',
    username: 'grace',
    displayName: 'Grace Gamer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=grace',
    bio: 'GG EZ 🎮',
    tags: ['gaming', 'music', 'night-owl', 'london'],
    balance: 75000, // $750
    price: 15000, // $150
    purchaseCount: 1,
    currentStreak: 1,
    lastLoginDate: new Date(),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    version: 2,
    ownerId: USER_IDS.BOB,
    deactivatedAt: null,
  },
];

// Mock transactions
export const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: 'clmock_tx_001',
    buyerId: USER_IDS.ALICE,
    sellerId: null,
    targetId: USER_IDS.CURRENT_USER,
    price: 10000,
    sellerReceived: 0,
    targetBonus: 1000,
    buyerBalanceBefore: 100000,
    buyerBalanceAfter: 90000,
    sellerBalanceBefore: null,
    sellerBalanceAfter: null,
    targetPriceBefore: 10000,
    targetPriceAfter: 15000,
    targetVersionBefore: 1,
    targetVersionAfter: 2,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'clmock_tx_002',
    buyerId: USER_IDS.CURRENT_USER,
    sellerId: null,
    targetId: USER_IDS.CHARLIE,
    price: 33750, // 4th purchase
    sellerReceived: 0,
    targetBonus: 3375,
    buyerBalanceBefore: 183750,
    buyerBalanceAfter: 150000,
    sellerBalanceBefore: null,
    sellerBalanceAfter: null,
    targetPriceBefore: 33750,
    targetPriceAfter: 50625,
    targetVersionBefore: 4,
    targetVersionAfter: 5,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'clmock_tx_003',
    buyerId: USER_IDS.CURRENT_USER,
    sellerId: null,
    targetId: USER_IDS.DANA,
    price: 10000,
    sellerReceived: 0,
    targetBonus: 1000,
    buyerBalanceBefore: 160000,
    buyerBalanceAfter: 150000,
    sellerBalanceBefore: null,
    sellerBalanceAfter: null,
    targetPriceBefore: 10000,
    targetPriceAfter: 15000,
    targetVersionBefore: 1,
    targetVersionAfter: 2,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// Mock ledger entries
export const MOCK_LEDGER_ENTRIES: MockLedgerEntry[] = [
  {
    id: 'clmock_ledger_001',
    userId: USER_IDS.CURRENT_USER,
    amount: 100000,
    balanceAfter: 100000,
    type: LedgerEntryType.SIGNUP_BONUS,
    description: 'Welcome bonus!',
    referenceType: null,
    referenceId: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'clmock_ledger_002',
    userId: USER_IDS.CURRENT_USER,
    amount: 1000,
    balanceAfter: 101000,
    type: LedgerEntryType.OWNERSHIP_BONUS,
    description: 'Bought by Alice!',
    referenceType: 'transaction',
    referenceId: 'clmock_tx_001',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'clmock_ledger_003',
    userId: USER_IDS.CURRENT_USER,
    amount: 100,
    balanceAfter: 101100,
    type: LedgerEntryType.DAILY_LOGIN,
    description: 'Daily login bonus',
    referenceType: null,
    referenceId: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'clmock_ledger_004',
    userId: USER_IDS.CURRENT_USER,
    amount: 500,
    balanceAfter: 101600,
    type: LedgerEntryType.STREAK_BONUS_3,
    description: '3-day streak bonus!',
    referenceType: null,
    referenceId: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

// Mock notifications
export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'clmock_notif_001',
    userId: USER_IDS.CURRENT_USER,
    type: NotificationType.YOU_WERE_BOUGHT,
    data: {
      buyerName: 'Alice Anderson',
      buyerUsername: 'alice',
      price: 10000,
    },
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'clmock_notif_002',
    userId: USER_IDS.CURRENT_USER,
    type: NotificationType.STREAK_BONUS,
    data: {
      streakDays: 3,
      bonusAmount: 500,
    },
    read: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'clmock_notif_003',
    userId: USER_IDS.CURRENT_USER,
    type: NotificationType.DAILY_BONUS,
    data: {
      amount: 100,
    },
    read: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// Helper to get user by ID
export function getMockUserById(id: string): MockUser | null {
  return MOCK_USERS.find(u => u.id === id) || null;
}

// Helper to get user by username
export function getMockUserByUsername(username: string) {
  return MOCK_USERS.find(u => u.username === username) || null;
}

// Helper to get user by email
export function getMockUserByEmail(email: string) {
  return MOCK_USERS.find(u => u.email === email) || null;
}

// Helper to resolve owner relation
export function getMockUserWithOwner(user: typeof MOCK_USERS[0]) {
  const owner = user.ownerId ? getMockUserById(user.ownerId) : null;
  return {
    ...user,
    owner: owner ? {
      id: owner.id,
      username: owner.username,
      displayName: owner.displayName,
      avatarUrl: owner.avatarUrl,
    } : null,
  };
}

// Helper to get owned users
export function getMockOwnedUsers(ownerId: string) {
  return MOCK_USERS
    .filter(u => u.ownerId === ownerId)
    .map(u => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      price: u.price,
    }));
}

// Export user IDs for reference
export { USER_IDS };
