import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { purchaseUser } from '@/lib/purchase';
import { ECONOMY } from '@/lib/constants';

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { targetId, expectedPrice, expectedOwnerId, expectedVersion, idempotencyKey } = body;

  // Validate required fields
  if (!targetId || typeof targetId !== 'string') {
    return NextResponse.json(
      { error: 'Invalid targetId' },
      { status: 400 }
    );
  }

  if (typeof expectedPrice !== 'number' || expectedPrice < 0) {
    return NextResponse.json(
      { error: 'Invalid expectedPrice' },
      { status: 400 }
    );
  }

  if (typeof expectedVersion !== 'number' || expectedVersion < 1) {
    return NextResponse.json(
      { error: 'Invalid expectedVersion' },
      { status: 400 }
    );
  }

  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    return NextResponse.json(
      { error: 'Invalid idempotencyKey' },
      { status: 400 }
    );
  }

  // Attempt purchase
  const result = await purchaseUser({
    buyerId: session.user.id,
    targetId,
    expectedPrice,
    expectedOwnerId: expectedOwnerId ?? null,
    expectedVersion,
    idempotencyKey,
  });

  if (!result.success) {
    const error = result.error;
    let message: string;
    let status = 400;

    switch (error.code) {
      case 'USER_NOT_FOUND':
        message = 'User not found';
        status = 404;
        break;
      case 'USER_DEACTIVATED':
        message = 'This user is no longer available';
        break;
      case 'CANNOT_BUY_SELF':
        message = "You can't buy yourself";
        break;
      case 'ALREADY_OWN':
        message = 'You already own this person';
        break;
      case 'INSUFFICIENT_FUNDS':
        const needed = error.price - error.balance;
        message = `You need ${ECONOMY.formatPrice(needed)} more to buy this person`;
        break;
      case 'STALE_DATA':
      case 'PRICE_CHANGED':
      case 'OWNER_CHANGED':
        message = 'The price or owner has changed. Please refresh and try again.';
        status = 409; // Conflict
        break;
      default:
        message = 'An error occurred';
    }

    return NextResponse.json(
      {
        error: error.code,
        message,
        ...error,
      },
      { status }
    );
  }

  return NextResponse.json({
    success: true,
    transaction: {
      id: result.transaction.id,
      price: result.transaction.price,
      targetBonus: result.transaction.targetBonus,
      buyer: {
        id: result.transaction.buyer.id,
        username: result.transaction.buyer.username,
      },
      target: {
        id: result.transaction.target.id,
        username: result.transaction.target.username,
        newPrice: result.newTargetPrice,
      },
    },
    buyerBalance: result.buyerBalance,
  });
}
