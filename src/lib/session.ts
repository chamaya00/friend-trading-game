import { getServerSession } from 'next-auth';

/**
 * MOCK MODE SUPPORT
 *
 * When MOCK_DATA=true, we return a fake authenticated session.
 * This allows testing the app without Google OAuth setup.
 *
 * Mock mode is automatically enabled if:
 * - MOCK_DATA=true is set, OR
 * - Required auth environment variables (GOOGLE_CLIENT_ID, DATABASE_URL) are not set
 *
 * To disable mock mode: Set MOCK_DATA=false in .env.local AND ensure all required env vars are set
 */

const hasRequiredEnvVars = !!(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.DATABASE_URL
);

const isMockMode = process.env.MOCK_DATA === 'true' || !hasRequiredEnvVars;

export async function getSession() {
  if (isMockMode) {
    // Return mock session without hitting NextAuth
    const { getMockSession } = await import('./mock/session');
    return getMockSession();
  }

  // Dynamically import authOptions to avoid loading Prisma/database in mock mode
  const { authOptions } = await import('./auth');
  return await getServerSession(authOptions);
}

export async function getCurrentUserId() {
  const session = await getSession();
  return session?.user?.id;
}
