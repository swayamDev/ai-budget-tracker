import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

interface TransactionFilters {
  type: 'ALL' | 'INCOME' | 'EXPENSE';
  category: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

interface TransactionFilterState {
  filters: TransactionFilters;
  setFilter: <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => void;
  resetFilters: () => void;
}

const defaultFilters: TransactionFilters = {
  type: 'ALL',
  category: '',
  search: '',
  dateFrom: '',
  dateTo: '',
};

export const useTransactionFilters = create<TransactionFilterState>((set) => ({
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
