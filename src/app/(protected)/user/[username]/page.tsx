'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ECONOMY } from '@/lib/constants';
import { BuyModal } from '@/components/BuyModal';

interface Transaction {
  id: string;
  price: number;
  createdAt: string;
  buyer: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  seller: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
}

interface OwnedUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  price: number;
}

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  tags: string[];
  price: number;
  purchaseCount: number;
  version: number;
  createdAt: string;
  ownerId: string | null;
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  ownedUsers: OwnedUser[];
}

interface CurrentUserData {
  id: string;
  balance: number;
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      // Fetch user profile by username
      fetch(`/api/users/username/${encodeURIComponent(username)}`)
        .then((res) => {
          if (!res.ok) throw new Error('User not found');
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
          setTransactions(data.recentTransactions || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });

      // Fetch current user data
      fetch('/api/users/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setCurrentUser({ id: data.user.id, balance: data.user.balance });
          }
        });
    }
  }, [status, username]);

  const handleBuy = async () => {
    if (!user) return;

    const idempotencyKey = `purchase_${user.id}_${Date.now()}_${Math.random()}`;

    const res = await fetch('/api/transactions/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: user.id,
        expectedPrice: user.price,
        expectedOwnerId: user.ownerId,
        expectedVersion: user.version,
        idempotencyKey,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to complete purchase');
    }

    // Refresh the page data
    window.location.reload();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-4">
            The user @{username} doesn&apos;t exist.
          </p>
          <Link
            href="/market"
            className="text-indigo-600 hover:underline"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentUser = currentUser?.id === user.id;
  const isOwner = currentUser?.id === user.ownerId;
  const canBuy = !isCurrentUser && !isOwner;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-24 h-24 rounded-full"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center">
            <span className="text-indigo-600 text-3xl font-bold">
              {user.displayName[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
          <p className="text-gray-500 mb-2">@{user.username}</p>

          {user.bio && <p className="text-gray-700 mb-3">{user.bio}</p>}

          {/* Tags */}
          {user.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {user.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/market?tag=${tag}`}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Price and ownership */}
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-sm text-gray-500">Price: </span>
              <span className="text-xl font-bold text-indigo-600">
                {ECONOMY.formatPrice(user.price)}
              </span>
            </div>

            {user.owner && (
              <div className="text-sm text-gray-600">
                Owned by{' '}
                <Link
                  href={`/user/${user.owner.username}`}
                  className="text-indigo-600 hover:underline"
                >
                  @{user.owner.username}
                </Link>
              </div>
            )}

            {!user.owner && (
              <div className="text-sm text-gray-400">Unowned</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {canBuy && (
            <button
              onClick={() => setShowBuyModal(true)}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Buy for {ECONOMY.formatPrice(user.price)}
            </button>
          )}

          {isOwner && (
            <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md">
              You own this person
            </span>
          )}

          {isCurrentUser && (
            <span className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md">
              This is you
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {user.purchaseCount}
          </div>
          <div className="text-sm text-gray-500">times bought</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {user.ownedUsers.length}
          </div>
          <div className="text-sm text-gray-500">people owned</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-500">joined</div>
        </div>
      </div>

      {/* Owned users */}
      {user.ownedUsers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">
            People @{user.username} owns
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.ownedUsers.map((owned) => (
              <Link
                key={owned.id}
                href={`/user/${owned.username}`}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                {owned.avatarUrl ? (
                  <img
                    src={owned.avatarUrl}
                    alt={owned.displayName}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center">
                    <span className="text-indigo-600 text-xs font-medium">
                      {owned.displayName[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-700">@{owned.username}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Recent History</h2>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="text-sm">
                  <Link
                    href={`/user/${tx.buyer.username}`}
                    className="text-indigo-600 hover:underline"
                  >
                    @{tx.buyer.username}
                  </Link>
                  <span className="text-gray-600"> bought for </span>
                  <span className="font-medium">
                    {ECONOMY.formatPrice(tx.price)}
                  </span>
                  {tx.seller && (
                    <>
                      <span className="text-gray-600"> from </span>
                      <Link
                        href={`/user/${tx.seller.username}`}
                        className="text-indigo-600 hover:underline"
                      >
                        @{tx.seller.username}
                      </Link>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && currentUser && (
        <BuyModal
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          user={user}
          currentBalance={currentUser.balance}
          onConfirm={handleBuy}
        />
      )}
    </div>
  );
}
