'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ECONOMY } from '@/lib/constants';
import { useState, useEffect } from 'react';

interface UserData {
  balance: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export function Header() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/users/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUserData(data.user);
          }
        })
        .catch(console.error);
    }
  }, [session?.user?.id]);

  if (status === 'loading') {
    return (
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            Friends for Sale
          </Link>
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          Friends for Sale
        </Link>

        {session ? (
          <div className="flex items-center gap-4">
            {/* Balance */}
            {userData && (
              <div className="text-sm font-medium text-gray-700">
                <span className="text-green-600">
                  {ECONOMY.formatPrice(userData.balance)}
                </span>
              </div>
            )}

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/market"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Market
              </Link>
              <Link
                href="/portfolio"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Portfolio
              </Link>
            </nav>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2"
              >
                {userData?.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt={userData.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                    <span className="text-indigo-600 text-sm font-medium">
                      {userData?.displayName?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    href={`/user/${userData?.username}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/portfolio"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden"
                    onClick={() => setShowMenu(false)}
                  >
                    Portfolio
                  </Link>
                  <Link
                    href="/market"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden"
                    onClick={() => setShowMenu(false)}
                  >
                    Market
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
