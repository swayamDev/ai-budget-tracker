import Link from 'next/link';
import { ArrowRight, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { BudgetWithSpending } from '@/types';

interface BudgetOverviewProps {
  budgets: BudgetWithSpending[];
}

export default function BudgetOverview({ budgets }: BudgetOverviewProps) {
  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Budget Overview</h3>
          <p className="text-xs text-muted-foreground mt-0.5">This month's spending limits</p>
        </div>
        <Link
          href="/budget"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium group"
        >
          Manage <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No budgets set</p>
          <Link href="/budget" className="text-xs text-primary mt-2 block hover:underline font-medium">
            Create your first budget →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const isWarning = !budget.isOverBudget && budget.percentage > 80;
            return (
              <div key={budget.id} className="group/item">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{budget.category}</span>
                    {budget.isOverBudget && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                        <AlertTriangle className="w-2.5 h-2.5" /> Over
                      </span>
                    )}
                    {isWarning && (
                      <span className="text-[10px] font-semibold text-warning bg-warning/10 px-1.5 py-0.5 rounded-full">
                        High
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'text-sm font-semibold tabular',
                      budget.isOverBudget ? 'text-destructive' : isWarning ? 'text-warning' : 'text-foreground'
                    )}>
                      {budget.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-1.5">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      budget.isOverBudget ? 'bg-destructive' : isWarning ? 'bg-warning' : 'bg-primary'
                    )}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {budget.isOverBudget
                      ? <span className="text-destructive font-medium">{formatCurrency(budget.spent - budget.limitAmount)} over</span>
                      : <span>{formatCurrency(budget.remaining)} remaining</span>
                    }
                  </p>
                  <p className="text-xs text-muted-foreground tabular">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limitAmount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
