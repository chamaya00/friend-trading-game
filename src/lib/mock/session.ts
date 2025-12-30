/**
 * MOCK SESSION FOR LOCAL DEVELOPMENT
 *
 * Returns a fake authenticated session with the mock current user.
 * Bypasses NextAuth entirely in mock mode.
 *
 * To remove: Set MOCK_DATA=false and delete the src/lib/mock/ folder.
 */

import { MOCK_CURRENT_USER } from './data';

// Mock session that mimics NextAuth session structure
export const MOCK_SESSION = {
  user: {
    id: MOCK_CURRENT_USER.id,
    name: MOCK_CURRENT_USER.displayName,
    email: MOCK_CURRENT_USER.email,
    image: MOCK_CURRENT_USER.avatarUrl,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
};

// Mock getSession that returns the fake session
export async function getMockSession() {
  return MOCK_SESSION;
}

// Mock getCurrentUserId
export async function getMockCurrentUserId() {
  return MOCK_SESSION.user.id;
}
