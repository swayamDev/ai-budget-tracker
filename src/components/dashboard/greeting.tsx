'use client';

import { useMemo } from 'react';
import Link from 'next/link';

interface DashboardGreetingProps {
  firstName: string;
  isPro: boolean;
}

/**
 * Isolated client component for time-sensitive greeting.
 * Keeping Date() calls client-side prevents RSC hydration mismatches
 * when the server timezone differs from the user's browser.
 */
export function DashboardGreeting({ firstName, isPro }: DashboardGreetingProps) {
  const { greeting, dateStr } = useMemo(() => {
    const hour = new Date().getHours();
    const g = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const d = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    return { greeting: g, dateStr: d };
  }, []);

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">
          Good {greeting},{' '}
          <span className="text-gradient">{firstName}</span> 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">{dateStr}</p>
      </div>
      {!isPro && (
        <Link
          href="/pricing"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors shrink-0"
        >
          ✦ Upgrade to Pro
        </Link>
      )}
    </div>
  );
}
