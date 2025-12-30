# Friends for Sale

A social game where users can "buy" and "own" other users using fake currency. Inspired by the classic Facebook game.

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with Google OAuth

## Getting Started

### Quick Start (Mock Mode)

Run the app instantly without any database or OAuth setup:

```bash
npm install
cp .env.example .env.local
npm run dev
```

That's it! The app will run with placeholder data at `http://localhost:3000`.

You'll be automatically "logged in" as a demo user and can explore all features.

### Full Setup (Production Mode)

For the complete experience with real data persistence:

#### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials

#### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. Edit `.env.local` and set `MOCK_DATA=false`, then configure:
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

### Switching Between Modes

- **Mock Mode**: Set `MOCK_DATA=true` in `.env.local` - uses in-memory placeholder data
- **Production Mode**: Set `MOCK_DATA=false` - requires database and OAuth setup

To completely remove mock mode later, delete the `src/lib/mock/` folder.

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
