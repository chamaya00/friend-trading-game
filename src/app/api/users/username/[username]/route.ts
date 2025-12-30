import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      tags: true,
      price: true,
      purchaseCount: true,
      createdAt: true,
      version: true,
      ownerId: true,
      owner: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      ownedUsers: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          price: true,
        },
        take: 10,
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  // Get recent transactions where this user was the target
  const recentTransactions = await prisma.transaction.findMany({
    where: { targetId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      buyer: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      seller: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  return NextResponse.json({
    user,
    recentTransactions,
  });
}
