'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Wallet,
  Settings,
  Sparkles,
  MessageSquare,
  ChevronLeft,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import type { UserWithSubscription } from '@/types';

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { title: 'Budget', href: '/budget', icon: Wallet },
  { title: 'Goals', href: '/goals', icon: Target },
  { title: 'AI Insights', href: '/ai-chat', icon: MessageSquare },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ user }: { user: UserWithSubscription }) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const isPro = user.subscription?.plan === 'PRO';

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {sidebarOpen && (
          <span className="ml-3 font-bold text-lg text-sidebar-foreground whitespace-nowrap">
            Fintrak AI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary/15 text-primary shadow-glow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-primary' : ''
                )}
              />
              {sidebarOpen && <span className="whitespace-nowrap">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Plan badge */}
      {sidebarOpen && (
        <div className="m-3 p-3 rounded-xl bg-sidebar-accent border border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-sidebar-foreground">
              {isPro ? 'Pro Plan' : 'Free Plan'}
            </span>
          </div>
          {!isPro && (
            <Link
              href="/pricing"
              className="block w-full text-center text-xs py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium"
            >
              Upgrade to Pro →
            </Link>
          )}
        </div>
      )}

      {/* Collapse button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-background shadow-sm hover:bg-secondary"
      >
        <ChevronLeft
          className={cn('w-3 h-3 transition-transform', !sidebarOpen && 'rotate-180')}
        />
      </Button>
    </aside>
  );
}
