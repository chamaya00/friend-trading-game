/**
 * MOCK PRISMA CLIENT FOR LOCAL DEVELOPMENT
 *
 * This simulates Prisma database operations using in-memory mock data.
 * All data resets on server restart.
 *
 * To remove: Set MOCK_DATA=false and delete the src/lib/mock/ folder.
 */

import {
  MOCK_USERS,
  MOCK_TRANSACTIONS,
  MOCK_LEDGER_ENTRIES,
  MOCK_NOTIFICATIONS,
} from './data';
import {
  MockUser,
  MockTransaction,
  MockLedgerEntry,
  MockNotification,
} from './types';

// In-memory state (mutable copies for updates during session)
let mockUsers: MockUser[] = [...MOCK_USERS.map(u => ({ ...u }))];
let mockTransactions: MockTransaction[] = [...MOCK_TRANSACTIONS.map(t => ({ ...t }))];
let mockLedgerEntries: MockLedgerEntry[] = [...MOCK_LEDGER_ENTRIES.map(l => ({ ...l }))];
let mockNotifications: MockNotification[] = [...MOCK_NOTIFICATIONS.map(n => ({ ...n }))];
const mockIdempotencyKeys: Map<string, { result: unknown; createdAt: Date }> = new Map();

// Helper to apply select/include to a user object
function applyUserSelect(user: MockUser, select?: Record<string, unknown>) {
  if (!select) return user;

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(select)) {
    if (!value) continue;

    if (key === 'owner' && user.ownerId) {
      const owner = mockUsers.find(u => u.id === user.ownerId);
      if (owner && typeof value === 'object' && value !== null && 'select' in value) {
        result.owner = applyUserSelect(owner, (value as { select: Record<string, unknown> }).select);
      } else {
        result.owner = owner || null;
      }
    } else if (key === 'ownedUsers') {
      const owned = mockUsers.filter(u => u.ownerId === user.id);
      if (typeof value === 'object' && value !== null && 'select' in value) {
        result.ownedUsers = owned.map(u =>
          applyUserSelect(u, (value as { select: Record<string, unknown> }).select)
        );
      } else {
        result.ownedUsers = owned;
      }
    } else if (key in user) {
      result[key] = (user as unknown as Record<string, unknown>)[key];
    }
  }

  return result;
}

// Mock user operations
const mockUserOps = {
  findUnique: async ({ where, select }: {
    where: { id?: string; username?: string; email?: string };
    select?: Record<string, unknown>;
  }) => {
    let user: MockUser | undefined;

    if (where.id) {
      user = mockUsers.find(u => u.id === where.id);
    } else if (where.username) {
      user = mockUsers.find(u => u.username === where.username);
    } else if (where.email) {
      user = mockUsers.find(u => u.email === where.email);
    }

    if (!user) return null;
    return select ? applyUserSelect(user, select) : user;
  },

  findMany: async ({
    where,
    orderBy,
    take,
    skip,
    cursor,
    select,
  }: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, string>;
    take?: number;
    skip?: number;
    cursor?: { id: string };
    select?: Record<string, unknown>;
  }) => {
    let results = [...mockUsers];

    // Apply where filters
    if (where) {
      results = results.filter(user => {
        // Filter out deactivated users
        if (where.deactivatedAt === null && user.deactivatedAt !== null) {
          return false;
        }

        // Exclude specific ID
        if (where.id && typeof where.id === 'object' && 'not' in where.id) {
          if (user.id === (where.id as { not: string }).not) return false;
        }

        // Filter by tags
        if (where.tags && typeof where.tags === 'object' && 'has' in where.tags) {
          if (!user.tags.includes((where.tags as { has: string }).has)) return false;
        }

        // Search by OR condition (username or displayName)
        if (where.OR && Array.isArray(where.OR)) {
          const matchesAny = (where.OR as Array<Record<string, unknown>>).some(condition => {
            for (const [field, query] of Object.entries(condition)) {
              if (typeof query === 'object' && query !== null && 'contains' in query) {
                const searchTerm = (query as { contains: string; mode?: string }).contains.toLowerCase();
                const fieldValue = (user as unknown as Record<string, unknown>)[field];
                if (typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(searchTerm)) {
                  return true;
                }
              }
            }
            return false;
          });
          if (!matchesAny) return false;
        }

        return true;
      });
    }

    // Apply orderBy
    if (orderBy) {
      const [field, direction] = Object.entries(orderBy)[0];
      results.sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[field];
        const bVal = (b as unknown as Record<string, unknown>)[field];

        if (aVal instanceof Date && bVal instanceof Date) {
          return direction === 'asc'
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    // Apply cursor pagination
    if (cursor) {
      const cursorIndex = results.findIndex(u => u.id === cursor.id);
      if (cursorIndex !== -1) {
        results = results.slice(cursorIndex);
      }
    }

    // Apply skip
    if (skip) {
      results = results.slice(skip);
    }

    // Apply take
    if (take) {
      results = results.slice(0, take);
    }

    // Apply select
    if (select) {
      return results.map(u => applyUserSelect(u, select));
    }

    return results;
  },

  update: async ({
    where,
    data,
    select,
  }: {
    where: { id: string };
    data: Record<string, unknown>;
    select?: Record<string, unknown>;
  }) => {
    const userIndex = mockUsers.findIndex(u => u.id === where.id);
    if (userIndex === -1) throw new Error('User not found');

    // Update user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...data,
      updatedAt: new Date(),
    } as MockUser;

    return select
      ? applyUserSelect(mockUsers[userIndex], select)
      : mockUsers[userIndex];
  },

  create: async ({ data }: { data: Record<string, unknown> }) => {
    const newUser: MockUser = {
      id: `clmock_${Date.now()}`,
      email: '',
      username: '',
      displayName: '',
      avatarUrl: null,
      bio: null,
      tags: [],
      balance: 100000,
      price: 10000,
      purchaseCount: 0,
      currentStreak: 0,
      lastLoginDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      ownerId: null,
      deactivatedAt: null,
      ...data,
    } as MockUser;

    mockUsers.push(newUser);
    return newUser;
  },
};

