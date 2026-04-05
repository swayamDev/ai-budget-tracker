import { getOrCreateUser } from '@/lib/db/user';
import { getTransactions } from '@/lib/db/transactions';
import TransactionsClient from './client';

export const metadata = { title: 'Transactions' };

export default async function TransactionsPage() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const transactions = await getTransactions(user.id);

  return (
    <TransactionsClient
      transactions={transactions}
      userId={user.id}
      currency={user.currency}
      isPro={user.subscription?.plan === 'PRO'}
    />
  );
}
