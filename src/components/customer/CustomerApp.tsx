'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/lib/sonner';
import { authToast } from '@/lib/auth-toast';
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown,
  Minus, Plus, Trash2, ChevronRight, ChevronLeft, MapPin, Phone, Mail,
  Package, Truck, CheckCircle, Clock, Shield, Gift,
  ArrowRight, GitCompare,
  Store, Smartphone,
  LogOut, Bell, Sun, Moon, Monitor, Filter, SlidersHorizontal,
  MessageCircle, Facebook, Twitter, Headphones, ShoppingBag, Instagram,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTheme } from 'next-themes';
import { useAuthStore, useNavigationStore, useCartStore, useWishlistStore, useCompareStore, useNotificationStore } from '@/stores';
import { useNotifications } from '@/hooks/use-notifications';
import type { Product, Category, Brand, Banner, CustomerAddress, ApiResponse } from '@/types';
import { ProductCard, ProductGrid } from './shared/ProductCard';
import { formatCurrency, EMAIL_REGEX, useRequireAuth, StarRating, discountPercent } from './helpers';
import dynamic from 'next/dynamic';

const ProductDetailPage = dynamic(() => import('./pages/ProductDetailPage'), { loading: () => <div className="container mx-auto px-4 py-8"><Skeleton className="h-96 rounded-xl" /></div> });
const CartPage = dynamic(() => import('./pages/CartPage'), { loading: () => <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div> });
const CheckoutPage = dynamic(() => import('./pages/CheckoutPage'), { loading: () => <div className="container mx-auto px-4 py-8"><Skeleton className="h-64 rounded-xl" /></div> });
const OrdersPage = dynamic(() => import('./pages/OrderPages').then(m => ({ default: m.OrdersPage })), { loading: () => <div className="container mx-auto px-4 py-8"><Skeleton className="h-64 rounded-xl" /></div> });
const OrderDetailPage = dynamic(() => import('./pages/OrderPages').then(m => ({ default: m.OrderDetailPage })), { loading: () => <div className="container mx-auto px-4 py-8"><Skeleton className="h-64 rounded-xl" /></div> });
const LoginPage = dynamic(() => import('./pages/LoginPage'), { loading: () => <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div> });
const HelpCenterPage = dynamic(() => import('./pages/HelpCenterPage'), { loading: () => <div className="container mx-auto px-4 py-8"><Skeleton className="h-64 rounded-xl" /></div> });
const AboutPage = dynamic(() => import('./pages/AboutPage'), { loading: () => <div className="container mx-auto px-4 py-8"><Skeleton className="h-64 rounded-xl" /></div> });
const ReturnsRefundsPage = dynamic(() => import('./pages/ReturnsRefundsPage'), { loading: () => <div className="container mx-auto px-4 py-8"><Skeleton className="h-64 rounded-xl" /></div> });
const ShippingInfoPage = dynamic(() => import('./pages/ShippingInfoPage'), { loading: () => <div className="container mx-auto px-4 py-8"><Skeleton className="h-64 rounded-xl" /></div> });

// Need RefreshCw icon
function RefreshCw(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </svg>
  );
}

// ============ HEADER ============

function CustomerHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { customerView, searchQuery, setSearchQuery, setCustomerView, setMobileMenuOpen, isMobileMenuOpen, isCartOpen, setCartOpen, setAppView, navigateTo, setSelectedProductId } = useNavigationStore();
  const { getItemCount } = useCartStore();
  const { setTheme, theme } = useTheme();
  const itemCount = getItemCount();
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [mounted, setMounted] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const qc = useQueryClient();

  const { notifications, unreadCount } = useNotifications();
  const { markAllRead: storeMarkAllRead } = useNotificationStore();
  const markAllRead = async () => {
    await fetch('/api/notifications/mark-all-read', { method: 'PUT' });
    storeMarkAllRead();
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const { data: searchHistory = [] } = useQuery({
    queryKey: ['search-history'],
    queryFn: () => fetch('/api/search/history').then(r => r.json()).then((r: any) => r.data || []),
    enabled: !!mounted && isAuthenticated,
  });

  useEffect(() => { setSearchInput(searchQuery); }, [searchQuery]);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!searchInput.trim()) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchInput)}`);
        const data = await res.json();
        setSuggestions(data.data || []);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCustomerView(searchInput ? 'search' : 'home');
  };

  return (
    <header role="banner" className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="bg-orange-500 text-white text-xs py-1.5 text-center hidden md:block">
        Free shipping on orders above ₹500 | Use code WELCOME10 for 10% off on first order!
      </div>
      {/* Main nav */}
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle navigation menu" aria-expanded={isMobileMenuOpen} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => { setAppView('customer'); setCustomerView('home'); }}>
            <Store size={28} className="text-orange-500" />
            <span className="text-xl font-bold hidden sm:block">MarketHub</span>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 relative" onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Search products" placeholder="Search products, brands, categories..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-10 pr-4 h-10 bg-muted/50" />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {suggestions.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-muted cursor-pointer" onClick={() => { setSearchQuery(p.name); setSearchInput(p.name); setShowSuggestions(false); setSelectedProductId(p.id); navigateTo('product-detail'); }}>
                    <img src={p.images?.[0]?.url || ''} className="w-8 h-8 object-cover rounded" alt="" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-muted-foreground">₹{p.price.toLocaleString('en-IN')}</p></div>
                  </div>
                ))}
              </div>
            )}
            {showSuggestions && suggestions.length === 0 && !searchInput.trim() && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Recent Searches</div>
                {searchHistory.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer text-sm" onClick={() => { setSearchQuery(s.query); setSearchInput(s.query); setShowSuggestions(false); setCustomerView('search'); }}>
                    <Clock size={14} className="text-muted-foreground" />{s.query}
                  </div>
                ))}
              </div>
            )}
          </form>

          <div className="flex items-center gap-1">
            <TooltipProvider><Tooltip><TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} suppressHydrationWarning>
                {!mounted ? <div className="w-5 h-5" /> : theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            </TooltipTrigger><TooltipContent>Toggle theme</TooltipContent></Tooltip></TooltipProvider>

            <Button variant="ghost" size="icon" className="relative" aria-label={`Shopping cart with ${itemCount} items`} onClick={() => setCartOpen(true)}>
              <ShoppingCart size={20} />
              {mounted && itemCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-orange-500 text-white border-2 border-background">{itemCount}</Badge>}
            </Button>

            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={20} />
                    {mounted && unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-2 border-background">{unreadCount}</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => markAllRead()}><CheckCircle size={12} className="mr-1" />Mark all read</Button>}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Bell size={32} className="text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications</p>
                      </div>
                    ) :
                      notifications.slice(0, 10).map((n: any) => (
                        <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer" onClick={() => { if (n.link) { /* could navigate */ } }}>
                          <p className={`text-sm ${!n.isRead ? 'font-medium' : 'text-muted-foreground'}`}>{n.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                          <p className="text-xs text-muted-foreground/60">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </DropdownMenuItem>
                      ))
                    }
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><User size={20} /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2"><p className="text-sm font-medium">{user?.name}</p><p className="text-xs text-muted-foreground">{user?.email}</p></div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateTo('profile')}><User size={16} className="mr-2" />My Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('orders')}><Package size={16} className="mr-2" />My Orders</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('wishlist')}><Heart size={16} className="mr-2" />Wishlist</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('addresses')}><MapPin size={16} className="mr-2" />Addresses</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); setCustomerView('home'); authToast.logoutSuccess(); }} className="text-destructive"><LogOut size={16} className="mr-2" />Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigateTo('login')} className="hidden sm:flex gap-1.5"><User size={16} />Login</Button>
            )}
          </div>
        </div>
      </div>
      {/* Category nav */}
      <div className="hidden md:block border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <nav aria-label="Main navigation" className="flex items-center gap-6 h-10 text-sm overflow-x-auto">
            <CategoriesNav />
          </nav>
        </div>
      </div>
      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b"><SheetTitle className="flex items-center gap-2"><Store size={20} className="text-orange-500" />MarketHub</SheetTitle></SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4 space-y-2">
              <CategoriesNav mobile />
              <Separator className="my-3" />
              {isAuthenticated ? (
                <>
                  <p className="text-sm font-medium px-2">{user?.name}</p>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigateTo('profile'); setMobileMenuOpen(false); }}><User size={16} className="mr-2" />Profile</Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigateTo('orders'); setMobileMenuOpen(false); }}><Package size={16} className="mr-2" />Orders</Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigateTo('wishlist'); setMobileMenuOpen(false); }}><Heart size={16} className="mr-2" />Wishlist</Button>
                  <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => { logout(); setMobileMenuOpen(false); authToast.logoutSuccess(); }}><LogOut size={16} className="mr-2" />Logout</Button>
                </>
              ) : (
                <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => { navigateTo('login'); setMobileMenuOpen(false); }}>Login / Register</Button>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      {/* Cart Sheet */}
      <CartSheet />
    </header>
  );
}

function CategoriesNav({ mobile }: { mobile?: boolean }) {
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => fetch('/api/categories').then(r => r.json()).then((r: ApiResponse<Category[]>) => r.data || []) });
  const { setSelectedCategory, setCustomerView, setMobileMenuOpen } = useNavigationStore();

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    setCustomerView('products');
    if (mobile) setMobileMenuOpen(false);
  };

  if (mobile) {
    return categories?.map(cat => (
      <div key={cat.id} className="space-y-1">
        <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => handleCategoryClick(cat.slug)}>{cat.name}</Button>
        {cat.children?.map(child => (
          <Button key={child.id} variant="ghost" className="w-full justify-start pl-8 text-sm text-muted-foreground" onClick={() => handleCategoryClick(child.slug)}>{child.name}</Button>
        ))}
      </div>
    ));
  }

  return <>
    <Button variant="ghost" size="sm" className="h-10 text-sm font-medium" onClick={() => { setCustomerView('products'); setSelectedCategory(null); }}>All Products</Button>
    {categories?.map(cat => (
      <DropdownMenu key={cat.id}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-10 text-sm font-medium hover:text-orange-500">{cat.name}{cat.children?.length ? <ChevronDown size={14} className="ml-1" /> : null}</Button>
        </DropdownMenuTrigger>
        {cat.children?.length ? (
          <DropdownMenuContent>
            {cat.children.map(child => (
              <DropdownMenuItem key={child.id} onClick={() => handleCategoryClick(child.slug)}>{child.name} <Badge variant="secondary" className="ml-auto text-xs">{child._count?.products || 0}</Badge></DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        ) : null}
      </DropdownMenu>
    ))}
  </>;
}

function CartSheet() {
  const { items, removeItem, updateQuantity, getSubtotal, getShipping } = useCartStore();
  const { isCartOpen, setCartOpen, navigateTo } = useNavigationStore();
  const requireAuth = useRequireAuth();
  const [removeTarget, setRemoveTarget] = useState<{id: string; name: string} | null>(null);

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.info('Removed from cart', { description: `${name} removed.` });
    setRemoveTarget(null);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><ShoppingCart size={20} />Cart ({items.length})</SheetTitle></SheetHeader>
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <ShoppingBag size={48} className="text-muted-foreground/30" /><p className="font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Looks like you haven&apos;t added anything yet</p>
            <Button variant="outline" onClick={() => setCartOpen(false)}>Browse Products</Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">{items.map(item => (
                <div key={item.productId} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={20} /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.vendorName}</p>
                    <p className="text-sm font-bold mt-1">{formatCurrency(item.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => { updateQuantity(item.productId, item.quantity - 1); toast.success('Quantity updated'); }}><Minus size={12} /></Button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => { updateQuantity(item.productId, item.quantity + 1); toast.success('Quantity updated'); }}><Plus size={12} /></Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 ml-auto text-destructive" onClick={() => setRemoveTarget({id: item.productId, name: item.name})}><Trash2 size={12} /></Button>
                    </div>
                  </div>
                </div>
              ))}</div>
            </ScrollArea>
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(getSubtotal())}</span></div>
              <div className="flex justify-between text-sm"><span>Shipping</span><span>{getShipping() === 0 ? <span className="text-green-600">Free</span> : formatCurrency(getShipping())}</span></div>
              <Separator />
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatCurrency(getSubtotal() + getShipping())}</span></div>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={() => { if (!requireAuth('proceed to checkout')) return; setCartOpen(false); navigateTo('checkout'); }}>
                Checkout ({formatCurrency(getSubtotal() + getShipping())})
              </Button>
            </div>
          </>
        )}
        <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {removeTarget?.name} from cart?</AlertDialogTitle>
              <AlertDialogDescription>This item will be removed from your cart.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => removeTarget && handleRemove(removeTarget.id, removeTarget.name)}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}

// ============ HOME PAGE ============

function HomePage() {
  const { data: banners } = useQuery({ queryKey: ['banners'], queryFn: () => fetch('/api/banners?position=HOME').then(r => r.json()).then((r: ApiResponse<Banner[]>) => r.data || []) });
  const { data: categories, isLoading: categoriesLoading } = useQuery({ queryKey: ['categories'], queryFn: () => fetch('/api/categories').then(r => r.json()).then((r: ApiResponse<Category[]>) => r.data || []) });
  const { data: featuredData, isLoading: featuredLoading } = useQuery({ queryKey: ['products', 'featured'], queryFn: () => fetch('/api/products?featured=true&limit=8').then(r => r.json()).then((r: ApiResponse<Product[]>) => r.data || []) });
  const { data: newArrivals, isLoading: newArrivalsLoading } = useQuery({ queryKey: ['products', 'new'], queryFn: () => fetch('/api/products?limit=8&sort=newest').then(r => r.json()).then((r: ApiResponse<Product[]>) => r.data || []) });
  const { data: brands, isLoading: brandsLoading } = useQuery({ queryKey: ['brands'], queryFn: () => fetch('/api/brands').then(r => r.json()).then((r: ApiResponse<Brand[]>) => r.data || []) });
  const { data: popularSearches } = useQuery({ queryKey: ['popular-searches'], queryFn: () => fetch('/api/search/popular').then(r => r.json()).then((r: any) => r.data || []) });
  const { setSelectedCategory, setCustomerView, setSearchQuery } = useNavigationStore();
  const [bannerIdx, setBannerIdx] = useState(0);

  // Recently Viewed
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('marketplace-recently-viewed');
      return stored ? JSON.parse(stored).slice(0, 6) : [];
    } catch { return []; }
  });

  const { data: recentlyViewedProducts } = useQuery({
    queryKey: ['recently-viewed', recentlyViewedIds],
    queryFn: async () => {
      if (!recentlyViewedIds.length) return [];
      const res = await fetch('/api/products?limit=50');
      const data = await res.json();
      return (data.data || []).filter((p: Product) => recentlyViewedIds.includes(p.id));
    },
    enabled: recentlyViewedIds.length > 0,
  });

  useEffect(() => {
    if ((banners?.length || 0) > 1) {
      const timer = setInterval(() => setBannerIdx(i => (i + 1) % (banners?.length || 1)), 5000);
      return () => clearInterval(timer);
    }
  }, [banners?.length]);

  return (
    <div className="space-y-10 pb-10">
      {/* Hero Banner */}
      {banners && banners.length > 0 && (
        <div className="relative overflow-hidden rounded-xl mx-4 mt-4 md:mx-0">
          <AnimatePresence mode="wait">
            <motion.img key={bannerIdx} src={banners[bannerIdx]?.image} alt={banners[bannerIdx]?.title} className="w-full h-48 md:h-80 object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          </AnimatePresence>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => <button key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === bannerIdx ? 'bg-orange-500 w-6' : 'bg-white/70'}`} onClick={() => setBannerIdx(i)} />)}
          </div>
        </div>
      )}

      {/* Categories */}
      {categoriesLoading ? (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="text-center p-4">
                <Skeleton className="w-12 h-12 mx-auto rounded-full mb-2" />
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-2 w-12 mx-auto mt-1" />
              </Card>
            ))}
          </div>
        </section>
      ) : categories && categories.length > 0 ? (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Shop by Category</h2>
            <Button variant="ghost" size="sm" className="text-orange-500" onClick={() => { setSelectedCategory(null); setCustomerView('products'); }}>View All <ArrowRight size={14} /></Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {categories.slice(0, 7).map(cat => {
              const allCats = [cat, ...(cat.children || [])];
              return allCats.slice(0, 1).map(c => (
                <motion.div key={c.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card className="cursor-pointer hover:border-orange-300 hover:shadow-md transition-shadow duration-200 text-center p-4" onClick={() => { setSelectedCategory(c.slug); setCustomerView('products'); }}>
                    <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2 text-orange-500 font-bold text-lg">{c.name[0]}</div>
                    <p className="text-xs font-medium truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c._count?.products || 0} items</p>
                  </Card>
                </motion.div>
              ));
            })}
          </div>
        </section>
      ) : null}

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Featured Products</h2>
          {!featuredLoading && featuredData && featuredData.length > 0 && <Button variant="ghost" size="sm" className="text-orange-500" onClick={() => { setSelectedCategory(null); setCustomerView('products'); }}>View All <ArrowRight size={14} /></Button>}
        </div>
        <ProductGrid products={featuredData || []} loading={featuredLoading} />
      </section>

      {/* Brands */}
      {brandsLoading ? (
        <section className="container mx-auto px-4">
          <Skeleton className="h-7 w-28 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </section>
      ) : brands && brands.length > 0 ? (
        <section className="container mx-auto px-4">
          <h2 className="text-xl font-bold mb-4">Top Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {brands.map(brand => (
              <Card key={brand.id} className="flex items-center justify-center p-4 hover:border-orange-300 transition-colors cursor-pointer h-20">
                <span className="font-bold text-sm text-center">{brand.name}</span>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* New Arrivals */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">New Arrivals</h2>
        </div>
        <ProductGrid products={newArrivals || []} loading={newArrivalsLoading} />
      </section>

      {/* Features */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On orders above ₹500' },
            { icon: <Shield size={24} />, title: 'Secure Payment', desc: '100% secure payments' },
            { icon: <RefreshCw size={24} />, title: 'Easy Returns', desc: '7-day return policy' },
            { icon: <Gift size={24} />, title: 'Best Deals', desc: 'Unbeatable prices' },
          ].map((f, i) => (
            <Card key={i} className="p-4 text-center"><div className="mx-auto text-orange-500 mb-2">{f.icon}</div><h3 className="font-medium text-sm">{f.title}</h3><p className="text-xs text-muted-foreground">{f.desc}</p></Card>
          ))}
        </div>
      </section>

      {/* Popular Searches */}
      {popularSearches && (popularSearches as any[]).length > 0 && (
        <section className="container mx-auto px-4">
          <h2 className="text-xl font-bold mb-4">Popular Searches</h2>
          <div className="flex flex-wrap gap-2">
            {(popularSearches as any[]).map((s: any, i: number) => (
              <Button key={i} variant="outline" size="sm" className="rounded-full" onClick={() => { setSearchQuery(s.query || s); setCustomerView('products'); }}>
                <Search size={14} className="mr-1.5" />{s.query || s}
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewedProducts && recentlyViewedProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recently Viewed</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { try { localStorage.removeItem('marketplace-recently-viewed'); } catch {} setRecentlyViewedIds([]); }}>
              <Trash2 size={14} className="mr-1.5" />Clear
            </Button>
          </div>
          <ProductGrid products={recentlyViewedProducts} />
        </section>
      )}
    </div>
  );
}

// ============ FILTER SIDEBAR (extracted) ============

function FilterSidebarContent({ allCategories, allBrands }: { allCategories: Category[]; allBrands: Brand[] }) {
  const { selectedCategory, selectedBrand, priceRange, setPriceRange, setSelectedBrand } = useNavigationStore();
  const navStore = useNavigationStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Filter size={16} /> Filters</h3>
        <Accordion type="multiple" defaultValue={['category', 'brand', 'price', 'rating']}>
          <AccordionItem value="category"><AccordionTrigger>Category</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <Button variant={selectedCategory === null ? 'secondary' : 'ghost'} size="sm" className="w-full justify-start" onClick={() => { navStore.setSelectedCategory(null); }}>All Categories</Button>
                {allCategories.map(cat => (
                  <Button key={cat.id} variant={selectedCategory === cat.slug ? 'secondary' : 'ghost'} size="sm" className="w-full justify-start" onClick={() => { navStore.setSelectedCategory(cat.slug); }}>
                    {cat.name} <Badge variant="secondary" className="ml-auto text-xs">{cat._count?.products || 0}</Badge>
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="brand"><AccordionTrigger>Brand</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allBrands.map(brand => (
                  <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={selectedBrand === brand.slug} onCheckedChange={() => setSelectedBrand(selectedBrand === brand.slug ? null : brand.slug)} />
                    <span className="text-sm">{brand.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">({brand._count?.products || 0})</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="price"><AccordionTrigger>Price Range</AccordionTrigger>
            <AccordionContent>
              <Slider min={0} max={100000} step={1000} value={priceRange} onValueChange={(v) => { setPriceRange(v as [number, number]); }} className="mt-2" />
              <div className="flex justify-between text-sm mt-2"><span>{formatCurrency(priceRange[0])}</span><span>{formatCurrency(priceRange[1])}</span></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

// ============ PRODUCTS LIST PAGE ============

function ProductsPage() {
  const { selectedCategory, selectedBrand, searchQuery, priceRange, sortBy, setPriceRange, setSortBy, setSelectedBrand } = useNavigationStore();
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [minPrice, maxPrice] = priceRange;

  const queryParams = new URLSearchParams({ page: String(page), limit: '20', sort: sortBy, minPrice: String(minPrice), maxPrice: String(maxPrice) });
  if (selectedCategory) queryParams.set('category', selectedCategory);
  if (selectedBrand) queryParams.set('brand', selectedBrand);
  if (searchQuery) queryParams.set('search', searchQuery);

  const { data, isLoading } = useQuery({
    queryKey: ['products', queryParams.toString()],
    queryFn: () => fetch(`/api/products?${queryParams}`).then(r => r.json()).then((r: ApiResponse<Product[]>) => r),
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => fetch('/api/categories').then(r => r.json()).then((r: ApiResponse<Category[]>) => r.data || []) });
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: () => fetch('/api/brands').then(r => r.json()).then((r: ApiResponse<Brand[]>) => r.data || []) });

  const allCategories = useMemo(() => {
    const flat: Category[] = [];
    categories?.forEach(c => { flat.push(c); c.children?.forEach(ch => flat.push(ch)); });
    return flat;
  }, [categories]);

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList><BreadcrumbItem><BreadcrumbLink onClick={() => useNavigationStore.getState().setCustomerView('home')} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink className="text-foreground font-medium">{searchQuery ? `Search: "${searchQuery}"` : selectedCategory || 'All Products'}</BreadcrumbLink></BreadcrumbItem></BreadcrumbList>
      </Breadcrumb>

      <div className="flex gap-6">
        {/* Desktop Filters */}
        <aside className="hidden lg:block w-64 shrink-0"><FilterSidebarContent allCategories={allCategories} allBrands={brands || []} /></aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{data?.meta ? `${data.meta.total} products found` : ''}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileFilters(true)}><SlidersHorizontal size={16} className="mr-1.5" />Filters</Button>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ProductGrid products={data?.data || []} loading={isLoading} />
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
              {Array.from({ length: Math.min(data.meta.totalPages, 5) }, (_, i) => i + 1).map(p => (
                <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => setPage(p)}>{p}</Button>
              ))}
              <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={mobileFilters} onOpenChange={setMobileFilters}>
        <SheetContent side="left" className="w-80"><SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader><div className="mt-4"><FilterSidebarContent allCategories={allCategories} allBrands={brands || []} /></div></SheetContent>
      </Sheet>
    </div>
  );
}

// ============ PROFILE PAGE ============

function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { navigateTo } = useNavigationStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const changePwMutation = useMutation({
    mutationFn: async () => {
      if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); throw new Error(); }
      if (pwForm.newPw.length < 6) { toast.error('Password must be at least 6 characters'); throw new Error(); }
      const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user!.id, currentPassword: pwForm.current, newPassword: pwForm.newPw }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { authToast.passwordChanged(); setPwForm({ current: '', newPw: '', confirm: '' }); },
    onError: (e: any) => { if (e.message !== 'Passwords do not match' && e.message !== 'Password must be at least 6 characters') toast.error('Failed to change password. Please try again.'); },
  });
  const handleChangePw = () => changePwMutation.mutate();

  useEffect(() => { if (!isAuthenticated) navigateTo('login'); }, [isAuthenticated, navigateTo]);
  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16"><AvatarFallback className="text-xl bg-orange-100 text-orange-600">{user?.name?.[0]}</AvatarFallback></Avatar>
          <div><h2 className="text-lg font-bold">{user?.name}</h2><p className="text-sm text-muted-foreground">{user?.email}</p></div>
        </div>
        <div className="space-y-4">
          <div><Label>Name</Label>{editing ? <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="mt-1" /> : <p className="mt-1">{user?.name}</p>}</div>
          <div className="flex items-center gap-2">
            <Label>Email</Label>
            {user?.isVerified ? <Badge className="bg-green-100 text-green-700 text-xs">✓ Verified</Badge> : <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => authToast.passwordResetEmailSent(user?.email || '')}>Verify</Badge>}
          </div>
          <p className="mt-1">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Label>Phone</Label>
            {user?.phone ? <Badge className="bg-green-100 text-green-700 text-xs">✓ Verified</Badge> : <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => toast.info('OTP verification coming soon!')}>Verify</Badge>}
          </div>
          <p className="mt-1">{user?.phone || 'Not set'}</p>
          <Button variant={editing ? 'default' : 'outline'} className={editing ? 'bg-orange-500 hover:bg-orange-600' : ''} onClick={() => { if (editing) authToast.profileUpdated(); setEditing(!editing); }}>
            {editing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h3 className="font-bold text-lg mb-4">Change Password</h3>
        <div className="space-y-4">
          <div><Label>Current Password</Label><Input type="password" className="mt-1" value={pwForm.current} onChange={e => setPwForm(f => ({...f, current: e.target.value}))} /></div>
          <div><Label>New Password</Label><Input type="password" className="mt-1" value={pwForm.newPw} onChange={e => setPwForm(f => ({...f, newPw: e.target.value}))} /></div>
          <div><Label>Confirm New Password</Label><Input type="password" className="mt-1" value={pwForm.confirm} onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))} /></div>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleChangePw} disabled={changePwMutation.isPending}>Update Password</Button>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h3 className="font-bold text-lg mb-4">Active Sessions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><Smartphone size={18} className="text-green-600" /></div>
              <div>
                <p className="text-sm font-medium">Current Session</p>
                <p className="text-xs text-muted-foreground">{user?.email} · Active now</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center"><Monitor size={18} className="text-muted-foreground" /></div>
              <div>
                <p className="text-sm font-medium">Web Browser</p>
                <p className="text-xs text-muted-foreground">{user?.email} · Last active: {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Unknown'}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => toast.info('Other sessions will be logged out')}>Revoke</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============ WISHLIST PAGE ============

function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem: addCartItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { navigateTo } = useNavigationStore();

  const { data: products, isLoading: wishlistLoading } = useQuery({
    queryKey: ['wishlist-products', items],
    queryFn: async () => {
      if (!items.length) return [];
      const res = await fetch(`/api/products?limit=50`);
      const data = await res.json();
      return (data.data || []).filter((p: Product) => items.includes(p.id));
    },
    enabled: isAuthenticated && items.length > 0,
  });

  useEffect(() => { if (!isAuthenticated) navigateTo('login'); }, [isAuthenticated, navigateTo]);
  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({items.length})</h1>
      {wishlistLoading ? <ProductGrid products={[]} loading={true} /> :
      !products?.length ? <div className="flex flex-col items-center justify-center py-16 text-center"><Heart size={64} className="text-muted-foreground/30 mb-4" /><h3 className="text-lg font-medium">No items in wishlist</h3><p className="text-sm text-muted-foreground mt-1">Save items you love for later</p><Button className="mt-4 bg-orange-500 hover:bg-orange-600" onClick={() => navigateTo('home')}>Discover Products</Button></div> :
      <ProductGrid products={products} />}
    </div>
  );
}

