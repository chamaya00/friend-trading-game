import { prisma } from './prisma';
import { ECONOMY } from './constants';
import { LedgerEntryType, NotificationType, Prisma, PrismaClient } from '@prisma/client';
import type { PurchaseError, TransactionWithUsers } from '@/types';

// Type for Prisma transaction client
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

interface PurchaseParams {
  buyerId: string;
  targetId: string;
  expectedPrice: number;
  expectedOwnerId: string | null;
  expectedVersion: number;
  idempotencyKey: string;
}

interface PurchaseResult {
  success: true;
  transaction: TransactionWithUsers;
  newTargetPrice: number;
  buyerBalance: number;
}

interface PurchaseFailure {
  success: false;
  error: PurchaseError;
}

// Idempotency key TTL in milliseconds (24 hours)
const IDEMPOTENCY_KEY_TTL = 24 * 60 * 60 * 1000;

async function checkIdempotencyKey(key: string): Promise<TransactionWithUsers | null> {
  const cached = await prisma.idempotencyKey.findUnique({
    where: { key },
  });

  if (cached) {
    // Return cached transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: (cached.result as { transactionId: string }).transactionId },
      include: { buyer: true, seller: true, target: true },
    });
    return transaction;
  }

  return null;
}

async function storeIdempotencyKey(key: string, transactionId: string): Promise<void> {
  await prisma.idempotencyKey.create({
    data: {
      key,
      result: { transactionId },
    },
  });
}

// Clean up old idempotency keys (can be called periodically)
export async function cleanupIdempotencyKeys(): Promise<void> {
  const cutoff = new Date(Date.now() - IDEMPOTENCY_KEY_TTL);
  await prisma.idempotencyKey.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
}

