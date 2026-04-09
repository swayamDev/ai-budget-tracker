import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), 'MMM dd');
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function getPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((value / total) * 100), 100);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Home',
  'Salary',
  'Business',
  'Investment',
  'Gift',
  'Other',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#6366F1',
  Transportation: '#22C55E',
  Shopping: '#F59E0B',
  Entertainment: '#EC4899',
  'Bills & Utilities': '#14B8A6',
  Healthcare: '#EF4444',
  Education: '#8B5CF6',
  Travel: '#06B6D4',
  'Personal Care': '#F97316',
  Home: '#84CC16',
  Salary: '#10B981',
  Business: '#3B82F6',
  Investment: '#A855F7',
  Gift: '#FB7185',
  Other: '#6B7280',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#6B7280';
}

export function getCurrentMonth(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function getMonthName(month: number): string {
  return format(new Date(2024, month - 1, 1), 'MMMM');
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
