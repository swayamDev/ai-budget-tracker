'use client';

import { useState, useCallback } from 'react';
import type { Transaction } from '@/types';

export function useTransactions(initial: Transaction[]) {
  const [transactions, setTransactions] = useState<Transaction[]>(initial);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  }, []);

  const updateTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { transactions, loading, refetch, addTransaction, updateTransaction, deleteTransaction };
}
