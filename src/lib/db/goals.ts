import prisma from '@/lib/prisma';

export interface GoalInput {
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: Date;
}

export async function getGoals(userId: string) {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getGoalById(id: string, userId: string) {
  return prisma.goal.findFirst({ where: { id, userId } });
}

export async function createGoal(userId: string, data: GoalInput) {
  return prisma.goal.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? 0,
      deadline: data.deadline,
    },
  });
}

export async function updateGoal(id: string, userId: string, data: Partial<GoalInput>) {
  return prisma.goal.update({
    where: { id, userId },
    data: {
      ...data,
      isCompleted: data.currentAmount
        ? data.currentAmount >= (data as any).targetAmount
        : undefined,
    },
  });
}

export async function updateGoalAmount(id: string, userId: string, amount: number) {
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) throw new Error('Goal not found');

  const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
  const isCompleted = newAmount >= goal.targetAmount;

  return prisma.goal.update({
    where: { id },
    data: { currentAmount: newAmount, isCompleted },
  });
}

export async function deleteGoal(id: string, userId: string) {
  return prisma.goal.delete({ where: { id, userId } });
}
