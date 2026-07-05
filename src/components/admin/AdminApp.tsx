'use client';

import React, { useState, useCallback, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/lib/sonner';
import { authToast } from '@/lib/auth-toast';
import {
  BarChart3, Users, Package, ShoppingCart, Store, DollarSign, TrendingUp,
  Settings, LogOut, Menu, X, ChevronLeft, ChevronRight, Search, Eye,
  Plus, Pencil, Trash2, CheckCircle, XCircle, AlertTriangle, Shield,
  Tag, Image, Bell, FileText, UserCog, CreditCard, PieChart, LineChart, Clock,
  RotateCcw, Wallet, Headphones, Megaphone, HelpCircle, Copy, ArrowUpRight,
  ArrowDownRight, CheckCircle2, Send, MessageSquare, Zap, CalendarDays, Star,
  ShieldCheck, FolderOpen, Sparkles, Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { useAuthStore, useNavigationStore, useNotificationStore } from '@/stores';
import { useNotifications } from '@/hooks/use-notifications';
import type { Product, Category, Brand, Vendor, Order, Coupon, Banner, AdminDashboardStats } from '@/types';

const formatCurrency = (price: number | undefined | null) => '₹' + (price ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const ConfirmContext = React.createContext<((action: { title: string; description: string; onConfirm: () => void }) => void)>(() => {});
const useConfirm = () => useContext(ConfirmContext);

// ============ ADMIN NAV ============

const ADMIN_NAV = [
  { key: 'admin-dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'admin-vendors', label: 'Vendors', icon: Store },
  { key: 'admin-categories', label: 'Categories', icon: Tag },
  { key: 'admin-brands', label: 'Brands', icon: Shield },
  { key: 'admin-products', label: 'Products', icon: Package },
  { key: 'admin-orders', label: 'Orders', icon: ShoppingCart },
  { key: 'admin-customers', label: 'Customers', icon: Users },
  { key: 'admin-coupons', label: 'Coupons', icon: CreditCard },
  { key: 'admin-banners', label: 'Banners', icon: Image },
  { key: 'admin-reports', label: 'Reports', icon: TrendingUp },
  { key: 'admin-returns', label: 'Returns', icon: RotateCcw },
  { key: 'admin-payouts', label: 'Payouts', icon: Wallet },
  { key: 'admin-vendor-wallets', label: 'Vendor Wallets', icon: Wallet },
  { key: 'admin-analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'admin-support', label: 'Support', icon: Headphones },
  { key: 'admin-marketing', label: 'Marketing', icon: Megaphone },
  { key: 'admin-faq', label: 'FAQ', icon: HelpCircle },
  { key: 'admin-roles', label: 'Roles', icon: UserCog },
  { key: 'admin-settings', label: 'Settings', icon: Settings },
];

// ============ ADMIN SIDEBAR ============

function AdminSidebar() {
  const { adminView, setAdminView, setAppView } = useNavigationStore();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside role="navigation" aria-label="Admin panel navigation" className={`${collapsed ? 'w-16' : 'w-64'} border-r bg-card flex flex-col transition-all duration-300 hidden lg:flex`}>
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold shrink-0">
          <Shield size={20} />
        </div>
        {!collapsed && <div className="min-w-0"><p className="font-semibold text-sm truncate">Super Admin</p><p className="text-xs text-muted-foreground truncate">{user?.email}</p></div>}
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-1">
          {ADMIN_NAV.map(item => (
            <TooltipProvider key={item.key} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={adminView === item.key ? 'secondary' : 'ghost'} size="sm" aria-current={adminView === item.key ? 'page' : undefined} className={`w-full justify-start gap-3 ${collapsed ? 'justify-center px-0' : ''}`} onClick={() => setAdminView(item.key as any)}>
                    <item.icon size={18} />
                    {!collapsed && <span>{item.label}</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-3 border-t space-y-1">
        <Button variant="ghost" size="sm" className={`w-full justify-start gap-3 relative ${adminView === 'admin-notifications' ? 'bg-secondary' : ''} ${collapsed ? 'justify-center px-0' : ''}`} onClick={() => setAdminView('admin-notifications')}>
          <Bell size={18} />
          {!collapsed && <span>Notifications</span>}
          {unreadCount > 0 && <Badge className="ml-auto h-5 min-w-5 rounded-full px-1.5 flex items-center justify-center text-[10px] bg-red-500 text-white">{unreadCount}</Badge>}
        </Button>
        <Button variant="ghost" size="sm" className={`w-full justify-start gap-3 text-muted-foreground ${collapsed ? 'justify-center px-0' : ''}`} onClick={() => { logout(); setAppView('customer'); authToast.logoutSuccess(); }}>
          <LogOut size={18} />{!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}

function AdminMobileHeader() {
  const { user, logout } = useAuthStore();
  const { adminView, setAdminView, setAppView } = useNavigationStore();
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotificationStore();

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-background border-b px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}><Menu size={20} /></Button>
        <Shield size={20} className="text-amber-600" />
        <span className="font-bold">Admin Panel</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" onClick={() => setAdminView('admin-notifications')}>
          <Bell size={20} />
          {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-2 border-background">{unreadCount}</Badge>}
        </Button>
        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-amber-100 text-amber-600">{user?.name?.[0]}</AvatarFallback></Avatar>
      </div>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r p-4 space-y-2 overflow-y-auto">
            <div className="flex items-center justify-between mb-4"><span className="font-bold">Admin Menu</span><Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X size={20} /></Button></div>
            {ADMIN_NAV.map(item => (
              <Button key={item.key} variant={adminView === item.key ? 'secondary' : 'ghost'} className="w-full justify-start gap-3" onClick={() => { setAdminView(item.key as any); setOpen(false); }}>
                <item.icon size={18} />{item.label}
              </Button>
            ))}
            <Separator />
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" onClick={() => { authToast.logoutSuccess(); logout(); setAppView('customer'); }}><LogOut size={18} />Logout</Button>
          </div>
        </div>
      )}
    </header>
  );
}

// ============ ADMIN DASHBOARD ============

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => fetch('/api/admin/dashboard').then(r => r.json()).then((r: any) => r.data ?? {}),
  });

  if (isLoading) return <div className="p-6 space-y-4">{Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>;

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data?.totalRevenue || 0), icon: DollarSign, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'Platform Earnings', value: formatCurrency(data?.platformEarnings || 0), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Total Orders', value: String(data?.totalOrders || 0), icon: ShoppingCart, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Total Products', value: String(data?.totalProducts || 0), icon: Package, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Customers', value: String(data?.totalCustomers || 0), icon: Users, color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
    { label: 'Active Vendors', value: String(data?.totalVendors || 0), icon: Store, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="text-muted-foreground">Platform overview and analytics</p></div>
        {data?.pendingVendors > 0 && (
          <Badge variant="outline" className="text-amber-600 border-amber-500 cursor-pointer" onClick={() => useNavigationStore.getState().setAdminView('admin-vendors')}>
            <AlertTriangle size={14} className="mr-1" />{data.pendingVendors} Pending Vendors
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
            <Card className="p-4 hover:shadow-md transition-shadow duration-200"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon size={20} /></div></div></Card>
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-4 hover:shadow-md transition-shadow duration-200"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Today's Revenue</p><p className="text-2xl font-bold">{formatCurrency(data?.todayRevenue || 0)}</p></div><DollarSign className="h-8 w-8 text-green-500 bg-green-100 dark:bg-green-900/30 rounded-lg p-2" /></div></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="p-4 hover:shadow-md transition-shadow duration-200"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Today's Orders</p><p className="text-2xl font-bold">{data?.todayOrders || 0}</p></div><ShoppingCart className="h-8 w-8 text-blue-500 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2" /></div></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => useNavigationStore.getState().setAdminView('admin-returns')}><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending Returns</p><p className="text-2xl font-bold text-red-500">{data?.pendingReturns || 0}</p></div><RotateCcw className="h-8 w-8 text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg p-2" /></div></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} onClick={() => useNavigationStore.getState().setAdminView('admin-products')}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Low Stock Products</p><p className="text-2xl font-bold mt-1">{data?.lowStockProducts || 0}</p></div><div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><AlertTriangle size={24} className="text-amber-500" /></div></div></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-4 hover:shadow-md transition-shadow duration-200"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Conversion Rate</p><p className="text-2xl font-bold text-green-500">{data?.conversionRate || 2.4}%</p></div><TrendingUp className="h-8 w-8 text-green-500 bg-green-100 dark:bg-green-900/30 rounded-lg p-2" /></div></Card>
        </motion.div>
      </div>

      {/* Sales Chart */}
      {data?.monthlySales && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4"><CardTitle className="text-lg">Monthly Revenue</CardTitle></CardHeader>
          <div className="h-56 flex items-end gap-3">
            {data.monthlySales.map((ms: any, i: number) => {
              const maxSale = Math.max(...data.monthlySales.map((m: any) => m.sales), 1);
              const height = (ms.sales / maxSale) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{formatCurrency(ms.sales)}</span>
                  <div className="w-full rounded-t-md bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-500" style={{ height: `${Math.max(height, 4)}%` }} />
                  <span className="text-xs text-muted-foreground">{ms.month}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        {data?.topCategories && data.topCategories.length > 0 && (
          <Card className="p-4 col-span-full lg:col-span-2">
            <h3 className="font-semibold mb-3">Top Categories</h3>
            <div className="space-y-2">
              {data.topCategories.map((cat: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-32 truncate">{cat.name}</span>
                  <div className="flex-1 bg-muted rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(100, (cat.count / (data.topCategories[0]?.count || 1)) * 100)}%` }} /></div>
                  <span className="text-sm text-muted-foreground">{cat.count} orders</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Orders */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4"><CardTitle className="text-lg">Recent Orders</CardTitle></CardHeader>
          <div className="space-y-3">
            {data?.recentOrders?.slice(0, 8).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div><p className="text-sm font-medium">#{order.orderNumber}</p><p className="text-xs text-muted-foreground">{order.user?.name} • {new Date(order.createdAt).toLocaleDateString()}</p></div>
                <div className="text-right"><p className="text-sm font-bold">{formatCurrency(order.total)}</p><Badge variant="secondary" className="text-xs">{order.status}</Badge></div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4"><CardTitle className="text-lg">Top Products</CardTitle></CardHeader>
          <div className="space-y-3">
            {data?.topProducts?.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                <div className="w-10 h-10 rounded bg-muted shrink-0 overflow-hidden">{p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-muted-foreground">{p.vendor?.businessName} • {p.totalSold} sold</p></div>
                <p className="text-sm font-bold">{formatCurrency(p.price)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============ VENDOR MANAGEMENT ============

function AdminVendors() {
  const confirm = useConfirm();
  const [statusFilter, setStatusFilter] = useState('all');
  const qc = useQueryClient();
  const [detailVendor, setDetailVendor] = useState<Vendor | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectVendorId, setRejectVendorId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showWallet, setShowWallet] = useState(false);

  const { data: walletData } = useQuery({
    queryKey: ['admin-vendor-wallets'],
    queryFn: () => fetch('/api/admin/vendors/wallets').then(r => r.json()).then((r: any) => r.data || []),
  });

  const params = new URLSearchParams({ limit: '50' });
  if (statusFilter !== 'all') params.set('status', statusFilter);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors', statusFilter],
    queryFn: () => fetch(`/api/vendors?${params}`).then(r => r.json()).then((r: any) => r),
  });

  const updateVendor = useMutation({
    mutationFn: ({ id, status, rejectionReason: reason }: { id: string; status: string; rejectionReason?: string }) =>
      fetch(`/api/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(reason ? { rejectionReason: reason } : {}) }),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vendors'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Vendor updated');
    },
    onError: () => toast.error('Failed to update vendor'),
  });

  const handleReject = () => {
    if (!rejectVendorId) return;
    updateVendor.mutate({ id: rejectVendorId, status: 'REJECTED', rejectionReason: rejectionReason || 'Application does not meet our requirements.' });
    setRejectDialogOpen(false);
    setRejectVendorId(null);
    setRejectionReason('');
    setDetailVendor(null);
  };

  const openRejectDialog = (vendorId: string) => {
    setRejectVendorId(vendorId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    REJECTED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  const pendingCount = data?.data?.filter((v: Vendor) => v.status === 'PENDING').length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground text-sm">Manage vendor accounts and applications</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-500 text-white px-3 py-1 text-sm cursor-pointer" onClick={() => setStatusFilter('PENDING')}>
            <Clock size={14} className="mr-1.5" />{pendingCount} Pending Review
          </Badge>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className={statusFilter === s ? 'bg-amber-600' : ''} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            {s === 'PENDING' && pendingCount > 0 ? ` (${pendingCount})` : ''}
          </Button>
        ))}
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> :
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">GST/PAN</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="hidden sm:table-cell">Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data?.data?.length && <TableRow><TableCell colSpan={8}><div className="flex flex-col items-center justify-center py-12 text-center"><Store size={40} className="text-muted-foreground/40 mb-3" /><p className="text-muted-foreground font-medium">No vendors found</p><p className="text-muted-foreground text-sm mt-1">Vendors will appear here when they register</p></div></TableCell></TableRow>}
                {data?.data?.map((vendor: Vendor) => (
                  <TableRow key={vendor.id} className={`hover:bg-muted/50 transition-colors duration-150 ${vendor.status === 'PENDING' ? 'bg-amber-50/50 dark:bg-amber-900/5' : ''}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">{vendor.businessName[0]}</div>
                        <div>
                          <p className="font-medium text-sm">{vendor.businessName}</p>
                          <p className="text-xs text-muted-foreground">Joined {new Date(vendor.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{vendor.user?.email}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {vendor.gstNumber || vendor.panNumber || '—'}
                    </TableCell>
                    <TableCell className="font-medium">{vendor._count?.products || 0}</TableCell>
                    <TableCell className="hidden sm:table-cell font-medium">{formatCurrency(vendor.totalRevenue)}</TableCell>
                    <TableCell>
                      <Badge className={statusColor[vendor.status] || ''}>
                        {vendor.status === 'PENDING' && <Clock size={12} className="mr-1" />}
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailVendor(vendor)}><Eye size={14} /></Button>
                        {vendor.status === 'PENDING' && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => { updateVendor.mutate({ id: vendor.id, status: 'APPROVED' }); toast.success('Vendor approved', { description: vendor.businessName + ' can now sell.' }); }}><CheckCircle size={16} /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => openRejectDialog(vendor.id)}><XCircle size={16} /></Button>
                          </>
                        )}
                        {vendor.status === 'APPROVED' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" disabled={updateVendor.isPending} onClick={() => { confirm({ title: 'Suspend Vendor?', description: 'This will prevent ' + vendor.businessName + ' from accessing the vendor panel.', onConfirm: () => updateVendor.mutate({ id: vendor.id, status: 'SUSPENDED' }) }); }}><XCircle size={14} /></Button>
                        )}
                        {vendor.status === 'SUSPENDED' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => updateVendor.mutate({ id: vendor.id, status: 'APPROVED' })}><CheckCircle size={14} /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>}

      {/* Vendor Detail Modal */}
      <Dialog open={!!detailVendor} onOpenChange={() => setDetailVendor(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Vendor Details</DialogTitle></DialogHeader>
          {detailVendor && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 text-2xl font-bold shrink-0">{detailVendor.businessName[0]}</div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold">{detailVendor.businessName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={statusColor[detailVendor.status] || ''}>
                      {detailVendor.status === 'PENDING' && <Clock size={12} className="mr-1" />}
                      {detailVendor.status}
                    </Badge>
                    {detailVendor._count && <span className="text-sm text-muted-foreground">{detailVendor._count.products} products</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{detailVendor.description || 'No description provided'}</p>
                </div>
              </div>
              <Separator />

              {/* Business Details */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Business Information</h4>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Contact Email:</span> <span className="ml-2">{detailVendor.user?.email}</span></div>
                  <div><span className="text-muted-foreground">Phone:</span> <span className="ml-2">{detailVendor.user?.phone || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Business Email:</span> <span className="ml-2">{detailVendor.businessEmail || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Business Phone:</span> <span className="ml-2">{detailVendor.businessPhone || 'N/A'}</span></div>
                  <div className="sm:col-span-2"><span className="text-muted-foreground">Business Address:</span> <span className="ml-2">{detailVendor.businessAddress || 'N/A'}</span></div>
                </div>
              </div>

              <Separator />

              {/* Tax & Bank Details */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Tax & Bank Details</h4>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">GST Number:</span> <span className="ml-2">{detailVendor.gstNumber || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">PAN Number:</span> <span className="ml-2">{detailVendor.panNumber || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Bank Name:</span> <span className="ml-2">{detailVendor.bankName || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Bank Account:</span> <span className="ml-2">{detailVendor.bankAccount ? '••••' + detailVendor.bankAccount.slice(-4) : 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">IFSC:</span> <span className="ml-2">{detailVendor.bankIfsc || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Commission:</span> <span className="ml-2 font-medium">{detailVendor.commissionRate}%</span></div>
                </div>
              </div>

              <Separator />

              {/* Stats */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Performance</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-green-600">{formatCurrency(detailVendor.totalSales)}</p>
                    <p className="text-xs text-muted-foreground">Total Sales</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{formatCurrency(detailVendor.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{detailVendor.rating?.toFixed(1) || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>
              </div>

              {/* Rejection reason if previously rejected */}
              {detailVendor.rejectionReason && (
                <>
                  <Separator />
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">Previous Rejection Reason:</p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{detailVendor.rejectionReason}</p>
                  </div>
                </>
              )}

              {/* Vendor Wallet Section */}
              {(() => {
                const vw = walletData?.find((w: any) => w.id === detailVendor.id);
                if (!vw) return null;
                return (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2"><Wallet size={14} className="text-green-600" />Vendor Wallet</h4>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowWallet(!showWallet)}>
                          {showWallet ? 'Hide Transactions' : 'View Transactions'}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(vw.wallet.availableBalance)}</p>
                          <p className="text-xs text-muted-foreground">Available</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                          <p className="text-lg font-bold text-amber-600">{formatCurrency(vw.wallet.pendingBalance)}</p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-lg font-bold">{formatCurrency(vw.wallet.totalEarned)}</p>
                          <p className="text-xs text-muted-foreground">Total Earned</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-lg font-bold">{formatCurrency(vw.wallet.totalWithdrawn)}</p>
                          <p className="text-xs text-muted-foreground">Withdrawn</p>
                        </div>
                      </div>
                      {showWallet && vw.transactions.length > 0 && (
                        <div className="mt-3 border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader><TableRow><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Balance</TableHead><TableHead className="hidden sm:table-cell">Description</TableHead><TableHead className="text-right">Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                              {vw.transactions.map((t: any) => (
                                <TableRow key={t.id}>
                                  <TableCell><Badge variant="outline" className="text-xs">{t.type}</Badge></TableCell>
                                  <TableCell className={`text-right font-medium ${t.type === 'WITHDRAWAL' || t.type === 'COMMISSION_DEDUCTION' ? 'text-red-600' : 'text-green-600'}`}>{t.type === 'WITHDRAWAL' || t.type === 'COMMISSION_DEDUCTION' ? '-' : '+'}{formatCurrency(t.amount)}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(t.balance)}</TableCell>
                                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground max-w-[200px] truncate">{t.description || '—'}</TableCell>
                                  <TableCell className="text-right text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString('en-IN')}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      {showWallet && vw.transactions.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center mt-3">No transactions yet</p>
                      )}
                    </div>
                  </>
                );
              })()}

              <Separator />
              <div className="flex gap-2 flex-wrap">
                {detailVendor.status === 'PENDING' && (
                  <>
                    <Button className="bg-green-600 hover:bg-green-700" disabled={updateVendor.isPending} onClick={() => { updateVendor.mutate({ id: detailVendor.id, status: 'APPROVED' }); setDetailVendor(null); toast.success('Vendor approved', { description: detailVendor.businessName + ' can now sell.' }); }}>
                      <CheckCircle size={16} className="mr-1.5" />Approve Vendor
                    </Button>
                    <Button variant="destructive" disabled={updateVendor.isPending} onClick={() => { openRejectDialog(detailVendor.id); }}>
                      <XCircle size={16} className="mr-1.5" />Reject Application
                    </Button>
                  </>
                )}
                {detailVendor.status === 'APPROVED' && (
                  <Button variant="destructive" disabled={updateVendor.isPending} onClick={() => { confirm({ title: 'Suspend Vendor?', description: 'This will prevent ' + detailVendor.businessName + ' from accessing the vendor panel.', onConfirm: () => { updateVendor.mutate({ id: detailVendor.id, status: 'SUSPENDED' }); setDetailVendor(null); } }); }}>
                    <XCircle size={16} className="mr-1.5" />Suspend Vendor
                  </Button>
                )}
                {detailVendor.status === 'SUSPENDED' && (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => { updateVendor.mutate({ id: detailVendor.id, status: 'APPROVED' }); setDetailVendor(null); }}>
                    <CheckCircle size={16} className="mr-1.5" />Re-activate Vendor
                  </Button>
                )}
                {detailVendor.status === 'REJECTED' && (
                  <Button className="bg-green-600 hover:bg-green-700" disabled={updateVendor.isPending} onClick={() => { updateVendor.mutate({ id: detailVendor.id, status: 'APPROVED' }); setDetailVendor(null); toast.success('Vendor approved', { description: detailVendor.businessName + ' can now sell.' }); }}>
                    <CheckCircle size={16} className="mr-1.5" />Approve Now
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Vendor Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this application. This will be shown to the vendor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                className="mt-1"
                rows={4}
                placeholder="e.g., Incomplete business information, invalid GST number, etc."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
                <XCircle size={16} className="mr-1.5" />Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ CATEGORY MANAGEMENT ============

function AdminCategories() {
  const confirm = useConfirm();
  const qc = useQueryClient();
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json()).then((r: any) => r.data || []),
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', parentId: '', sortOrder: '0' });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editId) {
        return fetch('/api/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, name: form.name, description: form.description, parentId: form.parentId || null, sortOrder: parseInt(form.sortOrder) }) }).then(r => r.json());
      }
      return fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, description: form.description, parentId: form.parentId || null, sortOrder: parseInt(form.sortOrder) }) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success(editId ? 'Category updated' : 'Category created', { description: editId ? undefined : form.name + ' added.' }); setShowAdd(false); setEditId(null); setForm({ name: '', description: '', parentId: '', sortOrder: '0' }); },
    onError: () => toast.error('Failed to save category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/categories?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  const handleEdit = (cat: any) => { setForm({ name: cat.name, description: cat.description || '', parentId: cat.parentId || '', sortOrder: String(cat.sortOrder) }); setEditId(cat.id); setShowAdd(true); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Categories</h1><p className="text-muted-foreground text-sm">Manage product categories and subcategories</p></div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => { setForm({ name: '', description: '', parentId: '', sortOrder: '0' }); setEditId(null); setShowAdd(true); }}><Plus size={16} className="mr-1.5" />Add Category</Button>
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div> :
      (!categories || categories.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen size={48} className="text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No categories yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first product category to get started.</p>
          <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => { setForm({ name: '', description: '', parentId: '', sortOrder: '0' }); setEditId(null); setShowAdd(true); }}><Plus size={16} className="mr-1.5" />Add Category</Button>
        </div>
      ) : (
      <div className="space-y-2">
        {categories?.map((cat: any) => (
          <div key={cat.id}>
            <Card className="p-4 hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">{cat.name[0]}</div>
                <div><p className="font-medium">{cat.name}</p><p className="text-sm text-muted-foreground">{cat._count?.products || 0} products</p></div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}><Pencil size={14} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={deleteMutation.isPending} onClick={() => { confirm({ title: 'Delete Category?', description: 'Are you sure you want to delete "' + cat.name + '"? This action cannot be undone.', onConfirm: () => deleteMutation.mutate(cat.id) }); }}><Trash2 size={14} /></Button>
              </div>
            </Card>
            {cat.children?.map((child: any) => (
              <Card key={child.id} className="p-4 hover:shadow-md transition-shadow duration-200 flex items-center justify-between ml-8 mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold">{child.name[0]}</div>
                  <div><p className="font-medium text-sm">{child.name}</p><p className="text-xs text-muted-foreground">{child._count?.products || 0} products</p></div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(child)}><Pencil size={12} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={deleteMutation.isPending} onClick={() => { confirm({ title: 'Delete Category?', description: 'Are you sure you want to delete "' + child.name + '"? This action cannot be undone.', onConfirm: () => deleteMutation.mutate(child.id) }); }}><Trash2 size={12} /></Button>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>)}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent><DialogHeader><DialogTitle>{editId ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="mt-1" /></div>
            <div><Label>Parent Category</Label><Select value={form.parentId} onValueChange={v => setForm(f => ({...f, parentId: v}))}><SelectTrigger className="mt-1"><SelectValue placeholder="None (Root Category)" /></SelectTrigger><SelectContent><SelectItem value="none">None (Root Category)</SelectItem>{categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({...f, sortOrder: e.target.value}))} className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button className="bg-amber-600 hover:bg-amber-700" onClick={() => { if (!form.name.trim()) { toast.error('Name is required'); return; } saveMutation.mutate(); }} disabled={saveMutation.isPending || !form.name}>{saveMutation.isPending ? 'Saving...' : editId ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ BRAND MANAGEMENT ============

function AdminBrands() {
  const confirm = useConfirm();
  const qc = useQueryClient();
  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => fetch('/api/brands').then(r => r.json()).then((r: any) => r.data || []),
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const addMutation = useMutation({
    mutationFn: () => fetch('/api/brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['brands'] }); toast.success('Brand created', { description: form.name + ' has been added.' }); setShowAdd(false); setForm({ name: '', description: '' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/brands?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['brands'] }); toast.success('Brand deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Brands</h1><p className="text-muted-foreground text-sm">Manage product brands</p></div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowAdd(true)}><Plus size={16} className="mr-1.5" />Add Brand</Button>
      </div>

      {isLoading ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> :
      (!brands || brands.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Tag size={48} className="text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No brands yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Add your first product brand.</p>
          <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowAdd(true)}><Plus size={16} className="mr-1.5" />Add Brand</Button>
        </div>
      ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {brands.map((brand: any) => (
          <Card key={brand.id} className="p-4 hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
            <div><p className="font-medium">{brand.name}</p><p className="text-sm text-muted-foreground">{brand._count?.products || 0} products</p></div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" disabled={deleteMutation.isPending} onClick={() => { confirm({ title: 'Delete Brand?', description: 'Are you sure you want to delete "' + brand.name + '"? This action cannot be undone.', onConfirm: () => deleteMutation.mutate(brand.id) }); }}><Trash2 size={14} /></Button>
          </Card>
        ))}
      </div>)}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent><DialogHeader><DialogTitle>Add Brand</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Brand Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button className="bg-amber-600 hover:bg-amber-700" onClick={() => { if (!form.name.trim()) { toast.error('Name is required'); return; } addMutation.mutate(); }} disabled={addMutation.isPending || !form.name}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ ADMIN PRODUCTS ============

function AdminProducts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => fetch(`/api/products?page=${page}&limit=15&search=${search}`).then(r => r.json()).then((r: any) => r),
  });

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">All Products</h1><p className="text-muted-foreground text-sm">Manage products across all vendors</p></div>
      <div className="max-w-md"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" /></div></div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="hidden md:table-cell">Vendor</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead className="hidden sm:table-cell">Sold</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {data?.data?.map((p: any) => (
              <TableRow key={p.id} className="hover:bg-muted/50 transition-colors duration-150">
                <TableCell><div className="flex items-center gap-3"><div className="w-10 h-10 rounded bg-muted shrink-0 overflow-hidden">{p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}</div><div className="min-w-0"><p className="font-medium text-sm truncate max-w-48">{p.name}</p><p className="text-xs text-muted-foreground">{p.category?.name}</p></div></div></TableCell>
                <TableCell className="hidden md:table-cell text-sm">{p.vendor?.businessName}</TableCell>
                <TableCell className="font-medium">{formatCurrency(p.price)}</TableCell>
                <TableCell><span className={p.stock < 5 ? 'text-red-600 font-medium' : ''}>{p.stock}</span></TableCell>
                <TableCell className="hidden sm:table-cell">{p.totalSold}</TableCell>
                <TableCell><Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data?.meta?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
            {Array.from({length: Math.min(data.meta.totalPages, 5)}, (_, i) => i + 1).map(p => (
              <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className={p === page ? 'bg-amber-600' : ''} onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ============ ADMIN ORDERS ============

function AdminOrders() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page), limit: '15' });
  if (statusFilter !== 'all') params.set('status', statusFilter);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', params.toString()],
    queryFn: () => fetch(`/api/orders?${params}`).then(r => r.json()).then((r: any) => r),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json()),
    onSuccess: (_data, variables) => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order updated', { description: 'Status: ' + variables.status }); },
    onError: () => toast.error('Failed to update'),
  });

  const statusColor: Record<string, string> = { NEW: 'bg-blue-100 text-blue-700', PROCESSING: 'bg-amber-100 text-amber-700', SHIPPED: 'bg-orange-100 text-orange-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700' };

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">All Orders</h1><p className="text-muted-foreground text-sm">Manage all platform orders</p></div>
      <div className="flex gap-2 flex-wrap">
        {['all', 'NEW', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className={statusFilter === s ? 'bg-amber-600' : ''} onClick={() => { setStatusFilter(s); setPage(1); }}>{s === 'all' ? 'All' : s}</Button>
        ))}
      </div>
      {isLoading ? <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> :
      (!data?.data || data.data.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package size={48} className="text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No orders</h3>
          <p className="text-sm text-muted-foreground">Orders will appear here when customers make purchases.</p>
        </div>
      ) : (
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.data.map((order: any) => (
              <TableRow key={order.id} className="hover:bg-muted/50 transition-colors duration-150">
                <TableCell><p className="font-medium text-sm">#{order.orderNumber}</p></TableCell>
                <TableCell className="text-sm">{order.user?.name}</TableCell>
                <TableCell className="text-sm">{order.items?.length || 0} items</TableCell>
                <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                <TableCell><Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'} className="text-xs">{order.paymentStatus}</Badge></TableCell>
                <TableCell><Badge className={statusColor[order.status] || ''}>{order.status}</Badge></TableCell>
                <TableCell className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Select disabled={updateMutation.isPending} value={order.status} onValueChange={(v) => updateMutation.mutate({ id: order.id, status: v })}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{['NEW', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data?.meta?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
          </div>
        )}
      </Card>)}
    </div>
  );
}

// ============ ADMIN CUSTOMERS ============

function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search, page],
    queryFn: () => fetch(`/api/admin/users?role=CUSTOMER&search=${search}&page=${page}&limit=15`).then(r => r.json()).then((r: any) => r),
  });

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Customers</h1><p className="text-muted-foreground text-sm">Manage platform customers</p></div>
      <div className="max-w-md"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search customers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" /></div></div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Email</TableHead><TableHead className="hidden sm:table-cell">Phone</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {data?.data?.map((u: any) => (
              <TableRow key={u.id} className="hover:bg-muted/50 transition-colors duration-150">
                <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{u.name[0]}</AvatarFallback></Avatar><span className="font-medium text-sm">{u.name}</span></div></TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm">{u.phone || 'N/A'}</TableCell>
                <TableCell className="text-sm">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                <TableCell><Badge variant={u.isActive ? 'default' : 'secondary'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ============ ADMIN COUPONS ============

function AdminCoupons() {
  const qc = useQueryClient();
  const { data: coupons, isLoading } = useQuery({ queryKey: ['coupons'], queryFn: () => fetch('/api/coupons').then(r => r.json()).then((r: any) => r.data || []) });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: '10', minOrder: '500', maxDiscount: '1000', usageLimit: '100', startDate: '', endDate: '' });

  const addMutation = useMutation({
    mutationFn: () => fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, discountValue: parseFloat(form.discountValue), minOrder: parseFloat(form.minOrder) || null, maxDiscount: parseFloat(form.maxDiscount) || null, usageLimit: parseInt(form.usageLimit) || null, startDate: form.startDate || new Date().toISOString(), endDate: form.endDate || new Date(Date.now() + 86400000 * 30).toISOString() }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); toast.success('Coupon created', { description: 'Code: ' + form.code }); setShowAdd(false); },
    onError: () => toast.error('Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/coupons?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); toast.success('Coupon deleted'); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Coupons</h1><p className="text-muted-foreground text-sm">Manage discount coupons</p></div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowAdd(true)}><Plus size={16} className="mr-1.5" />Add Coupon</Button>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Min Order</TableHead><TableHead>Usage</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? Array.from({length: 3}).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8" /></TableCell></TableRow>) :
            coupons?.map((c: any) => (
              <TableRow key={c.id} className="hover:bg-muted/50 transition-colors duration-150">
                <TableCell className="font-mono font-bold">{c.code}</TableCell>
                <TableCell>{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}{c.maxDiscount ? ` (max ${formatCurrency(c.maxDiscount)})` : ''}</TableCell>
                <TableCell>{c.minOrder ? formatCurrency(c.minOrder) : 'N/A'}</TableCell>
                <TableCell>{c.usedCount}/{c.usageLimit || '∞'}</TableCell>
                <TableCell><Badge variant={c.isActive ? 'default' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(c.id)}><Trash2 size={14} /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent><DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Code *</Label><Input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} className="mt-1 uppercase" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Discount Type</Label><Select value={form.discountType} onValueChange={v => setForm(f => ({...f, discountType: v}))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PERCENTAGE">Percentage</SelectItem><SelectItem value="FIXED">Fixed Amount</SelectItem></SelectContent></Select></div>
              <div><Label>Discount Value *</Label><Input type="number" value={form.discountValue} onChange={e => setForm(f => ({...f, discountValue: e.target.value}))} className="mt-1" /></div>
              <div><Label>Min Order (₹)</Label><Input type="number" value={form.minOrder} onChange={e => setForm(f => ({...f, minOrder: e.target.value}))} className="mt-1" /></div>
              <div><Label>Max Discount (₹)</Label><Input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({...f, maxDiscount: e.target.value}))} className="mt-1" /></div>
              <div><Label>Usage Limit</Label><Input type="number" value={form.usageLimit} onChange={e => setForm(f => ({...f, usageLimit: e.target.value}))} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button className="bg-amber-600 hover:bg-amber-700" onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !form.code}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ ADMIN BANNERS ============

function AdminBanners() {
  const qc = useQueryClient();
  const { data: banners, isLoading } = useQuery({ queryKey: ['banners'], queryFn: () => fetch('/api/banners?position=HOME').then(r => r.json()).then((r: any) => r.data || []) });
  const [form, setForm] = useState({ title: '', image: '', link: '', position: 'HOME', sortOrder: '0' });

  const addMutation = useMutation({
    mutationFn: () => fetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, sortOrder: parseInt(form.sortOrder) }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['banners'] }); toast.success('Banner added'); setForm({ title: '', image: '', link: '', position: 'HOME', sortOrder: '0' }); },
    onError: () => toast.error('Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/banners?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['banners'] }); toast.success('Banner deleted'); },
  });

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Banners</h1><p className="text-muted-foreground text-sm">Manage homepage banners and advertisements</p></div>

      <Card className="p-6"><h3 className="font-semibold mb-4">Add New Banner</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="mt-1" /></div>
          <div><Label>Image URL</Label><Input value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} className="mt-1" placeholder="https://..." /></div>
          <div><Label>Link (optional)</Label><Input value={form.link} onChange={e => setForm(f => ({...f, link: e.target.value}))} className="mt-1" /></div>
          <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({...f, sortOrder: e.target.value}))} className="mt-1" /></div>
        </div>
        <Button className="mt-4 bg-amber-600 hover:bg-amber-700" onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !form.title || !form.image}>Add Banner</Button>
      </Card>

      <div className="space-y-4">
        {isLoading ? Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />) :
        banners?.map((banner: any) => (
          <Card key={banner.id} className="overflow-hidden">
            <img src={banner.image} alt={banner.title} className="w-full h-32 md:h-48 object-cover" />
            <div className="p-4 flex items-center justify-between">
              <div><p className="font-medium">{banner.title}</p><p className="text-sm text-muted-foreground">Position: {banner.position} • Sort: {banner.sortOrder}</p></div>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(banner.id)}><Trash2 size={16} /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ ADMIN REPORTS ============

function AdminReports() {
  const { data } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => fetch('/api/admin/dashboard').then(r => r.json()).then((r: any) => r.data ?? {}) });

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Reports & Analytics</h1><p className="text-muted-foreground text-sm">Platform performance insights</p></div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold text-green-600">{formatCurrency(data?.totalRevenue || 0)}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted-foreground">Platform Earnings (Commission)</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(data?.platformEarnings || 0)}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted-foreground">Total Tax Collected</p><p className="text-2xl font-bold">{formatCurrency((data?.totalRevenue || 0) * 0.18)}</p></Card>
      </div>

      {data?.monthlySales && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4"><CardTitle>Revenue Breakdown</CardTitle></CardHeader>
          <div className="h-64 flex items-end gap-3">
            {data.monthlySales.map((ms: any, i: number) => {
              const maxSale = Math.max(...data.monthlySales.map((m: any) => m.sales), 1);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{formatCurrency(ms.sales)}</span>
                  <div className="w-full rounded-t-md bg-gradient-to-t from-amber-700 to-amber-400" style={{ height: `${Math.max((ms.sales / maxSale) * 100, 4)}%` }} />
                  <span className="text-xs text-muted-foreground">{ms.month}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============ ADMIN SETTINGS ============

function AdminSettings() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => fetch('/api/settings').then(r => r.json()).then((r: any) => r.data ?? {}) });
  const [form, setForm] = useState<any>({});

  React.useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => r.json()),
    onSuccess: () => toast.success('Settings saved', { description: 'Changes applied successfully.' }),
    onError: () => toast.error('Failed to save'),
  });

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Platform Settings</h1><p className="text-muted-foreground text-sm">Configure marketplace settings</p></div>
      <Card className="p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Site Name</Label><Input value={form.siteName || ''} onChange={e => setForm(f => ({...f, siteName: e.target.value}))} className="mt-1" /></div>
          <div><Label>Site Description</Label><Input value={form.siteDescription || ''} onChange={e => setForm(f => ({...f, siteDescription: e.target.value}))} className="mt-1" /></div>
          <div><Label>Currency</Label><Input value={form.currency || ''} onChange={e => setForm(f => ({...f, currency: e.target.value}))} className="mt-1" /></div>
          <div><Label>Currency Symbol</Label><Input value={form.currencySymbol || ''} onChange={e => setForm(f => ({...f, currencySymbol: e.target.value}))} className="mt-1" /></div>
          <div><Label>Tax Rate (GST %)</Label><Input type="number" value={form.taxRate || ''} onChange={e => setForm(f => ({...f, taxRate: parseFloat(e.target.value)}))} className="mt-1" /></div>
          <div><Label>Free Shipping Min (₹)</Label><Input type="number" value={form.freeShippingMin || ''} onChange={e => setForm(f => ({...f, freeShippingMin: parseFloat(e.target.value)}))} className="mt-1" /></div>
          <div><Label>Contact Email</Label><Input value={form.contactEmail || ''} onChange={e => setForm(f => ({...f, contactEmail: e.target.value}))} className="mt-1" /></div>
          <div><Label>Contact Phone</Label><Input value={form.contactPhone || ''} onChange={e => setForm(f => ({...f, contactPhone: e.target.value}))} className="mt-1" /></div>
          <div className="sm:col-span-2"><Label>Address</Label><Textarea value={form.address || ''} onChange={e => setForm(f => ({...f, address: e.target.value}))} className="mt-1" /></div>
        </div>
        <Button className="mt-4 bg-amber-600 hover:bg-amber-700" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save Settings</Button>
      </Card>
    </div>
  );
}

// ============ ADMIN RETURNS ============

function AdminReturns() {
  const [statusFilter, setStatusFilter] = useState('all');
  const qc = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-returns', statusFilter],
    queryFn: () => fetch(`/api/admin/returns${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`).then(r => r.json()),
  });

  const updateReturn = useMutation({
    mutationFn: ({ id, status, adminNotes }: any) => fetch(`/api/admin/returns/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, adminNotes }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-returns'] }); toast.success('Return updated'); },
    onError: () => toast.error('Failed to update return'),
  });

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
    APPROVED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Returns & Refunds</h1>
      <div className="flex gap-2 flex-wrap">
        {['all', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className={statusFilter === s ? 'bg-amber-600' : ''} onClick={() => setStatusFilter(s)}>{s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</Button>
        ))}
      </div>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> :
        <Card><Table><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Reason</TableHead><TableHead>Refund</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>{(data?.data || []).map((r: any) => (
            <TableRow key={r.id}><TableCell className="font-mono text-sm">#{r.orderId?.slice(-6)}</TableCell><TableCell>{r.userId || 'Guest'}</TableCell><TableCell className="max-w-[200px] truncate">{r.reason}</TableCell><TableCell>{r.refundAmount ? formatCurrency(r.refundAmount) : '—'}</TableCell>
              <TableCell><Badge className={statusColor[r.status] || ''}>{r.status}</Badge></TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('en-IN')}</TableCell>
              <TableCell><div className="flex gap-1">
                {r.status === 'PENDING' && <><Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => updateReturn.mutate({ id: r.id, status: 'APPROVED' })}><CheckCircle2 size={16} /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setRejectId(r.id)}><XCircle size={16} /></Button></>}
                {r.status === 'APPROVED' && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateReturn.mutate({ id: r.id, status: 'COMPLETED' })}>Process Refund</Button>}
              </div></TableCell></TableRow>
          ))}</TableBody></Table></Card>}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent><DialogHeader><DialogTitle>Reject Return</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason for rejection" value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} />
          <DialogFooter><Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button><Button variant="destructive" onClick={() => { updateReturn.mutate({ id: rejectId, status: 'REJECTED', adminNotes: rejectNotes }); setRejectId(null); setRejectNotes(''); }}>Reject</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ ADMIN PAYOUTS ============

function AdminPayouts() {
  const [statusFilter, setStatusFilter] = useState('all');
  const qc = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payouts', statusFilter],
    queryFn: () => fetch(`/api/admin/payouts${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`).then(r => r.json()),
  });

  const updatePayout = useMutation({
    mutationFn: ({ id, status, notes }: any) => fetch(`/api/admin/payouts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, notes }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-payouts'] }); toast.success('Payout updated'); },
    onError: () => toast.error('Failed to update payout'),
  });

  const maskBank = (acc?: string | null) => acc ? '••••' + acc.slice(-4) : '—';

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
    APPROVED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Vendor Payouts</h1>
      <div className="flex gap-2 flex-wrap">
        {['all', 'PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className={statusFilter === s ? 'bg-amber-600' : ''} onClick={() => setStatusFilter(s)}>{s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</Button>
        ))}
      </div>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> :
        <Card><Table><TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Amount</TableHead><TableHead>Bank</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>{(data?.data || []).map((p: any) => (
            <TableRow key={p.id}><TableCell className="font-medium text-sm">{p.vendor?.businessName || 'Unknown'}</TableCell><TableCell className="font-bold">{formatCurrency(p.amount)}</TableCell><TableCell className="text-sm text-muted-foreground">{p.bankName} ({maskBank(p.bankAccount)})</TableCell>
              <TableCell><Badge className={statusColor[p.status] || ''}>{p.status}</Badge></TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString('en-IN')}</TableCell>
              <TableCell><div className="flex gap-1">
                {p.status === 'PENDING' && <><Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => updatePayout.mutate({ id: p.id, status: 'APPROVED' })}><CheckCircle2 size={16} /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setRejectId(p.id)}><XCircle size={16} /></Button></>}
                {p.status === 'APPROVED' && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updatePayout.mutate({ id: p.id, status: 'COMPLETED' })}>Complete</Button>}
              </div></TableCell></TableRow>
          ))}</TableBody></Table></Card>}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent><DialogHeader><DialogTitle>Reject Payout</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason for rejection" value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} />
          <DialogFooter><Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button><Button variant="destructive" onClick={() => { updatePayout.mutate({ id: rejectId, status: 'FAILED', notes: rejectNotes }); setRejectId(null); setRejectNotes(''); }}>Reject</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ ADMIN ANALYTICS ============

function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => fetch('/api/admin/analytics').then(r => r.json()).then((r: any) => r.data ?? {}),
  });

  if (isLoading) return <div className="p-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-muted-foreground text-sm">Deep platform insights and metrics</p></div>

      {/* Average Order Value */}
      <div className="grid sm:grid-cols-2 gap-4">
      {data?.averageOrderValue > 0 && (
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Average Order Value</p><p className="text-2xl font-bold">{formatCurrency(data.averageOrderValue)}</p></div><TrendingUp className="h-8 w-8 text-amber-500 bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2" /></div></Card>
      )}
      <div className="bg-card border rounded-xl p-4">
        <p className="text-sm text-muted-foreground">Conversion Rate</p>
        <p className="text-2xl font-bold mt-1">{data?.conversionEstimate || 2.4}%</p>
        <p className="text-xs text-green-600 mt-1">↑ Estimated from orders/visits</p>
      </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Top Searches</h3>
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Query</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Results</TableHead></TableRow></TableHeader>
            <TableBody>{(data?.topSearches || []).map((s: any, i: number) => (
              <TableRow key={i}><TableCell className="text-sm font-medium">{s.query}</TableCell><TableCell className="text-right text-sm">{s.searchCount}</TableCell><TableCell className="text-right text-sm text-muted-foreground">{s.resultCount}</TableCell></TableRow>
            ))}</TableBody></Table></div>
        </Card>

        {/* Zero-Result Searches */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Zero-Result Searches</h3>
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Query</TableHead><TableHead className="text-right">Count</TableHead></TableRow></TableHeader>
            <TableBody>{(data?.zeroResultSearches || []).map((s: any, i: number) => (
              <TableRow key={i}><TableCell className="text-sm font-medium text-red-600">{s.query}</TableCell><TableCell className="text-right text-sm">{s.searchCount}</TableCell></TableRow>
            ))}</TableBody></Table></div>
        </Card>
      </div>

      {/* Customer Growth Chart */}
      {data?.customerGrowth && data.customerGrowth.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Customer Growth (Monthly New Users)</h3>
          <div className="h-48 flex items-end gap-3">
            {data.customerGrowth.map((m: any, i: number) => {
              const maxVal = Math.max(...data.customerGrowth.map((x: any) => x.count), 1);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{m.count}</span>
                  <div className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500" style={{ height: `${Math.max((m.count / maxVal) * 100, 4)}%` }} />
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Vendor Performance */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Vendor Performance</h3>
        <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Rating</TableHead></TableRow></TableHeader>
          <TableBody>{(data?.vendorPerformance || []).map((v: any, i: number) => (
            <TableRow key={i}><TableCell className="font-medium text-sm">{v.name}</TableCell><TableCell className="text-right font-medium">{formatCurrency(v.revenue)}</TableCell><TableCell className="text-right text-sm">{v.orders}</TableCell><TableCell className="text-right text-sm"><span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{v.rating?.toFixed(1) || 'N/A'}</span></TableCell></TableRow>
          ))}</TableBody></Table></div>
      </Card>
    </div>
  );
}

// ============ ADMIN SUPPORT ============

function AdminSupport() {
  const qc = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => fetch('/api/support/tickets').then(r => r.json()).then((r: any) => r.data ?? []),
  });

  const replyMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) => fetch('/api/support/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticketId, message, isStaff: true }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['support-tickets'] }); setReply(''); toast.success('Reply sent', { description: 'The customer will be notified.' }); },
    onError: () => toast.error('Failed to send reply'),
  });

  const priorityColor: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
  };

  const statusColor: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-amber-100 text-amber-700',
    CLOSED: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Support Tickets</h1>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> :
        <Card><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Customer</TableHead><TableHead>Category</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead className="hidden sm:table-cell">Messages</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>{(Array.isArray(data) ? data : []).map((t: any) => (
            <TableRow key={t.id}><TableCell className="font-medium text-sm max-w-[200px] truncate">{t.subject}</TableCell><TableCell className="text-sm">{t.user?.name || 'Guest'}</TableCell><TableCell className="text-sm">{t.category}</TableCell>
              <TableCell><Badge className={priorityColor[t.priority] || ''}>{t.priority}</Badge></TableCell>
              <TableCell><Badge className={statusColor[t.status] || ''}>{t.status.replace('_', ' ')}</Badge></TableCell>
              <TableCell className="hidden sm:table-cell text-sm">{t._count?.messages || t.messages?.length || 0}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(t.createdAt).toLocaleDateString('en-IN')}</TableCell>
              <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTicket(t)}><Eye size={14} /></Button></TableCell></TableRow>
          ))}</TableBody></Table></div></Card>}

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => { setSelectedTicket(null); setReply(''); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>{selectedTicket?.category} • {selectedTicket?.status} • {selectedTicket?.user?.name}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
            {(selectedTicket?.messages || []).map((m: any) => (
              <div key={m.id} className={`p-3 rounded-lg text-sm ${m.isStaff ? 'bg-amber-50 dark:bg-amber-900/10 ml-8' : 'bg-muted mr-8'}`}>
                <div className="flex items-center gap-2 mb-1"><span className="font-medium text-xs">{m.isStaff ? 'Admin' : selectedTicket?.user?.name || 'Customer'}</span><span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString('en-IN')}</span></div>
                <p>{m.message}</p>
              </div>
            ))}
          </div>
          {selectedTicket?.status !== 'CLOSED' && selectedTicket?.status !== 'RESOLVED' && (
            <div className="flex gap-2 pt-2 border-t">
              <Input placeholder="Type your reply..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && reply.trim()) replyMutation.mutate({ ticketId: selectedTicket.id, message: reply }); }} className="flex-1" />
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => replyMutation.mutate({ ticketId: selectedTicket.id, message: reply })} disabled={!reply.trim()}><Send size={16} /></Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ ADMIN MARKETING ============

function AdminMarketing() {
  return (
    <Tabs defaultValue="flash-sales" className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Marketing</h1><p className="text-muted-foreground text-sm">Manage promotions and campaigns</p></div>
      <TabsList className="flex-wrap h-auto gap-1"><TabsTrigger value="flash-sales">Flash Sales</TabsTrigger><TabsTrigger value="deals">Deals</TabsTrigger><TabsTrigger value="festival-offers">Festival Offers</TabsTrigger><TabsTrigger value="collections">Collections</TabsTrigger></TabsList>
      <TabsContent value="flash-sales"><FlashSalesTab /></TabsContent>
      <TabsContent value="deals"><DealsTab /></TabsContent>
      <TabsContent value="festival-offers"><FestivalOffersTab /></TabsContent>
      <TabsContent value="collections"><FeaturedCollectionsTab /></TabsContent>
    </Tabs>
  );
}

function FlashSalesTab() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['flash-sales'],
    queryFn: () => fetch('/api/flash-sales').then(r => r.json()).then((r: any) => r.data || []),
  });

  const createMutation = useMutation({
    mutationFn: () => fetch('/api/flash-sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, isActive: true }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['flash-sales'] }); toast.success('Flash sale created'); setShowCreate(false); setForm({ title: '', description: '', startDate: '', endDate: '' }); },
    onError: () => toast.error('Failed to create'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Flash Sales</h3>
        <Button className="bg-amber-600 hover:bg-amber-700" size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" />Create</Button>
      </div>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> :
        <div className="space-y-3">
          {(data || []).map((fs: any) => (
            <Card key={fs.id} className="p-4 flex items-center justify-between">
              <div><p className="font-medium">{fs.title}</p><p className="text-sm text-muted-foreground flex items-center gap-1"><CalendarDays size={12} />{new Date(fs.startDate).toLocaleDateString('en-IN')} — {new Date(fs.endDate).toLocaleDateString('en-IN')}</p><p className="text-xs text-muted-foreground">{fs.items?.length || 0} products</p></div>
              <Badge variant={fs.isActive ? 'default' : 'secondary'}>{fs.isActive ? 'Active' : 'Inactive'}</Badge>
            </Card>
          ))}
          {(!data || data.length === 0) && <div className="flex flex-col items-center justify-center py-12 text-center"><Zap size={40} className="text-muted-foreground/40 mb-3" /><p className="text-muted-foreground font-medium">No flash sales yet</p><p className="text-muted-foreground text-sm mt-1">Create a flash sale to boost product visibility</p></div>}
        </div>}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent><DialogHeader><DialogTitle>Create Flash Sale</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date *</Label><Input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="mt-1" /></div>
              <div><Label>End Date *</Label><Input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button className="bg-amber-600 hover:bg-amber-700" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FestivalOffersTab() {
  const { data: flashSales, isLoading } = useQuery({
    queryKey: ['festival-offers'],
    queryFn: () => fetch('/api/flash-sales').then(r => r.json()).then((r: any) => r.data || []),
  });
  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => fetch('/api/deals').then(r => r.json()).then((r: any) => r.data || []),
  });

  const isLoadingCombined = isLoading || dealsLoading;
  const festivalFlashSales = (flashSales || []).filter((fs: any) => fs.description?.toLowerCase().includes('festival') || fs.title?.toLowerCase().includes('festival'));
  const festivalDeals = (deals || []).filter((d: any) => d.description?.toLowerCase().includes('festival') || d.title?.toLowerCase().includes('festival'));
  const hasFestivalContent = festivalFlashSales.length > 0 || festivalDeals.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Festival Offers</h3>
        <Badge variant="outline" className="text-xs">Filtered from Flash Sales & Deals</Badge>
      </div>
      {isLoadingCombined ? <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> :
      hasFestivalContent ? (
        <div className="space-y-3">
          {festivalFlashSales.length > 0 && <>
            <h4 className="text-sm font-medium text-muted-foreground">Festival Flash Sales</h4>
            {festivalFlashSales.map((fs: any) => (
              <Card key={fs.id} className="p-4 flex items-center justify-between border-l-4 border-l-amber-500">
                <div><p className="font-medium flex items-center gap-2"><Sparkles size={14} className="text-amber-500" />{fs.title}</p><p className="text-sm text-muted-foreground flex items-center gap-1"><CalendarDays size={12} />{new Date(fs.startDate).toLocaleDateString('en-IN')} — {new Date(fs.endDate).toLocaleDateString('en-IN')}</p><p className="text-xs text-muted-foreground">{fs.items?.length || 0} products</p></div>
                <Badge variant={fs.isActive ? 'default' : 'secondary'}>{fs.isActive ? 'Active' : 'Inactive'}</Badge>
              </Card>
            ))}
          </>}
          {festivalDeals.length > 0 && <>
            <h4 className="text-sm font-medium text-muted-foreground">Festival Deals</h4>
            {festivalDeals.map((d: any) => (
              <Card key={d.id} className="p-4 flex items-center justify-between border-l-4 border-l-green-500">
                <div><p className="font-medium flex items-center gap-2"><Sparkles size={14} className="text-green-500" />{d.title}</p><p className="text-sm text-muted-foreground">{d.product?.name || d.productId} • {d.discountPercent}% off</p><p className="text-xs text-muted-foreground">{new Date(d.startDate).toLocaleDateString()} — {new Date(d.endDate).toLocaleDateString()}</p></div>
                <Badge variant={d.isActive ? 'default' : 'secondary'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>
              </Card>
            ))}
          </>}
        </div>
      ) : (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No festival offers yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create flash sales or deals with &quot;festival&quot; in the title or description to see them here</p>
        </div>
      )}
    </div>
  );
}

interface Collection {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  coverImage: string;
  sortOrder: number;
  createdAt: string;
}

function FeaturedCollectionsTab() {
  const [collections, setCollections] = useState<Collection[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('marketplace-collections') || '[]');
    } catch { return []; }
  });
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', coverImage: '', sortOrder: '0' });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const { data: products } = useQuery({
    queryKey: ['all-products-mini'],
    queryFn: () => fetch('/api/products?limit=100').then(r => r.json()).then((r: any) => r.data || []),
  });

  const saveCollections = (updated: Collection[]) => {
    setCollections(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketplace-collections', JSON.stringify(updated));
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const updated = editId
      ? collections.map(c => c.id === editId ? { ...c, name: form.name, description: form.description, coverImage: form.coverImage, sortOrder: parseInt(form.sortOrder), productIds: selectedProductIds } : c)
      : [...collections, { id: Date.now().toString(), name: form.name, description: form.description, coverImage: form.coverImage, sortOrder: parseInt(form.sortOrder), productIds: selectedProductIds, createdAt: new Date().toISOString() }];
    saveCollections(updated);
    toast.success(editId ? 'Collection updated' : 'Collection created');
    setShowCreate(false);
    setEditId(null);
    setForm({ name: '', description: '', coverImage: '', sortOrder: '0' });
    setSelectedProductIds([]);
  };

  const handleEdit = (c: Collection) => {
    setForm({ name: c.name, description: c.description, coverImage: c.coverImage, sortOrder: String(c.sortOrder) });
    setSelectedProductIds(c.productIds);
    setEditId(c.id);
    setShowCreate(true);
  };

  const handleDelete = (id: string) => {
    saveCollections(collections.filter(c => c.id !== id));
    toast.success('Collection deleted');
  };

  const toggleProduct = (pid: string) => {
    setSelectedProductIds(prev => prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid]);
  };

  const productMap = new Map((products || []).map((p: any) => [p.id, p]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Featured Collections</h3>
        <Button className="bg-amber-600 hover:bg-amber-700" size="sm" onClick={() => { setForm({ name: '', description: '', coverImage: '', sortOrder: '0' }); setSelectedProductIds([]); setEditId(null); setShowCreate(true); }}><Plus size={14} className="mr-1" />Create Collection</Button>
      </div>
      {collections.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No collections yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create curated product collections for your customers</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.sort((a, b) => a.sortOrder - b.sortOrder).map(c => (
            <Card key={c.id} className="overflow-hidden">
              {c.coverImage ? <img src={c.coverImage} alt={c.name} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center"><FolderOpen className="h-8 w-8 text-amber-500" /></div>}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{c.name}</h4>
                  <Badge variant="outline" className="text-xs">{c.productIds.length} products</Badge>
                </div>
                {c.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>}
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleEdit(c)}><Pencil size={12} className="mr-1" />Edit</Button>
                  <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => handleDelete(c.id)}><Trash2 size={12} /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={showCreate} onOpenChange={(v) => { if (!v) { setShowCreate(false); setEditId(null); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Collection' : 'Create Collection'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1" /></div>
            <div><Label>Cover Image URL</Label><Input value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className="mt-1" placeholder="https://..." /></div>
            <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="mt-1" /></div>
            <div>
              <Label className="mb-2 block">Select Products ({selectedProductIds.length} selected)</Label>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                {products?.length ? products.map((p: any) => (
                  <label key={p.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer text-sm">
                    <input type="checkbox" checked={selectedProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="rounded" />
                    <span className="truncate flex-1">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{formatCurrency(p.price)}</span>
                  </label>
                )) : <p className="text-sm text-muted-foreground text-center py-4">Loading products...</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSave} disabled={!form.name.trim()}>{editId ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DealsTab() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', productId: '', discountPercent: '10', startDate: '', endDate: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => fetch('/api/deals').then(r => r.json()).then((r: any) => r.data || []),
  });

  const createMutation = useMutation({
    mutationFn: () => fetch('/api/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, discountPercent: parseFloat(form.discountPercent), isActive: true, sortOrder: 0 }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); toast.success('Deal created'); setShowCreate(false); setForm({ title: '', description: '', productId: '', discountPercent: '10', startDate: '', endDate: '' }); },
    onError: () => toast.error('Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/deals?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); toast.success('Deal deleted'); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Deals</h3>
        <Button className="bg-amber-600 hover:bg-amber-700" size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" />Create</Button>
      </div>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> :
        <Card><Table><TableHeader><TableRow><TableHead>Deal</TableHead><TableHead>Product</TableHead><TableHead>Discount</TableHead><TableHead>Period</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>{(data || []).map((d: any) => (
            <TableRow key={d.id}><TableCell className="font-medium text-sm">{d.title}</TableCell><TableCell className="text-sm">{d.product?.name || d.productId}</TableCell><TableCell><Badge className="bg-green-100 text-green-700">{d.discountPercent}%</Badge></TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(d.startDate).toLocaleDateString()} — {new Date(d.endDate).toLocaleDateString()}</TableCell>
              <TableCell><Badge variant={d.isActive ? 'default' : 'secondary'}>{d.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
              <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(d.id)}><Trash2 size={14} /></Button></TableCell></TableRow>
          ))}</TableBody></Table></Card>}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent><DialogHeader><DialogTitle>Create Deal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1" /></div>
            <div><Label>Product ID *</Label><Input value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Discount % *</Label><Input type="number" value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))} className="mt-1" /></div>
              <div><Label>Sort Order</Label><Input type="number" value="0" disabled className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date *</Label><Input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="mt-1" /></div>
              <div><Label>End Date *</Label><Input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button className="bg-amber-600 hover:bg-amber-700" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title || !form.productId}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ ADMIN FAQ ============

function AdminFAQ() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'General', sortOrder: '0' });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin-faq'],
    queryFn: () => fetch('/api/faq').then(r => r.json()).then((r: any) => r.data || []),
  });

  const saveMutation = useMutation({
    mutationFn: () => fetch('/api/faq', {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(editId ? { id: editId } : {}), ...form, sortOrder: parseInt(form.sortOrder), isActive: true }),
    }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faq'] }); toast.success(editId ? 'FAQ updated' : 'FAQ added'); setShowAdd(false); setEditId(null); setForm({ question: '', answer: '', category: 'General', sortOrder: '0' }); },
    onError: () => toast.error('Failed to save FAQ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/faq?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faq'] }); toast.success('FAQ deleted'); },
  });

  const handleEdit = (faq: any) => {
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, sortOrder: String(faq.sortOrder) });
    setEditId(faq.id);
    setShowAdd(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">FAQ Management</h1><p className="text-muted-foreground text-sm">Manage frequently asked questions</p></div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => { setForm({ question: '', answer: '', category: 'General', sortOrder: '0' }); setEditId(null); setShowAdd(true); }}><Plus size={16} className="mr-1.5" />Add FAQ</Button>
      </div>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div> :
        <Card className="p-4">
          <Accordion type="multiple">
            {(faqs || []).map((faq: any, i: number) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center gap-3 flex-1 pr-4">
                    <span className="text-sm font-medium flex-1 truncate">{faq.question}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{faq.category}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground mb-3">{faq.answer}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(faq)}><Pencil size={12} className="mr-1" />Edit</Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(faq.id)}><Trash2 size={12} className="mr-1" />Delete</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {(!faqs || faqs.length === 0) && <div className="flex flex-col items-center justify-center py-12 text-center"><HelpCircle size={40} className="text-muted-foreground/40 mb-3" /><p className="text-muted-foreground font-medium">No FAQs yet</p><p className="text-muted-foreground text-sm mt-1">Add frequently asked questions to help customers</p></div>}
        </Card>}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent><DialogHeader><DialogTitle>{editId ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Question *</Label><Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} className="mt-1" /></div>
            <div><Label>Answer *</Label><Textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} className="mt-1" rows={4} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="mt-1" placeholder="e.g. General, Shipping, Returns" /></div>
              <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button className="bg-amber-600 hover:bg-amber-700" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.question || !form.answer}>{saveMutation.isPending ? 'Saving...' : editId ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ ADMIN ROLES ============

const ROLE_PERMISSIONS: Record<string, string> = {
  SUPER_ADMIN: 'Full Access (all features)',
  FINANCE_ADMIN: 'Payouts, Wallet, Commission Reports, Analytics',
  SUPPORT_ADMIN: 'Support Tickets, Returns, Customer Management',
  INVENTORY_ADMIN: 'Products, Categories, Brands, Inventory, Orders',
};

const ROLE_DETAIL_PERMISSIONS: Record<string, { label: string; color: string; desc: string; permissions: string[] }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', desc: 'Full access to all features', permissions: ['All Permissions'] },
  FINANCE_ADMIN: { label: 'Finance Admin', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', desc: 'Payouts, wallet, revenue, coupons', permissions: ['Manage Payouts', 'View Revenue', 'Manage Coupons', 'View Reports'] },
  SUPPORT_ADMIN: { label: 'Support Admin', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', desc: 'Tickets, returns, customers', permissions: ['Manage Tickets', 'Process Returns', 'View Customers', 'Manage FAQ'] },
  INVENTORY_ADMIN: { label: 'Inventory Admin', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', desc: 'Products, categories, brands, stock', permissions: ['Manage Products', 'Manage Categories', 'Manage Brands', 'View Stock'] },
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  FINANCE_ADMIN: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  SUPPORT_ADMIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  INVENTORY_ADMIN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const ROLE_OPTIONS = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'INVENTORY_ADMIN'];

function AdminRolesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SUPPORT_ADMIN' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => fetch('/api/admin/roles').then(r => r.json()).then((r: any) => r.data || []),
  });

  const createMutation = useMutation({
    mutationFn: () => fetch('/api/admin/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-roles'] }); toast.success('Admin user created'); setShowCreate(false); setForm({ name: '', email: '', password: '', role: 'SUPPORT_ADMIN' }); },
    onError: (e: any) => toast.error(e?.message || 'Failed to create admin'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => fetch('/api/admin/roles', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-roles'] }); toast.success('Role updated'); },
    onError: () => toast.error('Failed to update role'),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Admin Roles</h1><p className="text-muted-foreground text-sm">Manage admin users and role-based access</p></div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowCreate(true)}><Plus size={16} className="mr-1.5" />Create Admin</Button>
      </div>

      {/* RBAC Permissions Matrix */}
      <div className="grid md:grid-cols-2 gap-4">
        {ROLE_OPTIONS.map(role => {
          const detail = ROLE_DETAIL_PERMISSIONS[role];
          const adminCount = (data || []).filter((a: any) => a.role === role).length;
          return (
            <Card key={role} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="font-bold text-lg">{detail.label}</h3><p className="text-sm text-muted-foreground">{detail.desc}</p></div>
                <Badge className={detail.color}>{adminCount}</Badge>
              </div>
              <div className="space-y-2">
                {detail.permissions.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 size={14} className="text-green-500" />{p}</div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div> :
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!data || data.length === 0) && <TableRow><TableCell colSpan={6}><div className="flex flex-col items-center justify-center py-12 text-center"><UserCog size={40} className="text-muted-foreground/40 mb-3" /><p className="text-muted-foreground font-medium">No admin users found</p></div></TableCell></TableRow>}
                {data?.map((admin: any) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-amber-100 text-amber-600">{admin.name?.[0]}</AvatarFallback></Avatar>
                        <span className="font-medium text-sm">{admin.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{admin.email}</TableCell>
                    <TableCell><Badge className={ROLE_COLORS[admin.role] || ''}>{admin.role?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell><Badge variant={admin.isActive ? 'default' : 'secondary'}>{admin.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString('en-IN') : 'Never'}</TableCell>
                    <TableCell className="text-right">
                      <Select value={admin.role} onValueChange={(v) => updateRoleMutation.mutate({ userId: admin.id, role: v })}>
                        <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{ROLE_OPTIONS.map(r => <SelectItem key={r} value={r}>{r.replace('_', ' ')}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Admin User</DialogTitle><DialogDescription>Add a new admin with a specific role</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1" /></div>
            <div><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="mt-1" /></div>
            <div>
              <Label>Role *</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(r => (
                    <SelectItem key={r} value={r}>
                      <div><span className="font-medium">{r.replace('_', ' ')}</span><span className="text-xs text-muted-foreground ml-2">— {ROLE_PERMISSIONS[r]}</span></div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.name || !form.email || !form.password}>{createMutation.isPending ? 'Creating...' : 'Create Admin'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ ADMIN ACTIVITY LOGS ============

function AdminActivityLogs() {
  const { data } = useQuery({ queryKey: ['activity-logs'], queryFn: () => fetch('/api/admin/activity-logs').then(r => r.json()) });
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Activity Logs</h1>
      <Card><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Details</TableHead><TableHead className="hidden md:table-cell">IP</TableHead><TableHead>Timestamp</TableHead></TableRow></TableHeader>
        <TableBody>{(data?.data || []).map((log: any) => (
          <TableRow key={log.id}><TableCell className="text-sm">{log.user?.name || 'System'}</TableCell><TableCell><Badge variant="outline">{log.action}</Badge></TableCell><TableCell className="text-sm">{log.entityType || '—'}</TableCell><TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{log.details || '—'}</TableCell><TableCell className="hidden md:table-cell text-xs text-muted-foreground">{log.ipAddress || '—'}</TableCell><TableCell className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString('en-IN')}</TableCell></TableRow>
        ))}</TableBody></Table></Card>
    </div>
  );
}

// ============ ADMIN VENDOR WALLETS ============

function AdminVendorWalletsPage() {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['admin-vendor-wallets-page'],
    queryFn: () => fetch('/api/admin/vendor-wallets').then(r => r.json()).then((r: any) => r.data || []),
  });
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Vendor Wallets</h2>
      {isLoading ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-40 rounded-xl" />)}</div> :
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v: any) => (
          <Card key={v.id} className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Store size={20} className="text-orange-500" /></div>
              <div><p className="font-semibold">{v.businessName}</p><p className="text-xs text-muted-foreground">{v.user?.email}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/30 rounded-lg p-3"><p className="text-muted-foreground text-xs">Available</p><p className="font-bold text-green-600">{formatCurrency(v.wallet?.availableBalance || 0)}</p></div>
              <div className="bg-muted/30 rounded-lg p-3"><p className="text-muted-foreground text-xs">Pending</p><p className="font-bold text-amber-600">{formatCurrency(v.wallet?.pendingBalance || 0)}</p></div>
              <div className="bg-muted/30 rounded-lg p-3"><p className="text-muted-foreground text-xs">Total Earned</p><p className="font-bold">{formatCurrency(v.wallet?.totalEarned || 0)}</p></div>
              <div className="bg-muted/30 rounded-lg p-3"><p className="text-muted-foreground text-xs">Commission</p><p className="font-bold">{v.commissionRate}%</p></div>
            </div>
          </Card>
        ))}
      </div>}
    </div>
  );
}

// ============ ADMIN NOTIFICATIONS ============

function AdminNotifications() {
  const { notifications, unreadCount, isLoading, refetch } = useNotifications();
  const { markAllRead: storeMarkAllRead } = useNotificationStore();
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/notifications/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { refetch(); qc.invalidateQueries({ queryKey: ['notifications'] }); setDeletingId(null); toast.success('Notification deleted'); },
    onError: () => { setDeletingId(null); toast.error('Failed to delete notification'); },
  });

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications/mark-all-read', { method: 'PUT' });
    storeMarkAllRead();
    qc.invalidateQueries({ queryKey: ['notifications'] });
    toast.success('All notifications marked as read');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vendor': case 'VENDOR': case 'vendor_registration': return <Store size={18} className="text-blue-500" />;
      case 'customer': case 'CUSTOMER': case 'customer_registration': return <Users size={18} className="text-purple-500" />;
      case 'alert': case 'ALERT': case 'low_stock': return <AlertTriangle size={18} className="text-amber-500" />;
      case 'order': case 'ORDER': case 'high_value': return <ShoppingCart size={18} className="text-orange-500" />;
      case 'return': case 'RETURN': return <RotateCcw size={18} className="text-red-500" />;
      case 'wallet': case 'WALLET': case 'payout': case 'withdrawal': return <Wallet size={18} className="text-green-500" />;
      case 'system': case 'SYSTEM': case 'platform': return <Shield size={18} className="text-slate-500" />;
      default: return <Bell size={18} className="text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4 border rounded-lg">
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCircle size={14} className="mr-2" />Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No notifications</h3>
          <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {(notifications as Array<{ id: string; title: string; message: string; isRead: boolean; createdAt: string; type?: string }>).map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${!n.isRead ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50' : 'hover:bg-muted/50'}`}
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  {getNotificationIcon(n.type || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-medium' : 'text-muted-foreground'}`}>{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Delete notification"
                  disabled={deletingId === n.id}
                  onClick={() => { setDeletingId(n.id); deleteMutation.mutate(n.id); }}
                >
                  {deletingId === n.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ============ MAIN ADMIN APP ============

export default function AdminApp() {
  const { user, isAuthenticated } = useAuthStore();
  const { adminView, setAdminView, setAppView } = useNavigationStore();

  // Confirmation dialog state (must be before any early return)
  const [confirmState, setConfirmState] = useState<{ title: string; description: string; onConfirm: () => void } | null>(null);
  const doConfirm = useCallback((action: { title: string; description: string; onConfirm: () => void }) => setConfirmState(action), []);
  const handleConfirm = useCallback(() => { confirmState?.onConfirm(); setConfirmState(null); }, [confirmState]);

  // Auth guard
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    toast.warning('Unauthorized access', { description: 'Admin privileges required to access this panel.' });
    useNavigationStore.getState().setAppView('customer');
    return null;
  }

  const renderView = () => {
    switch (adminView) {
      case 'admin-dashboard': return <AdminDashboard />;
      case 'admin-vendors': return <AdminVendors />;
      case 'admin-categories': return <AdminCategories />;
      case 'admin-brands': return <AdminBrands />;
      case 'admin-products': return <AdminProducts />;
      case 'admin-orders': return <AdminOrders />;
      case 'admin-customers': return <AdminCustomers />;
      case 'admin-coupons': return <AdminCoupons />;
      case 'admin-banners': return <AdminBanners />;
      case 'admin-reports': return <AdminReports />;
      case 'admin-returns': return <AdminReturns />;
      case 'admin-payouts': return <AdminPayouts />;
      case 'admin-vendor-wallets': return <AdminVendorWalletsPage />;
      case 'admin-analytics': return <AdminAnalytics />;
      case 'admin-support': return <AdminSupport />;
      case 'admin-marketing': return <AdminMarketing />;
      case 'admin-faq': return <AdminFAQ />;
      case 'admin-roles': return <AdminRolesPage />;
      case 'admin-activity-logs': return <AdminActivityLogs />;
      case 'admin-settings': return <AdminSettings />;
      case 'admin-notifications': return <AdminNotifications />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <ConfirmContext.Provider value={doConfirm}>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <AdminMobileHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main id="main-content" className="flex-1 overflow-auto" role="main"><AnimatePresence mode="wait"><motion.div key={adminView} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.15}}>{renderView()}</motion.div></AnimatePresence></main>
      </div>
      <AlertDialog open={!!confirmState} onOpenChange={(open) => { if (!open) setConfirmState(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirmState?.title}</AlertDialogTitle><AlertDialogDescription>{confirmState?.description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </motion.div>
    </ConfirmContext.Provider>
  );
}