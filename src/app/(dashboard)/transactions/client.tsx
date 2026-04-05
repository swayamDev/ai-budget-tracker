'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, ArrowUpRight, ArrowDownRight, Trash2, Edit2 } from 'lucide-react';
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
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = search === '' || t.category.toLowerCase().includes(search.toLowerCase()) || (t.note ?? '').toLowerCase().includes(search.toLowerCase());
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
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-muted-foreground text-sm mt-1">{transactions.length} total transactions</p>
        </div>
        <div className="flex items-center gap-2">
          {isPro && (
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
          )}
          <Button onClick={() => { setEditingTx(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Income', value: totals.income, color: 'text-accent' },
          { label: 'Total Expenses', value: totals.expense, color: 'text-destructive' },
          { label: 'Net', value: totals.income - totals.expense, color: totals.income - totals.expense >= 0 ? 'text-accent' : 'text-destructive' },
        ].map(card => (
          <div key={card.label} className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{formatCurrency(card.value, currency)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-transparent h-9" />
        </div>
        <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
          <SelectTrigger className="w-36 h-9 bg-secondary/50 border-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44 h-9 bg-secondary/50 border-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No transactions found</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add your first transaction
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: getCategoryColor(t.category) + '20' }}>
                  {t.type === 'INCOME'
                    ? <ArrowUpRight className="w-4 h-4" style={{ color: getCategoryColor(t.category) }} />
                    : <ArrowDownRight className="w-4 h-4" style={{ color: getCategoryColor(t.category) }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.note || t.category}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: getCategoryColor(t.category) + '20', color: getCategoryColor(t.category) }}>
                      {t.category}
                    </span>
                  </div>
                </div>
                <p className={`text-sm font-bold flex-shrink-0 ${t.type === 'INCOME' ? 'text-accent' : 'text-destructive'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                </p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => { setEditingTx(t); setShowForm(true); }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)} disabled={deleting === t.id}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form dialog */}
      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditingTx(null); }}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingTx ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
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
