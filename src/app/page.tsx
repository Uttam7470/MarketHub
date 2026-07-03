'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore, useNavigationStore } from '@/stores';
import { SonnerToaster } from '@/components/sonner-toaster';

const CustomerApp = dynamic(() => import('@/components/customer/CustomerApp'), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>,
  ssr: false,
});

const VendorApp = dynamic(() => import('@/components/vendor/VendorApp'), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>,
  ssr: false,
});

const AdminApp = dynamic(() => import('@/components/admin/AdminApp'), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>,
  ssr: false,
});

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

  return (
    <>
      {/* Portal switcher links shown on login page */}
      {appView === 'vendor' && <VendorApp />}
      {appView === 'admin' && <AdminApp />}
      {appView !== 'vendor' && appView !== 'admin' && <CustomerApp />}
      <SonnerToaster />
    </>
  );
}