// Mock transaction operations
const mockTransactionOps = {
  findMany: async ({
    where,
    orderBy,
    take,
    include,
  }: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, string>;
    take?: number;
    include?: Record<string, unknown>;
  }) => {
    let results = [...mockTransactions];

    // Apply where filters
    if (where) {
      results = results.filter(tx => {
        if (where.OR && Array.isArray(where.OR)) {
          return (where.OR as Array<Record<string, unknown>>).some(condition => {
            for (const [field, value] of Object.entries(condition)) {
              if ((tx as unknown as Record<string, unknown>)[field] === value) return true;
            }
            return false;
          });
        }
        return true;
      });
    }

    // Apply orderBy
    if (orderBy) {
      const [field, direction] = Object.entries(orderBy)[0];
      results.sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[field];
        const bVal = (b as unknown as Record<string, unknown>)[field];

        if (aVal instanceof Date && bVal instanceof Date) {
          return direction === 'asc'
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }

        return 0;
      });
    }

    // Apply take
    if (take) {
      results = results.slice(0, take);
    }

    // Apply include (add related users)
    if (include) {
      return results.map(tx => {
        const enriched: Record<string, unknown> = { ...tx };

        if (include.buyer) {
          const buyer = mockUsers.find(u => u.id === tx.buyerId);
          enriched.buyer = buyer ? {
            id: buyer.id,
            username: buyer.username,
            displayName: buyer.displayName,
            avatarUrl: buyer.avatarUrl,
          } : null;
        }

        if (include.seller) {
          const seller = tx.sellerId ? mockUsers.find(u => u.id === tx.sellerId) : null;
          enriched.seller = seller ? {
            id: seller.id,
            username: seller.username,
            displayName: seller.displayName,
            avatarUrl: seller.avatarUrl,
          } : null;
        }

        if (include.target) {
          const target = mockUsers.find(u => u.id === tx.targetId);
          enriched.target = target ? {
            id: target.id,
            username: target.username,
            displayName: target.displayName,
            avatarUrl: target.avatarUrl,
          } : null;
        }

        return enriched;
      });
    }

    return results;
  },

  create: async ({ data }: { data: Record<string, unknown> }) => {
    const newTx: MockTransaction = {
      id: `clmock_tx_${Date.now()}`,
      buyerId: '',
      sellerId: null,
      targetId: '',
      price: 0,
      sellerReceived: 0,
      targetBonus: 0,
      buyerBalanceBefore: 0,
      buyerBalanceAfter: 0,
      sellerBalanceBefore: null,
      sellerBalanceAfter: null,
      targetPriceBefore: 0,
      targetPriceAfter: 0,
      targetVersionBefore: 0,
      targetVersionAfter: 0,
      createdAt: new Date(),
      ...data,
    } as MockTransaction;

    mockTransactions.push(newTx);
    return newTx;
  },
};

