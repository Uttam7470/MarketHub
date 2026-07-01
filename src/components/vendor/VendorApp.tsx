'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Package, ShoppingCart, DollarSign, Star, TrendingUp, BarChart3, Plus, Pencil, Trash2,
  Search, Filter, Eye, ChevronLeft, ChevronRight, Upload, Settings, Bell, LogOut,
  Store, Menu, X, User, AlertTriangle, CheckCircle, Clock, Truck, BoxIcon
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
import type { Product, Order, ApiResponse, VendorDashboardStats } from '@/types';

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
  { key: 'vendor-reports', label: 'Reports', icon: TrendingUp },
  { key: 'vendor-profile', label: 'Profile', icon: User },
  { key: 'vendor-settings', label: 'Settings', icon: Settings },
];

function VendorSidebar() {
  const { vendorView, setVendorView, setAppView } = useNavigationStore();
  const { user, vendorId, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} border-r bg-card flex flex-col transition-all duration-300 hidden lg:flex`}>
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
                  <Button variant={vendorView === item.key ? 'secondary' : 'ghost'} size="sm" className={`w-full justify-start gap-3 ${collapsed ? 'justify-center px-0' : ''}`} onClick={() => setVendorView(item.key as any)}>
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
        <Button variant="ghost" size="sm" className="w-full justify-center lg:hidden" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
    </aside>
  );
}

function VendorMobileHeader() {
  const { user } = useAuthStore();
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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products', vendorId, page, search],
    queryFn: () => fetch(`/api/products?vendorId=${vendorId}&page=${page}&limit=12&search=${search}`).then(r => r.json()).then((r: ApiResponse<Product[]>) => r),
    enabled: !!vendorId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/products?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-products'] }); toast.success('Product deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete product'),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Products</h1><p className="text-muted-foreground text-sm">Manage your product catalog</p></div>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setVendorView('vendor-add-product')}><Plus size={16} className="mr-1.5" />Add Product</Button>
      </div>

      <div className="flex gap-3 max-w-md">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" /></div>
      </div>

      {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div> :
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="hidden md:table-cell">Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead className="hidden sm:table-cell">Rating</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {!data?.data?.length && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No products found</TableCell></TableRow>}
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
                <TableCell className="hidden sm:table-cell"><div className="flex items-center gap-1"><StarRating rating={product.rating} size={12} /><span className="text-sm">{product.rating}</span></div></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedProductId(product.id); setVendorView('vendor-add-product'); }}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(product.id)}><Trash2 size={14} /></Button>
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
  });

  React.useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '', slug: product.slug || '', description: product.description || '', shortDescription: product.shortDescription || '',
        sku: product.sku || '', barcode: product.barcode || '', price: String(product.price || ''), compareAtPrice: String(product.compareAtPrice || ''),
        costPrice: String(product.costPrice || ''), stock: String(product.stock || '10'), weight: String(product.weight || ''), warranty: product.warranty || '',
        returnPolicy: product.returnPolicy || '', categoryId: product.categoryId || '', brandId: product.brandId || '',
        isFeatured: product.isFeatured || false, seoTitle: product.seoTitle || '', seoDescription: product.seoDescription || '', seoKeywords: product.seoKeywords || '',
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
        </div>

        <div className="space-y-6">
          <Card className="p-6"><h3 className="font-semibold mb-4">Organization</h3>
            <div className="space-y-4">
              <div><Label>Category *</Label><Select value={form.categoryId} onValueChange={v => update('categoryId', v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Brand</Label><Select value={form.brandId} onValueChange={v => update('brandId', v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select brand" /></SelectTrigger><SelectContent>{brands?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
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
  const { vendorId } = useAuthStore();
  const { setSelectedOrderId, setVendorView } = useNavigationStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ vendorId: vendorId || '', page: String(page), limit: '15' });
  if (statusFilter !== 'all') params.set('status', statusFilter);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders', params.toString()],
    queryFn: () => fetch(`/api/orders?${params}`).then(r => r.json()).then((r: ApiResponse<Order[]>) => r),
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

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Orders</h1><p className="text-muted-foreground text-sm">Manage and fulfill customer orders</p></div>

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
                <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {order.items?.filter(i => i.vendorId === vendorId).map(item => (
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
            </div>
          </Card>
        ))}
      </div>}
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

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Reports</h1><p className="text-muted-foreground text-sm">Business performance and analytics</p></div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold text-green-600">{formatCurrency(data?.totalRevenue || 0)}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{data?.totalOrders || 0}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted-foreground">Average Rating</p><p className="text-2xl font-bold flex items-center gap-1"><StarRating rating={data?.avgRating || 0} size={20} />{data?.avgRating?.toFixed(1)}</p></Card>
      </div>

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

// ============ MAIN VENDOR APP ============

export default function VendorApp() {
  const { vendorView, setVendorView } = useNavigationStore();

  const renderView = () => {
    switch (vendorView) {
      case 'vendor-dashboard': return <VendorDashboard />;
      case 'vendor-products': return <VendorProducts />;
      case 'vendor-add-product': return <VendorAddProduct />;
      case 'vendor-orders': return <VendorOrders />;
      case 'vendor-reports': return <VendorReports />;
      case 'vendor-profile': return <VendorProfile />;
      case 'vendor-settings': return <VendorSettings />;
      case 'vendor-notifications': return <div className="p-6"><h1 className="text-2xl font-bold mb-4">Notifications</h1><p className="text-muted-foreground">No new notifications</p></div>;
      default: return <VendorDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <VendorMobileHeader />
      <div className="flex flex-1">
        <VendorSidebar />
        <main className="flex-1 overflow-auto">{renderView()}</main>
      </div>
    </div>
  );
}