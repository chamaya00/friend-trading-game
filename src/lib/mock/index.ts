/**
 * MOCK MODE EXPORTS
 *
 * Central export point for all mock functionality.
 *
 * To check if mock mode is enabled:
 *   import { isMockMode } from '@/lib/mock';
 *
 * To remove mock mode entirely:
 * 1. Set MOCK_DATA=false in .env.local (or remove the variable)
 * 2. Delete this entire src/lib/mock/ folder
 * 3. Remove mock-related code from prisma.ts and session.ts
 */

// Check if mock mode is enabled via environment variable
export const isMockMode = process.env.MOCK_DATA === 'true';

// Export types
export type {
  MockUser,
  MockTransaction,
  MockLedgerEntry,
  MockNotification,
} from './types';
export { LedgerEntryType, NotificationType } from './types';

// Export mock implementations
export { mockPrismaClient } from './prisma';
export { getMockSession, getMockCurrentUserId, MOCK_SESSION } from './session';
export {
  MOCK_USERS,
  MOCK_CURRENT_USER,
  MOCK_TRANSACTIONS,
  MOCK_LEDGER_ENTRIES,
  MOCK_NOTIFICATIONS,
  getMockUserById,
  getMockUserByUsername,
  getMockUserByEmail,
  getMockUserWithOwner,
  getMockOwnedUsers,
  USER_IDS,
} from './data';
