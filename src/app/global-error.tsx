'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            <h1 className="text-4xl font-bold mb-2">500 — Server Error</h1>
            <p className="text-gray-500 mb-8">A critical error occurred. Our team has been notified.</p>
            <Button onClick={reset} variant="outline">
              <RefreshCw size={16} className="mr-2" />Reload Page
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}