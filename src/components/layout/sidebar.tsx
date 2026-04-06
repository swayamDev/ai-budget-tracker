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
  { title: 'Dashboard',     href: '/dashboard',    icon: LayoutDashboard },
  { title: 'Transactions',  href: '/transactions', icon: ArrowLeftRight },
  { title: 'Budget',        href: '/budget',       icon: Wallet },
  { title: 'Goals',         href: '/goals',        icon: Target },
  { title: 'AI Insights',   href: '/ai-chat',      icon: MessageSquare },
  { title: 'Settings',      href: '/settings',     icon: Settings },
];

export default function Sidebar({ user }: { user: UserWithSubscription }) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const isPro = user.subscription?.plan === 'PRO';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40',
          /* Mobile: absolute, Desktop: relative */
          'max-md:absolute max-md:h-full max-md:shadow-2xl',
          sidebarOpen ? 'w-64' : 'w-0 md:w-16 overflow-hidden md:overflow-visible'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-glow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="ml-3 overflow-hidden whitespace-nowrap animate-fade-in">
              <span className="font-display font-bold text-base text-sidebar-foreground">
                Fintrak AI
              </span>
              <span className="block text-[10px] text-sidebar-foreground/50 uppercase tracking-widest font-medium">
                Finance Manager
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                )}
                <item.icon
                  className={cn(
                    'w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-primary' : ''
                  )}
                />
                {sidebarOpen && (
                  <span className="whitespace-nowrap">{item.title}</span>
                )}
                {/* Tooltip for collapsed mode */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover border border-border rounded-lg text-xs font-medium text-foreground shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Plan badge */}
        {sidebarOpen && (
          <div className="m-3 p-3.5 rounded-xl bg-sidebar-accent border border-sidebar-border animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-sidebar-foreground">
                {isPro ? '✦ Pro Plan' : 'Free Plan'}
              </span>
            </div>
            {!isPro && (
              <Link
                href="/pricing"
                className="block w-full text-center text-xs py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-semibold"
              >
                Upgrade to Pro →
              </Link>
            )}
            {isPro && (
              <p className="text-[10px] text-sidebar-foreground/50">All features unlocked</p>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute -right-3 top-[4.5rem] w-6 h-6 rounded-full border border-border bg-background shadow-md hover:bg-secondary hidden md:flex"
        >
          <ChevronLeft
            className={cn('w-3 h-3 transition-transform duration-300', !sidebarOpen && 'rotate-180')}
          />
        </Button>
      </aside>
    </>
  );
}
