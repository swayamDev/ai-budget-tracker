'use client';

import { useState } from 'react';
import { Plus, Target, CheckCircle2, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatCurrency, getPercentage } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import type { Goal } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0).optional(),
  deadline: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface GoalsClientProps { goals: Goal[]; userId: string; currency: string; }

export default function GoalsClient({ goals: initial, userId, currency }: GoalsClientProps) {
  const [goals, setGoals] = useState<Goal[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [addingAmount, setAddingAmount] = useState<{ id: string; value: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId }),
    });
    if (!res.ok) { toast({ title: 'Failed to create goal', variant: 'destructive' }); return; }
    const saved = await res.json();
    setGoals(prev => [saved, ...prev]);
    toast({ title: 'Goal created!' });
    reset(); setShowForm(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      setGoals(prev => prev.filter(g => g.id !== id));
      toast({ title: 'Goal deleted' });
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
    finally { setDeleting(null); }
  }

  async function handleAddAmount(id: string) {
    const amount = parseFloat(addingAmount?.value ?? '0');
    if (!amount || amount <= 0) return;
    const res = await fetch(`/api/goals/${id}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    const updated = await res.json();
    setGoals(prev => prev.map(g => g.id === id ? updated : g));
    setAddingAmount(null);
    toast({ title: `Added ${formatCurrency(amount, currency)} to goal!` });
  }

  const completed = goals.filter(g => g.isCompleted).length;
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Savings Goals</h2>
          <p className="text-muted-foreground text-sm mt-1">{goals.length} goals • {completed} completed</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1.5" />New Goal</Button>
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
          <p className="text-xl font-bold text-primary">{completed} / {goals.length}</p>
        </div>
      </div>

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No goals yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Set savings goals and track your progress</p>
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1.5" />Create Goal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct = getPercentage(goal.currentAmount, goal.targetAmount);
            return (
              <div key={goal.id} className={`glass rounded-2xl p-5 relative group transition-all hover:bg-white/10 ${goal.isCompleted ? 'border-accent/30' : ''}`}>
                <Button
                  variant="ghost" size="icon"
                  className="absolute top-3 right-3 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(goal.id)} disabled={deleting === goal.id}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>

                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${goal.isCompleted ? 'bg-accent/20' : 'bg-primary/15'}`}>
                    {goal.isCompleted ? <CheckCircle2 className="w-5 h-5 text-accent" /> : <Target className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm pr-6">{goal.title}</h4>
                    {goal.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{goal.description}</p>}
                    {goal.deadline && <p className="text-xs text-muted-foreground mt-0.5">Due: {new Date(goal.deadline).toLocaleDateString()}</p>}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">{formatCurrency(goal.currentAmount, currency)}</span>
                    <span className="text-muted-foreground">{formatCurrency(goal.targetAmount, currency)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${goal.isCompleted ? 'bg-accent' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{pct}% complete</p>
                </div>

                {/* Add amount */}
                {!goal.isCompleted && (
                  addingAmount?.id === goal.id ? (
                    <div className="flex gap-2 mt-3">
                      <Input
                        type="number" placeholder="Amount" value={addingAmount.value} autoFocus
                        onChange={e => setAddingAmount({ id: goal.id, value: e.target.value })}
                        className="h-8 text-sm"
                      />
                      <Button size="sm" className="h-8 shrink-0" onClick={() => handleAddAmount(goal.id)}>Add</Button>
                      <Button size="sm" variant="ghost" className="h-8 shrink-0" onClick={() => setAddingAmount(null)}>✕</Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full mt-2 h-8 text-xs" onClick={() => setAddingAmount({ id: goal.id, value: '' })}>
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" />Add Savings
                    </Button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) reset(); }}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader><DialogTitle>New Savings Goal</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Goal Title</Label>
              <Input placeholder="e.g. Emergency Fund" {...register('title')} className="mt-1.5" />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea placeholder="Why is this goal important?" {...register('description')} rows={2} className="mt-1.5 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Target Amount ($)</Label>
                <Input type="number" step="0.01" placeholder="5000" {...register('targetAmount')} className="mt-1.5" />
              </div>
              <div>
                <Label>Current Savings ($)</Label>
                <Input type="number" step="0.01" placeholder="0" {...register('currentAmount')} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Deadline (optional)</Label>
              <Input type="date" {...register('deadline')} className="mt-1.5" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}Create Goal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
