import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { BudgetWithSpending } from '@/types';

interface BudgetOverviewProps {
  budgets: BudgetWithSpending[];
}

export default function BudgetOverview({ budgets }: BudgetOverviewProps) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Budget Overview</h3>
          <p className="text-xs text-muted-foreground mt-0.5">This month's spending limits</p>
        </div>
        <Link
          href="/budget"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Manage <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">No budgets set</p>
          <Link href="/budget" className="text-xs text-primary mt-2 block hover:underline">
            Create your first budget →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{budget.category}</span>
                  {budget.isOverBudget && (
                    <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${budget.isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                    ${budget.spent.toFixed(0)}
                  </span>
                  <span className="text-xs text-muted-foreground"> / ${budget.limitAmount.toFixed(0)}</span>
                </div>
              </div>
              <Progress
                value={budget.percentage}
                className="h-1.5"
                indicatorClassName={budget.isOverBudget ? 'bg-destructive' : budget.percentage > 80 ? 'bg-warning' : 'bg-primary'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {budget.isOverBudget
                  ? `$${(budget.spent - budget.limitAmount).toFixed(0)} over budget`
                  : `$${budget.remaining.toFixed(0)} remaining`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
