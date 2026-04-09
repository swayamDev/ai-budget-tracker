import { getOrCreateUser } from '@/lib/db/user';
import SettingsClient from './client';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const user = await getOrCreateUser();
  if (!user) return null;
  return <SettingsClient user={user} />;
}
