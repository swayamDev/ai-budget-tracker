'use client';

import { useState } from 'react';
import { Plus, Target, CheckCircle2, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatCurrency, getPercentage } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import type { Goal } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  targetAmount: z.coerce.number().positive('Enter a positive amount'),
  currentAmount: z.coerce.number().min(0).optional(),
  deadline: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface GoalsClientProps {
  goals: Goal[];
  userId: string;
  currency: string;
}

export default function GoalsClient({ goals: initial, userId, currency }: GoalsClientProps) {
  const [goals, setGoals] = useState<Goal[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [addingAmount, setAddingAmount] = useState<{ id: string; value: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) as Resolver<FormData> });

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });
      if (!res.ok) {
        toast({ title: 'Failed to create goal', variant: 'destructive' });
        return;
      }
      const saved = await res.json();
      setGoals((prev) => [saved, ...prev]);
      toast({ title: 'Goal created!' });
      reset();
      setShowForm(false);
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    }
  }

  async function handleDelete(id: string, title: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast({ title: `"${title}" goal deleted` });
    } catch {
      toast({ title: 'Failed to delete goal', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  }

  async function handleAddAmount(id: string) {
    const amount = parseFloat(addingAmount?.value ?? '0');
    if (!amount || amount <= 0) return;
    try {
      const res = await fetch(`/api/goals/${id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        toast({ title: 'Failed to update goal', variant: 'destructive' });
        return;
      }
      const updated = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      setAddingAmount(null);
      toast({ title: `Added ${formatCurrency(amount, currency)} to goal!` });
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    }
  }

  const completed = goals.filter((g) => g.isCompleted).length;
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Savings Goals</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {goals.length} goals • {completed} completed
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
          New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Saved</p>
          <p className="text-xl font-bold text-accent">{formatCurrency(totalSaved, currency)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Target</p>
          <p className="text-xl font-bold">{formatCurrency(totalTarget, currency)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Completed</p>
          <p className="text-xl font-bold text-primary">
            {completed} / {goals.length}
          </p>
        </div>
      </div>

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <h3 className="font-semibold text-lg mb-2">No goals yet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Set savings goals and track your progress
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Create Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct = getPercentage(goal.currentAmount, goal.targetAmount);
            return (
              <div
                key={goal.id}
                className={`glass rounded-2xl p-5 relative group transition-all hover:bg-white/10 ${goal.isCompleted ? 'border-accent/30' : ''}`}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(goal.id, goal.title)}
                  disabled={deleting === goal.id}
                  aria-label={`Delete "${goal.title}" goal`}
                >
                  {deleting === goal.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </Button>

                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${goal.isCompleted ? 'bg-accent/20' : 'bg-primary/15'}`}
                    aria-hidden="true"
                  >
                    {goal.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    ) : (
                      <Target className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm pr-6">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                    {goal.deadline && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due:{' '}
                        <time dateTime={new Date(goal.deadline).toISOString()}>
                          {new Date(goal.deadline).toLocaleDateString()}
                        </time>
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                  <div
                    className="h-2 bg-secondary rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${goal.title} progress: ${pct}%`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${goal.isCompleted ? 'bg-accent' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{pct}% complete</p>
                </div>

                {/* Add amount */}
                {!goal.isCompleted &&
                  (addingAmount !== null && addingAmount.id === goal.id ? (
                    <div className="flex gap-2 mt-3">
                      <Label htmlFor={`add-amount-${goal.id}`} className="sr-only">
                        Amount to add
                      </Label>
                      <Input
                        id={`add-amount-${goal.id}`}
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Amount"
                        value={addingAmount.value}
                        autoFocus
                        onChange={(e) => setAddingAmount({ id: goal.id, value: e.target.value })}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddAmount(goal.id);
                          if (e.key === 'Escape') setAddingAmount(null);
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 shrink-0"
                        onClick={() => handleAddAmount(goal.id)}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 shrink-0"
                        onClick={() => setAddingAmount(null)}
                        aria-label="Cancel adding amount"
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 h-8 text-xs"
                      onClick={() => setAddingAmount({ id: goal.id, value: '' })}
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                      Add Savings
                    </Button>
                  ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Form dialog */}
      <Dialog
        open={showForm}
        onOpenChange={(v) => {
          setShowForm(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>New Savings Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input
                id="goal-title"
                placeholder="e.g. Emergency Fund"
                {...register('title')}
                className="mt-1.5"
                aria-describedby={errors.title ? 'goal-title-error' : undefined}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p id="goal-title-error" className="text-xs text-destructive mt-1" role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="goal-description">Description (optional)</Label>
              <Textarea
                id="goal-description"
                placeholder="Why is this goal important?"
                {...register('description')}
                rows={2}
                className="mt-1.5 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="goal-target">Target Amount</Label>
                <Input
                  id="goal-target"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="5000"
                  {...register('targetAmount')}
                  className="mt-1.5"
                  aria-describedby={errors.targetAmount ? 'goal-target-error' : undefined}
                  aria-invalid={!!errors.targetAmount}
                />
                {errors.targetAmount && (
                  <p id="goal-target-error" className="text-xs text-destructive mt-1" role="alert">
                    {errors.targetAmount.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="goal-current">Current Savings</Label>
                <Input
                  id="goal-current"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  {...register('currentAmount')}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="goal-deadline">Deadline (optional)</Label>
              <Input
                id="goal-deadline"
                type="date"
                {...register('deadline')}
                className="mt-1.5"
              />
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
                Create Goal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
