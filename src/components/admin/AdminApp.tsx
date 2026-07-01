'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  BarChart3, Users, Package, ShoppingCart, Store, DollarSign, TrendingUp,
  Settings, LogOut, Menu, X, ChevronLeft, ChevronRight, Search, Eye,
  Plus, Pencil, Trash2, CheckCircle, XCircle, AlertTriangle, Shield,
  Tag, Image, Bell, FileText, UserCog, CreditCard, PieChart, LineChart
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { useAuthStore, useNavigationStore } from '@/stores';
import type { Product, Category, Brand, Vendor, Order, Coupon, Banner, AdminDashboardStats } from '@/types';

const formatCurrency = (price: number) => '₹' + price.toLocaleString('en-IN', { maximumFractionDigits: 0 });

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
  { key: 'admin-settings', label: 'Settings', icon: Settings },
];

// ============ ADMIN SIDEBAR ============

function AdminSidebar() {
  const { adminView, setAdminView, setAppView } = useNavigationStore();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} border-r bg-card flex flex-col transition-all duration-300 hidden lg:flex`}>
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
                  <Button variant={adminView === item.key ? 'secondary' : 'ghost'} size="sm" className={`w-full justify-start gap-3 ${collapsed ? 'justify-center px-0' : ''}`} onClick={() => setAdminView(item.key as any)}>
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
        <Button variant="ghost" size="sm" className={`w-full justify-start gap-3 text-muted-foreground ${collapsed ? 'justify-center px-0' : ''}`} onClick={() => { logout(); setAppView('customer'); toast.success('Logged out'); }}>
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

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-background border-b px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}><Menu size={20} /></Button>
        <Shield size={20} className="text-amber-600" />
        <span className="font-bold">Admin Panel</span>
      </div>
      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-amber-100 text-amber-600">{user?.name?.[0]}</AvatarFallback></Avatar>
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
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" onClick={() => { logout(); setAppView('customer'); }}><LogOut size={18} />Logout</Button>
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
    queryFn: () => fetch('/api/admin/dashboard').then(r => r.json()).then((r: any) => r.data),
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
            <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon size={20} /></div></div></Card>
          </motion.div>
        ))}
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const [detailVendor, setDetailVendor] = useState<Vendor | null>(null);

  const params = new URLSearchParams({ limit: '20' });
  if (statusFilter !== 'all') params.set('status', statusFilter);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors', statusFilter],
    queryFn: () => fetch(`/api/vendors?${params}`).then(r => r.json()).then((r: any) => r),
  });

  const updateVendor = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => fetch(`/api/vendors/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-vendors'] }); toast.success('Vendor updated'); },
    onError: () => toast.error('Failed to update vendor'),
  });

  const statusColor: Record<string, string> = { PENDING: 'bg-amber-100 text-amber-700', APPROVED: 'bg-green-100 text-green-700', SUSPENDED: 'bg-red-100 text-red-700', REJECTED: 'bg-gray-100 text-gray-700' };

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Vendor Management</h1><p className="text-muted-foreground text-sm">Manage vendor accounts and applications</p></div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className={statusFilter === s ? 'bg-amber-600' : ''} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All' : s} {s !== 'all' && data?.data?.filter((v: Vendor) => v.status === s).length ? `(${data.data.filter((v: Vendor) => v.status === s).length})` : ''}
          </Button>
        ))}
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> :
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead className="hidden md:table-cell">Email</TableHead><TableHead>Products</TableHead><TableHead>Revenue</TableHead><TableHead>Rating</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {!data?.data?.length && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No vendors found</TableCell></TableRow>}
            {data?.data?.map((vendor: Vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">{vendor.businessName[0]}</div>
                    <div><p className="font-medium text-sm">{vendor.businessName}</p><p className="text-xs text-muted-foreground">Since {new Date(vendor.createdAt).toLocaleDateString()}</p></div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{vendor.user?.email}</TableCell>
                <TableCell className="font-medium">{vendor._count?.products || 0}</TableCell>
                <TableCell className="font-medium">{formatCurrency(vendor.totalRevenue)}</TableCell>
                <TableCell>{vendor.rating?.toFixed(1) || 'N/A'}</TableCell>
                <TableCell><Badge className={statusColor[vendor.status] || ''}>{vendor.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailVendor(vendor)}><Eye size={14} /></Button>
                    {vendor.status === 'PENDING' && <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => updateVendor.mutate({ id: vendor.id, status: 'APPROVED' })}><CheckCircle size={14} /></Button>}
                    {vendor.status === 'PENDING' && <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => updateVendor.mutate({ id: vendor.id, status: 'REJECTED' })}><XCircle size={14} /></Button>}
                    {vendor.status === 'APPROVED' && <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" onClick={() => updateVendor.mutate({ id: vendor.id, status: 'SUSPENDED' })}><XCircle size={14} /></Button>}
                    {vendor.status === 'SUSPENDED' && <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => updateVendor.mutate({ id: vendor.id, status: 'APPROVED' })}><CheckCircle size={14} /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>}

      {/* Vendor Detail Modal */}
      <Dialog open={!!detailVendor} onOpenChange={() => setDetailVendor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Vendor Details</DialogTitle></DialogHeader>
          {detailVendor && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 text-2xl font-bold">{detailVendor.businessName[0]}</div>
                <div>
                  <h3 className="text-xl font-bold">{detailVendor.businessName}</h3>
                  <Badge className={statusColor[detailVendor.status] || ''}>{detailVendor.status}</Badge>
                  <p className="text-sm text-muted-foreground mt-1">{detailVendor.description}</p>
                </div>
              </div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Email:</span> <span className="ml-2">{detailVendor.user?.email}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="ml-2">{detailVendor.user?.phone || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">Products:</span> <span className="ml-2 font-medium">{detailVendor._count?.products || 0}</span></div>
                <div><span className="text-muted-foreground">Commission:</span> <span className="ml-2 font-medium">{detailVendor.commissionRate}%</span></div>
                <div><span className="text-muted-foreground">Total Sales:</span> <span className="ml-2 font-medium text-green-600">{formatCurrency(detailVendor.totalSales)}</span></div>
                <div><span className="text-muted-foreground">Revenue:</span> <span className="ml-2 font-medium">{formatCurrency(detailVendor.totalRevenue)}</span></div>
                <div><span className="text-muted-foreground">GST:</span> <span className="ml-2">{detailVendor.gstNumber || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">PAN:</span> <span className="ml-2">{detailVendor.panNumber || 'N/A'}</span></div>
              </div>
              <Separator />
              <div className="flex gap-2">
                {detailVendor.status === 'PENDING' && <>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => { updateVendor.mutate({ id: detailVendor.id, status: 'APPROVED' }); setDetailVendor(null); }}><CheckCircle size={16} className="mr-1.5" />Approve</Button>
                  <Button variant="destructive" onClick={() => { updateVendor.mutate({ id: detailVendor.id, status: 'REJECTED' }); setDetailVendor(null); }}><XCircle size={16} className="mr-1.5" />Reject</Button>
                </>}
                {detailVendor.status === 'APPROVED' && <Button variant="destructive" onClick={() => { updateVendor.mutate({ id: detailVendor.id, status: 'SUSPENDED' }); setDetailVendor(null); }}><XCircle size={16} className="mr-1.5" />Suspend</Button>}
                {detailVendor.status === 'SUSPENDED' && <Button className="bg-green-600 hover:bg-green-700" onClick={() => { updateVendor.mutate({ id: detailVendor.id, status: 'APPROVED' }); setDetailVendor(null); }}><CheckCircle size={16} className="mr-1.5" />Re-activate</Button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ CATEGORY MANAGEMENT ============

function AdminCategories() {
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success(editId ? 'Category updated' : 'Category created'); setShowAdd(false); setEditId(null); setForm({ name: '', description: '', parentId: '', sortOrder: '0' }); },
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
      <div className="space-y-2">
        {categories?.map((cat: any) => (
          <div key={cat.id}>
            <Card className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">{cat.name[0]}</div>
                <div><p className="font-medium">{cat.name}</p><p className="text-sm text-muted-foreground">{cat._count?.products || 0} products</p></div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}><Pencil size={14} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(cat.id)}><Trash2 size={14} /></Button>
              </div>
            </Card>
            {cat.children?.map((child: any) => (
              <Card key={child.id} className="p-4 flex items-center justify-between ml-8 mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold">{child.name[0]}</div>
                  <div><p className="font-medium text-sm">{child.name}</p><p className="text-xs text-muted-foreground">{child._count?.products || 0} products</p></div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(child)}><Pencil size={12} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(child.id)}><Trash2 size={12} /></Button>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent><DialogHeader><DialogTitle>{editId ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="mt-1" /></div>
            <div><Label>Parent Category</Label><Select value={form.parentId} onValueChange={v => setForm(f => ({...f, parentId: v}))}><SelectTrigger className="mt-1"><SelectValue placeholder="None (Root Category)" /></SelectTrigger><SelectContent><SelectItem value="none">None (Root Category)</SelectItem>{categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({...f, sortOrder: e.target.value}))} className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button className="bg-amber-600 hover:bg-amber-700" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name}>{saveMutation.isPending ? 'Saving...' : editId ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ BRAND MANAGEMENT ============

function AdminBrands() {
  const qc = useQueryClient();
  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => fetch('/api/brands').then(r => r.json()).then((r: any) => r.data || []),
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const addMutation = useMutation({
    mutationFn: () => fetch('/api/brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['brands'] }); toast.success('Brand created'); setShowAdd(false); setForm({ name: '', description: '' }); },
    onError: () => toast.error('Failed to create brand'),
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) :
        brands?.map((brand: any) => (
          <Card key={brand.id} className="p-4 flex items-center justify-between">
            <div><p className="font-medium">{brand.name}</p><p className="text-sm text-muted-foreground">{brand._count?.products || 0} products</p></div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => deleteMutation.mutate(brand.id)}><Trash2 size={14} /></Button>
          </Card>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent><DialogHeader><DialogTitle>Add Brand</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Brand Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button className="bg-amber-600 hover:bg-amber-700" onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !form.name}>Create</Button></DialogFooter>
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
              <TableRow key={p.id}>
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order updated'); },
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
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data?.data?.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell><p className="font-medium text-sm">#{order.orderNumber}</p></TableCell>
                <TableCell className="text-sm">{order.user?.name}</TableCell>
                <TableCell className="text-sm">{order.items?.length || 0} items</TableCell>
                <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                <TableCell><Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'} className="text-xs">{order.paymentStatus}</Badge></TableCell>
                <TableCell><Badge className={statusColor[order.status] || ''}>{order.status}</Badge></TableCell>
                <TableCell className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Select value={order.status} onValueChange={(v) => updateMutation.mutate({ id: order.id, status: v })}>
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
      </Card>}
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
              <TableRow key={u.id}>
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); toast.success('Coupon created'); setShowAdd(false); },
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
              <TableRow key={c.id}>
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
  const { data } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => fetch('/api/admin/dashboard').then(r => r.json()).then((r: any) => r.data) });

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
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => fetch('/api/settings').then(r => r.json()).then((r: any) => r.data) });
  const [form, setForm] = useState<any>({});

  React.useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => r.json()),
    onSuccess: () => toast.success('Settings saved'),
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

// ============ MAIN ADMIN APP ============

export default function AdminApp() {
  const { adminView, setAdminView } = useNavigationStore();

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
      case 'admin-settings': return <AdminSettings />;
      case 'admin-activity-logs': return <div className="p-6"><h1 className="text-2xl font-bold mb-4">Activity Logs</h1><p className="text-muted-foreground">Activity tracking coming soon</p></div>;
      case 'admin-notifications': return <div className="p-6"><h1 className="text-2xl font-bold mb-4">Notifications</h1><p className="text-muted-foreground">No new notifications</p></div>;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminMobileHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">{renderView()}</main>
      </div>
    </div>
  );
}