'use client';

import { useState } from 'react';
import { Plus, Wallet, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatCurrency, CATEGORIES, getCategoryColor, getCurrentMonth, getMonthName } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import type { BudgetWithSpending } from '@/types';

const schema = z.object({
  category: z.string().min(1),
  limitAmount: z.coerce.number().positive(),
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
  const overBudgetCount = budgets.filter(b => b.isOverBudget).length;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId, month, year }),
    });
    if (!res.ok) { toast({ title: 'Failed to create budget', variant: 'destructive' }); return; }
    const saved = await res.json();
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.id === saved.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = { ...saved, spent: prev[idx].spent, percentage: prev[idx].percentage, remaining: prev[idx].remaining, isOverBudget: prev[idx].isOverBudget }; return n; }
      return [...prev, { ...saved, spent: 0, percentage: 0, remaining: saved.limitAmount, isOverBudget: false }];
    });
    toast({ title: 'Budget saved!' });
    reset();
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast({ title: 'Budget deleted' });
    } catch { toast({ title: 'Failed to delete', variant: 'destructive' }); }
    finally { setDeleting(null); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget</h2>
          <p className="text-muted-foreground text-sm mt-1">{getMonthName(month)} {year} spending limits</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Budget
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
          <p className="text-xl font-bold">{formatCurrency(totalLimit, currency)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
          <p className={`text-xl font-bold ${totalSpent > totalLimit ? 'text-destructive' : 'text-foreground'}`}>{formatCurrency(totalSpent, currency)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Over Budget</p>
          <p className={`text-xl font-bold ${overBudgetCount > 0 ? 'text-destructive' : 'text-accent'}`}>{overBudgetCount} categories</p>
        </div>
      </div>

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No budgets yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Set spending limits to stay on track</p>
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1.5" />Create Budget</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <div key={budget.id} className="glass rounded-2xl p-5 hover:bg-white/10 transition-all group relative">
              <Button
                variant="ghost" size="icon"
                className="absolute top-3 right-3 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(budget.id)}
                disabled={deleting === budget.id}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: getCategoryColor(budget.category) + '20' }}>
                  {budget.isOverBudget ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <CheckCircle className="w-5 h-5" style={{ color: getCategoryColor(budget.category) }} />}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{budget.category}</h4>
                  <p className={`text-xs ${budget.isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {budget.isOverBudget ? `$${(budget.spent - budget.limitAmount).toFixed(0)} over` : `$${budget.remaining.toFixed(0)} left`}
                  </p>
                </div>
              </div>
              <Progress value={budget.percentage} className="h-2 mb-3" indicatorClassName={budget.isOverBudget ? 'bg-destructive' : budget.percentage > 80 ? 'bg-warning' : undefined} />
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{formatCurrency(budget.spent, currency)}</span>
                <span className="text-muted-foreground">of {formatCurrency(budget.limitAmount, currency)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader><DialogTitle>Create Budget</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select onValueChange={v => setValue('category', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="limitAmount">Monthly Limit ($)</Label>
              <Input id="limitAmount" type="number" step="0.01" placeholder="500.00" {...register('limitAmount')} className="mt-1.5" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
