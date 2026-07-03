'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, useNotificationStore } from '@/stores';

export function useNotifications() {
  const { user, isAuthenticated } = useAuthStore();
  const { setUnreadCount } = useNotificationStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () =>
      fetch(`/api/notifications?userId=${user!.id}&limit=20`)
        .then((r) => r.json())
        .then((r: { success: boolean; data?: unknown[] }) => r.data || []),
    enabled: !!user?.id && isAuthenticated,
    refetchInterval: 30000, // Auto-poll every 30 seconds
  });

  const notifications = (data as Array<{ isRead: boolean }>) || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Sync unread count to the notification store so other components can react
  useEffect(() => {
    setUnreadCount(unreadCount);
  }, [unreadCount, setUnreadCount]);

  return { notifications, unreadCount, isLoading, refetch };
}