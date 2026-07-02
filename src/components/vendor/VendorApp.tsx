'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Package, ShoppingCart, DollarSign, Star, TrendingUp, BarChart3, Plus, Pencil, Trash2,
  Search, Filter, Eye, ChevronLeft, ChevronRight, Upload, Settings, Bell, LogOut,
  Store, Menu, X, User, AlertTriangle, CheckCircle, Clock, Truck, BoxIcon, XCircle, ShieldCheck,
  Wallet, Copy, Printer, ArrowDownUp, FileText, RotateCcw, Ban, Download, FileSpreadsheet, Tags
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
import { useAuthStore, useNavigationStore } from '@/stores';
import type { Product, Order, ApiResponse, VendorDashboardStats, VendorWallet, WalletTransaction, InventoryHistory } from '@/types';

const formatCurrency = (price: number) => '₹' + price.toLocaleString('en-IN', { maximumFractionDigits: 0 });

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push(<Star key={i} className="fill-amber-400 text-amber-400" size={size} />);
    else if (i - 0.5 <= rating) stars.push(<Star key={i} className="fill-amber-400 text-amber-400" size={size} style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    else stars.push(<Star key={i} className="text-muted-foreground/30" size={size} />);
  }
  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}

// ============ VENDOR LAYOUT ============

