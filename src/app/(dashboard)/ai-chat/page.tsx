import { getOrCreateUser } from '@/lib/db/user';
import { getDashboardStats } from '@/lib/db/transactions';
import AIChatClient from './client';

export const metadata = { title: 'AI Assistant' };

export default async function AIChatPage() {
  const user = await getOrCreateUser();
  if (!user) return null;
  const stats = await getDashboardStats(user.id);
  return (
    <AIChatClient
      isPro={user.subscription?.plan === 'PRO'}
      financialContext={{ income: stats.income, expense: stats.expense, balance: stats.balance, recentTransactions: stats.transactions }}
    />
  );
}
