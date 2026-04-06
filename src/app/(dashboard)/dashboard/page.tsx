import { Suspense } from 'next';
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
  const firstName = user.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-5 md:space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">
            Good {getGreeting()},{' '}
            <span className="text-gradient">{firstName}</span> 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {!isPro && (
          <a
            href="/pricing"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors shrink-0"
          >
            ✦ Upgrade to Pro
          </a>
        )}
      </div>

      {/* Stat cards */}
      <StatCards stats={stats} currency={user.currency} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <MoneyFlowChart data={monthlyData} />
        </div>
        <CategoryChart data={categoryData} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <RecentTransactions transactions={recentTx} currency={user.currency} />
          <BudgetOverview budgets={budgets.slice(0, 4)} />
        </div>
        <div className="space-y-4 md:space-y-6">
          <GoalsWidget goals={goals.slice(0, 3)} />
          <AIInsightPanel transactions={stats.transactions} isPro={isPro} />
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