const VENDOR_NAV = [
  { key: 'vendor-dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'vendor-products', label: 'Products', icon: Package },
  { key: 'vendor-add-product', label: 'Add Product', icon: Plus },
  { key: 'vendor-orders', label: 'Orders', icon: ShoppingCart },
  { key: 'vendor-inventory', label: 'Inventory', icon: BoxIcon },
  { key: 'vendor-reports', label: 'Reports', icon: TrendingUp },
  { key: 'vendor-wallet', label: 'Wallet', icon: Wallet },
  { key: 'vendor-profile', label: 'Profile', icon: User },
  { key: 'vendor-settings', label: 'Settings', icon: Settings },
];

function VendorSidebar() {
  const { vendorView, setVendorView, setAppView } = useNavigationStore();
  const { user, vendorId, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside role="navigation" aria-label="Vendor panel navigation" className={`${collapsed ? 'w-16' : 'w-64'} border-r bg-card flex flex-col transition-all duration-300 hidden lg:flex`}>
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 font-bold shrink-0">{user?.name?.[0]}</div>
        {!collapsed && <div className="min-w-0"><p className="font-semibold text-sm truncate">{user?.name}</p><p className="text-xs text-muted-foreground truncate">Vendor Panel</p></div>}
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-1">
          {VENDOR_NAV.map(item => (
            <TooltipProvider key={item.key} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={vendorView === item.key ? 'secondary' : 'ghost'} size="sm" aria-current={vendorView === item.key ? 'page' : undefined} className={`w-full justify-start gap-3 ${collapsed ? 'justify-center px-0' : ''}`} onClick={() => setVendorView(item.key as any)}>
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
        <Button variant="ghost" size="sm" className={`w-full justify-start gap-3 ${collapsed ? 'justify-center px-0' : ''} text-muted-foreground`} onClick={() => { logout(); setAppView('customer'); toast.success('Logged out'); }}>
          <LogOut size={18} />{!collapsed && <span>Logout</span>}
        </Button>
        <Button variant="ghost" size="sm" aria-label="Toggle sidebar" className="w-full justify-center lg:hidden" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
    </aside>
  );
}

function VendorMobileHeader() {
  const { user, logout } = useAuthStore();
  const { vendorView, setVendorView, setAppView } = useNavigationStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-background border-b px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}><Menu size={20} /></Button>
        <Store size={20} className="text-orange-500" />
        <span className="font-bold">Vendor Panel</span>
      </div>
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-orange-100 text-orange-600">{user?.name?.[0]}</AvatarFallback></Avatar>
      </div>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r p-4 space-y-2">
            <div className="flex items-center justify-between mb-4"><span className="font-bold">Menu</span><Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X size={20} /></Button></div>
            {VENDOR_NAV.map(item => (
              <Button key={item.key} variant={vendorView === item.key ? 'secondary' : 'ghost'} className="w-full justify-start gap-3" onClick={() => { setVendorView(item.key as any); setOpen(false); }}>
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

// ============ VENDOR DASHBOARD ============

function VendorDashboard() {
  const { vendorId } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-dashboard', vendorId],
    queryFn: () => fetch(`/api/vendor/dashboard?vendorId=${vendorId}`).then(r => r.json()).then((r: ApiResponse<VendorDashboardStats>) => r.data),
    enabled: !!vendorId,
  });

  if (isLoading) return <div className="p-6 space-y-4">{Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>;
  if (!data) return <div className="p-6 text-center text-muted-foreground">Failed to load dashboard</div>;

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data.totalRevenue), icon: DollarSign, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Orders', value: String(data.totalOrders), icon: ShoppingCart, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Products', value: String(data.totalProducts), icon: Package, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Avg Rating', value: data.avgRating?.toFixed(1) || '0', icon: Star, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your business overview.</p>
      </div>

      {data.lowStockProducts > 0 && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-900/10 p-4 flex items-center gap-3">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <p className="text-sm"><span className="font-medium">{data.lowStockProducts} products</span> are running low on stock. <span className="text-amber-600 cursor-pointer underline" onClick={() => useNavigationStore.getState().setVendorView('vendor-products')}>Manage inventory</span></p>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon size={20} /></div></div></Card>
          </motion.div>
        ))}
      </div>

      {/* Sales Chart */}
      {data.monthlySales && data.monthlySales.length > 0 && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4"><CardTitle className="text-lg">Monthly Sales</CardTitle></CardHeader>
          <div className="h-48 flex items-end gap-2">
            {data.monthlySales.map((ms, i) => {
              const maxSale = Math.max(...data.monthlySales.map(m => m.sales), 1);
              const height = (ms.sales / maxSale) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{formatCurrency(ms.sales)}</span>
                  <div className="w-full bg-orange-500 rounded-t-md transition-all duration-500" style={{ height: `${Math.max(height, 4)}%` }} />
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
            {data.recentOrders?.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>}
            {data.recentOrders?.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">#{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.user?.name} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
                  <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4"><CardTitle className="text-lg">Top Products</CardTitle></CardHeader>
          <div className="space-y-3">
            {data.topProducts?.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No products yet</p>}
            {data.topProducts?.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                <div className="w-10 h-10 rounded bg-muted shrink-0 overflow-hidden">
                  {product.images?.[0]?.url && <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{product.name}</p><p className="text-xs text-muted-foreground">{product.totalSold} sold</p></div>
                <p className="text-sm font-bold">{formatCurrency(product.price)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============ VENDOR PRODUCTS ============

function VendorProducts() {
  const { vendorId } = useAuthStore();
  const { setSelectedProductId, setVendorView } = useNavigationStore();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products', vendorId, page, search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ vendorId: vendorId || '', page: String(page), limit: '12', search });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      return fetch(`/api/products?${params}`).then(r => r.json()).then((r: ApiResponse<Product[]>) => r);
    },
    enabled: !!vendorId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/products?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-products'] }); toast.success('Product deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete product'),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/vendor/products/${id}/duplicate`, { method: 'POST' }).then(r => r.json()),
    onSuccess: (data) => {
      if (data.success) { toast.success('Product duplicated successfully'); qc.invalidateQueries({ queryKey: ['vendor-products'] }); }
      else toast.error(data.error || 'Failed to duplicate');
    },
    onError: () => toast.error('Failed to duplicate product'),
  });

  const handleBulkImport = async () => {
    if (!importFile || !vendorId) return;
    setImporting(true);
    try {
      const text = await importFile.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { toast.error('CSV file is empty or has no data rows'); setImporting(false); return; }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const products = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
        products.push(row);
      }
      const res = await fetch('/api/vendor/products/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, products }),
      });
      const result = await res.json();
      if (result.success) {
        const d = result.data;
        toast.success(`Imported ${d.successCount}/${d.totalProducts} products successfully`);
        if (d.errors.length > 0) toast.error(`${d.errors.length} errors occurred`);
        qc.invalidateQueries({ queryKey: ['vendor-products'] });
        setImportOpen(false);
        setImportFile(null);
      } else {
        toast.error(result.error || 'Import failed');
      }
    } catch {
      toast.error('Failed to parse CSV file');
    }
    setImporting(false);
  };

  const downloadTemplate = () => {
    const csv = 'name,description,price,compareAtPrice,stock,sku,categoryId,brandId,weight\nSample Product,Sample description,999,1299,50,SKU001,cat_id_here,brand_id_here,0.5\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'product_import_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkExport = async () => {
    try {
      const params = new URLSearchParams({ vendorId: vendorId || '', page: '1', limit: '9999', search: '' });
      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      const products: Product[] = json.data || [];
      if (products.length === 0) { toast.error('No products to export'); return; }
      const headers = ['name', 'sku', 'price', 'stock', 'status', 'category'];
      const rows = products.map(p => [
        `"${p.name}"`, `"${p.sku || ''}"`, String(p.price), String(p.stock),
        p.productStatus, `"${p.category?.name || ''}"`
      ].join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `products_export_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${products.length} products`);
    } catch {
      toast.error('Failed to export products');
    }
  };

  const statusColor: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    ARCHIVED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusFilters = ['all', 'PUBLISHED', 'DRAFT', 'ARCHIVED'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Products</h1><p className="text-muted-foreground text-sm">Manage your product catalog</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setVendorView('vendor-add-product')}><Plus size={16} className="mr-1.5" />Add Product</Button>
          <Button variant="outline" onClick={() => setImportOpen(true)}><Upload size={16} className="mr-1.5" />Bulk Import</Button>
          <Button variant="outline" onClick={handleBulkExport}><Download size={16} className="mr-1.5" />Bulk Export</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" /></div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className={statusFilter === s ? 'bg-orange-500 hover:bg-orange-600' : ''} onClick={() => { setStatusFilter(s); setPage(1); }}>
              {s === 'all' ? 'All' : s}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div> :
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="hidden md:table-cell">Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead className="hidden sm:table-cell">Status</TableHead><TableHead className="hidden sm:table-cell">Rating</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {!data?.data?.length && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No products found</TableCell></TableRow>}
            {data?.data?.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted shrink-0 overflow-hidden">
                      {product.images?.[0]?.url ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={16} /></div>}
                    </div>
                    <div className="min-w-0"><p className="font-medium text-sm truncate max-w-48">{product.name}</p><p className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</p></div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell"><Badge variant="secondary">{product.category?.name}</Badge></TableCell>
                <TableCell>
                  <div><span className="font-medium">{formatCurrency(product.price)}</span></div>
                  {product.compareAtPrice && <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>}
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${product.stock < 5 ? 'text-red-600' : product.stock < 20 ? 'text-amber-600' : 'text-green-600'}`}>{product.stock}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="secondary" className={statusColor[product.productStatus] || ''}>{product.productStatus}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell"><div className="flex items-center gap-1"><StarRating rating={product.rating} size={12} /><span className="text-sm">{product.rating}</span></div></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider delayDuration={0}><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateMutation.mutate(product.id)} disabled={duplicateMutation.isPending}><Copy size={14} /></Button></TooltipTrigger><TooltipContent>Duplicate</TooltipContent></Tooltip></TooltipProvider>
                    <TooltipProvider delayDuration={0}><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedProductId(product.id); setVendorView('vendor-add-product'); }}><Pencil size={14} /></Button></TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip></TooltipProvider>
                    <TooltipProvider delayDuration={0}><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(product.id)}><Trash2 size={14} /></Button></TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip></TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
            {Array.from({ length: Math.min(data.meta.totalPages, 5) }, (_, i) => i + 1).map(p => (
              <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className={p === page ? 'bg-orange-500' : ''} onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
          </div>
        )}
      </Card>}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent><DialogHeader><DialogTitle>Delete Product</DialogTitle><DialogDescription>Are you sure? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={importOpen} onOpenChange={(open) => { setImportOpen(open); if (!open) setImportFile(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileSpreadsheet size={20} />Bulk Import Products</DialogTitle>
            <DialogDescription>Upload a CSV file to import products in bulk.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-2">
              <Upload size={32} className="mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {importFile ? <span className="font-medium text-foreground">{importFile.name}</span> : 'Drag & drop or click to select a CSV file'}
              </p>
              <Input
                type="file"
                accept=".csv"
                className="max-w-xs mx-auto"
                onChange={e => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Required columns: <span className="font-medium text-foreground">name, price, categoryId</span></p>
              <p>Optional columns: description, compareAtPrice, stock, sku, brandId, weight</p>
            </div>
            <Button variant="link" className="p-0 h-auto text-orange-600" onClick={downloadTemplate}>
              <Download size={14} className="mr-1" />Download CSV Template
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setImportOpen(false); setImportFile(null); }}>Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleBulkImport} disabled={!importFile || importing}>
              {importing ? 'Importing...' : 'Import Products'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ ADD/EDIT PRODUCT ============

function VendorAddProduct() {
  const { vendorId } = useAuthStore();
  const { selectedProductId, setVendorView } = useNavigationStore();
  const qc = useQueryClient();
  const isEditing = !!selectedProductId;

  const { data: product } = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: () => fetch(`/api/products/${selectedProductId}`).then(r => r.json()).then((r: ApiResponse<Product>) => r.data),
    enabled: isEditing,
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => fetch('/api/categories').then(r => r.json()).then((r: any) => { const flat: any[] = []; (r.data || []).forEach((c: any) => { flat.push(c); c.children?.forEach((ch: any) => flat.push(ch)); }); return flat; }) });
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: () => fetch('/api/brands').then(r => r.json()).then((r: any) => r.data || []) });

  const [form, setForm] = useState({
    name: '', slug: '', description: '', shortDescription: '', sku: '', barcode: '',
    price: '', compareAtPrice: '', costPrice: '', stock: '10', weight: '', warranty: '', returnPolicy: '',
    categoryId: '', brandId: '', isFeatured: false, seoTitle: '', seoDescription: '', seoKeywords: '',
    productStatus: 'DRAFT', badge: 'NONE', estimatedDeliveryDays: '7',
  });

  React.useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '', slug: product.slug || '', description: product.description || '', shortDescription: product.shortDescription || '',
        sku: product.sku || '', barcode: product.barcode || '', price: String(product.price || ''), compareAtPrice: String(product.compareAtPrice || ''),
        costPrice: String(product.costPrice || ''), stock: String(product.stock || '10'), weight: String(product.weight || ''), warranty: product.warranty || '',
        returnPolicy: product.returnPolicy || '', categoryId: product.categoryId || '', brandId: product.brandId || '',
        isFeatured: product.isFeatured || false, seoTitle: product.seoTitle || '', seoDescription: product.seoDescription || '', seoKeywords: product.seoKeywords || '',
        productStatus: product.productStatus || 'DRAFT', badge: product.badge || 'NONE', estimatedDeliveryDays: String(product.estimatedDeliveryDays || 7),
      });
    }
  }, [product]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        vendorId,
        ...form,
        price: parseFloat(form.price) || 0,
        compareAtPrice: parseFloat(form.compareAtPrice) || null,
        costPrice: parseFloat(form.costPrice) || null,
        stock: parseInt(form.stock) || 0,
        weight: parseFloat(form.weight) || null,
        estimatedDeliveryDays: parseInt(form.estimatedDeliveryDays) || 7,
        badge: form.badge === 'NONE' ? null : form.badge,
        images: [{ url: `https://placehold.co/600x600/f97316/ffffff?text=${encodeURIComponent(form.name.substring(0, 15))}`, alt: form.name, sortOrder: 0 }],
        specs: [{ key: 'Warranty', value: form.warranty || 'Standard' }],
      };
      if (isEditing) {
        const res = await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedProductId, ...body }) });
        return res.json();
      }
      const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) { toast.success(isEditing ? 'Product updated!' : 'Product created!'); qc.invalidateQueries({ queryKey: ['vendor-products'] }); setVendorView('vendor-products'); }
      else toast.error(data.error || 'Failed to save product');
    },
    onError: () => toast.error('Failed to save product'),
  });

  const update = (key: string, value: string | boolean) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => { setVendorView('vendor-products'); useNavigationStore.getState().setSelectedProductId(null); }}><ChevronLeft size={20} /></Button>
        <div><h1 className="text-2xl font-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</h1><p className="text-muted-foreground text-sm">{isEditing ? 'Update product details' : 'Fill in the product information'}</p></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6"><h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div><Label>Product Name *</Label><Input value={form.name} onChange={e => { update('name', e.target.value); update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} className="mt-1" placeholder="Product name" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => update('slug', e.target.value)} className="mt-1" /></div>
              <div><Label>Short Description</Label><Input value={form.shortDescription} onChange={e => update('shortDescription', e.target.value)} className="mt-1" placeholder="Brief product summary" /></div>
              <div><Label>Full Description</Label><Textarea value={form.description} onChange={e => update('description', e.target.value)} className="mt-1" rows={4} placeholder="Detailed product description" /></div>
            </div>
          </Card>

          <Card className="p-6"><h3 className="font-semibold mb-4">Pricing & Inventory</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Price * (₹)</Label><Input type="number" value={form.price} onChange={e => update('price', e.target.value)} className="mt-1" /></div>
              <div><Label>Compare at Price (₹)</Label><Input type="number" value={form.compareAtPrice} onChange={e => update('compareAtPrice', e.target.value)} className="mt-1" /></div>
              <div><Label>Cost Price (₹)</Label><Input type="number" value={form.costPrice} onChange={e => update('costPrice', e.target.value)} className="mt-1" /></div>
              <div><Label>Stock Quantity *</Label><Input type="number" value={form.stock} onChange={e => update('stock', e.target.value)} className="mt-1" /></div>
              <div><Label>SKU</Label><Input value={form.sku} onChange={e => update('sku', e.target.value)} className="mt-1" /></div>
              <div><Label>Barcode</Label><Input value={form.barcode} onChange={e => update('barcode', e.target.value)} className="mt-1" /></div>
              <div><Label>Weight (kg)</Label><Input type="number" value={form.weight} onChange={e => update('weight', e.target.value)} className="mt-1" /></div>
            </div>
          </Card>

          <Card className="p-6"><h3 className="font-semibold mb-4">SEO</h3>
            <div className="space-y-4">
              <div><Label>SEO Title</Label><Input value={form.seoTitle} onChange={e => update('seoTitle', e.target.value)} className="mt-1" /></div>
              <div><Label>SEO Description</Label><Textarea value={form.seoDescription} onChange={e => update('seoDescription', e.target.value)} className="mt-1" rows={2} /></div>
              <div><Label>SEO Keywords</Label><Input value={form.seoKeywords} onChange={e => update('seoKeywords', e.target.value)} className="mt-1" /></div>
            </div>
          </Card>

          {/* SEO Preview */}
          <Card className="p-4 border bg-muted/30">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2"><Search size={14} />SEO Preview</h3>
            <div className="bg-white dark:bg-background rounded-lg p-4 border">
              <p className="text-blue-700 dark:text-blue-400 text-lg font-medium hover:underline cursor-pointer truncate" style={{ maxWidth: '600px' }}>
                {form.seoTitle || form.name || 'Product Title'}{" "}<span className="text-xs text-muted-foreground">— MarketHub</span>
              </p>
              <p className="text-sm text-green-700 dark:text-green-500 mt-0.5">
                markethub.com/products/{form.slug || 'product-slug'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {form.seoDescription || form.shortDescription || 'No description provided. Add a SEO description to improve search visibility.'}
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6"><h3 className="font-semibold mb-4">Organization</h3>
            <div className="space-y-4">
              <div><Label>Category *</Label><Select value={form.categoryId} onValueChange={v => update('categoryId', v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Brand</Label><Select value={form.brandId} onValueChange={v => update('brandId', v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select brand" /></SelectTrigger><SelectContent>{brands?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </Card>

          <Card className="p-6"><h3 className="font-semibold mb-4">Publishing</h3>
            <div className="space-y-4">
              <div><Label>Status</Label><Select value={form.productStatus} onValueChange={v => update('productStatus', v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="PUBLISHED">Published</SelectItem><SelectItem value="ARCHIVED">Archived</SelectItem></SelectContent></Select></div>
              <div><Label>Badge</Label><Select value={form.badge} onValueChange={v => update('badge', v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NONE">None</SelectItem><SelectItem value="BEST_SELLER">Best Seller</SelectItem><SelectItem value="NEW_ARRIVAL">New Arrival</SelectItem><SelectItem value="LIMITED_TIME">Limited Time</SelectItem><SelectItem value="FESTIVAL_OFFER">Festival Offer</SelectItem></SelectContent></Select></div>
              <div><Label>Est. Delivery (days)</Label><Input type="number" min={1} max={30} value={form.estimatedDeliveryDays} onChange={e => update('estimatedDeliveryDays', e.target.value)} className="mt-1" /></div>
            </div>
          </Card>

          <Card className="p-6"><h3 className="font-semibold mb-4">Policies</h3>
            <div className="space-y-4">
              <div><Label>Warranty</Label><Input value={form.warranty} onChange={e => update('warranty', e.target.value)} className="mt-1" placeholder="e.g., 1 year manufacturer warranty" /></div>
              <div><Label>Return Policy</Label><Input value={form.returnPolicy} onChange={e => update('returnPolicy', e.target.value)} className="mt-1" placeholder="e.g., 7-day easy returns" /></div>
            </div>
          </Card>

          <Card className="p-6">
            <Button className="w-full bg-orange-500 hover:bg-orange-600" size="lg" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name || !form.price || !form.categoryId}>
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============ VENDOR ORDERS ============

function VendorOrders() {
  const qc = useQueryClient();
  const { vendorId, user } = useAuthStore();
  const { setSelectedOrderId, setVendorView } = useNavigationStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [printDialog, setPrintDialog] = useState<{ open: boolean; order: Order | null; mode: 'invoice' | 'packing' | 'shipping' }>({ open: false, order: null, mode: 'invoice' });

  const params = new URLSearchParams({ vendorId: vendorId || '', page: String(page), limit: '15' });
  if (statusFilter !== 'all') params.set('status', statusFilter);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders', params.toString()],
    queryFn: () => fetch(`/api/orders?${params}`).then(r => r.json()).then((r: ApiResponse<Order[]>) => r),
    enabled: !!vendorId,
  });

  const { data: statsData } = useQuery({
    queryKey: ['vendor-dashboard', vendorId],
    queryFn: () => fetch(`/api/vendor/dashboard?vendorId=${vendorId}`).then(r => r.json()).then((r: ApiResponse<VendorDashboardStats>) => r.data),
    enabled: !!vendorId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderId, status, trackingId }: { orderId: string; status: string; trackingId?: string }) =>
      fetch(`/api/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, trackingId }) }).then(r => r.json()),
    onSuccess: () => { toast.success('Order updated'); qc.invalidateQueries({ queryKey: ['vendor-orders'] }); },
    onError: () => toast.error('Failed to update order'),
  });

  const statusColor: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700', PROCESSING: 'bg-amber-100 text-amber-700', PACKED: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-orange-100 text-orange-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
  };

  const vendorItems = (order: Order | null) => order?.items?.filter(i => i.vendorId === vendorId) || [];
  const vendorTotal = (order: Order | null) => vendorItems(order).reduce((sum, i) => sum + i.total, 0);

  const openPrint = (order: Order, mode: 'invoice' | 'packing' | 'shipping') => {
    setPrintDialog({ open: true, order, mode });
  };

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Orders</h1><p className="text-muted-foreground text-sm">Manage and fulfill customer orders</p></div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><Ban size={20} className="text-red-600" /></div><div><p className="text-xs text-muted-foreground">Cancelled Orders</p><p className="text-xl font-bold">{statsData?.cancelledOrders || 0}</p></div></div></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><RotateCcw size={20} className="text-amber-600" /></div><div><p className="text-xs text-muted-foreground">Refund Rate</p><p className="text-xl font-bold">{(statsData?.refundRate || 0).toFixed(1)}%</p></div></div></Card>
        </motion.div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'NEW', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className={statusFilter === s ? 'bg-orange-500' : ''} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {s === 'all' ? 'All' : s}
          </Button>
        ))}
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> :
      <div className="space-y-4">
        {!data?.data?.length && <Card className="p-8 text-center text-muted-foreground">No orders found</Card>}
        {data?.data?.map(order => (
          <Card key={order.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-medium">Order #{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">{order.user?.name} • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColor[order.status] || ''}>{order.status}</Badge>
                <span className="font-bold text-lg">{formatCurrency(vendorTotal(order))}</span>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {vendorItems(order).map(item => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded bg-muted shrink-0 overflow-hidden">{item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}</div>
                  <div className="flex-1 min-w-0"><p className="truncate">{item.productName}</p><p className="text-muted-foreground">Qty: {item.quantity} × {formatCurrency(item.price)}</p></div>
                  <span className="font-medium">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {order.status === 'NEW' && <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ orderId: order.id, status: 'PROCESSING' })}><Clock size={14} className="mr-1" />Accept & Process</Button>}
              {order.status === 'PROCESSING' && <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ orderId: order.id, status: 'PACKED' })}><BoxIcon size={14} className="mr-1" />Mark Packed</Button>}
              {order.status === 'PACKED' && <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ orderId: order.id, status: 'SHIPPED' })}><Truck size={14} className="mr-1" />Mark Shipped</Button>}
              <Button size="sm" variant="outline" onClick={() => openPrint(order, 'invoice')}><FileText size={14} className="mr-1" />Invoice</Button>
              <Button size="sm" variant="outline" onClick={() => openPrint(order, 'packing')}><Printer size={14} className="mr-1" />Packing Slip</Button>
              <Button size="sm" variant="outline" onClick={() => openPrint(order, 'shipping')}><Truck size={14} className="mr-1" />Shipping Label</Button>
            </div>
          </Card>
        ))}
      </div>}

      {/* Print Dialog */}
      <Dialog open={printDialog.open} onOpenChange={(open) => { if (!open) window.close(); setPrintDialog({ open, order: null, mode: 'invoice' }); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{printDialog.mode === 'invoice' ? 'Invoice' : printDialog.mode === 'packing' ? 'Packing Slip' : 'Shipping Label'} - #{printDialog.order?.orderNumber}</DialogTitle>
          </DialogHeader>
          <div id="print-content" className="space-y-4 text-sm">
            {!printDialog.order ? <p className="text-center text-muted-foreground py-8">No order selected</p> : printDialog.mode === 'invoice' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b pb-4">
                  <div><h3 className="text-lg font-bold text-orange-600">INVOICE</h3><p className="text-muted-foreground">Order #{printDialog.order?.orderNumber}</p><p className="text-muted-foreground">{new Date(printDialog.order?.createdAt || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                  <div className="text-right"><p className="font-medium">{printDialog.order?.user?.name}</p><p className="text-muted-foreground text-xs">{printDialog.order?.shippingAddress}</p></div>
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {vendorItems(printDialog.order).map(item => (
                      <TableRow key={item.id}><TableCell>{item.productName}</TableCell><TableCell>{item.quantity}</TableCell><TableCell>{formatCurrency(item.price)}</TableCell><TableCell className="text-right">{formatCurrency(item.total)}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end"><Card className="p-4 w-64 space-y-1"><div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(vendorTotal(printDialog.order))}</span></div><div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span className="text-orange-600">{formatCurrency(vendorTotal(printDialog.order))}</span></div></Card></div>
                <p className="text-xs text-muted-foreground text-center">Payment: {printDialog.order?.paymentMethod} • Status: {printDialog.order?.paymentStatus}</p>
              </div>
            ) : printDialog.mode === 'packing' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b pb-4">
                  <div><h3 className="text-lg font-bold text-orange-600">PACKING SLIP</h3><p className="text-muted-foreground">Order #{printDialog.order?.orderNumber}</p></div>
                  <div className="text-right"><p className="font-medium">{printDialog.order?.user?.name}</p><p className="text-muted-foreground text-xs">{printDialog.order?.shippingAddress}</p></div>
                </div>
                <div className="space-y-2">
                  {vendorItems(printDialog.order).map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-muted overflow-hidden shrink-0">{item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}</div><span>{item.productName}</span></div>
                      <Badge variant="secondary">Qty: {item.quantity}</Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">Date: {new Date(printDialog.order?.createdAt || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="border-2 border-dashed border-black dark:border-white p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">SHIPPING LABEL</h2>
                  <div className="text-left space-y-2 text-sm">
                    <div className="flex justify-between"><span className="font-bold">From:</span><span>{user?.name} (Vendor)</span></div>
                    <div className="flex justify-between"><span className="font-bold">To:</span><span>{printDialog.order?.shippingAddress}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span className="font-bold">Order:</span><span>#{printDialog.order?.orderNumber}</span></div>
                    <div className="flex justify-between"><span className="font-bold">Items:</span><span>{vendorItems(printDialog.order).length} item(s)</span></div>
                    <div className="flex justify-between"><span className="font-bold">Weight:</span><span>0.5 kg (approx)</span></div>
                    <Separator />
                    <div className="text-center mt-4">
                      <div className="border-2 border-black dark:border-white p-4 font-mono text-lg tracking-wider">
                        {printDialog.order?.orderNumber}-{printDialog.order?.id?.slice(-6).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintDialog({ open: false, order: null, mode: 'invoice' })}>Close</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => window.print()}>Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ VENDOR REPORTS ============

function VendorReports() {
  const { vendorId } = useAuthStore();
  const { data } = useQuery({
    queryKey: ['vendor-dashboard', vendorId],
    queryFn: () => fetch(`/api/vendor/dashboard?vendorId=${vendorId}`).then(r => r.json()).then((r: ApiResponse<VendorDashboardStats>) => r.data),
    enabled: !!vendorId,
  });

  const latestComparison = data?.monthlyComparison?.[data.monthlyComparison.length - 1];
  const comparisonChange = latestComparison ? ((latestComparison.thisMonth - latestComparison.lastMonth) / Math.max(latestComparison.lastMonth, 1)) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Reports</h1><p className="text-muted-foreground text-sm">Business performance and analytics</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold text-green-600">{formatCurrency(data?.totalRevenue || 0)}</p></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{data?.totalOrders || 0}</p></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Average Rating</p><p className="text-2xl font-bold flex items-center gap-1"><StarRating rating={data?.avgRating || 0} size={20} />{data?.avgRating?.toFixed(1)}</p></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="p-4"><div className="flex items-center gap-2"><Ban size={16} className="text-red-500" /><p className="text-sm text-muted-foreground">Cancelled</p></div><p className="text-2xl font-bold text-red-600">{data?.cancelledOrders || 0}</p></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card className="p-4"><div className="flex items-center gap-2"><RotateCcw size={16} className="text-amber-500" /><p className="text-sm text-muted-foreground">Refund Rate</p></div><p className="text-2xl font-bold text-amber-600">{(data?.refundRate || 0).toFixed(1)}%</p></Card>
        </motion.div>
      </div>

      {/* Monthly Comparison */}
      {latestComparison && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4"><CardTitle className="text-lg flex items-center gap-2"><ArrowDownUp size={18} />Monthly Comparison</CardTitle></CardHeader>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">This Month</p><p className="text-2xl font-bold text-green-600">{formatCurrency(latestComparison.thisMonth)}</p></div>
                <div className={`text-sm font-medium px-2 py-1 rounded ${comparisonChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {comparisonChange >= 0 ? '+' : ''}{comparisonChange.toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3"><div className="h-3 rounded-full bg-orange-500 transition-all" style={{ width: `${Math.min((latestComparison.thisMonth / Math.max(latestComparison.lastMonth, 1)) * 100, 100)}%` }} /></div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Month</p>
              <p className="text-2xl font-bold">{formatCurrency(latestComparison.lastMonth)}</p>
              <p className="text-xs text-muted-foreground mt-1">{latestComparison.month}</p>
            </div>
          </div>
        </Card>
      )}

      {data?.monthlySales && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4"><CardTitle className="text-lg">Revenue Trend</CardTitle></CardHeader>
          <div className="h-64 flex items-end gap-3">
            {data.monthlySales.map((ms, i) => {
              const maxSale = Math.max(...data.monthlySales.map(m => m.sales), 1);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{formatCurrency(ms.sales)}</span>
                  <div className="w-full rounded-t-md bg-gradient-to-t from-orange-600 to-orange-400 transition-all duration-500" style={{ height: `${Math.max((ms.sales / maxSale) * 100, 2)}%` }} />
                  <span className="text-xs text-muted-foreground">{ms.month}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Top Categories */}
      {data?.topCategories && data.topCategories.length > 0 && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4"><CardTitle className="text-lg">Top Categories</CardTitle></CardHeader>
          <Table>
            <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Orders</TableHead><TableHead>Revenue</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.topCategories.map((cat, i) => (
                <TableRow key={i}>
                  <TableCell><div className="flex items-center gap-2"><span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span><span className="text-sm font-medium">{cat.name}</span></div></TableCell>
                  <TableCell className="font-medium">{cat.count}</TableCell>
                  <TableCell className="font-medium text-green-600">{formatCurrency(cat.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Card className="p-6">
        <CardHeader className="p-0 mb-4"><CardTitle className="text-lg">Top Selling Products</CardTitle></CardHeader>
        <Table>
          <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Sold</TableHead><TableHead>Revenue</TableHead><TableHead>Rating</TableHead></TableRow></TableHeader>
          <TableBody>
            {data?.topProducts?.map(p => (
              <TableRow key={p.id}>
                <TableCell><div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-muted shrink-0 overflow-hidden">{p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}</div><span className="text-sm truncate max-w-48">{p.name}</span></div></TableCell>
                <TableCell className="font-medium">{p.totalSold}</TableCell>
                <TableCell className="font-medium">{formatCurrency(p.price * p.totalSold)}</TableCell>
                <TableCell><StarRating rating={p.rating} size={12} /></TableCell>
              </TableRow>
            ))}
            {(!data?.topProducts?.length) && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No data available</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ============ VENDOR PROFILE ============

function VendorProfile() {
  const { user, vendorId } = useAuthStore();
  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => fetch(`/api/vendors/${vendorId}`).then(r => r.json()).then((r: any) => r.data),
    enabled: !!vendorId,
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Business Profile</h1><p className="text-muted-foreground text-sm">Your vendor account information</p></div>

      <Card className="p-6">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-20 h-20 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 text-3xl font-bold shrink-0">{vendor?.businessName?.[0]}</div>
          <div>
            <h2 className="text-xl font-bold">{vendor?.businessName}</h2>
            <div className="flex items-center gap-2 mt-1"><Badge variant={vendor?.status === 'APPROVED' ? 'default' : 'secondary'}>{vendor?.status}</Badge><StarRating rating={vendor?.rating || 0} size={14} /></div>
            <p className="text-sm text-muted-foreground mt-1">{vendor?.description}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Business Email:</span> <span className="ml-2">{vendor?.businessEmail || user?.email}</span></div>
          <div><span className="text-muted-foreground">Phone:</span> <span className="ml-2">{vendor?.businessPhone || 'Not set'}</span></div>
          <div><span className="text-muted-foreground">GST Number:</span> <span className="ml-2">{vendor?.gstNumber || 'Not set'}</span></div>
          <div><span className="text-muted-foreground">Commission Rate:</span> <span className="ml-2 font-medium">{vendor?.commissionRate}%</span></div>
          <div><span className="text-muted-foreground">Total Sales:</span> <span className="ml-2 font-medium text-green-600">{formatCurrency(vendor?.totalSales || 0)}</span></div>
          <div><span className="text-muted-foreground">Total Revenue:</span> <span className="ml-2 font-medium">{formatCurrency(vendor?.totalRevenue || 0)}</span></div>
        </div>
      </Card>
    </div>
  );
}

// ============ VENDOR SETTINGS ============

function VendorSettings() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground text-sm">Manage your vendor account settings</p></div>
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Store Settings</h3>
        <div className="space-y-4">
          <div><Label>Business Name</Label><Input className="mt-1" defaultValue={useAuthStore.getState().user?.name || ''} /></div>
          <div><Label>Business Email</Label><Input className="mt-1" type="email" defaultValue={useAuthStore.getState().user?.email || ''} /></div>
          <div><Label>Business Phone</Label><Input className="mt-1" /></div>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => toast.success('Settings saved')}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}

// ============ VENDOR PENDING / REJECTED PAGE ============

function VendorPendingPage() {
  const { user, logout, vendorId, vendorStatus } = useAuthStore();
  const { setAppView } = useNavigationStore();
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor-status', vendorId],
    queryFn: () => fetch(`/api/vendors/${vendorId}`).then(r => r.json()).then((r: any) => r.data),
    enabled: !!vendorId,
  });

  // Sync vendor status from server
  React.useEffect(() => {
    if (vendor?.status) {
      useAuthStore.getState().login(
        useAuthStore.getState().user!,
        useAuthStore.getState().token!,
        vendorId,
        vendor.status
      );
      if (vendor.rejectionReason) {
        setRejectionReason(vendor.rejectionReason);
      }
      // If approved, navigate to dashboard
      if (vendor.status === 'APPROVED') {
        const timer = setTimeout(() => useNavigationStore.getState().setVendorView('vendor-dashboard'), 100);
        return () => clearTimeout(timer);
      }
    }
  }, [vendor?.status, vendorId]);

  const isRejected = vendorStatus === 'REJECTED' || vendor?.status === 'REJECTED';
  const isPending = vendorStatus === 'PENDING' || vendor?.status === 'PENDING';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-64 w-full max-w-md rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg text-center space-y-6"
      >
        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${isRejected ? 'bg-red-100 dark:bg-red-900/20' : 'bg-amber-100 dark:bg-amber-900/20'}`}>
          {isRejected ? (
            <XCircle size={48} className="text-red-500" />
          ) : (
            <Clock size={48} className="text-amber-500" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {isRejected ? 'Application Rejected' : 'Application Pending'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRejected
              ? 'Your vendor application has been rejected by the admin.'
              : 'Your vendor account is currently under review by our admin team.'}
          </p>
        </div>

        <Card className="p-6 text-left">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business Name</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={isRejected ? 'destructive' : 'secondary'} className={isPending ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : ''}>
                {vendorStatus || vendor?.status || 'PENDING'}
              </Badge>
            </div>
          </div>
        </Card>

        {rejectionReason && (
          <Card className="p-4 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
            <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Rejection Reason:</p>
            <p className="text-sm text-red-600 dark:text-red-300">{rejectionReason}</p>
          </Card>
        )}

        {isPending && (
          <Card className="p-4 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400">What happens next?</p>
                <ul className="mt-1 space-y-1 text-amber-600 dark:text-amber-300">
                  <li>• Our team will review your business details</li>
                  <li>• You&apos;ll receive a notification once approved</li>
                  <li>• This usually takes 24-48 hours</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              logout();
              setAppView('customer');
              toast.success('Logged out');
            }}
          >
            Back to Store
          </Button>
          {isRejected && (
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                logout();
                setAppView('customer');
                toast.info('Please contact admin to re-apply');
              }}
            >
              Contact Support
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Need help? Contact us at support@markethub.com
        </p>
      </motion.div>
    </div>
  );
}

// ============ VENDOR WALLET ============

function VendorWalletPage() {
  const { vendorId } = useAuthStore();
  const qc = useQueryClient();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [page, setPage] = useState(1);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['vendor-wallet', vendorId],
    queryFn: () => fetch(`/api/vendor/wallet?vendorId=${vendorId}`).then(r => r.json()).then((r: ApiResponse<VendorWallet>) => r.data),
    enabled: !!vendorId,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['vendor-wallet-tx', vendorId, page],
    queryFn: () => fetch(`/api/vendor/wallet?vendorId=${vendorId}&page=${page}&limit=20`).then(r => r.json()).then((r: ApiResponse<{ wallet: VendorWallet; transactions: WalletTransaction[] }>) => r.data),
    enabled: !!vendorId,
  });

  const vendorData = txData || (wallet ? { wallet, transactions: [] as WalletTransaction[] } : null);

  const { data: vendorInfo } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => fetch(`/api/vendors/${vendorId}`).then(r => r.json()).then((r: any) => r.data),
    enabled: !!vendorId,
  });

  const maskBankAccount = (acc?: string | null) => {
    if (!acc) return 'Not set';
    return 'XXXX XXXX ' + acc.slice(-4);
  };
  const maskIfsc = (ifsc?: string | null) => {
    if (!ifsc) return 'N/A';
    return 'XXXX0' + ifsc.slice(-3);
  };

  const withdrawMutation = useMutation({
    mutationFn: () => fetch('/api/vendor/wallet/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId, amount: parseFloat(withdrawAmount) }) }).then(r => r.json()),
    onSuccess: (data) => {
      if (data.success) { toast.success('Withdrawal request submitted!'); setWithdrawOpen(false); setWithdrawAmount(''); qc.invalidateQueries({ queryKey: ['vendor-wallet'] }); qc.invalidateQueries({ queryKey: ['vendor-wallet-tx'] }); }
      else toast.error(data.error || 'Withdrawal failed');
    },
    onError: () => toast.error('Failed to request withdrawal'),
  });

  const txTypeColor: Record<string, string> = {
    EARNING: 'text-green-600',
    WITHDRAWAL: 'text-red-600',
    ADJUSTMENT: 'text-amber-600',
    COMMISSION_DEDUCTION: 'text-orange-600',
  };

  if (walletLoading) return <div className="p-6 space-y-4">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Wallet</h1><p className="text-muted-foreground text-sm">Manage your earnings and withdrawals</p></div>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setWithdrawOpen(true)}><DollarSign size={16} className="mr-1.5" />Request Withdrawal</Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="p-6 border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-background">
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><DollarSign size={20} className="text-green-600" /></div><p className="text-sm text-muted-foreground">Available Balance</p></div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(vendorData?.wallet?.availableBalance || 0)}</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="p-6 border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-background">
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><Clock size={20} className="text-amber-600" /></div><p className="text-sm text-muted-foreground">Pending Balance</p></div>
            <p className="text-3xl font-bold text-amber-600">{formatCurrency(vendorData?.wallet?.pendingBalance || 0)}</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card className="p-6 border-orange-200 dark:border-orange-900/50 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-background">
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><TrendingUp size={20} className="text-orange-600" /></div><p className="text-sm text-muted-foreground">Total Earned</p></div>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(vendorData?.wallet?.totalEarned || 0)}</p>
          </Card>
        </motion.div>
      </div>

      {/* Transaction History */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-4"><CardTitle className="text-lg">Transaction History</CardTitle></CardHeader>
        {txLoading ? <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div> : (
          <>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right hidden sm:table-cell">Balance After</TableHead><TableHead className="hidden md:table-cell">Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(!vendorData?.transactions?.length) && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No transactions yet</TableCell></TableRow>}
                  {vendorData?.transactions?.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell><Badge variant="secondary" className={txTypeColor[tx.type] || ''}>{tx.type.replace(/_/g, ' ')}</Badge></TableCell>
                      <TableCell className="text-sm max-w-48 truncate">{tx.description || '-'}</TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === 'EARNING' ? 'text-green-600' : 'text-red-600'}`}>{tx.type === 'EARNING' ? '+' : '-'}{formatCurrency(tx.amount)}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{formatCurrency(tx.balance)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>Enter the amount you want to withdraw to your bank account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Available Balance</Label>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(vendorData?.wallet?.availableBalance || 0)}</p>
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <Input type="number" min={1} max={vendorData?.wallet?.availableBalance || 0} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="mt-1" placeholder="Enter withdrawal amount" />
              <p className="text-xs text-muted-foreground mt-1">Minimum withdrawal: ₹500</p>
            </div>
            <Separator />
            <div className="text-sm space-y-2">
              <p className="font-medium">Bank Account Details</p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <span>Bank:</span><span className="text-foreground">{vendorInfo?.bankName || 'Not set'}</span>
                <span>Account:</span><span className="text-foreground font-mono">{maskBankAccount(vendorInfo?.bankAccount)}</span>
                <span>IFSC:</span><span className="text-foreground font-mono">{maskIfsc(vendorInfo?.bankIfsc)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setWithdrawOpen(false); setWithdrawAmount(''); }}>Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => withdrawMutation.mutate()} disabled={withdrawMutation.isPending || !withdrawAmount || parseFloat(withdrawAmount) < 500 || parseFloat(withdrawAmount) > (vendorData?.wallet?.availableBalance || 0)}>
              {withdrawMutation.isPending ? 'Submitting...' : 'Confirm Withdrawal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ VENDOR INVENTORY ============

function VendorInventoryPage() {
  const { vendorId } = useAuthStore();
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['inventory-history'],
    queryFn: () => fetch(`/api/vendor/products/inventory-history`).then(r => r.json()).then((r: any) => r.data || []),
  });
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Inventory History</h2>
      {isLoading ? <div className="space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 rounded-lg" />)}</div> :
      history.length === 0 ? (
        <Card className="p-8 text-center"><BoxIcon size={48} className="mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No inventory changes recorded yet</p></Card>
      ) : (
        <Card>
          <Table><TableHeader><TableRow>
            <TableHead>Date</TableHead><TableHead>Product</TableHead><TableHead>Type</TableHead><TableHead>Quantity</TableHead><TableHead>Note</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {history.map((h: any) => (
              <TableRow key={h.id}>
                <TableCell className="text-sm">{new Date(h.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm font-medium">{h.product?.name || h.productId}</TableCell>
                <TableCell><Badge variant={h.type === 'SOLD' ? 'secondary' : h.type === 'ADDED' ? 'default' : 'outline'} className="text-xs">{h.type}</Badge></TableCell>
                <TableCell className={h.type === 'SOLD' || h.type === 'REMOVED' ? 'text-red-500' : 'text-green-600'}>{h.type === 'SOLD' || h.type === 'REMOVED' ? '-' : '+'}{h.quantity}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{h.note || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody></Table>
        </Card>
      )}
    </div>
  );
}

// ============ MAIN VENDOR APP ============

export default function VendorApp() {
  const { vendorView, setVendorView } = useNavigationStore();
  const { user, vendorStatus, isAuthenticated } = useAuthStore();

  // Gate: If vendor is not APPROVED, show pending/rejected page
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <Store size={48} className="mx-auto text-muted-foreground" />
          <h2 className="text-xl font-bold">Vendor Access Required</h2>
          <p className="text-sm text-muted-foreground">Please log in to access the vendor panel.</p>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => useNavigationStore.getState().setAppView('customer')}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (vendorStatus === 'PENDING' || vendorStatus === 'REJECTED') {
    return <VendorPendingPage />;
  }

  if (vendorStatus === 'SUSPENDED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <XCircle size={48} className="mx-auto text-red-500" />
          <h2 className="text-xl font-bold">Account Suspended</h2>
          <p className="text-sm text-muted-foreground">Your vendor account has been suspended. Please contact the admin for more information.</p>
          <Button variant="outline" onClick={() => { useAuthStore.getState().logout(); useNavigationStore.getState().setAppView('customer'); }}>
            Back to Store
          </Button>
        </Card>
      </div>
    );
  }

  const renderView = () => {
    switch (vendorView) {
      case 'vendor-dashboard': return <VendorDashboard />;
      case 'vendor-products': return <VendorProducts />;
      case 'vendor-add-product': return <VendorAddProduct />;
      case 'vendor-orders': return <VendorOrders />;
      case 'vendor-reports': return <VendorReports />;
      case 'vendor-inventory': return <VendorInventoryPage />;
      case 'vendor-wallet': return <VendorWalletPage />;
      case 'vendor-profile': return <VendorProfile />;
      case 'vendor-settings': return <VendorSettings />;
      case 'vendor-notifications': return <div className="p-6"><h1 className="text-2xl font-bold mb-4">Notifications</h1><p className="text-muted-foreground">No new notifications</p></div>;
      default: return <VendorDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <VendorMobileHeader />
      <div className="flex flex-1">
        <VendorSidebar />
        <main id="main-content" className="flex-1 overflow-auto" role="main">{renderView()}</main>
      </div>
    </div>
  );
}