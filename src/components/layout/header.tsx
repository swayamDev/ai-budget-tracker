'use client';

import { UserButton } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Bell, Menu, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store';
import type { UserWithSubscription } from '@/types';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budget': 'Budget',
  '/goals': 'Goals',
  '/ai-chat': 'AI Assistant',
  '/settings': 'Settings',
};

export default function Header({ user }: { user: UserWithSubscription }) {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();
  const title = PAGE_TITLES[pathname] ?? 'Dashboard';

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Mobile sidebar toggle */}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
        <Menu className="w-5 h-5" />
      </Button>

      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      <div className="flex-1" />

      {/* Search - decorative for now */}
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
        <Search className="w-5 h-5" />
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
      </Button>

      {/* User menu */}
      <UserButton
        appearance={{
          baseTheme: dark,
          elements: {
            avatarBox: 'w-8 h-8 ring-2 ring-border hover:ring-primary transition-all',
          },
        }}
        afterSignOutUrl="/"
      />
    </header>
  );
}
