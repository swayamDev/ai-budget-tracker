import { Suspense } from 'react';
import { getOrCreateUser } from '@/lib/db/user';
import { getDashboardStats, getMonthlyData, getCategoryBreakdown, getTransactions } from '@/lib/db/transactions';
import { getBudgetWithSpending } from '@/lib/db/budget';
import { getGoals } from '@/lib/db/goals';
import StatCards from '@/components/dashboard/stat-cards';
import MoneyFlowChart from '@/components/dashboard/money-flow-chart';
import CategoryChart from '@/components/dashboard/category-chart';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import BudgetOverview from '@/components/dashboard/budget-overview';
import GoalsWidget from '@/components/dashboard/goals-widget';
import AIInsightPanel from '@/components/dashboard/ai-insight-panel';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const [stats, monthlyData, categoryData, budgets, goals, recentTx] = await Promise.all([
    getDashboardStats(user.id),
    getMonthlyData(user.id, 6),
    getCategoryBreakdown(user.id),
    getBudgetWithSpending(user.id),
    getGoals(user.id),
    getTransactions(user.id, { limit: 5 }),
  ]);

  const isPro = user.subscription?.plan === 'PRO';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold">
          Good {getGreeting()},{' '}
          <span className="text-gradient">{user.name?.split(' ')[0] ?? 'there'}</span> 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <StatCards stats={stats} currency={user.currency} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MoneyFlowChart data={monthlyData} />
        </div>
        <CategoryChart data={categoryData} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentTransactions transactions={recentTx} currency={user.currency} />
          <BudgetOverview budgets={budgets.slice(0, 4)} />
        </div>
        <div className="space-y-6">
          <GoalsWidget goals={goals.slice(0, 3)} />
          <AIInsightPanel
            transactions={stats.transactions}
            isPro={isPro}
          />
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
