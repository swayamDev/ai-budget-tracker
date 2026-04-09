'use client';

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface StatCardsProps {
  stats: DashboardStats;
  currency?: string;
}

export default function StatCards({ stats, currency = 'USD' }: StatCardsProps) {
  const savingsRate = stats.income > 0
    ? ((stats.income - stats.expense) / stats.income) * 100
    : 0;

  const cards = [
    {
      title: 'Net Balance',
      value: formatCurrency(stats.balance, currency),
      icon: Wallet,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/15',
      barColor: 'bg-primary',
      desc: 'Current net balance',
      trend: null,
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(stats.income, currency),
      icon: TrendingUp,
      iconColor: 'text-accent',
      iconBg: 'bg-accent/15',
      barColor: 'bg-accent',
      desc: 'This month',
      trend: 'up' as const,
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(stats.expense, currency),
      icon: TrendingDown,
      iconColor: 'text-destructive',
      iconBg: 'bg-destructive/15',
      barColor: 'bg-destructive',
      desc: 'This month',
      trend: 'down' as const,
    },
    {
      title: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      iconColor: 'text-warning',
      iconBg: 'bg-warning/15',
      barColor: 'bg-warning',
      desc: 'Of total income saved',
      trend: savingsRate > 20 ? 'up' as const : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 stagger">
      {cards.map((card) => (
        <div
          key={card.title}
          className="glass rounded-2xl p-4 md:p-5 hover:bg-card/80 transition-all duration-300 group animate-fade-in relative overflow-hidden"
        >
          {/* Subtle gradient accent top */}
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${card.barColor} opacity-60`} />

          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
              <card.icon className={`w-4 h-4 md:w-5 md:h-5 ${card.iconColor}`} />
            </div>
          </div>

          <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
            {card.title}
          </p>
          <p className="text-xl md:text-2xl font-bold text-foreground tabular truncate">
            {card.value}
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}
