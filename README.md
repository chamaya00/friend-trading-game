# Friends for Sale

A social game where users can "buy" and "own" other users using fake currency. Inspired by the classic Facebook game.

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with Google OAuth

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. Set up your environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)
   - `NEXTAUTH_SECRET`: A random secret for NextAuth
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

4. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- **Buy & Own**: Purchase other users for their current price. Prices increase 50% after each purchase.
- **Earn Money**: Get a 10% bonus when someone buys you, plus daily login bonuses.
- **Portfolio**: Track the people you own and your total portfolio value.
- **Marketplace**: Browse and filter users by tags, sort by price or popularity.

## Game Economy

- Starting balance: $1,000
- Starting price: $100
- Price multiplier on purchase: 1.5x
- Ownership bonus: 10% of purchase price goes to the person being bought

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── (protected)/   # Authenticated pages
│   └── login/         # Login page
├── components/        # React components
├── lib/               # Utilities and helpers
└── types/             # TypeScript types
```
