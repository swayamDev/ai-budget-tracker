import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate, getCategoryColor } from '@/lib/utils';
import type { Transaction } from '@/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency?: string;
}

export default function RecentTransactions({ transactions, currency = 'USD' }: RecentTransactionsProps) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your latest activity</p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No transactions yet</p>
          <Link href="/transactions" className="text-xs text-primary mt-2 block hover:underline">
            Add your first transaction →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              {/* Category color dot */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: getCategoryColor(t.category) + '20' }}
              >
                {t.type === 'INCOME' ? (
                  <ArrowUpRight className="w-4 h-4" style={{ color: getCategoryColor(t.category) }} />
                ) : (
                  <ArrowDownRight className="w-4 h-4" style={{ color: getCategoryColor(t.category) }} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {t.note || t.category}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p
                  className={`text-sm font-semibold ${
                    t.type === 'INCOME' ? 'text-accent' : 'text-destructive'
                  }`}
                >
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                </p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: getCategoryColor(t.category) + '20',
                    color: getCategoryColor(t.category),
                  }}
                >
                  {t.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
