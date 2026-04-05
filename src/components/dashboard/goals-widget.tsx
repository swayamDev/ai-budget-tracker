import Link from 'next/link';
import { ArrowRight, Target, CheckCircle2 } from 'lucide-react';
import { formatCurrency, getPercentage } from '@/lib/utils';
import type { Goal } from '@/types';

interface GoalsWidgetProps {
  goals: Goal[];
}

export default function GoalsWidget({ goals }: GoalsWidgetProps) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Savings Goals</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Track your progress</p>
        </div>
        <Link
          href="/goals"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          All goals <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-6">
          <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No goals yet</p>
          <Link href="/goals" className="text-xs text-primary mt-2 block hover:underline">
            Set your first goal →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = getPercentage(goal.currentAmount, goal.targetAmount);
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  {goal.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  ) : (
                    <Target className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                  <p className="text-sm font-medium text-foreground flex-1 truncate">{goal.title}</p>
                  <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${goal.isCompleted ? 'bg-accent' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${goal.currentAmount.toLocaleString()}</span>
                  <span>${goal.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
