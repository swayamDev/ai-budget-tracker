# Fintrak AI — AI-Powered Budget Tracker

**Live → [budget.swayam.io](https://budget.swayam.io)**

> A full-stack personal finance management application with AI-driven insights, subscription billing, and a real-time dashboard — built on Next.js 16, Prisma 7, Clerk, OpenAI, and Stripe.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Subscription Plans](#subscription-plans)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

Fintrak AI is a production-ready SaaS application that helps users track income, expenses, and financial goals with AI-powered insights. Users get a real-time dashboard with money flow charts, category breakdowns, and an AI chat advisor that offers personalized financial recommendations based on their actual spending data.

The app follows a freemium model — a generous free tier is available with basic features, while Pro subscribers unlock unlimited transactions, AI chat, spending predictions, and auto-categorization.

---

## Features

### Core Finance

- **Transaction Management** — Create, edit, filter, and delete income/expense transactions with category tagging and optional notes
- **Budget Tracking** — Set per-category monthly budget limits and track progress with visual indicators and over-budget alerts
- **Savings Goals** — Create goals with target amounts and deadlines, and contribute to them incrementally
- **Dashboard Analytics** — Real-time stat cards (income, expense, balance, savings rate), a 6-month money flow chart, and a category expense pie chart

### AI Features (OpenAI GPT-4o-mini)

- **Financial Insights** — Automated bullet-point analysis of recent transactions surfaced directly on the dashboard
- **AI Chat Advisor** — Interactive chat interface where users can ask financial questions; the model is injected with the user's actual income, expense, and transaction context (Pro only)
- **Auto-Categorization** — Classify transactions by description using zero-shot GPT classification across 15 predefined categories (Pro only)
- **Spending Predictions** — 30-day rolling expense analysis with next-month forecasts and cost-reduction tips (Pro only)
- **AI Logging** — Every AI interaction is persisted to the `AiLog` table for auditability and future analytics

### Auth & User Management

- **Clerk Authentication** — Sign-up, sign-in, and session management handled entirely by Clerk with Next.js server-side integration
- **User Sync** — Users are upserted into the PostgreSQL database on first access, linking Clerk identities to application data
- **Theme & Currency Settings** — Per-user dark/light theme preference and currency selection persisted in the database

### Billing (Stripe)

- **Checkout** — Stripe Checkout sessions for Pro subscription upgrades with user metadata embedding
- **Customer Portal** — Self-service subscription management (cancel, update payment method) via Stripe Billing Portal
- **Webhook Handler** — Production-grade webhook processing for `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, and `customer.subscription.deleted` events, fully compatible with Stripe API `2026-03-25.dahlia`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| ORM | Prisma 7 (custom output path) |
| Database | PostgreSQL (via `@prisma/adapter-pg`) |
| Authentication | Clerk (`@clerk/nextjs` v7) |
| AI | OpenAI SDK v6 (`gpt-4o-mini`) |
| Payments | Stripe SDK v22 |
| State Management | Zustand v5 |
| Charts | Recharts v3 |
| Form Handling | React Hook Form + Zod v4 |
| Notifications | Sonner |
| Date Utilities | date-fns v4 |
| Runtime | Node.js |

---

## Architecture

```
┌───────────────────────────────────────────────────────────┐
│                        Next.js App Router                  │
│                                                           │
│  ┌──────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  Public Pages│  │ Dashboard Pages │  │  API Routes │  │
│  │  / (landing) │  │ /dashboard      │  │ /api/...    │  │
│  │  /pricing    │  │ /transactions   │  │             │  │
│  │  /sign-in    │  │ /budget         │  │             │  │
│  │  /sign-up    │  │ /goals          │  │             │  │
│  │              │  │ /ai-chat        │  │             │  │
│  │              │  │ /settings       │  │             │  │
│  └──────────────┘  └─────────────────┘  └─────────────┘  │
└────────────────────────────┬──────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
     ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
     │  PostgreSQL  │  │   OpenAI    │  │   Stripe   │
     │  (Prisma 7)  │  │ GPT-4o-mini │  │   v22      │
     └─────────────┘  └─────────────┘  └────────────┘
```

All dashboard pages follow a **server component → client component** split: the server page fetches data using Clerk's `auth()` and Prisma directly, then passes serialized props into a `client.tsx` component that owns interactivity and local state. Each route also has dedicated `loading.tsx` (skeleton UI) and `error.tsx` (error boundary) files.

---

## Database Schema

Six models power the application:

**`User`** — Core user record linked to a Clerk identity via `clerkId`. Stores display preferences (currency, theme).

**`Transaction`** — Individual income or expense entries. Indexed on `(userId, date)`, `(userId, type)`, and `(userId, category)` for efficient dashboard queries.

**`Budget`** — Monthly category-level spending limits. A unique constraint on `(userId, category, month, year)` prevents duplicate budgets.

**`Goal`** — Savings targets with optional deadlines. Tracks `currentAmount` separately from `targetAmount` to support incremental contributions.

**`AiLog`** — Immutable audit log of every AI prompt and response, scoped per user.

**`Subscription`** — Billing state, linked to Stripe customer and subscription IDs. Supports `FREE` and `PRO` plans with `ACTIVE`, `CANCELLED`, `PAST_DUE`, and `INCOMPLETE` statuses.

---

## Project Structure

```
.
├── prisma/
│   ├── schema.prisma          # Source of truth for the DB schema
│   └── seed.ts                # Optional seed script
├── generated/
│   └── prisma/                # Prisma-generated client (committed; do not edit)
├── src/
│   ├── actions/
│   │   └── transactions.ts    # Server actions (Next.js revalidation)
│   ├── app/
│   │   ├── (auth)/            # Sign-in / sign-up routes (Clerk-hosted UI)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── ai-chat/       # AI advisor chat interface
│   │   │   ├── budget/        # Budget management
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── goals/         # Savings goals
│   │   │   ├── settings/      # User preferences
│   │   │   └── transactions/  # Transaction list & filters
│   │   ├── api/
│   │   │   ├── ai/            # AI endpoints (categorize, chat, insights)
│   │   │   ├── budgets/       # Budget CRUD
│   │   │   ├── goals/         # Goals CRUD + contributions
│   │   │   ├── stripe/        # Checkout, portal, webhook
│   │   │   ├── transactions/  # Transaction CRUD
│   │   │   └── user/          # User settings
│   │   ├── pricing/           # Public pricing page
│   │   └── page.tsx           # Public landing page
│   ├── components/
│   │   ├── dashboard/         # Stat cards, charts, widgets
│   │   ├── layout/            # Sidebar and header
│   │   ├── transactions/      # Transaction form component
│   │   └── ui/                # shadcn/ui primitives
│   ├── hooks/                 # useLocalStorage, useTransactions
│   ├── lib/
│   │   ├── ai/openai.ts       # OpenAI client + all AI functions
│   │   ├── db/                # Prisma query helpers per domain
│   │   ├── stripe/config.ts   # Stripe client + plan definitions
│   │   └── prisma.ts          # Singleton Prisma client
│   ├── store/index.ts         # Zustand stores (UI + filters)
│   ├── styles/globals.css     # Tailwind base + CSS custom properties
│   └── types/index.ts         # Shared TypeScript types
├── components/ui/             # Root-level shadcn/ui components
├── next.config.ts
├── prisma.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or hosted, e.g. Supabase, Neon)
- Clerk account
- OpenAI API key
- Stripe account

