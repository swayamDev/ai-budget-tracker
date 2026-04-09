'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('[PageError]', error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6"
    >
      <div className="w-12 h-12 rounded-2xl bg-destructive/15 flex items-center justify-center mb-4" aria-hidden="true">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Failed to load this page</h2>
      <p className="text-muted-foreground text-sm mb-5 max-w-xs">
        Something went wrong. Your data is safe — please try refreshing.
      </p>
      <Button type="button" onClick={reset} size="sm">
        <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
