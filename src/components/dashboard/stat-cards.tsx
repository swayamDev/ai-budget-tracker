'use client';

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface StatCardsProps {
  stats: DashboardStats;
  currency?: string;
}

export default function StatCards({ stats, currency = 'USD' }: StatCardsProps) {
  const savingsRate = stats.income > 0 ? ((stats.income - stats.expense) / stats.income) * 100 : 0;

  const cards = [
    {
      title: 'Total Balance',
      value: formatCurrency(stats.balance, currency),
      icon: Wallet,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/15',
      change: null,
      desc: 'Current net balance',
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(stats.income, currency),
      icon: TrendingUp,
      iconColor: 'text-accent',
      iconBg: 'bg-accent/15',
      change: null,
      desc: 'This month',
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(stats.expense, currency),
      icon: TrendingDown,
      iconColor: 'text-destructive',
      iconBg: 'bg-destructive/15',
      change: null,
      desc: 'This month',
    },
    {
      title: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      iconColor: 'text-warning',
      iconBg: 'bg-warning/15',
      change: null,
      desc: 'Of total income',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="glass rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
            {card.title}
          </p>
          <p className="text-2xl font-bold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}
