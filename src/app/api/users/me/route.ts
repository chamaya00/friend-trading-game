import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      tags: true,
      balance: true,
      price: true,
      purchaseCount: true,
      currentStreak: true,
      lastLoginDate: true,
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
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { displayName, bio, tags } = body;

  // Validate fields
  const updateData: Record<string, unknown> = {};

  if (displayName !== undefined) {
    if (typeof displayName !== 'string' || displayName.length > 50) {
      return NextResponse.json(
        { error: 'Invalid display name' },
        { status: 400 }
      );
    }
    updateData.displayName = displayName;
  }

  if (bio !== undefined) {
    if (typeof bio !== 'string' || bio.length > 160) {
      return NextResponse.json(
        { error: 'Bio must be 160 characters or less' },
        { status: 400 }
      );
    }
    updateData.bio = bio;
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags) || tags.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 tags allowed' },
        { status: 400 }
      );
    }
    updateData.tags = tags;
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      tags: true,
    },
  });

  return NextResponse.json({ user });
}
