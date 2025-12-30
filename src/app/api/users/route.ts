import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sort = searchParams.get('sort') || 'newest';
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const cursor = searchParams.get('cursor');

  const currentUserId = await getCurrentUserId();

  // Build where clause
  const where: Record<string, unknown> = {
    deactivatedAt: null,
  };

  // Exclude current user from results
  if (currentUserId) {
    where.id = { not: currentUserId };
  }

  // Filter by tag
  if (tag) {
    where.tags = { has: tag };
  }

  // Search by username or display name
  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { displayName: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Build order by clause
  let orderBy: Record<string, string>;
  switch (sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'most_bought':
      orderBy = { purchaseCount: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  // Pagination
  const cursorObj = cursor ? { id: cursor } : undefined;

  const users = await prisma.user.findMany({
    where,
    orderBy,
    take: limit + 1, // Fetch one extra to determine if there are more results
    cursor: cursorObj,
    skip: cursor ? 1 : 0, // Skip the cursor item itself
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      tags: true,
      price: true,
      purchaseCount: true,
      ownerId: true,
      owner: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      version: true,
    },
  });

  // Check if there are more results
  const hasMore = users.length > limit;
  const results = hasMore ? users.slice(0, limit) : users;
  const nextCursor = hasMore ? results[results.length - 1].id : null;

  return NextResponse.json({
    users: results,
    nextCursor,
    hasMore,
  });
}
