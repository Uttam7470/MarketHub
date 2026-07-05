'use client';

import { toast } from '@/lib/sonner';
import { Star, StarHalf } from 'lucide-react';
import { useAuthStore, useNavigationStore } from '@/stores';

export const formatCurrency = (price: number | undefined | null) => '₹' + (price ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const discountPercent = (price: number, compare?: number | null) => compare ? Math.round(((compare - price) / compare) * 100) : 0;

export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore();
  const { navigateTo } = useNavigationStore();
  return (action: string) => {
    if (!isAuthenticated) {
      toast.warning('Login required', { description: `Please log in to ${action}.` });
      navigateTo('login');
      return false;
    }
    return true;
  };
}

export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Star key={i} className="fill-amber-400 text-amber-400" size={size} />);
    } else if (i - 0.5 <= rating) {
      stars.push(<StarHalf key={i} className="fill-amber-400 text-amber-400" size={size} />);
    } else {
      stars.push(<Star key={i} className="text-muted-foreground/30" size={size} />);
    }
  }
  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}