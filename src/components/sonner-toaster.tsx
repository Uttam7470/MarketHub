'use client';

import { Toaster } from '@/lib/sonner';

export function SonnerToaster() {
  return <Toaster position="top-right" richColors closeButton duration={4000} />;
}