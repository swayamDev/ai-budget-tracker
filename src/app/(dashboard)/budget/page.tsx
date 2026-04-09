import { getOrCreateUser } from '@/lib/db/user';
import { getBudgetWithSpending } from '@/lib/db/budget';
import BudgetClient from './client';

export const metadata = { title: 'Budget' };

export default async function BudgetPage() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const budgets = await getBudgetWithSpending(user.id);

  return (
    <BudgetClient
      budgets={budgets}
      userId={user.id}
      currency={user.currency}
    />
  );
}