// Mock ledger entry operations
const mockLedgerOps = {
  create: async ({ data }: { data: Record<string, unknown> }) => {
    const newEntry: MockLedgerEntry = {
      id: `clmock_ledger_${Date.now()}`,
      userId: '',
      amount: 0,
      balanceAfter: 0,
      type: 'SIGNUP_BONUS' as MockLedgerEntry['type'],
      description: null,
      referenceType: null,
      referenceId: null,
      createdAt: new Date(),
      ...data,
    } as MockLedgerEntry;

    mockLedgerEntries.push(newEntry);
    return newEntry;
  },

  findMany: async ({ where }: { where?: { userId?: string } }) => {
    if (!where?.userId) return mockLedgerEntries;
    return mockLedgerEntries.filter(e => e.userId === where.userId);
  },
};

// Mock notification operations
const mockNotificationOps = {
  create: async ({ data }: { data: Record<string, unknown> }) => {
    const newNotif: MockNotification = {
      id: `clmock_notif_${Date.now()}`,
      userId: '',
      type: 'YOU_WERE_BOUGHT' as MockNotification['type'],
      data: {},
      read: false,
      createdAt: new Date(),
      ...data,
    } as MockNotification;

    mockNotifications.push(newNotif);
    return newNotif;
  },

  findMany: async ({
    where,
    orderBy,
    take,
  }: {
    where?: { userId?: string; read?: boolean };
    orderBy?: Record<string, string>;
    take?: number;
  }) => {
    let results = mockNotifications.filter(n => {
      if (where?.userId && n.userId !== where.userId) return false;
      if (where?.read !== undefined && n.read !== where.read) return false;
      return true;
    });

    if (orderBy) {
      const [field, direction] = Object.entries(orderBy)[0];
      results.sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[field];
        const bVal = (b as unknown as Record<string, unknown>)[field];

        if (aVal instanceof Date && bVal instanceof Date) {
          return direction === 'asc'
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }

        return 0;
      });
    }

    if (take) {
      results = results.slice(0, take);
    }

    return results;
  },

  updateMany: async ({
    where,
    data,
  }: {
    where: { userId: string; read?: boolean };
    data: { read: boolean };
  }) => {
    let count = 0;
    mockNotifications.forEach(n => {
      if (n.userId === where.userId) {
        if (where.read === undefined || n.read === where.read) {
          n.read = data.read;
          count++;
        }
      }
    });
    return { count };
  },
};

// Mock idempotency key operations
const mockIdempotencyKeyOps = {
  findUnique: async ({ where }: { where: { key: string } }) => {
    const entry = mockIdempotencyKeys.get(where.key);
    if (!entry) return null;
    return { key: where.key, ...entry };
  },

  create: async ({ data }: { data: { key: string; result: unknown } }) => {
    const createdAt = new Date();
    mockIdempotencyKeys.set(data.key, {
      result: data.result,
      createdAt,
    });
    return { key: data.key, result: data.result, createdAt };
  },
};

// Mock $transaction for atomic operations
async function mockTransaction<T>(
  fn: (tx: typeof mockPrismaClient) => Promise<T>
): Promise<T> {
  // In mock mode, we just run the function without real atomicity
  return fn(mockPrismaClient);
}

// The mock Prisma client
export const mockPrismaClient = {
  user: mockUserOps,
  transaction: mockTransactionOps,
  ledgerEntry: mockLedgerOps,
  notification: mockNotificationOps,
  idempotencyKey: mockIdempotencyKeyOps,
  $transaction: mockTransaction,

  // Add connect/disconnect no-ops for compatibility
  $connect: async () => {},
  $disconnect: async () => {},
};

// Export type for compatibility
export type MockPrismaClient = typeof mockPrismaClient;
