import prisma from '@/lib/prisma';
import { TransactionType } from '@prisma/client';

export interface TransactionInput {
  amount: number;
  type: TransactionType;
  category: string;
  note?: string;
  date: Date;
}

export async function getTransactions(userId: string, filters?: {
  type?: TransactionType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
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
    take: filters?.limit,
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
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
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

export async function getMonthlyData(userId: string, months = 6) {
  const result = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === 'INCOME') income += t.amount;
      else expense += t.amount;
    }

    result.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      income,
      expense,
      balance: income - expense,
    });
  }

  return result;
}

export async function getCategoryBreakdown(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      date: { gte: startOfMonth },
    },
  });

  const breakdown: Record<string, number> = {};
  for (const t of transactions) {
    breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
  }

  return Object.entries(breakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
