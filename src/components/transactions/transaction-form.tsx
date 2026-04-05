'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CATEGORIES } from '@/lib/utils';
import type { Transaction } from '@/types';

const schema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Select a category'),
  note: z.string().optional(),
  date: z.string().min(1, 'Select a date'),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  userId: string;
  transaction?: Transaction | null;
  onSaved: (tx: Transaction, isEdit: boolean) => void;
  onCancel: () => void;
  isPro: boolean;
}

export default function TransactionForm({ userId, transaction, onSaved, onCancel, isPro }: TransactionFormProps) {
  const [categorizing, setCategorizing] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: transaction?.amount ?? undefined,
      type: transaction?.type ?? 'EXPENSE',
      category: transaction?.category ?? '',
      note: transaction?.note ?? '',
      date: transaction ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  const noteValue = watch('note');

  async function autoCategorize() {
    if (!noteValue || !isPro) return;
    setCategorizing(true);
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteValue }),
      });
      const data = await res.json();
      if (data.category) {
        setValue('category', data.category);
        toast({ title: `Categorized as: ${data.category}` });
      }
    } catch {
      toast({ title: 'Categorization failed', variant: 'destructive' });
    } finally {
      setCategorizing(false);
    }
  }

  async function onSubmit(data: FormData) {
    const url = transaction ? `/api/transactions/${transaction.id}` : '/api/transactions';
    const method = transaction ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId }),
    });

    if (!res.ok) {
      toast({ title: 'Failed to save transaction', variant: 'destructive' });
      return;
    }

    const saved = await res.json();
    toast({ title: transaction ? 'Transaction updated' : 'Transaction added' });
    onSaved(saved, !!transaction);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(['INCOME', 'EXPENSE'] as const).map(t => (
          <label key={t} className="cursor-pointer">
            <input type="radio" value={t} {...register('type')} className="sr-only" />
            <div className={`text-center py-2 rounded-xl text-sm font-medium transition-all border ${watch('type') === t ? t === 'INCOME' ? 'bg-accent/20 border-accent text-accent' : 'bg-destructive/20 border-destructive text-destructive' : 'border-border text-muted-foreground hover:bg-secondary/50'}`}>
              {t === 'INCOME' ? '↑ Income' : '↓ Expense'}
            </div>
          </label>
        ))}
      </div>

      {/* Amount */}
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount')} className="mt-1.5" />
        {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
      </div>

      {/* Note + AI categorize */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="note">Description</Label>
          {isPro && (
            <Button type="button" variant="ghost" size="sm" className="h-6 text-xs text-primary px-2" onClick={autoCategorize} disabled={categorizing || !noteValue}>
              {categorizing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
              Auto-categorize
            </Button>
          )}
        </div>
        <Textarea id="note" placeholder="e.g. Grocery shopping at Walmart" {...register('note')} rows={2} className="resize-none" />
      </div>

      {/* Category */}
      <div>
        <Label>Category</Label>
        <Select value={watch('category')} onValueChange={v => setValue('category', v)}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register('date')} className="mt-1.5" />
        {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
          {transaction ? 'Update' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
}
