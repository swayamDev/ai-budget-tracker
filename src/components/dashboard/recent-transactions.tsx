import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate, getCategoryColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency?: string;
}

export default function RecentTransactions({ transactions, currency = 'USD' }: RecentTransactionsProps) {
  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your latest activity</p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium group"
        >
          View all <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No transactions yet</p>
          <Link href="/transactions" className="text-xs text-primary mt-2 block hover:underline font-medium">
            Add your first transaction →
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-secondary/40 transition-colors group cursor-default"
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: getCategoryColor(t.category) + '18' }}
              >
                {t.type === 'INCOME' ? (
                  <ArrowUpRight className="w-4 h-4" style={{ color: getCategoryColor(t.category) }} />
                ) : (
                  <ArrowDownRight className="w-4 h-4" style={{ color: getCategoryColor(t.category) }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {t.note || t.category}
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                  <span className="text-muted-foreground/30">·</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                    style={{
                      background: getCategoryColor(t.category) + '18',
                      color: getCategoryColor(t.category),
                    }}
                  >
                    {t.category}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <p className={cn(
                'text-sm font-bold shrink-0 tabular',
                t.type === 'INCOME' ? 'text-accent' : 'text-destructive'
              )}>
                {t.type === 'INCOME' ? '+' : '−'}{formatCurrency(t.amount, currency)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
