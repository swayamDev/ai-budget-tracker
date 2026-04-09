'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function TransactionForm({
  userId,
  transaction,
  onSaved,
  onCancel,
  isPro,
}: TransactionFormProps) {
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
      date: transaction
        ? new Date(transaction.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    },
  });

  const noteValue = watch('note');
  const typeValue = watch('type');
  const categoryValue = watch('category');

  async function autoCategorize() {
    if (!noteValue || !isPro) return;
    setCategorizing(true);
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteValue }),
      });
      if (!res.ok) throw new Error('Categorization failed');
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
    try {
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
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Type toggle — radio group with proper ARIA */}
      <fieldset>
        <legend className="text-sm font-medium mb-2">Transaction type</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Transaction type">
          {(['INCOME', 'EXPENSE'] as const).map((t) => (
            <label key={t} className="cursor-pointer">
              <input
                type="radio"
                value={t}
                {...register('type')}
                className="sr-only"
                aria-label={t === 'INCOME' ? 'Income transaction' : 'Expense transaction'}
              />
              <div
                aria-hidden="true"
                className={`text-center py-2 rounded-xl text-sm font-medium transition-all border ${
                  typeValue === t
                    ? t === 'INCOME'
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'bg-destructive/20 border-destructive text-destructive'
                    : 'border-border text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                {t === 'INCOME' ? '↑ Income' : '↓ Expense'}
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Amount */}
      <div>
        <Label htmlFor="tx-amount">Amount</Label>
        <Input
          id="tx-amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          {...register('amount')}
          className="mt-1.5"
          aria-describedby={errors.amount ? 'tx-amount-error' : undefined}
          aria-invalid={!!errors.amount}
        />
        {errors.amount && (
          <p id="tx-amount-error" className="text-xs text-destructive mt-1" role="alert">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Note + AI categorize */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="tx-note">Description</Label>
          {isPro && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-primary px-2"
              onClick={autoCategorize}
              disabled={categorizing || !noteValue}
              aria-label="Auto-categorize using AI"
            >
              {categorizing ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" aria-hidden="true" />
              ) : (
                <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
              )}
              Auto-categorize
            </Button>
          )}
        </div>
        <Textarea
          id="tx-note"
          placeholder="e.g. Grocery shopping at Walmart"
          {...register('note')}
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="tx-category">Category</Label>
        <Select
          value={categoryValue}
          onValueChange={(v) => setValue('category', v, { shouldValidate: true })}
        >
          <SelectTrigger
            id="tx-category"
            className="mt-1.5"
            aria-label="Select transaction category"
            aria-describedby={errors.category ? 'tx-category-error' : undefined}
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
          <p id="tx-category-error" className="text-xs text-destructive mt-1" role="alert">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="tx-date">Date</Label>
        <Input
          id="tx-date"
          type="date"
          {...register('date')}
          className="mt-1.5"
          aria-describedby={errors.date ? 'tx-date-error' : undefined}
          aria-invalid={!!errors.date}
        />
        {errors.date && (
          <p id="tx-date-error" className="text-xs text-destructive mt-1" role="alert">
            {errors.date.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
          )}
          {transaction ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
}
