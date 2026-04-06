'use client';

import { UserButton } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Bell, Menu, Search, Sun, Moon, X, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store';
import { useTheme } from '@/components/theme-provider';
import type { UserWithSubscription } from '@/types';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budget': 'Budget',
  '/goals': 'Goals',
  '/ai-chat': 'AI Assistant',
  '/settings': 'Settings',
};

const PAGE_SUBTITLES: Record<string, string> = {
  '/dashboard': 'Your financial overview',
  '/transactions': 'Track all your money movement',
  '/budget': 'Manage your spending limits',
  '/goals': 'Work toward your milestones',
  '/ai-chat': 'Get AI-powered financial advice',
  '/settings': 'Manage your account',
};

// Mock notifications — replace with real data fetching
const NOTIFICATIONS = [
  { id: '1', type: 'warning', title: 'Budget Alert', body: 'Food & Dining is at 85% of limit', time: '5m ago', read: false },
  { id: '2', type: 'success', title: 'Goal Milestone', body: 'Emergency Fund reached 50%!', time: '2h ago', read: false },
  { id: '3', type: 'info', title: 'Monthly Summary', body: 'Your April report is ready', time: '1d ago', read: true },
];

export default function Header({ user }: { user: UserWithSubscription }) {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();
  const { theme, toggleTheme } = useTheme();
  const title = PAGE_TITLES[pathname] ?? 'Dashboard';
  const subtitle = PAGE_SUBTITLES[pathname] ?? '';

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Focus search on open
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notif-panel]')) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const filteredNav = searchQuery
    ? Object.entries(PAGE_TITLES).filter(([, label]) =>
        label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-16 border-b border-border bg-background/90 backdrop-blur-xl flex items-center px-4 md:px-6 gap-3 sticky top-0 z-40">
      {/* Mobile sidebar toggle */}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden text-muted-foreground hover:text-foreground shrink-0">
        <Menu className="w-5 h-5" />
      </Button>

      {/* Page title */}
      <div className="hidden sm:block">
        <h1 className="text-base font-semibold text-foreground leading-tight">{title}</h1>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex-1" />

      {/* Search bar (expands inline) */}
      <div className="relative flex items-center">
        {searchOpen ? (
          <div className="flex items-center gap-2 bg-secondary/70 border border-border rounded-xl px-3 py-1.5 w-64 animate-scale-in">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search pages…"
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 min-w-0"
              onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
            />
            <button onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
            {/* Dropdown results */}
            {filteredNav.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50">
                {filteredNav.map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors"
                    onClick={() => setSearchOpen(false)}
                  >
                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="text-muted-foreground hover:text-foreground"
            title="Search (press S)"
          >
            <Search className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="text-muted-foreground hover:text-foreground"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>

      {/* Notifications */}
      <div className="relative" data-notif-panel>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotifOpen(v => !v)}
          className="text-muted-foreground hover:text-foreground relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse-dot" />
          )}
        </Button>

        {/* Notification panel */}
        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                >
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                    n.type === 'warning' ? 'bg-warning' : n.type === 'success' ? 'bg-accent' : 'bg-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-border">
              <button className="text-xs text-primary hover:underline w-full text-center">
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <UserButton
        appearance={{
          baseTheme: dark,
          elements: {
            avatarBox: 'w-8 h-8 ring-2 ring-border hover:ring-primary transition-all rounded-full',
          },
        }}
        afterSignOutUrl="/"
      />
    </header>
  );
}
