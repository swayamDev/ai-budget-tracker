import prisma from '@/lib/prisma';

export interface BudgetInput {
  category: string;
  limitAmount: number;
  month: number;
  year: number;
}

export async function getBudgets(userId: string, month?: number, year?: number) {
  const now = new Date();
  return prisma.budget.findMany({
    where: {
      userId,
      month: month ?? now.getMonth() + 1,
      year: year ?? now.getFullYear(),
    },
  });
}

export async function createBudget(userId: string, data: BudgetInput) {
  return prisma.budget.upsert({
    where: {
      userId_category_month_year: {
        userId,
        category: data.category,
        month: data.month,
        year: data.year,
      },
    },
    create: { userId, ...data },
    update: { limitAmount: data.limitAmount },
  });
}

export async function updateBudget(id: string, userId: string, data: Partial<BudgetInput>) {
  return prisma.budget.update({
    where: { id, userId },
    data,
  });
}

export async function deleteBudget(id: string, userId: string) {
  return prisma.budget.delete({
    where: { id, userId },
  });
}

/**
 * Optimized: uses Promise.all for parallel queries,
 * select projections to reduce payload,
 * and DB-side spending aggregation.
 */
export async function getBudgetWithSpending(userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const [budgets, spendingGroups] = await Promise.all([
    prisma.budget.findMany({
      where: { userId, month, year },
    }),
    prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),
  ]);

  const spending: Record<string, number> = {};
  for (const s of spendingGroups) {
    spending[s.category] = s._sum.amount ?? 0;
  }

  return budgets.map((budget) => {
    const spent = spending[budget.category] ?? 0;
    return {
      ...budget,
      spent,
      percentage: Math.min(Math.round((spent / budget.limitAmount) * 100), 100),
      remaining: Math.max(budget.limitAmount - spent, 0),
      isOverBudget: spent > budget.limitAmount,
    };
  });
}
