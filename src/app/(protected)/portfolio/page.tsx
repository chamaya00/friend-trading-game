'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ECONOMY } from '@/lib/constants';

interface OwnedUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  price: number;
}

interface UserData {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  balance: number;
  price: number;
  purchaseCount: number;
  ownedUsers: OwnedUser[];
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
}

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/users/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUserData(data.user);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
          <div className="h-32 bg-gray-200 rounded-lg mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Failed to load data</div>
      </div>
    );
  }

  const totalPortfolioValue = userData.ownedUsers.reduce(
    (sum, user) => sum + user.price,
    0
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Portfolio</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Balance</div>
          <div className="text-2xl font-bold text-green-600">
            {ECONOMY.formatPrice(userData.balance)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Your Value</div>
          <div className="text-2xl font-bold text-indigo-600">
            {ECONOMY.formatPrice(userData.price)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">People Owned</div>
          <div className="text-2xl font-bold text-gray-900">
            {userData.ownedUsers.length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Portfolio Value</div>
          <div className="text-2xl font-bold text-gray-900">
            {ECONOMY.formatPrice(totalPortfolioValue)}
          </div>
        </div>
      </div>

      {/* Ownership Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Your Status</h2>
        {userData.owner ? (
          <p className="text-gray-600">
            You are owned by{' '}
            <Link
              href={`/user/${userData.owner.username}`}
              className="text-indigo-600 hover:underline font-medium"
            >
              @{userData.owner.username}
            </Link>
          </p>
        ) : (
          <p className="text-gray-500">You are currently unowned</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          You&apos;ve been bought {userData.purchaseCount} time
          {userData.purchaseCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Owned Users */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900 mb-4">People You Own</h2>

        {userData.ownedUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              You don&apos;t own anyone yet. Head to the marketplace to buy your first person!
            </p>
            <Link
              href="/market"
              className="inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {userData.ownedUsers.map((user) => (
              <Link
                key={user.id}
                href={`/user/${user.username}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {user.displayName[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {user.displayName}
                  </div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-indigo-600">
                    {ECONOMY.formatPrice(user.price)}
                  </div>
                  <div className="text-xs text-gray-500">current value</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
