'use client';

import { useState } from 'react';
import { ECONOMY } from '@/lib/constants';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    displayName: string;
    price: number;
    version: number;
    ownerId: string | null;
  };
  currentBalance: number;
  onConfirm: () => Promise<void>;
}

export function BuyModal({
  isOpen,
  onClose,
  user,
  currentBalance,
  onConfirm,
}: BuyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const canAfford = currentBalance >= user.price;
  const balanceAfter = currentBalance - user.price;
  const newPrice = Math.floor(user.price * ECONOMY.PRICE_MULTIPLIER);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete purchase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {canAfford ? 'Confirm Purchase' : 'Insufficient Funds'}
        </h2>

        {canAfford ? (
          <>
            <p className="text-gray-600 mb-4">
              Are you sure you want to buy{' '}
              <span className="font-semibold">@{user.username}</span> for{' '}
              <span className="font-semibold text-indigo-600">
                {ECONOMY.formatPrice(user.price)}
              </span>
              ?
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Your balance</span>
                <span className="font-medium">{ECONOMY.formatPrice(currentBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Purchase price</span>
                <span className="font-medium text-red-600">
                  -{ECONOMY.formatPrice(user.price)}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Balance after</span>
                <span className="font-medium">{ECONOMY.formatPrice(balanceAfter)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              After purchase, @{user.username}&apos;s price will be{' '}
              <span className="font-medium">{ECONOMY.formatPrice(newPrice)}</span>
            </p>

            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Buying...' : 'Buy Now'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              You need{' '}
              <span className="font-semibold text-red-600">
                {ECONOMY.formatPrice(user.price - currentBalance)}
              </span>{' '}
              more to buy @{user.username}.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Your balance</span>
                <span className="font-medium">{ECONOMY.formatPrice(currentBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Required</span>
                <span className="font-medium">{ECONOMY.formatPrice(user.price)}</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Come back tomorrow for your daily bonus, or wait for someone to buy you!
            </p>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Got it
            </button>
          </>
        )}
      </div>
    </div>
  );
}
