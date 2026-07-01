'use client';

import { useEffect } from 'react';
import { useAuthStore, useNavigationStore } from '@/stores';
import CustomerApp from '@/components/customer/CustomerApp';
import VendorApp from '@/components/vendor/VendorApp';
import AdminApp from '@/components/admin/AdminApp';

export default function Home() {
  const { appView } = useNavigationStore();
  const { user, isAuthenticated } = useAuthStore();
  const { setAppView, setVendorView, setAdminView } = useNavigationStore();

  // Redirect based on role after login
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN' && appView !== 'admin') {
        setAppView('admin');
        setAdminView('admin-dashboard');
      } else if (user.role === 'VENDOR' && appView !== 'vendor') {
        setAppView('vendor');
        setVendorView('vendor-dashboard');
      }
    }
  }, [isAuthenticated, user, appView, setAppView, setAdminView, setVendorView]);

  // Portal switcher links shown on login page
  switch (appView) {
    case 'vendor':
      return <VendorApp />;
    case 'admin':
      return <AdminApp />;
    default:
      return <CustomerApp />;
  }
}