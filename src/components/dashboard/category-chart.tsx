'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getCategoryColor } from '@/lib/utils';
import type { CategoryBreakdown } from '@/types';

interface CategoryChartProps {
  data: CategoryBreakdown[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 shadow-soft border border-border text-sm">
        <p className="font-medium text-foreground">{payload[0].name}</p>
        <p className="text-muted-foreground">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ data }: CategoryChartProps) {
  const top5 = data.slice(0, 5);
  const total = top5.reduce((s, d) => s + d.value, 0);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Spending by Category</h3>
        <p className="text-xs text-muted-foreground mt-0.5">This month's breakdown</p>
      </div>

      {top5.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <p className="text-muted-foreground text-sm">No expense data yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add transactions to see breakdown</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={top5}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {top5.map((entry) => (
                  <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {top5.map((entry) => {
              const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
              return (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: getCategoryColor(entry.name) }}
                  />
                  <span className="text-xs text-muted-foreground flex-1 truncate">{entry.name}</span>
                  <span className="text-xs font-medium text-foreground">{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
