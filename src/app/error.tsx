'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Something went wrong!</h1>
          <p className="text-muted-foreground mt-2">
            We encountered an unexpected error. Please try again.
          </p>
        </div>
        <Button onClick={reset} className="bg-orange-500 hover:bg-orange-600">
          Try Again
        </Button>
        <p className="text-xs text-muted-foreground">
          Error: {error.message}
        </p>
      </div>
    </div>
  );
}