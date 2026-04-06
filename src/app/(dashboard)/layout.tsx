import { redirect } from 'next/navigation';
import { getOrCreateUser } from '@/lib/db/user';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
