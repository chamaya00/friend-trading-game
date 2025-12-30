'use client';

import Link from 'next/link';
import { ECONOMY } from '@/lib/constants';

interface UserCardProps {
  user: {
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
  };
  currentUserId?: string;
  onBuy?: (user: UserCardProps['user']) => void;
  showBuyButton?: boolean;
}

export function UserCard({
  user,
  currentUserId,
  onBuy,
  showBuyButton = true,
}: UserCardProps) {
  const isOwned = user.ownerId === currentUserId;
  const canBuy = showBuyButton && currentUserId && !isOwned && user.id !== currentUserId;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link href={`/user/${user.username}`}>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center">
              <span className="text-indigo-600 text-lg font-medium">
                {user.displayName[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/user/${user.username}`}>
            <h3 className="font-semibold text-gray-900 truncate hover:text-indigo-600">
              {user.displayName}
            </h3>
          </Link>
          <p className="text-sm text-gray-500">@{user.username}</p>

          {user.bio && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{user.bio}</p>
          )}

          {/* Tags */}
          {user.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {user.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{user.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-indigo-600">
            {ECONOMY.formatPrice(user.price)}
          </div>
          {user.owner && (
            <div className="text-xs text-gray-500">
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
            <div className="text-xs text-gray-400">Unowned</div>
          )}
        </div>

        {canBuy && (
          <button
            onClick={() => onBuy?.(user)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Buy
          </button>
        )}

        {isOwned && (
          <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
            You own
          </span>
        )}
      </div>
    </div>
  );
}
