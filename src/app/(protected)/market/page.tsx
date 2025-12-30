'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserCard } from '@/components/UserCard';
import { BuyModal } from '@/components/BuyModal';
import { TAGS } from '@/lib/constants';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  tags: string[];
  price: number;
  purchaseCount: number;
  version: number;
  ownerId: string | null;
  owner?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
}

interface UserData {
  balance: number;
}

function MarketPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const sort = searchParams.get('sort') || 'newest';
  const tag = searchParams.get('tag');

  const fetchUsers = useCallback(async (reset = false) => {
    const params = new URLSearchParams();
    params.set('sort', sort);
    if (tag) params.set('tag', tag);
    if (!reset && cursor) params.set('cursor', cursor);

    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();

    if (reset) {
      setUsers(data.users);
    } else {
      setUsers(prev => [...prev, ...data.users]);
    }
    setHasMore(data.hasMore);
    setCursor(data.nextCursor);
    setLoading(false);
  }, [sort, tag, cursor]);

  const fetchUserData = useCallback(async () => {
    const res = await fetch('/api/users/me');
    const data = await res.json();
    if (data.user) {
      setUserData(data.user);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      setCursor(null);
      fetchUsers(true);
      fetchUserData();
    }
  }, [status, sort, tag]);

  const handleBuy = async () => {
    if (!selectedUser) return;

    const idempotencyKey = `purchase_${selectedUser.id}_${Date.now()}_${Math.random()}`;

    const res = await fetch('/api/transactions/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: selectedUser.id,
        expectedPrice: selectedUser.price,
        expectedOwnerId: selectedUser.ownerId,
        expectedVersion: selectedUser.version,
        idempotencyKey,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to complete purchase');
    }

    // Refresh user data and users list
    await Promise.all([fetchUserData(), fetchUsers(true)]);
  };

  const updateSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    router.push(`/market?${params.toString()}`);
  };

  const updateTag = (newTag: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newTag) {
      params.set('tag', newTag);
    } else {
      params.delete('tag');
    }
    router.push(`/market?${params.toString()}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketplace</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => updateSort(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="most_bought">Most Bought</option>
        </select>

        {/* Tag filter */}
        <select
          value={tag || ''}
          onChange={(e) => updateTag(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
        >
          <option value="">All Tags</option>
          {TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {tag && (
          <button
            onClick={() => updateTag(null)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Users grid */}
      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No users found. Be the first to join!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                currentUserId={session?.user?.id}
                onBuy={(u) => setSelectedUser(u)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => fetchUsers()}
                className="px-6 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}

      {/* Buy Modal */}
      {selectedUser && userData && (
        <BuyModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          currentBalance={userData.balance}
          onConfirm={handleBuy}
        />
      )}
    </div>
  );
}

function MarketPageFallback() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense fallback={<MarketPageFallback />}>
      <MarketPageContent />
    </Suspense>
  );
}
