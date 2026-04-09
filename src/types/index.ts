import { Transaction, Budget, Goal, User, Subscription } from '@prisma/client';

export type { Transaction, Budget, Goal, User, Subscription };

export type UserWithSubscription = User & {
  subscription: Subscription | null;
};

export type BudgetWithSpending = Budget & {
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
};

export type DashboardStats = {
  income: number;
  expense: number;
  balance: number;
  savings: number;
  transactions: Transaction[];
};

export type MonthlyData = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

export type CategoryBreakdown = {
  name: string;
  value: number;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

export type Plan = 'FREE' | 'PRO';
