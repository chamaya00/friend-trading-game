export const ECONOMY = {
  STARTING_BALANCE: 100000,      // $1000.00 in cents
  STARTING_PRICE: 10000,         // $100.00 in cents

  DAILY_LOGIN_BONUS: 100,        // $1.00
  STREAK_3_BONUS: 500,           // $5.00
  STREAK_7_BONUS: 2000,          // $20.00

  PRICE_MULTIPLIER: 1.5,         // Price increases 50% on each purchase
  OWNERSHIP_BONUS_PERCENT: 0.1,  // Target gets 10% when bought

  // Display helpers
  formatPrice: (cents: number): string => `$${(cents / 100).toFixed(2)}`,
  formatPriceShort: (cents: number): string => {
    if (cents >= 100000000) return `$${(cents / 100000000).toFixed(1)}M`;
    if (cents >= 100000) return `$${(cents / 100000).toFixed(1)}K`;
    return `$${(cents / 100).toFixed(0)}`;
  },
};

export const TAGS = [
  // Interests
  'tech', 'design', 'music', 'gaming', 'sports', 'fitness',
  'food', 'travel', 'art', 'photography', 'movies', 'books',
  'fashion', 'crypto', 'startups', 'science',

  // Vibes
  'introvert', 'extrovert', 'creative', 'analytical',
  'night-owl', 'early-bird', 'coffee', 'tea',

  // Location (optional)
  'nyc', 'sf', 'la', 'chicago', 'austin', 'seattle',
  'london', 'remote'
] as const;

export type Tag = typeof TAGS[number];
