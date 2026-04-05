# 🚀 Fintrak AI — AI-Powered Budget Tracker SaaS

A production-grade, full-stack SaaS application for personal finance management powered by AI. Built with Next.js 15, TypeScript, Tailwind CSS, Clerk Auth, Prisma + PostgreSQL, Stripe, and OpenAI.

---

## ✨ Features

### Core
- **Dashboard** — Live stats (balance, income, expenses, savings rate), charts, recent transactions
- **Transactions** — Full CRUD with category filters, date filters, search, CSV export (Pro)
- **Budget Management** — Set per-category monthly limits with real-time spending tracking
- **Savings Goals** — Create goals, track progress visually, contribute amounts
- **Settings** — Profile management (via Clerk), currency preferences, billing portal

### AI (Pro Plan)
- **AI Insights** — GPT-4 powered financial pattern analysis
- **AI Chat Advisor** — Personal financial advisor with access to your data
- **Auto-Categorization** — Automatically detect transaction category from description
- **Spending Predictions** — Predict next month's expenses

### SaaS
- **Clerk Authentication** — Email/password + Google OAuth, secure sessions
- **Stripe Billing** — Free & Pro plans, webhook-driven subscription management
- **Feature Gating** — Pro features locked behind subscription check
- **Row-level security** — Each user only sees their own data

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom design system |
| UI Components | Radix UI primitives (custom styled) |
| Animations | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Auth | Clerk |
| Database | PostgreSQL + Prisma ORM |
| Payments | Stripe |
| AI | OpenAI GPT-4o-mini |
| Deployment | Vercel |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd ai-budget-tracker
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/fintrak"

# Clerk - get from https://clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI - get from https://platform.openai.com
OPENAI_API_KEY=sk-...

# Stripe - get from https://stripe.com
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

```bash
# Push schema to your database
npm run db:push

# Generate Prisma client
npm run db:generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 External Service Setup

### Clerk (Authentication)
1. Create account at [clerk.com](https://clerk.com)
2. Create a new application
3. Enable **Email/Password** and **Google** sign-in
4. Copy your API keys to `.env.local`
5. Set redirect URLs: After sign-in → `/dashboard`, After sign-up → `/dashboard`

### Stripe (Payments)
1. Create account at [stripe.com](https://stripe.com)
2. Create a **Product** called "Fintrak Pro"
3. Add a **Price**: $9.99/month recurring
4. Copy the **Price ID** to `STRIPE_PRO_PRICE_ID`
5. Set up webhook endpoint: `https://your-domain.com/api/stripe/webhook`
6. Add webhook events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
7. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

**For local webhook testing:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### OpenAI
1. Create account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key
3. Add to `OPENAI_API_KEY`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Sign in/up pages (Clerk)
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── dashboard/          # Main dashboard
│   │   ├── transactions/       # Transaction CRUD
│   │   ├── budget/             # Budget management
│   │   ├── goals/              # Savings goals
│   │   ├── ai-chat/            # AI financial advisor
│   │   └── settings/           # User settings
│   ├── api/
│   │   ├── ai/                 # AI endpoints (insights, chat, categorize)
│   │   ├── stripe/             # Stripe checkout, webhook, portal
│   │   ├── transactions/       # Transaction CRUD API
│   │   ├── budgets/            # Budget API
│   │   ├── goals/              # Goals API
│   │   └── user/               # User settings API
│   ├── pricing/                # Pricing page
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # Base UI components (Radix-based)
│   ├── layout/                 # Sidebar, Header
│   └── dashboard/              # Dashboard-specific components
├── lib/
│   ├── ai/                     # OpenAI functions
│   ├── db/                     # Prisma query functions
│   ├── stripe/                 # Stripe config
│   ├── prisma.ts               # Prisma client
│   └── utils.ts                # Utilities
├── store/                      # Zustand stores
├── types/                      # TypeScript types
└── styles/                     # Global CSS
prisma/
└── schema.prisma               # Database schema
```

---

## 🚀 Deployment (Vercel)

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Set `NEXT_PUBLIC_APP_URL` to your production URL
5. Deploy!

**Build command:** `npm run build`
**Install command:** `npm install`
**Output directory:** `.next`

> **Important:** Run `npm run db:push` against your production database before first deploy.

---

## 📝 Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Push Prisma schema
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio (GUI)
```

---

## 🔒 Security

- All API routes protected with Clerk auth middleware
- Database queries scoped to authenticated user ID
- Zod validation on all API inputs
- Stripe webhook signature verification
- OpenAI/Stripe keys server-side only
- Pro feature gating on all AI endpoints

---

## 📄 License

MIT — use freely for personal and commercial projects.
