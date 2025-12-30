import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect('/market');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Friends for Sale
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          The classic social game where you can buy and own your friends!
          Build your collection, watch your value grow, and have fun.
        </p>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div>
              <div className="text-2xl mb-2">🎁</div>
              <h3 className="font-medium text-gray-900">Start with $1,000</h3>
              <p className="text-sm text-gray-600">
                Every new player gets $1,000 in fake currency to start buying.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🛒</div>
              <h3 className="font-medium text-gray-900">Buy & Own</h3>
              <p className="text-sm text-gray-600">
                Buy anyone for their current price. When bought, prices go up 50%!
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-medium text-gray-900">Earn Money</h3>
              <p className="text-sm text-gray-600">
                Earn when your people are bought, plus daily login bonuses.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-block px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
