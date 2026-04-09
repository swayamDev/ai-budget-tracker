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
    orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
  });
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

export async function contributeToGoal(id: string, userId: string, amount: number) {
  const goal = await prisma.goal.findFirst({
    where: { id, userId },
    select: { currentAmount: true, targetAmount: true },
  });
  if (!goal) throw new Error('Goal not found');

  const newAmount = goal.currentAmount + amount;
  return prisma.goal.update({
    where: { id, userId },
    data: {
      currentAmount: newAmount,
      isCompleted: newAmount >= goal.targetAmount,
    },
  });
}

export async function deleteGoal(id: string, userId: string) {
  return prisma.goal.delete({ where: { id, userId } });
}
