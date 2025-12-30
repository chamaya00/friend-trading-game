import { PrismaClient } from '@prisma/client'

/**
 * MOCK MODE SUPPORT
 *
 * When MOCK_DATA=true, we use an in-memory mock client instead of a real database.
 * This allows running the app without PostgreSQL or any database setup.
 *
 * Mock mode is automatically enabled if:
 * - MOCK_DATA=true is set, OR
 * - DATABASE_URL is not set
 *
 * To disable mock mode and use a real database:
 * 1. Set MOCK_DATA=false in .env.local
 * 2. Set up your DATABASE_URL in .env.local
 * 3. Run: npx prisma migrate dev
 */

const isMockMode = process.env.MOCK_DATA === 'true' || !process.env.DATABASE_URL;

// Real Prisma client (only initialized when not in mock mode)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getRealPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

// Dynamic export based on mock mode
// We use 'any' here because the mock client has a compatible but not identical interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = isMockMode
  ? (() => {
      // Lazy load mock to avoid import errors when @prisma/client isn't generated
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { mockPrismaClient } = require('./mock/prisma');
      console.log('🎭 Running in MOCK MODE - using in-memory data (no database required)');
      return mockPrismaClient;
    })()
  : getRealPrisma();

if (process.env.NODE_ENV !== 'production' && !isMockMode) {
  globalForPrisma.prisma = prisma;
}
