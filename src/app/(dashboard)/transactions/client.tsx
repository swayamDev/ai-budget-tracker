'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Download, ArrowUpRight, ArrowDownRight, Trash2, Edit2, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatDate, getCategoryColor, CATEGORIES } from '@/lib/utils';
import TransactionForm from '@/components/transactions/transaction-form';
import { useToast } from '@/components/ui/use-toast';
import type { Transaction } from '@/types';

interface TransactionsClientProps {
  transactions: Transaction[];
  userId: string;
  currency: string;
  isPro: boolean;
}

export default function TransactionsClient({ transactions: initial, userId, currency, isPro }: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = search === '' ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        (t.note ?? '').toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchCat = categoryFilter === 'ALL' || t.category === categoryFilter;
      return matchSearch && matchType && matchCat;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const totals = useMemo(() => {
    const income = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [filtered]);

  const hasActiveFilters = typeFilter !== 'ALL' || categoryFilter !== 'ALL' || search !== '';

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Transaction deleted' });
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved(tx: Transaction, isEdit: boolean) {
    if (isEdit) {
      setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t));
    } else {
      setTransactions(prev => [tx, ...prev]);
    }
    setShowForm(false);
    setEditingTx(null);
  }

  function exportCSV() {
    const rows = [
      ['Date', 'Type', 'Category', 'Amount', 'Note'],
      ...filtered.map(t => [formatDate(t.date), t.type, t.category, t.amount.toString(), t.note ?? ''])
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setSearch('');
    setTypeFilter('ALL');
    setCategoryFilter('ALL');
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{transactions.length} total records</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isPro && (
            <Button variant="outline" size="sm" onClick={exportCSV} className="hidden sm:flex">
              <Download className="w-4 h-4 mr-1.5" /> Export CSV
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => { setEditingTx(null); setShowForm(true); }}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Income', value: totals.income, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
          { label: 'Expenses', value: totals.expense, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
          {
            label: 'Net',
            value: totals.income - totals.expense,
            color: totals.income - totals.expense >= 0 ? 'text-accent' : 'text-destructive',
            bg: totals.income - totals.expense >= 0 ? 'bg-accent/10' : 'bg-destructive/10',
            border: totals.income - totals.expense >= 0 ? 'border-accent/20' : 'border-destructive/20',
          },
        ].map(card => (
          <div key={card.label} className={`glass rounded-xl p-3 md:p-4 border ${card.border}`}>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-base md:text-xl font-bold ${card.color} tabular truncate`}>
              {formatCurrency(card.value, currency)}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-3 md:p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-transparent h-9 text-sm"
            />
          </div>
          <Button
            variant={showFilters ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowFilters(v => !v)}
            className="shrink-0 h-9 gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 h-9 text-muted-foreground gap-1">
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

        {/* Expandable filter row */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 pt-1 animate-fade-in">
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="w-36 h-8 bg-secondary/50 border-transparent text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44 h-8 bg-secondary/50 border-transparent text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground self-center ml-auto">
              {filtered.length} of {transactions.length} results
            </span>
          </div>
        )}
      </div>

      {/* Transaction list */}
      <div className="glass rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-secondary mx-auto flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No transactions found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your filters or add a new transaction</p>
            <Button variant="ghost" size="sm" className="mt-3 text-primary" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Transaction
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Desktop header */}
            <div className="hidden md:grid grid-cols-[1fr_120px_100px_80px] gap-4 px-5 py-2.5 bg-secondary/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transaction</span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Amount</span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</span>
            </div>

            {filtered.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 hover:bg-secondary/20 transition-colors group"
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: getCategoryColor(t.category) + '18' }}
                >
                  {t.type === 'INCOME'
                    ? <ArrowUpRight className="w-4 h-4" style={{ color: getCategoryColor(t.category) }} />
                    : <ArrowDownRight className="w-4 h-4" style={{ color: getCategoryColor(t.category) }} />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {t.note || t.category}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                      style={{ background: getCategoryColor(t.category) + '18', color: getCategoryColor(t.category) }}
                    >
                      {t.category}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <p className={`text-sm font-bold shrink-0 tabular ${t.type === 'INCOME' ? 'text-accent' : 'text-destructive'}`}>
                  {t.type === 'INCOME' ? '+' : '−'}{formatCurrency(t.amount, currency)}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-foreground"
                    onClick={() => { setEditingTx(t); setShowForm(true); }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Dialog */}
      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditingTx(null); }}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-bold">
              {editingTx ? 'Edit Transaction' : 'New Transaction'}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            userId={userId}
            transaction={editingTx}
            onSaved={handleSaved}
            onCancel={() => { setShowForm(false); setEditingTx(null); }}
            isPro={isPro}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