// ============ ADDRESSES PAGE (simplified) ============

function AddressesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { navigateTo } = useNavigationStore();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);

  useEffect(() => { if (!isAuthenticated) navigateTo('login'); }, [isAuthenticated, navigateTo]);
  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Addresses</h1>
      <Card className="p-6 text-center text-muted-foreground">
        <MapPin size={48} className="mx-auto mb-4 text-muted-foreground/30" />
        <p>No saved addresses</p>
        <p className="text-sm mt-1">Addresses are automatically saved during checkout</p>
      </Card>
    </div>
  );
}

// ============ COMPARE PAGE (simplified) ============

function ComparePage() {
  const { items, removeItem, clearAll } = useCompareStore();
  const { navigateTo, setSelectedProductId } = useNavigationStore();

  const { data: products, isLoading: compareLoading } = useQuery({
    queryKey: ['compare-products', items],
    queryFn: async () => {
      if (!items.length) return [];
      const res = await fetch('/api/products?limit=50');
      const data = await res.json();
      return (data.data || []).filter((p: Product) => items.includes(p.id));
    },
    enabled: items.length > 0,
  });

  if (!items.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <GitCompare size={64} className="text-muted-foreground/30 mb-4" />
      <h2 className="text-xl font-bold">Compare Products</h2>
      <p className="text-muted-foreground mt-2">Add up to 4 products to compare</p>
      <Button className="mt-4 bg-orange-500 hover:bg-orange-600" onClick={() => navigateTo('home')}>Browse Products</Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Compare Products ({items.length}/4)</h1>
        <Button variant="outline" onClick={clearAll}>Clear All</Button>
      </div>
      {compareLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="relative">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-24" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-5/6" />
                  <Skeleton className="h-3.5 w-4/6" />
                  <Skeleton className="h-3.5 w-3/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
      <div className="overflow-x-auto">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products?.length || 1}, minmax(200px, 1fr))` }}>
          {products?.map(p => (
            <Card key={p.id} className="relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeItem(p.id)}><X size={16} /></Button>
              <CardContent className="p-4 space-y-3">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer" onClick={() => { setSelectedProductId(p.id); navigateTo('product-detail'); }}>
                  {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={32} /></div>}
                </div>
                <h3 className="font-medium text-sm line-clamp-2">{p.name}</h3>
                <p className="text-lg font-bold text-orange-500">{formatCurrency(p.price)}</p>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Brand:</span> {p.brand?.name}</p>
                  <p><span className="text-muted-foreground">Rating:</span> <StarRating rating={p.rating} size={12} /> {p.rating}</p>
                  <p><span className="text-muted-foreground">Stock:</span> {p.stock}</p>
                  <p><span className="text-muted-foreground">Sold:</span> {p.totalSold}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

// ============ FOOTER ============

function CustomerFooter() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4"><Store size={24} className="text-orange-500" /><span className="text-lg font-bold">MarketHub</span></div>
            <p className="text-sm text-muted-foreground">Your one-stop multi-vendor marketplace for everything you need.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="hover:text-foreground cursor-pointer" onClick={() => useNavigationStore.getState().setCustomerView('home')}>Home</p>
              <p className="hover:text-foreground cursor-pointer" onClick={() => { useNavigationStore.getState().setSelectedCategory(null); useNavigationStore.getState().setCustomerView('products'); }}>All Products</p>
              <p className="hover:text-foreground cursor-pointer" onClick={() => useNavigationStore.getState().setCustomerView('about')}>About Us</p>
              <p className="hover:text-foreground cursor-pointer" onClick={() => useNavigationStore.getState().setCustomerView('contact')}>Contact</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Customer Service</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="hover:text-foreground cursor-pointer" onClick={() => useNavigationStore.getState().setCustomerView('help')}>Help Center</p><p className="hover:text-foreground cursor-pointer" onClick={() => useNavigationStore.getState().setCustomerView('returns')}>Returns & Refunds</p><p className="hover:text-foreground cursor-pointer" onClick={() => useNavigationStore.getState().setCustomerView('shipping-info')}>Shipping Info</p><p className="hover:text-foreground cursor-pointer" onClick={() => useNavigationStore.getState().setCustomerView('help')}>FAQ</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact Us</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Mail size={14} />support@markethub.com</p>
              <p className="flex items-center gap-2"><Phone size={14} />+91-1800-123-4567</p>
              <p className="flex items-center gap-2"><MapPin size={14} />Bangalore, India</p>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 MarketHub. All rights reserved.</p>
          <div className="flex gap-4"><p className="hover:text-foreground">Privacy Policy</p><p className="hover:text-foreground">Terms & Conditions</p></div>
        </div>
      </div>

      {/* Live Chat Placeholder */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-full h-14 w-14 shadow-lg bg-orange-500 hover:bg-orange-600 text-white">
              <MessageCircle size={24} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><MessageCircle size={20} className="text-orange-500" />Live Chat</DialogTitle>
              <DialogDescription>Our support team is here to help</DialogDescription>
            </DialogHeader>
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
                <Headphones size={32} className="text-orange-500" />
              </div>
              <h3 className="font-semibold">Chat Support Coming Soon!</h3>
              <p className="text-sm text-muted-foreground">We're working on bringing you live chat support. In the meantime, please use our contact form or support tickets.</p>
              <Button variant="outline" onClick={() => useNavigationStore.getState().setCustomerView('contact')}>Go to Contact Form</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  );
}

// ============ CONTACT US PAGE ============

function ContactUsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/support/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      return res.json();
    },
    onSuccess: () => { toast.success('Message sent! We\'ll get back to you soon.'); setForm({ name: user?.name || '', email: user?.email || '', subject: '', message: '' }); },
    onError: () => toast.error('Failed to send message'),
  });
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><Store size={20} className="text-orange-500" />MarketHub Office</h2>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3"><MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" /><div><p className="font-medium">Address</p><p className="text-muted-foreground">MarketHub HQ, 4th Floor, Infinity Tower, <br />Outer Ring Road, Marathahalli, <br />Bangalore, Karnataka 560037, India</p></div></div>
              <div className="flex gap-3"><Phone size={16} className="text-orange-500 shrink-0 mt-0.5" /><div><p className="font-medium">Phone</p><p className="text-muted-foreground">+91-1800-123-4567 (Toll Free)<br />+91-80-4567-8900 (Direct)</p></div></div>
              <div className="flex gap-3"><Mail size={16} className="text-orange-500 shrink-0 mt-0.5" /><div><p className="font-medium">Email</p><p className="text-muted-foreground">support@markethub.com<br />business@markethub.com</p></div></div>
              <div className="flex gap-3"><Clock size={16} className="text-orange-500 shrink-0 mt-0.5" /><div><p className="font-medium">Business Hours</p><p className="text-muted-foreground">Mon - Sat: 9:00 AM - 8:00 PM IST<br />Sunday: 10:00 AM - 6:00 PM IST<br />Holidays: Closed</p></div></div>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Connect With Us</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Facebook size={18} />, label: 'Facebook', url: 'https://facebook.com/MarketHub' },
                { icon: <Twitter size={18} />, label: 'Twitter', url: 'https://twitter.com/MarketHub' },
                { icon: <Instagram size={18} />, label: 'Instagram', url: 'https://instagram.com/MarketHub' },
                { icon: <MessageCircle size={18} />, label: 'WhatsApp', url: 'https://wa.me/9118001234567' },
              ].map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2 cursor-pointer"><span className="text-orange-500">{s.icon}</span>{s.label}</Button>
                </a>
              ))}
            </div>
          </Card>
        </div>
        <Card className="p-6 space-y-4 h-fit">
          <h2 className="font-semibold text-lg">Send Us a Message</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Full Name *</Label><Input className="mt-1" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div><Label>Email *</Label><Input type="email" className="mt-1" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
          </div>
          <div><Label>Subject *</Label><Input className="mt-1" placeholder="What is this about?" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} /></div>
          <div><Label>Message *</Label><Textarea className="mt-1" rows={5} placeholder="Tell us how we can help you..." value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} /></div>
          <p className="text-xs text-muted-foreground">We usually respond within 2-4 business hours.</p>
          <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || !form.name || !form.email || !form.subject || !form.message}>
            {submitMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Message'}
          </Button>
        </Card>
      </div>
    </div>
  );
}

// ============ MAIN CUSTOMER APP ============

export default function CustomerApp() {
  const { customerView } = useNavigationStore();

  // Scroll to top whenever the view changes (footer links, navigation, etc.)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [customerView]);

  const renderView = () => {
    switch (customerView) {
      case 'home': return <HomePage />;
      case 'products':
      case 'search': return <ProductsPage />;
      case 'product-detail': return <ProductDetailPage />;
      case 'cart': return <CartPage />;
      case 'checkout': return <CheckoutPage />;
      case 'orders': return <OrdersPage />;
      case 'order-detail': return <OrderDetailPage />;
      case 'profile': return <ProfilePage />;
      case 'wishlist': return <WishlistPage />;
      case 'addresses': return <AddressesPage />;
      case 'compare': return <ComparePage />;
      case 'login':
      case 'register': return <LoginPage />;
      case 'contact': return <ContactUsPage />;
      case 'help': return <HelpCenterPage />;
      case 'about': return <AboutPage />;
      case 'returns': return <ReturnsRefundsPage />;
      case 'shipping-info': return <ShippingInfoPage />;
      default: return <HomePage />;
    }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.2}} className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <CustomerHeader />
      <main id="main-content" className="flex-1" role="main"><AnimatePresence mode="wait"><motion.div key={customerView} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.15}}>{renderView()}</motion.div></AnimatePresence></main>
      <CustomerFooter />
    </motion.div>
  );
}