import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import type { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import { ECONOMY } from './constants';

// Type for Prisma transaction client
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// Generate username from email
function generateUsername(email: string): string {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  return base.slice(0, 20);
}

// Make username unique by adding random suffix
async function makeUsernameUnique(baseUsername: string): Promise<string> {
  let username = baseUsername;
  let attempts = 0;

  while (attempts < 10) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) return username;

    username = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
    attempts++;
  }

  // Fallback to timestamp-based
  return `${baseUsername}${Date.now().toString(36)}`;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-do-not-use-in-production',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // When a user is created via NextAuth, set up their game profile
      const baseUsername = generateUsername(user.email || 'user');
      const username = await makeUsernameUnique(baseUsername);

      // Update user with game-specific fields and award signup bonus
      await prisma.$transaction(async (tx: TransactionClient) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            username,
            displayName: user.name || username,
            avatarUrl: user.image,
            balance: ECONOMY.STARTING_BALANCE,
            price: ECONOMY.STARTING_PRICE,
          },
        });

        // Create ledger entry for signup bonus
        await tx.ledgerEntry.create({
          data: {
            userId: user.id,
            amount: ECONOMY.STARTING_BALANCE,
            balanceAfter: ECONOMY.STARTING_BALANCE,
            type: 'SIGNUP_BONUS',
            description: 'Welcome bonus!',
          },
        });
      });
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'database',
  },
};
