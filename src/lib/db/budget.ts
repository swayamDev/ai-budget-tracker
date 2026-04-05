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

export async function getBudgetWithSpending(userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startOfMonth = new Date(year, month - 1, 1);

  const [budgets, transactions] = await Promise.all([
    prisma.budget.findMany({ where: { userId, month, year } }),
    prisma.transaction.findMany({
      where: { userId, type: 'EXPENSE', date: { gte: startOfMonth } },
    }),
  ]);

  const spending: Record<string, number> = {};
  for (const t of transactions) {
    spending[t.category] = (spending[t.category] || 0) + t.amount;
  }

  return budgets.map((budget) => ({
    ...budget,
    spent: spending[budget.category] || 0,
    percentage: Math.min(
      Math.round(((spending[budget.category] || 0) / budget.limitAmount) * 100),
      100
    ),
    remaining: Math.max(budget.limitAmount - (spending[budget.category] || 0), 0),
    isOverBudget: (spending[budget.category] || 0) > budget.limitAmount,
  }));
}
