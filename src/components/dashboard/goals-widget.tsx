import Link from 'next/link';
import { ArrowRight, Target, CheckCircle2, Trophy } from 'lucide-react';
import { formatCurrency, getPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Goal } from '@/types';

interface GoalsWidgetProps {
  goals: Goal[];
}

export default function GoalsWidget({ goals }: GoalsWidgetProps) {
  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Savings Goals</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Track your progress</p>
        </div>
        <Link
          href="/goals"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium group"
        >
          All goals <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">No goals yet</p>
          <Link href="/goals" className="text-xs text-primary mt-2 block hover:underline font-medium">
            Set your first goal →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = getPercentage(goal.currentAmount, goal.targetAmount);
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                    goal.isCompleted ? 'bg-accent/15' : 'bg-primary/10'
                  )}>
                    {goal.isCompleted
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                      : <Target className="w-3.5 h-3.5 text-primary" />
                    }
                  </div>
                  <p className="text-sm font-medium text-foreground flex-1 truncate">{goal.title}</p>
                  <span className={cn(
                    'text-xs font-bold shrink-0 tabular',
                    goal.isCompleted ? 'text-accent' : pct >= 75 ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      goal.isCompleted ? 'bg-accent' : 'bg-primary'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground tabular">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span className="text-muted-foreground/60">of {formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