export async function purchaseUser(
  params: PurchaseParams
): Promise<PurchaseResult | PurchaseFailure> {
  const { buyerId, targetId, expectedPrice, expectedOwnerId, expectedVersion, idempotencyKey } = params;

  // 1. Check idempotency key - return cached result if exists
  const cached = await checkIdempotencyKey(idempotencyKey);
  if (cached) {
    const buyer = await prisma.user.findUnique({ where: { id: buyerId }, select: { balance: true } });
    return {
      success: true,
      transaction: cached,
      newTargetPrice: cached.targetPriceAfter,
      buyerBalance: buyer?.balance ?? 0,
    };
  }

  // 2. Start database transaction
  try {
    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      // 3. Lock and fetch target
      const target = await tx.user.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          price: true,
          ownerId: true,
          version: true,
          purchaseCount: true,
          deactivatedAt: true,
          username: true,
          balance: true,
        },
      });

      // Validations
      if (!target) {
        throw { code: 'USER_NOT_FOUND' } as PurchaseError;
      }
      if (target.deactivatedAt) {
        throw { code: 'USER_DEACTIVATED' } as PurchaseError;
      }
      if (target.version !== expectedVersion) {
        throw {
          code: 'STALE_DATA',
          currentPrice: target.price,
          currentOwner: target.ownerId,
          currentVersion: target.version,
        } as PurchaseError;
      }
      if (target.price !== expectedPrice) {
        throw { code: 'PRICE_CHANGED', currentPrice: target.price } as PurchaseError;
      }
      if (target.ownerId !== expectedOwnerId) {
        throw { code: 'OWNER_CHANGED', currentOwner: target.ownerId } as PurchaseError;
      }

      // 4. Lock and fetch buyer
      const buyer = await tx.user.findUnique({
        where: { id: buyerId },
        select: { id: true, balance: true, username: true },
      });

      if (!buyer) {
        throw { code: 'USER_NOT_FOUND' } as PurchaseError;
      }
      if (buyer.id === targetId) {
        throw { code: 'CANNOT_BUY_SELF' } as PurchaseError;
      }
      if (target.ownerId === buyerId) {
        throw { code: 'ALREADY_OWN' } as PurchaseError;
      }
      if (buyer.balance < target.price) {
        throw { code: 'INSUFFICIENT_FUNDS', balance: buyer.balance, price: target.price } as PurchaseError;
      }

      // 5. Fetch seller (previous owner) if exists
      let seller: { id: string; balance: number; username: string } | null = null;
      if (target.ownerId) {
        seller = await tx.user.findUnique({
          where: { id: target.ownerId },
          select: { id: true, balance: true, username: true },
        });
      }

      // 6. Calculate amounts
      const price = target.price;
      const newPrice = Math.floor(price * ECONOMY.PRICE_MULTIPLIER);
      const targetBonus = Math.floor(price * ECONOMY.OWNERSHIP_BONUS_PERCENT);

      // 7. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller?.id,
          targetId: target.id,
          price: price,
          sellerReceived: price,
          targetBonus: targetBonus,
          buyerBalanceBefore: buyer.balance,
          buyerBalanceAfter: buyer.balance - price,
          sellerBalanceBefore: seller?.balance,
          sellerBalanceAfter: seller ? seller.balance + price : null,
          targetPriceBefore: price,
          targetPriceAfter: newPrice,
          targetVersionBefore: target.version,
          targetVersionAfter: target.version + 1,
        },
      });

      // 8. Create ledger entries
      const ledgerEntries: {
        userId: string;
        amount: number;
        balanceAfter: number;
        type: LedgerEntryType;
        referenceType: string;
        referenceId: string;
        description: string;
      }[] = [
        // Buyer pays
        {
          userId: buyer.id,
          amount: -price,
          balanceAfter: buyer.balance - price,
          type: LedgerEntryType.PURCHASE_PAYMENT,
          referenceType: 'transaction',
          referenceId: transaction.id,
          description: `Purchased @${target.username}`,
        },
        // Target gets bonus
        {
          userId: target.id,
          amount: targetBonus,
          balanceAfter: target.balance + targetBonus,
          type: LedgerEntryType.OWNERSHIP_BONUS,
          referenceType: 'transaction',
          referenceId: transaction.id,
          description: `Bought by @${buyer.username}`,
        },
      ];

      // Seller receives (if exists)
      if (seller) {
        ledgerEntries.push({
          userId: seller.id,
          amount: price,
          balanceAfter: seller.balance + price,
          type: LedgerEntryType.SALE_REVENUE,
          referenceType: 'transaction',
          referenceId: transaction.id,
          description: `@${target.username} was bought`,
        });
      }

      await tx.ledgerEntry.createMany({ data: ledgerEntries });

      // 9. Update buyer
      await tx.user.update({
        where: { id: buyer.id },
        data: {
          balance: { decrement: price },
        },
      });

      // 10. Update seller (if exists)
      if (seller) {
        await tx.user.update({
          where: { id: seller.id },
          data: {
            balance: { increment: price },
          },
        });
      }

      // 11. Update target
      await tx.user.update({
        where: { id: target.id },
        data: {
          ownerId: buyer.id,
          price: newPrice,
          purchaseCount: { increment: 1 },
          version: { increment: 1 },
          balance: { increment: targetBonus },
        },
      });

      // 12. Create notifications
      const notifications: {
        userId: string;
        type: NotificationType;
        data: Prisma.InputJsonValue;
      }[] = [
        // Notify target they were bought
        {
          userId: target.id,
          type: NotificationType.YOU_WERE_BOUGHT,
          data: {
            buyerId: buyer.id,
            buyerUsername: buyer.username,
            price: price,
            newPrice: newPrice,
            bonus: targetBonus,
          },
        },
      ];

      // Notify seller their person was sold
      if (seller) {
        notifications.push({
          userId: seller.id,
          type: NotificationType.YOUR_PERSON_SOLD,
          data: {
            buyerId: buyer.id,
            buyerUsername: buyer.username,
            targetId: target.id,
            targetUsername: target.username,
            price: price,
          },
        });
      }

      await tx.notification.createMany({ data: notifications });

      // Return transaction with relations
      const fullTransaction = await tx.transaction.findUnique({
        where: { id: transaction.id },
        include: { buyer: true, seller: true, target: true },
      });

      return {
        transaction: fullTransaction!,
        newPrice,
        buyerBalanceAfter: buyer.balance - price,
      };
    });

    // 13. Store idempotency key result after transaction commits
    await storeIdempotencyKey(idempotencyKey, result.transaction.id);

    return {
      success: true,
      transaction: result.transaction,
      newTargetPrice: result.newPrice,
      buyerBalance: result.buyerBalanceAfter,
    };
  } catch (error) {
    // Check if it's a known purchase error
    if (error && typeof error === 'object' && 'code' in error) {
      return { success: false, error: error as PurchaseError };
    }
    // Re-throw unknown errors
    throw error;
  }
}