### Installation

```bash
git clone https://github.com/your-username/ai-budget-tracker.git
cd ai-budget-tracker
npm install
```

### Database Setup

```bash
# Push the schema to your database
npx prisma db push

# (Optional) Run the seed script
npx tsx prisma/seed.ts
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Clerk — https://clerk.com/docs
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI — https://platform.openai.com
OPENAI_API_KEY=sk-...

# Stripe — https://stripe.com/docs
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# App URL (required for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Both the OpenAI and Stripe clients are lazily initialized — the app will build successfully even when these keys are absent from the build environment. Errors surface at runtime on first use.

### Stripe Webhook (Local Development)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## API Reference

All routes are under `/api` and require authentication via Clerk unless noted.

### Transactions

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/transactions` | List transactions (supports `type`, `category`, `limit`, `offset` query params) |
| `POST` | `/api/transactions` | Create a transaction |
| `PATCH` | `/api/transactions/[id]` | Update a transaction |
| `DELETE` | `/api/transactions/[id]` | Delete a transaction |

### Budgets

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/budgets` | List budgets with spending totals for current month |
| `POST` | `/api/budgets` | Create a budget |
| `PATCH` | `/api/budgets/[id]` | Update a budget limit |
| `DELETE` | `/api/budgets/[id]` | Delete a budget |

### Goals

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/goals` | List all goals |
| `POST` | `/api/goals` | Create a goal |
| `PATCH` | `/api/goals/[id]` | Update a goal |
| `DELETE` | `/api/goals/[id]` | Delete a goal |
| `POST` | `/api/goals/[id]/contribute` | Add a contribution amount to a goal |

### AI

| Method | Path | Plan Required | Description |
|---|---|---|---|
| `POST` | `/api/ai/insights` | Free | Generate financial insights from recent transactions |
| `POST` | `/api/ai/chat` | Pro | Chat with the AI financial advisor |
| `POST` | `/api/ai/categorize` | Pro | Auto-categorize a transaction by description |

### Stripe Billing

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/stripe/checkout` | Create a Stripe Checkout session for Pro upgrade |
| `POST` | `/api/stripe/portal` | Create a Stripe Customer Portal session |
| `POST` | `/api/stripe/webhook` | Stripe webhook handler (no auth — verified by signature) |

### User

| Method | Path | Description |
|---|---|---|
| `PATCH` | `/api/user/settings` | Update currency and theme preferences |

---

## Subscription Plans

| Feature | Free | Pro |
|---|---|---|
| Transactions per month | 50 | Unlimited |
| Budgets | 2 | Unlimited |
| Goals | 2 | Unlimited |
| AI Insights | 3 per day | Unlimited |
| AI Chat Advisor | ✗ | ✓ |
| Auto-Categorization | ✗ | ✓ |
| Spending Predictions | ✗ | ✓ |
| Price | $0 | $9.99/month |

Plan enforcement is applied at the API route level using the `requireApiUser` guard, which includes the user's subscription record.

---

## Deployment

The app is live at **[budget.swayam.io](https://budget.swayam.io)**.

For self-hosted deployments, the app is a standard Next.js application compatible with any platform supporting Node.js 20+. Ensure:

- `DATABASE_URL` points to a reachable PostgreSQL instance.
- The Stripe webhook endpoint (`/api/stripe/webhook`) is publicly reachable and registered in the Stripe dashboard.
- `NEXT_PUBLIC_APP_URL` is set to the production domain.

---

## Contributing

1. Fork the repository and create a feature branch (`git checkout -b feat/my-feature`).
2. Run `npm run lint` before committing.
3. Open a pull request with a clear description of the change and any relevant context.

Bug reports and feature suggestions are welcome via GitHub Issues.

---

## License

This project is private. All rights reserved.
