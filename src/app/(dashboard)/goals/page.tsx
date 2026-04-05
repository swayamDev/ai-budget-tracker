import { getOrCreateUser } from '@/lib/db/user';
import { getGoals } from '@/lib/db/goals';
import GoalsClient from './client';

export const metadata = { title: 'Goals' };

export default async function GoalsPage() {
  const user = await getOrCreateUser();
  if (!user) return null;
  const goals = await getGoals(user.id);
  return <GoalsClient goals={goals} userId={user.id} currency={user.currency} />;
}
