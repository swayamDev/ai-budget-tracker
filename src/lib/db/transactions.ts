import prisma from '@/lib/prisma';
import { TransactionType } from '@prisma/client';

export interface TransactionInput {
  amount: number;
  type: TransactionType;
  category: string;
  note?: string;
  date: Date;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export async function getTransactions(userId: string, filters?: TransactionFilters) {
  return prisma.transaction.findMany({
    where: {
      userId,
      ...(filters?.type && { type: filters.type }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.startDate || filters?.endDate
        ? {
            date: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
    },
    orderBy: { date: 'desc' },
    take: filters?.limit ?? 100,
    skip: filters?.offset ?? 0,
  });
}

export async function countTransactions(userId: string, filters?: Omit<TransactionFilters, 'limit' | 'offset'>) {
  return prisma.transaction.count({
    where: {
      userId,
      ...(filters?.type && { type: filters.type }),
      ...(filters?.category && { category: filters.category }),
    },
  });
}

export async function getTransactionById(id: string, userId: string) {
  return prisma.transaction.findFirst({
    where: { id, userId },
  });
}

export async function createTransaction(userId: string, data: TransactionInput) {
  return prisma.transaction.create({
    data: {
      userId,
      amount: data.amount,
      type: data.type,
      category: data.category,
      note: data.note,
      date: data.date,
    },
  });
}

export async function updateTransaction(
  id: string,
  userId: string,
  data: Partial<TransactionInput>
) {
  return prisma.transaction.update({
    where: { id, userId },
    data,
  });
}

export async function deleteTransaction(id: string, userId: string) {
  return prisma.transaction.delete({
    where: { id, userId },
  });
}

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      note: true,
      date: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
    orderBy: { date: 'desc' },
  });

  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.type === 'INCOME') income += t.amount;
    else expense += t.amount;
  }

  const balance = income - expense;
  const savings = income > 0 ? ((income - expense) / income) * 100 : 0;

  return { income, expense, balance, savings, transactions };
}

/**
 * Optimized: single query fetching only needed fields,
 * aggregated in JS — avoids N+1 (was 6 separate queries).
 */
export async function getMonthlyData(userId: string, months = 6) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: startDate } },
    select: { amount: true, type: true, date: true },
    orderBy: { date: 'asc' },
  });

  // Build labeled month buckets
  const buckets: Record<string, { income: number; expense: number; label: string }> = {};
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    buckets[key] = { income: 0, expense: 0, label };
  }

  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (buckets[key]) {
      if (t.type === 'INCOME') buckets[key].income += t.amount;
      else buckets[key].expense += t.amount;
    }
  }

  return Object.values(buckets).map(({ label, income, expense }) => ({
    month: label,
    income,
    expense,
    balance: income - expense,
  }));
}

/**
 * Optimized: uses Prisma groupBy (DB-side aggregation)
 * instead of fetching all rows and summing in JS.
 */
export async function getCategoryBreakdown(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await prisma.transaction.groupBy({
    by: ['category'],
    where: {
      userId,
      type: 'EXPENSE',
      date: { gte: startOfMonth },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  return result.map((r) => ({
    name: r.category,
    value: r._sum.amount ?? 0,
  }));
}
