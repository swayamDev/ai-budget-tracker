'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to your error tracking service (e.g. Sentry) here
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6"
    >
      <div
        className="w-14 h-14 rounded-2xl bg-destructive/15 flex items-center justify-center mb-5"
        aria-hidden="true"
      >
        <AlertTriangle className="w-7 h-7 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        {/* Never expose raw error.message to users in production — it may leak internals */}
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground/60 mb-4 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <Button type="button" onClick={reset}>
        <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
