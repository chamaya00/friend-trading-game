import NextAuth from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

const isMockMode = process.env.MOCK_DATA === 'true';

// Mock session data for client-side
const mockSession = {
  user: {
    id: 'clmock_current_user_001',
    name: 'You (Demo User)',
    email: 'you@example.com',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

// In mock mode, intercept session requests and return mock session
function mockHandler(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Return mock session for session endpoint
  if (pathname.endsWith('/session')) {
    return NextResponse.json(mockSession);
  }

  // Return mock CSRF token
  if (pathname.endsWith('/csrf')) {
    return NextResponse.json({ csrfToken: 'mock-csrf-token' });
  }

  // Return empty providers (no real OAuth in mock mode)
  if (pathname.endsWith('/providers')) {
    return NextResponse.json({});
  }

  // Handle signout by just redirecting to home
  if (pathname.endsWith('/signout')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // For any other auth endpoint, just return empty OK response
  return NextResponse.json({});
}

const realHandler = NextAuth(authOptions);

export async function GET(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  if (isMockMode) {
    return mockHandler(req);
  }
  return realHandler(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  if (isMockMode) {
    return mockHandler(req);
  }
  return realHandler(req, context);
}
