'use client';

import { useState } from 'react';
import { Plus, Wallet, AlertTriangle, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  formatCurrency,
  CATEGORIES,
  getCategoryColor,
  getCurrentMonth,
  getMonthName,
} from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import type { BudgetWithSpending } from '@/types';

const schema = z.object({
  category: z.string().min(1, 'Select a category'),
  limitAmount: z.coerce.number().positive('Enter a positive amount'),
});
type FormData = z.infer<typeof schema>;

interface BudgetClientProps {
  budgets: BudgetWithSpending[];
  userId: string;
  currency: string;
}

export default function BudgetClient({ budgets: initial, userId, currency }: BudgetClientProps) {
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const { month, year } = getCurrentMonth();

  const totalLimit = budgets.reduce((s, b) => s + b.limitAmount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudgetCount = budgets.filter((b) => b.isOverBudget).length;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const categoryValue = watch('category');

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId, month, year }),
      });
      if (!res.ok) {
        toast({ title: 'Failed to create budget', variant: 'destructive' });
        return;
      }
      const saved = await res.json();
      setBudgets((prev) => {
        const idx = prev.findIndex((b) => b.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...saved,
            spent: prev[idx].spent,
            percentage: prev[idx].percentage,
            remaining: prev[idx].remaining,
            isOverBudget: prev[idx].isOverBudget,
          };
          return next;
        }
        return [
          ...prev,
          { ...saved, spent: 0, percentage: 0, remaining: saved.limitAmount, isOverBudget: false },
        ];
      });
      toast({ title: 'Budget saved!' });
      reset();
      setShowForm(false);
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    }
  }

  async function handleDelete(id: string, category: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      toast({ title: `"${category}" budget deleted` });
    } catch {
      toast({ title: 'Failed to delete budget', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {getMonthName(month)} {year} spending limits
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Add Budget
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4" role="list" aria-label="Budget summary">
        {[
          { label: 'Total Budget', value: formatCurrency(totalLimit, currency) },
          {
            label: 'Total Spent',
            value: formatCurrency(totalSpent, currency),
            highlight: totalSpent > totalLimit ? 'text-destructive' : 'text-foreground',
          },
          {
            label: 'Over Budget',
            value: `${overBudgetCount} categories`,
            highlight: overBudgetCount > 0 ? 'text-destructive' : 'text-accent',
          },
        ].map(({ label, value, highlight }) => (
          <div key={label} role="listitem" className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-xl font-bold ${highlight ?? ''}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <h3 className="font-semibold text-lg mb-2">No budgets yet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Set spending limits to stay on track
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Create Budget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className="glass rounded-2xl p-5 hover:bg-white/10 transition-all group relative"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(budget.id, budget.category)}
                disabled={deleting === budget.id}
                aria-label={`Delete ${budget.category} budget`}
              >
                {deleting === budget.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </Button>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: getCategoryColor(budget.category) + '20' }}
                  aria-hidden="true"
                >
                  {budget.isOverBudget ? (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  ) : (
                    <CheckCircle
                      className="w-5 h-5"
                      style={{ color: getCategoryColor(budget.category) }}
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{budget.category}</h4>
                  <p
                    className={`text-xs ${budget.isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}
                  >
                    {budget.isOverBudget
                      ? `${formatCurrency(budget.spent - budget.limitAmount, currency)} over`
                      : `${formatCurrency(budget.remaining, currency)} left`}
                  </p>
                </div>
              </div>
              <Progress
                value={budget.percentage}
                className="h-2 mb-3"
                aria-label={`${budget.category} spending: ${budget.percentage}%`}
              />
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{formatCurrency(budget.spent, currency)}</span>
                <span className="text-muted-foreground">
                  of {formatCurrency(budget.limitAmount, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Category */}
            <div>
              <Label htmlFor="budget-category">Category</Label>
              <Select
                value={categoryValue}
                onValueChange={(v) => setValue('category', v, { shouldValidate: true })}
              >
                <SelectTrigger
                  id="budget-category"
                  className="mt-1.5"
                  aria-label="Select budget category"
                  aria-describedby={errors.category ? 'budget-category-error' : undefined}
                  aria-invalid={!!errors.category}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p id="budget-category-error" className="text-xs text-destructive mt-1" role="alert">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Limit */}
            <div>
              <Label htmlFor="budget-limit">Monthly Limit</Label>
              <Input
                id="budget-limit"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="500.00"
                {...register('limitAmount')}
                className="mt-1.5"
                aria-describedby={errors.limitAmount ? 'budget-limit-error' : undefined}
                aria-invalid={!!errors.limitAmount}
              />
              {errors.limitAmount && (
                <p id="budget-limit-error" className="text-xs text-destructive mt-1" role="alert">
                  {errors.limitAmount.message}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => { setShowForm(false); reset(); }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
                )}
                Save Budget
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
