'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { authToast, authErrorToast, vendorStatusToast } from '@/lib/auth-toast';
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Star, StarHalf,
  Minus, Plus, Trash2, ChevronRight, ChevronLeft, MapPin, Phone, Mail,
  Package, Truck, CheckCircle, Clock, Shield, Gift, TrendingUp,
  BarChart3, Users, ArrowRight, Eye, Share2, GitCompare, Tag,
  Store, CreditCard, Banknote, Smartphone, Building2, Home,
  Settings, LogOut, Bell, Sun, Moon, Monitor, Filter, SlidersHorizontal,
  Bookmark, Send, Printer, RotateCcw, XCircle,
  MessageCircle, Facebook, Twitter, Link as LinkIcon, HelpCircle, Headphones, SearchX, ShoppingBag,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTheme } from 'next-themes';
import { useAuthStore, useNavigationStore, useCartStore, useWishlistStore, useCompareStore, useNotificationStore } from '@/stores';
import { useNotifications } from '@/hooks/use-notifications';
import type { Product, Category, Brand, Order, Banner, CustomerAddress, ApiResponse } from '@/types';

// ============ HELPERS ============

const formatCurrency = (price: number) => '₹' + price.toLocaleString('en-IN', { maximumFractionDigits: 0 });
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function useRequireAuth() {
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
const discountPercent = (price: number, compare?: number | null) => compare ? Math.round(((compare - price) / compare) * 100) : 0;
const badgeColors: Record<string, string> = { BEST_SELLER: 'bg-emerald-500 text-white', NEW_ARRIVAL: 'bg-blue-500 text-white', LIMITED_TIME: 'bg-red-500 text-white', FESTIVAL_OFFER: 'bg-amber-500 text-white' };
const badgeLabels: Record<string, string> = { BEST_SELLER: 'Best Seller', NEW_ARRIVAL: 'New', LIMITED_TIME: 'Limited', FESTIVAL_OFFER: 'Festival' };

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
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

function ProductCard({ product }: { product: Product }) {
  const { navigateTo, setSelectedProductId } = useNavigationStore();
  const { addItem } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();
  const { toggleItem: toggleCompare, hasItem: hasCompare } = useCompareStore();
  const requireAuth = useRequireAuth();
  const isWishlisted = hasItem(product.id);
  const isCompared = hasCompare(product.id);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const mainImage = product.images?.[0]?.url;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth('add items to cart')) return;
    addItem({ productId: product.id, name: product.name, price: product.price, image: mainImage || '', vendorName: product.vendor?.businessName || '', vendorId: product.vendorId, stock: product.stock });
    toast.success('Added to cart', { description: `${product.name} has been added to your cart.` });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth('add items to wishlist')) return;
    toggleItem(product.id);
    if (isWishlisted) {
      toast.info('Removed from wishlist');
    } else {
      toast.success('Added to wishlist', { description: product.name });
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth('compare products')) return;
    toggleCompare(product.id);
    if (isCompared) {
      toast.info('Removed from comparison');
    } else {
      toast.success('Added to comparison');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} whileHover={{ y: -4 }}>
      <Card role="article" aria-label={`${product.name}, ${formatCurrency(product.price)}`} className="group overflow-hidden border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {mainImage ? (
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package size={48} /></div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && <Badge className="bg-red-500 text-white text-xs">{discount}% OFF</Badge>}
            {product.badge && (
              <Badge className={badgeColors[product.badge] || 'bg-gray-500 text-white'}>{badgeLabels[product.badge]}</Badge>
            )}
          </div>
          {product.stock < 5 && product.stock > 0 && <Badge variant="secondary" className="absolute top-2 right-10 text-xs">Low Stock</Badge>}
          {product.stock === 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Badge variant="destructive">Out of Stock</Badge></div>}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md" aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} onClick={handleWishlistToggle}>
              <Heart size={14} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md" onClick={handleCompareToggle}>
              <GitCompare size={14} className={isCompared ? 'text-orange-500' : ''} />
            </Button>
          </div>
        </div>
        <CardContent className="p-3 flex-1 flex flex-col gap-1.5" onClick={() => { setSelectedProductId(product.id); navigateTo('product-detail'); }}>
          <p className="text-xs text-muted-foreground truncate">{product.vendor?.businessName}</p>
          <h3 className="text-sm font-medium line-clamp-2 leading-tight min-h-[2.5rem]">{product.name}</h3>
          <div className="flex items-center gap-1">
            <StarRating rating={product.rating} size={12} />
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-lg font-bold text-foreground">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0">
          <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white" aria-label={`Add ${product.name} to cart`} disabled={product.stock === 0} onClick={handleAddToCart}>
            <ShoppingCart size={14} className="mr-1.5" /> Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function ProductGrid({ products, loading }: { products: Product[]; loading?: boolean }) {
  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-1"><Skeleton className="h-3 w-20" /></div>
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="px-3 pb-3"><Skeleton className="h-8 w-full rounded-md" /></div>
        </Card>
      ))}
    </div>;
  }
  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <SearchX size={64} className="text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No results found</h3>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search</p>
        <Button variant="outline" className="mt-4" onClick={() => { const { setSearchQuery, setSelectedCategory, setSelectedBrand, setCustomerView, setPriceRange } = useNavigationStore.getState(); setSearchQuery(''); setSelectedCategory(null); setSelectedBrand(null); setPriceRange([0, 100000]); setCustomerView('products'); }}>Clear search</Button>
      </div>
    );
  }
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>;
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

// Need RefreshCw icon
function RefreshCw(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </svg>
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

// ============ PRODUCT DETAIL PAGE ============

function ProductDetailPage() {
  const { selectedProductId } = useNavigationStore();
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: () => fetch(`/api/products/${selectedProductId}`).then(r => r.json()).then((r: ApiResponse<Product>) => r.data),
    enabled: !!selectedProductId,
  });
  const { isAuthenticated, user } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();
  const requireAuth = useRequireAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [pincode, setPincode] = useState('');
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<{available: boolean; date?: string} | null>(null);
  const [showWishlistConfirm, setShowWishlistConfirm] = useState(false);
  const checkPincode = async () => {
    setCheckingPincode(true);
    try {
      const res = await fetch(`/api/products/${selectedProductId}/delivery-check?pincode=${pincode}`);
      const data = await res.json();
      setDeliveryResult(data.data || { available: false });
    } catch { setDeliveryResult({ available: false }); }
    setCheckingPincode(false);
  };

  const { data: similarProducts = [] } = useQuery({
    queryKey: ['similar-products', selectedProductId, product?.categoryId],
    queryFn: () => fetch(`/api/products?categoryId=${product?.categoryId}&limit=4`).then(r => r.json()).then((r: any) => (r.data || []).filter((p: any) => p.id !== selectedProductId).slice(0, 4)),
    enabled: !!product?.categoryId,
  });

  const { data: frequentlyBought = [] } = useQuery({
    queryKey: ['frequently-bought', selectedProductId, product?.vendorId],
    queryFn: () => fetch(`/api/products?vendorId=${product?.vendorId}&limit=4`).then(r => r.json()).then((r: any) => (r.data || []).filter((p: any) => p.id !== selectedProductId).slice(0, 4)),
    enabled: !!product?.vendorId,
  });

  const { data: qaList = [] } = useQuery({
    queryKey: ['product-qa', selectedProductId],
    queryFn: () => fetch(`/api/products/${selectedProductId}/qa`).then(r => r.json()).then((r: any) => r.data || []),
    enabled: !!selectedProductId,
  });

  const variantsByType = useMemo(() => {
    const map: Record<string, string[]> = {};
    product?.variants?.forEach(v => { if (!map[v.name]) map[v.name] = []; if (!map[v.name].includes(v.value)) map[v.name].push(v.value); });
    return map;
  }, [product?.variants]);

  if (isLoading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-96 rounded-xl" /></div>;
  if (!product) return <div className="container mx-auto px-4 py-16 text-center"><p className="text-muted-foreground">Product not found</p></div>;

  const isWishlisted = hasItem(product.id);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const mainImage = product.images?.[selectedImage]?.url;

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={() => useNavigationStore.getState().setCustomerView('home')} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink onClick={() => { useNavigationStore.getState().setSelectedCategory(product.category?.slug || null); useNavigationStore.getState().setCustomerView('products'); }} className="cursor-pointer">{product.category?.name}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink className="text-foreground font-medium truncate max-w-48">{product.name}</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted/30 border">
            {mainImage ? <img src={mainImage} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={64} className="text-muted-foreground/30" /></div>}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">{product.images.map((img, i) => (
              <button key={img.id} className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === selectedImage ? 'border-orange-500' : 'border-transparent'}`} onClick={() => setSelectedImage(i)}>
                <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
              </button>
            ))}</div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Brand: <span className="text-foreground font-medium">{product.brand?.name}</span></p>
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <StarRating rating={product.rating} /> <span>{product.rating}</span> ({product.reviewCount} reviews) | {product.totalSold} sold
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-orange-500">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-xl text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>
                <Badge className="bg-green-600">{discount}% OFF</Badge>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={`font-medium ${product.stock > 5 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
              {product.stock > 5 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
            </span>
            <span>|</span>
            <span>Sold by: <span className="text-orange-500 font-medium">{product.vendor?.businessName}</span></span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <MapPin size={16} className="text-orange-500 shrink-0" />
            <Input placeholder="Enter pincode" className="h-8 w-36 text-sm" value={pincode} onChange={e => setPincode(e.target.value)} maxLength={6} />
            <Button size="sm" variant="outline" className="h-8" onClick={checkPincode} disabled={pincode.length !== 6 || checkingPincode}>
              {checkingPincode ? 'Checking...' : 'Check'}
            </Button>
            {deliveryResult && (
              <span className={`text-xs font-medium ${deliveryResult.available ? 'text-green-600' : 'text-red-500'}`}>
                {deliveryResult.available ? `✓ Delivery available by ${deliveryResult.date}` : '✗ Delivery not available'}
              </span>
            )}
          </div>

          <Separator />

          {/* Variants */}
          {Object.entries(variantsByType).map(([type, values]) => (
            <div key={type}>
              <Label className="text-sm font-medium mb-2 block">{type}</Label>
              <div className="flex gap-2 flex-wrap">
                {values.map(v => (
                  <Button key={v} variant="outline" size="sm" className={type === 'Color' ? `w-10 h-10 p-0 rounded-full` : ''}>{v}</Button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16} /></Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}><Plus size={16} /></Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button size="lg" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12" disabled={product.stock === 0}
              onClick={() => {
                if (!requireAuth('add items to cart')) return;
                for (let i = 0; i < quantity; i++) addItem({ productId: product.id, name: product.name, price: product.price, image: mainImage || '', vendorName: product.vendor?.businessName || '', vendorId: product.vendorId, stock: product.stock });
                toast.success('Added to cart', { description: `${product.name} has been added to your cart.` });
              }}>
              <ShoppingCart size={20} className="mr-2" />Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="h-12" onClick={() => {
              if (isWishlisted) {
                setShowWishlistConfirm(true);
              } else {
                if (!requireAuth('add items to wishlist')) return;
                toggleItem(product.id);
                toast.success('Added to wishlist', { description: product.name });
              }
            }}>
              <Heart size={20} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
            </Button>
          </div>

          {/* Wishlist Remove Confirmation */}
          <AlertDialog open={showWishlistConfirm} onOpenChange={setShowWishlistConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from wishlist?</AlertDialogTitle>
                <AlertDialogDescription>{product.name} will be removed from your wishlist.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => { toggleItem(product.id); toast.info('Removed from wishlist'); setShowWishlistConfirm(false); }}>Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Share Buttons */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground">Share:</span>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`)}><MessageCircle size={14} /></Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)}><Facebook size={14} /></Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(window.location.href)}`)}><Twitter size={14} /></Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}><LinkIcon size={14} /></Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm"><Truck size={16} className="text-orange-500" /><span>Estimated delivery: {product.estimatedDeliveryDays || 5}-{(product.estimatedDeliveryDays || 5) + 3} business days</span></div>
            <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Truck size={16} />, text: 'Free delivery above ₹500' },
              { icon: <RefreshCw size={16} />, text: '7-day easy returns' },
              { icon: <Shield size={16} />, text: 'Secure transactions' },
              { icon: <Package size={16} />, text: product.warranty || 'Standard warranty' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><span className="text-orange-500">{f.icon}</span>{f.text}</div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews, Q&A */}
      <div className="mt-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
            {['specs', 'description', 'reviews', 'qa'].map(t => (
              <TabsTrigger key={t} value={t} className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:shadow-none px-6 py-3 capitalize">{t === 'qa' ? 'Q&A' : t}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="specs" className="pt-4">
            {product.specs && product.specs.length > 0 ? (
              <div className="max-w-2xl"><Table><TableBody>{product.specs.map(s => (
                <TableRow key={s.id}><TableCell className="font-medium w-40 bg-muted/30">{s.key}</TableCell><TableCell>{s.value}</TableCell></TableRow>
              ))}</TableBody></Table></div>
            ) : <p className="text-muted-foreground">No specifications available</p>}
          </TabsContent>
          <TabsContent value="description" className="pt-4">
            <div className="max-w-3xl prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available</p>' }} />
          </TabsContent>
          <TabsContent value="reviews" className="pt-4">
            <ReviewsSection productId={product.id} reviews={product.reviews || []} reviewCount={product._count?.reviews || 0} rating={product.rating} />
          </TabsContent>
          <TabsContent value="qa" className="pt-4">
            <ProductQASection productId={product.id} qaList={qaList} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Similar Products</h2>
          <ProductGrid products={similarProducts} />
        </div>
      )}

      {/* Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Frequently Bought Together</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {frequentlyBought.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Customers Also Bought */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Customers Also Bought</h2>
        <CustomersAlsoBought productId={product.id} />
      </div>
    </div>
  );
}

function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border overflow-hidden ${className || ''}`}><table className="w-full text-sm">{children}</table></div>;
}
function TableBody({ children }: { children: React.ReactNode }) { return <tbody>{children}</tbody>; }
function TableRow({ children, className }: { children: React.ReactNode; className?: string }) { return <tr className={`border-b last:border-0 ${className || ''}`}>{children}</tr>; }
function TableCell({ children, className }: { children: React.ReactNode; className?: string }) { return <td className={`px-4 py-3 ${className || ''}`}>{children}</td>; }

function CustomersAlsoBought({ productId }: { productId: string }) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['customers-also-bought', productId],
    queryFn: () => fetch(`/api/products?limit=8&exclude=${productId}`).then(r => r.json()).then((r: any) => (r.data || []).sort(() => Math.random() - 0.5).slice(0, 4)),
    enabled: !!productId,
  });
  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="aspect-square rounded-xl" />)}</div>;
  if (!products.length) return null;
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>;
}

function ReviewsSection({ productId, reviews, reviewCount, rating }: { productId: string; reviews: any[]; reviewCount: number; rating: number }) {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const requireAuth = useRequireAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', comment: '', images: '' });
  const [sortBy, setSortBy] = useState('latest');
  const sortedReviews = useMemo(() => {
    const r = [...reviews];
    switch(sortBy) {
      case 'highest': return r.sort((a,b) => b.rating - a.rating);
      case 'lowest': return r.sort((a,b) => a.rating - b.rating);
      case 'helpful': return r.sort((a,b) => (b.helpfulCount||0) - (a.helpfulCount||0));
      default: return r.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [reviews, sortBy]);

  const submitReview = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user!.id, productId, rating: form.rating, title: form.title, comment: form.comment, images: form.images.trim() || undefined }) });
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['product', productId] }); toast.success('Review submitted!'); setShowForm(false); setForm({ rating: 5, title: '', comment: '', images: '' }); },
    onError: () => toast.error('Failed to submit review'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center"><div className="text-4xl font-bold">{rating}</div><StarRating rating={rating} size={16} /><p className="text-sm text-muted-foreground mt-1">{reviewCount} reviews</p></div>
        </div>
        {isAuthenticated && <Button variant="outline" onClick={() => { if (!requireAuth('write a review')) return; setShowForm(!showForm); }}>{showForm ? 'Cancel' : 'Write a Review'}</Button>}
      </div>

      {showForm && (
        <Card className="p-4 space-y-4">
          <div><Label>Rating</Label><div className="flex gap-1 mt-1">{[1,2,3,4,5].map(s => <button key={s} aria-label={`Rate ${s} out of 5 stars`} onClick={() => setForm(f => ({...f, rating: s}))}><Star size={24} className={s <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'} /></button>)}</div></div>
          <div><Label>Title</Label><Input placeholder="Summary of your experience" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="mt-1" /></div>
          <div><Label>Review</Label><Textarea placeholder="Tell us more..." value={form.comment} onChange={e => setForm(f => ({...f, comment: e.target.value}))} className="mt-1" rows={3} /></div>
          <div><Label>Images (URLs, one per line)</Label><Textarea placeholder="Paste image URLs here..." value={form.images} onChange={e => setForm(f => ({...f, images: e.target.value}))} className="mt-1" rows={2} /></div>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => submitReview.mutate()} disabled={submitReview.isPending || !form.comment.trim()}>{submitReview.isPending ? 'Submitting...' : 'Submit Review'}</Button>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger aria-label="Sort reviews" className="w-40 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {sortedReviews.length === 0 && <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>}
        {sortedReviews.map((review: any) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10"><AvatarFallback>{review.user?.name?.[0] || 'U'}</AvatarFallback></Avatar>
                <div>
                  <p className="font-medium text-sm">{review.user?.name || 'Anonymous'}</p>
                  {review.verifiedPurchase && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs ml-2">✓ Verified Purchase</Badge>}
                  <div className="flex items-center gap-2"><StarRating rating={review.rating} size={12} /><span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>
            </div>
            {review.title && <p className="font-medium mt-2">{review.title}</p>}
            {review.comment && <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>}
            {review.images && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {review.images.split(',').filter(Boolean).map((img: string, i: number) => (
                  <img key={i} src={img.trim()} alt="Review" className="w-16 h-16 rounded-lg object-cover border" />
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProductQASection({ productId, qaList }: { productId: string; qaList: any[] }) {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [question, setQuestion] = useState('');

  const submitQuestion = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/products/${productId}/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id, question }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-qa', productId] });
      toast.success('Question submitted!');
      setShowDialog(false);
      setQuestion('');
    },
    onError: () => toast.error('Failed to submit question'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle size={20} className="text-orange-500" />
          <h3 className="text-lg font-bold">Questions & Answers</h3>
          <Badge variant="secondary">{qaList.length}</Badge>
        </div>
        <Button variant="outline" onClick={() => { if (!isAuthenticated) { toast.info('Please login to ask a question'); return; } setShowDialog(true); }}>
          <Send size={14} className="mr-1.5" />Ask Question
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask a Question</DialogTitle>
            <DialogDescription>Get answers from the community and seller</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Your Question</Label>
              <Textarea placeholder="What would you like to know about this product?" value={question} onChange={e => setQuestion(e.target.value)} className="mt-1" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => submitQuestion.mutate()} disabled={!question.trim() || submitQuestion.isPending}>
              {submitQuestion.isPending ? 'Submitting...' : 'Submit Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {qaList.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No questions yet. Be the first to ask!</p>
        )}
        {qaList.map((qa: any) => (
          <Card key={qa.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="text-xs">{qa.user?.name?.[0] || 'U'}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{qa.user?.name || 'Anonymous'}</p>
                  <span className="text-xs text-muted-foreground">{new Date(qa.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm mt-1">{qa.question}</p>
                {qa.answer && (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-orange-500 bg-orange-50 dark:bg-orange-900/10 rounded-r-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Seller Answer</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{qa.answer}</p>
                  </div>
                )}
                {!qa.answer && (
                  <p className="text-xs text-muted-foreground mt-1 italic">No answer yet</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ CART PAGE ============

function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getShipping, getTax, getTotal, couponCode, couponDiscount, applyCoupon, removeCoupon, clearCart, addItem } = useCartStore();
  const { navigateTo } = useNavigationStore();
  const requireAuth = useRequireAuth();
  const { data: coupons } = useQuery({ queryKey: ['coupons'], queryFn: () => fetch('/api/coupons').then(r => r.json()).then((r: ApiResponse<any[]>) => r.data || []) });
  const [couponInput, setCouponInput] = useState('');
  const [savedForLater, setSavedForLater] = useState<any[]>([]);
  const [cartPageRemoveTarget, setCartPageRemoveTarget] = useState<{id: string; name: string} | null>(null);
  const qc = useQueryClient();

  const handleApplyCoupon = () => {
    const coupon = coupons?.find(c => c.code.toUpperCase() === couponInput.toUpperCase());
    if (!coupon) { toast.error('Invalid coupon code', { description: 'Please check the code and try again.' }); return; }
    const subtotal = getSubtotal();
    if (coupon.minOrder && subtotal < coupon.minOrder) { toast.error('Minimum order amount not met', { description: `You need to order at least ${formatCurrency(coupon.minOrder)} to use this coupon.` }); return; }
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') discount = (subtotal * coupon.discountValue) / 100;
    else discount = coupon.discountValue;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    applyCoupon(coupon.code, discount);
    toast.success('Coupon applied!', { description: 'You save ' + formatCurrency(discount) });
  };

  const handleCartPageRemove = (id: string, name: string) => {
    removeItem(id);
    toast.info('Removed from cart', { description: `${name} removed.` });
    setCartPageRemoveTarget(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag size={64} className="text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground mt-2">Looks like you haven&apos;t added anything yet</p>
        <Button className="mt-4 bg-orange-500 hover:bg-orange-600" onClick={() => navigateTo('home')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <Card key={item.productId} className="flex gap-4 p-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={24} /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.vendorName}</p>
                <p className="text-lg font-bold text-orange-500 mt-1">{formatCurrency(item.price)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus size={14} /></Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}><Plus size={14} /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setCartPageRemoveTarget({id: item.productId, name: item.name})}><Trash2 size={16} className="mr-1" />Remove</Button>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => { setSavedForLater(prev => [...prev, item]); removeItem(item.productId); toast.success('Saved for later'); }}>
                    <Bookmark size={14} className="mr-1" />Save for Later
                  </Button>
                </div>
              </div>
              <div className="text-right shrink-0"><p className="font-bold">{formatCurrency(item.price * item.quantity)}</p></div>
            </Card>
          ))}
        </div>
        {savedForLater.length > 0 && (
          <Card className="p-4 mt-4">
            <h3 className="font-bold mb-3">Saved for Later ({savedForLater.length})</h3>
            <div className="space-y-2">
              {savedForLater.map(item => (
                <div key={item.productId} className="flex items-center gap-3 p-2 border rounded-lg">
                  {item.image && <img src={item.image} className="w-12 h-12 object-cover rounded" alt="" />}
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-sm text-orange-500 font-bold">₹{item.price.toLocaleString('en-IN')}</p></div>
                  <Button size="sm" onClick={() => { setSavedForLater(prev => prev.filter(i => i.productId !== item.productId)); addItem(item); toast.success('Moved to cart'); }}>Move to Cart</Button>
                </div>
              ))}
            </div>
          </Card>
        )}
        <div>
          <Card className="p-6 sticky top-24 space-y-4">
            <h3 className="font-bold text-lg">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(getSubtotal())}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{getShipping() === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatCurrency(getShipping())}</span></div>
              <div className="flex justify-between"><span>Tax (GST 18%)</span><span>{formatCurrency(getTax())}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-{formatCurrency(couponDiscount)}</span></div>}
              <Separator />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-orange-500">{formatCurrency(getTotal())}</span></div>
            </div>
            {!couponCode ? (
              <div className="flex gap-2"><Input placeholder="Coupon code" value={couponInput} onChange={e => setCouponInput(e.target.value)} className="uppercase" /><Button variant="outline" onClick={handleApplyCoupon}>Apply</Button></div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded"><span className="text-sm text-green-600">Code: {couponCode}</span><Button variant="ghost" size="sm" className="text-destructive h-6" onClick={removeCoupon}>Remove</Button></div>
            )}
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Available Coupons:</p>
              <div className="flex flex-wrap gap-2">
                {coupons?.filter((c: any) => c.isActive).slice(0, 3).map((c: any) => (
                  <Badge key={c.id} variant="outline" className="cursor-pointer hover:bg-orange-50 text-xs" onClick={() => setCouponInput(c.code)}>
                    {c.code} - {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                  </Badge>
                ))}
              </div>
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg" onClick={() => { if (!requireAuth('proceed to checkout')) return; navigateTo('checkout'); }}>
              Proceed to Checkout
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigateTo('home')}>Continue Shopping</Button>
          </Card>
        </div>
      </div>
      <AlertDialog open={!!cartPageRemoveTarget} onOpenChange={() => setCartPageRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {cartPageRemoveTarget?.name} from cart?</AlertDialogTitle>
            <AlertDialogDescription>This item will be removed from your cart.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => cartPageRemoveTarget && handleCartPageRemove(cartPageRemoveTarget.id, cartPageRemoveTarget.name)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CheckoutPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { items, getSubtotal, getShipping, getTax, getTotal, clearCart, couponDiscount } = useCartStore();
  const { navigateTo } = useNavigationStore();
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [address, setAddress] = useState({ fullName: user?.name || '', phone: user?.phone || '', addressLine1: '', city: '', state: '', pincode: '' });
  const [placing, setPlacing] = useState(false);
  const [isGuest, setIsGuest] = useState(!isAuthenticated);
  const [guestInfo, setGuestInfo] = useState({ email: '', phone: '' });
  const [sameAddress, setSameAddress] = useState(true);
  const [billingForm, setBillingForm] = useState({ fullName: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const qc = useQueryClient();

  useEffect(() => { if (items.length === 0) navigateTo('cart'); }, [items.length, navigateTo]);
  if (items.length === 0) return null;
  if (!isAuthenticated && !isGuest) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center space-y-4">
        <Package size={64} className="mx-auto text-muted-foreground/30" />
        <h2 className="text-xl font-bold">Continue to Checkout</h2>
        <p className="text-muted-foreground">Log in for a faster experience, or continue as guest.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigateTo('login')}>Login</Button>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsGuest(true)}>Continue as Guest</Button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!address.fullName) { toast.error('Please enter your full name'); return; }
    if (!address.addressLine1) { toast.error('Please enter your address'); return; }
    if (!address.city) { toast.error('Please enter your city'); return; }
    if (!address.pincode) { toast.error('Please enter your pincode'); return; }
    if (!/^\d{6}$/.test(address.pincode)) { toast.error('Invalid pincode', { description: 'Pincode must be exactly 6 digits.' }); return; }
    if (!address.phone) { toast.error('Please enter your phone number'); return; }
    if (!/^\d{10}$/.test(address.phone.replace(/\s/g, ''))) { toast.error('Invalid phone number', { description: 'Phone number must be exactly 10 digits.' }); return; }
    if (!isAuthenticated && (!guestInfo.email || !guestInfo.phone)) {
      toast.error('Please fill guest email and phone'); return;
    }
    setPlacing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isAuthenticated ? { userId: user!.id } : { guestEmail: guestInfo.email, guestPhone: guestInfo.phone }),
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: `${address.fullName}, ${address.addressLine1}, ${address.city}, ${address.state} - ${address.pincode}, Phone: ${address.phone}`,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        toast.success('Order placed successfully!', { description: 'Your order has been confirmed.' });
        navigateTo('orders');
        qc.invalidateQueries({ queryKey: ['orders'] });
      } else { toast.error(data.error || 'Failed to place order'); }
    } catch { toast.error('Something went wrong'); }
    setPlacing(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {isGuest && !isAuthenticated && (
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-3">Guest Information</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Email *</Label><Input className="mt-1" type="email" value={guestInfo.email} onChange={e => setGuestInfo(g => ({...g, email: e.target.value}))} /></div>
            <div><Label>Phone *</Label><Input className="mt-1" value={guestInfo.phone} onChange={e => setGuestInfo(g => ({...g, phone: e.target.value}))} /></div>
          </div>
        </Card>
      )}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={20} className="text-orange-500" />Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full Name</Label><Input value={address.fullName} onChange={e => setAddress(a => ({...a, fullName: e.target.value}))} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={address.phone} onChange={e => setAddress(a => ({...a, phone: e.target.value}))} className="mt-1" /></div>
              <div className="sm:col-span-2"><Label>Address</Label><Textarea value={address.addressLine1} onChange={e => setAddress(a => ({...a, addressLine1: e.target.value}))} className="mt-1" /></div>
              <div><Label>City</Label><Input value={address.city} onChange={e => setAddress(a => ({...a, city: e.target.value}))} className="mt-1" /></div>
              <div><Label>State</Label><Input value={address.state} onChange={e => setAddress(a => ({...a, state: e.target.value}))} className="mt-1" /></div>
              <div><Label>Pincode</Label><Input value={address.pincode} onChange={e => setAddress(a => ({...a, pincode: e.target.value}))} className="mt-1" /></div>
            </div>
          </Card>

          <div className="flex items-center gap-2 mb-4">
            <Checkbox id="same-billing" checked={sameAddress} onCheckedChange={(v) => setSameAddress(v === true)} />
            <Label htmlFor="same-billing" className="text-sm">Billing address same as shipping</Label>
          </div>
          {!sameAddress && (
            <Card className="p-4 mb-4 border-dashed">
              <h3 className="font-semibold mb-3">Billing Address</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Full Name</Label><Input className="mt-1" value={billingForm.fullName} onChange={e => setBillingForm(f => ({...f, fullName: e.target.value}))} /></div>
                <div><Label>Phone</Label><Input className="mt-1" value={billingForm.phone} onChange={e => setBillingForm(f => ({...f, phone: e.target.value}))} /></div>
                <div className="sm:col-span-2"><Label>Address</Label><Textarea className="mt-1" rows={2} value={billingForm.address} onChange={e => setBillingForm(f => ({...f, address: e.target.value}))} /></div>
                <div><Label>City</Label><Input className="mt-1" value={billingForm.city} onChange={e => setBillingForm(f => ({...f, city: e.target.value}))} /></div>
                <div><Label>State</Label><Input className="mt-1" value={billingForm.state} onChange={e => setBillingForm(f => ({...f, state: e.target.value}))} /></div>
                <div><Label>Pincode</Label><Input className="mt-1" value={billingForm.pincode} onChange={e => setBillingForm(f => ({...f, pincode: e.target.value}))} /></div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard size={20} className="text-orange-500" />Payment Method</h2>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              {[
                { value: 'COD', label: 'Cash on Delivery', icon: <Banknote size={20} />, desc: 'Pay when you receive' },
                { value: 'UPI', label: 'UPI Payment', icon: <Smartphone size={20} />, desc: 'GPay, PhonePe, Paytm' },
                { value: 'Credit Card', label: 'Credit Card', icon: <CreditCard size={20} />, desc: 'Visa, Mastercard' },
                { value: 'Debit Card', label: 'Debit Card', icon: <CreditCard size={20} />, desc: 'All banks supported' },
                { value: 'Net Banking', label: 'Net Banking', icon: <Building2 size={20} />, desc: 'All major banks' },
              ].map(pm => (
                <Label key={pm.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${paymentMethod === pm.value ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                  <RadioGroupItem value={pm.value} />
                  <span className="text-orange-500">{pm.icon}</span>
                  <div><p className="font-medium text-sm">{pm.label}</p><p className="text-xs text-muted-foreground">{pm.desc}</p></div>
                </Label>
              ))}
            </RadioGroup>
          </Card>
        </div>

        <Card className="p-6 h-fit sticky top-24 space-y-4">
          <h3 className="font-bold text-lg">Order Summary</h3>
          <ScrollArea className="max-h-48"><div className="space-y-3">{items.map(item => (
            <div key={item.productId} className="flex gap-3"><div className="w-12 h-12 rounded bg-muted shrink-0 overflow-hidden">{item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}</div><div className="flex-1 min-w-0"><p className="text-sm truncate">{item.name}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity}</p></div><p className="text-sm font-medium shrink-0">{formatCurrency(item.price * item.quantity)}</p></div>
          ))}</div></ScrollArea>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(getSubtotal())}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{getShipping() === 0 ? 'FREE' : formatCurrency(getShipping())}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(getTax())}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(couponDiscount)}</span></div>}
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-orange-500">{formatCurrency(getTotal())}</span></div>
          </div>
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg" onClick={handlePlaceOrder} disabled={placing}>
            {placing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Placing Order...</> : `Place Order • ${formatCurrency(getTotal())}`}
          </Button>
        </Card>
      </div>
    </div>
  );
}

// ============ ORDERS PAGE ============

function OrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { navigateTo, setSelectedOrderId } = useNavigationStore();
  const { data, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => fetch(`/api/orders?userId=${user?.id}`).then(r => r.json()).then((r: ApiResponse<Order[]>) => r.data || []),
    enabled: !!user?.id,
  });

  useEffect(() => { if (!isAuthenticated) navigateTo('login'); }, [isAuthenticated, navigateTo]);
  if (!isAuthenticated) return null;

  const statusColor: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700', PROCESSING: 'bg-amber-100 text-amber-700', PACKED: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-orange-100 text-orange-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
    RETURNED: 'bg-gray-100 text-gray-700', REFUNDED: 'bg-teal-100 text-teal-700',
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {isLoading ? <div className="space-y-4">{Array.from({length: 3}).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex gap-3 mb-3">
            {Array.from({length: 3}).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-2.5 w-16" /></div>
              </div>
            ))}
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex justify-between items-center mt-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </Card>
      ))}</div> :
      !data?.length ? <div className="flex flex-col items-center justify-center py-16 text-center"><Package size={64} className="text-muted-foreground/30 mb-4" /><h3 className="text-lg font-medium">No orders yet</h3><p className="text-sm text-muted-foreground mt-1">When you place your first order, it will appear here</p><Button className="mt-4 bg-orange-500 hover:bg-orange-600" onClick={() => navigateTo('home')}>Start Shopping</Button></div> :
      <div className="space-y-4">{data.map(order => (
        <Card key={order.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedOrderId(order.id); navigateTo('order-detail'); }}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div><p className="font-medium">Order #{order.orderNumber}</p><p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
            <Badge className={statusColor[order.status] || ''}>{order.status}</Badge>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">{order.items?.slice(0, 3).map(item => (
            <div key={item.id} className="flex items-center gap-2 shrink-0"><div className="w-12 h-12 rounded bg-muted shrink-0 overflow-hidden">{item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}</div><div><p className="text-sm truncate max-w-32">{item.productName}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity}</p></div></div>
          ))}</div>
          <Separator className="my-3" />
          <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">{order.items?.length || 0} items</span><span className="font-bold">{formatCurrency(order.total)}</span></div>
        </Card>
      ))}</div>}
    </div>
  );
}

function OrderDetailPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { selectedOrderId, navigateTo } = useNavigationStore();
  const { addItem } = useCartStore();
  const qc = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const cancelMutation = useMutation({
    mutationFn: () => fetch(`/api/orders/${selectedOrderId}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: cancelReason }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['order'] }); toast.success('Order cancelled', { description: 'Refund will be processed.' }); setShowCancelDialog(false); },
  });
  const returnMutation = useMutation({
    mutationFn: () => fetch(`/api/orders/${selectedOrderId}/return`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: returnReason }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['order'] }); toast.success('Return request submitted', { description: 'We will review your request shortly.' }); setShowReturnDialog(false); },
  });
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', selectedOrderId],
    queryFn: () => fetch(`/api/orders/${selectedOrderId}`).then(r => r.json()).then((r: ApiResponse<Order>) => r.data),
    enabled: !!selectedOrderId,
  });

  useEffect(() => { if (!isAuthenticated) navigateTo('login'); }, [isAuthenticated, navigateTo]);
  if (!isAuthenticated) return null;
  if (isLoading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-64 rounded-xl" /></div>;
  if (!order) return <div className="container mx-auto px-4 py-16 text-center"><p>Order not found</p></div>;

  const steps = ['NEW', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];
  const currentIdx = steps.indexOf(order.status);
  const statusColor: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700', PROCESSING: 'bg-amber-100 text-amber-700', PACKED: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-orange-100 text-orange-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
  };

  const handleReorder = async () => {
    if (!order.items) return;
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addItem({ productId: item.productId, name: item.productName, price: item.price, image: item.productImage || '', vendorName: item.vendorName || '', vendorId: item.vendorId, stock: 999 });
      }
    });
    toast.success('Items added to cart', { description: 'You can review them before checkout.' });
    navigateTo('cart');
  };

  const handleInvoice = () => { setShowInvoiceDialog(true); };

  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="ghost" onClick={() => navigateTo('orders')} className="mb-4"><ChevronLeft size={16} className="mr-1" />Back to Orders</Button>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div><h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1><p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
        <Badge className={`${statusColor[order.status] || ''} text-sm px-3 py-1`}>{order.status}</Badge>
      </div>

      {/* Status Timeline */}
      {order.status !== 'CANCELLED' && order.status !== 'RETURNED' && order.status !== 'REFUNDED' && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-muted" />
            {steps.map((step, i) => (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentIdx ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}`}>{i <= currentIdx ? <CheckCircle size={16} /> : i + 1}</div>
                <span className="text-xs mt-2 text-center hidden sm:block">{step}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6"><h2 className="font-bold mb-4">Items Ordered</h2>
            <div className="space-y-4">{order.items?.map(item => (
              <div key={item.id} className="flex gap-4"><div className="w-16 h-16 rounded bg-muted shrink-0 overflow-hidden">{item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}</div><div className="flex-1"><p className="font-medium">{item.productName}</p><p className="text-sm text-muted-foreground">Seller: {item.vendorName} | Qty: {item.quantity}</p></div><p className="font-medium">{formatCurrency(item.total)}</p></div>
            ))}</div>
          </Card>
          {order.trackingId && <Card className="p-4"><p className="text-sm text-muted-foreground">Tracking ID</p><p className="font-medium">{order.trackingId}</p>{order.courierName && <p className="text-sm text-muted-foreground">Courier: {order.courierName}</p>}</Card>}
          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {order?.status === 'NEW' && <Button variant="destructive" size="sm" onClick={() => setShowCancelDialog(true)}><XCircle size={14} className="mr-1" />Cancel Order</Button>}
            {order?.status === 'DELIVERED' && <Button variant="outline" size="sm" onClick={() => setShowReturnDialog(true)}><RotateCcw size={14} className="mr-1" />Request Return</Button>}
            <Button variant="outline" size="sm" onClick={handleReorder}><ShoppingCart size={14} className="mr-1" />Reorder</Button>
            <Button variant="outline" size="sm" onClick={handleInvoice}><Printer size={14} className="mr-1" />Download Invoice</Button>
          </div>
        </div>
        <Card className="p-6 h-fit space-y-3">
          <h3 className="font-bold">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-orange-500">{formatCurrency(order.total)}</span></div>
          </div>
          <Separator />
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Payment:</span> {order.paymentMethod}</p>
            <p><span className="text-muted-foreground">Status:</span> <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}>{order.paymentStatus}</Badge></p>
          </div>
          <Separator />
          <div className="text-sm"><p className="text-muted-foreground mb-1">Shipping Address</p><p>{order.shippingAddress}</p></div>
        </Card>
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent><DialogHeader><DialogTitle>Cancel Order</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Are you sure? This action cannot be undone.</p>
        <Textarea placeholder="Reason for cancellation (optional)" value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
        <DialogFooter><Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Order</Button><Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>Cancel Order</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Order Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent><DialogHeader><DialogTitle>Request Return</DialogTitle></DialogHeader>
        <Select value={returnReason} onValueChange={setReturnReason}><SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
          <SelectContent><SelectItem value="defective">Defective Product</SelectItem><SelectItem value="wrong">Wrong Item Received</SelectItem><SelectItem value="not_as_described">Not as Described</SelectItem><SelectItem value="changed_mind">Changed My Mind</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select>
        <DialogFooter><Button variant="outline" onClick={() => setShowReturnDialog(false)}>Cancel</Button><Button onClick={() => returnMutation.mutate()} disabled={!returnReason || returnMutation.isPending}>Submit Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Printer size={18} />Invoice - Order #{order.orderNumber}</DialogTitle>
          </DialogHeader>
          <div id="invoice-content" className="border rounded-lg p-6 space-y-4 bg-white text-black dark:bg-white dark:text-black">
            <div className="flex justify-between items-start">
              <div><h2 className="text-xl font-bold text-orange-600">MarketHub</h2><p className="text-sm text-gray-500">Your one-stop marketplace</p></div>
              <div className="text-right"><p className="font-bold">INVOICE</p><p className="text-sm text-gray-500">#{order.orderNumber}</p><p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="font-medium text-gray-500">Bill To</p><p className="font-medium">{user?.name}</p><p>{user?.email}</p></div>
              <div className="text-right"><p className="font-medium text-gray-500">Ship To</p><p>{order.shippingAddress}</p></div>
            </div>
            <Separator />
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Item</th><th className="text-center py-2">Qty</th><th className="text-right py-2">Price</th><th className="text-right py-2">Total</th></tr></thead>
              <tbody>
                {order.items?.map(item => (
                  <tr key={item.id} className="border-b"><td className="py-2">{item.productName}</td><td className="text-center py-2">{item.quantity}</td><td className="text-right py-2">{formatCurrency(item.price)}</td><td className="text-right py-2">{formatCurrency(item.total)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <div className="w-48 space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
                <Separator />
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-orange-600">{formatCurrency(order.total)}</span></div>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">Thank you for shopping with MarketHub!</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Close</Button>
            <Button variant="outline" onClick={() => { window.print(); }}><Printer size={14} className="mr-1" />Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ LOGIN / REGISTER / VENDOR REGISTER ============

function LoginPage() {
  const { login, setLoading, isLoading } = useAuthStore();
  const { navigateTo, setAppView } = useNavigationStore();
  const [mode, setMode] = useState<'login' | 'register' | 'vendor-register'>('login');
  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', confirmPassword: '',
    businessName: '', businessEmail: '', businessPhone: '',
    businessAddress: '', gstNumber: '', panNumber: '',
    bankName: '', bankAccount: '', bankIfsc: '', description: '',
  });

  const updateForm = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    if (!EMAIL_REGEX.test(form.email)) { toast.error('Invalid email format'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, password: form.password }) });
      const data = await res.json();
      if (data.success) {
        login(data.data.user, data.data.token, data.data.vendorId, data.data.vendorStatus);
        // Show vendor status warning if pending/rejected
        if (data.data.user.role === 'VENDOR' && data.data.vendorStatus && data.data.vendorStatus !== 'APPROVED') {
          authToast.loginSuccess(data.data.user.name, data.data.user.role);
          vendorStatusToast(data.data.vendorStatus);
        } else {
          authToast.loginSuccess(data.data.user.name, data.data.user.role);
        }
        if (data.data.user.role === 'ADMIN') { useNavigationStore.getState().setAppView('admin'); }
        else if (data.data.user.role === 'VENDOR') { useNavigationStore.getState().setAppView('vendor'); }
        else { navigateTo('home'); }
      } else { authErrorToast(data.error || 'Login failed', res.status); }
    } catch { toast.error('Something went wrong. Please check your connection.'); }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all required fields'); return; }
    if (!EMAIL_REGEX.test(form.email)) { toast.error('Invalid email format'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone }) });
      const data = await res.json();
      if (data.success) { login(data.data.user, data.data.token); authToast.registerSuccess(data.data.user.name); navigateTo('home'); }
      else { authErrorToast(data.error || 'Registration failed', res.status); }
    } catch { toast.error('Something went wrong'); }
    setLoading(false);
  };

  const handleVendorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.businessName) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!EMAIL_REGEX.test(form.email)) { toast.error('Invalid email format'); return; }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) { toast.error('Invalid phone number', { description: 'Phone number must be exactly 10 digits.' }); return; }
    if (form.gstNumber && form.gstNumber.length !== 15) { toast.error('Invalid GST number', { description: 'GST number must be exactly 15 characters.' }); return; }
    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) { toast.error('Invalid PAN number', { description: 'PAN format should be: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F).' }); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/vendor-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          businessName: form.businessName,
          businessEmail: form.businessEmail || form.email,
          businessPhone: form.businessPhone,
          businessAddress: form.businessAddress,
          gstNumber: form.gstNumber,
          panNumber: form.panNumber,
          bankName: form.bankName,
          bankAccount: form.bankAccount,
          bankIfsc: form.bankIfsc,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.data.user, data.data.token, data.data.vendorId, data.data.vendorStatus);
        authToast.vendorApplicationSubmitted(form.businessName);
        setAppView('vendor');
      } else {
        authErrorToast(data.error || 'Registration failed', res.status);
      }
    } catch { toast.error('Something went wrong'); }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Become a Vendor'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Login to your account' : mode === 'register' ? 'Join MarketHub today' : 'Start selling on MarketHub'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mode Tabs */}
          <div className="flex mb-6 bg-muted rounded-lg p-1">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'register' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setMode('register')}
            >
              Customer
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'vendor-register' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setMode('vendor-register')}
            >
              Vendor
            </button>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div><Label>Email</Label><Input type="email" placeholder="you@example.com" value={form.email} onChange={e => updateForm('email', e.target.value)} className="mt-1" /></div>
              <div><Label>Password</Label><Input type="password" placeholder="••••••••" value={form.password} onChange={e => updateForm('password', e.target.value)} className="mt-1" /></div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Login'}</Button>
            </form>
          )}

          {/* Customer Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div><Label>Full Name *</Label><Input placeholder="John Doe" value={form.name} onChange={e => updateForm('name', e.target.value)} className="mt-1" /></div>
              <div><Label>Email *</Label><Input type="email" placeholder="you@example.com" value={form.email} onChange={e => updateForm('email', e.target.value)} className="mt-1" /></div>
              <div><Label>Password *</Label><Input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => updateForm('password', e.target.value)} className="mt-1" /></div>
              <div><Label>Confirm Password *</Label><Input type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} className="mt-1" /></div>
              <div><Label>Phone (optional)</Label><Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => updateForm('phone', e.target.value)} className="mt-1" /></div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Create Account'}</Button>
            </form>
          )}

          {/* Vendor Register Form */}
          {mode === 'vendor-register' && (
            <form onSubmit={handleVendorRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 flex items-start gap-2">
                <Shield size={16} className="shrink-0 mt-0.5" />
                Your application will be reviewed by our admin team. Once approved, you can start selling products.
              </p>

              <h3 className="font-semibold text-sm text-muted-foreground mt-2">Account Details</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Full Name *</Label><Input placeholder="Your name" value={form.name} onChange={e => updateForm('name', e.target.value)} className="mt-1" /></div>
                <div><Label>Email *</Label><Input type="email" placeholder="you@business.com" value={form.email} onChange={e => updateForm('email', e.target.value)} className="mt-1" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Password *</Label><Input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => updateForm('password', e.target.value)} className="mt-1" /></div>
                <div><Label>Phone</Label><Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => updateForm('phone', e.target.value)} className="mt-1" /></div>
              </div>

              <h3 className="font-semibold text-sm text-muted-foreground pt-2">Business Details</h3>
              <div><Label>Business Name *</Label><Input placeholder="Your Store Name" value={form.businessName} onChange={e => updateForm('businessName', e.target.value)} className="mt-1" /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Business Email</Label><Input type="email" placeholder="business@email.com" value={form.businessEmail} onChange={e => updateForm('businessEmail', e.target.value)} className="mt-1" /></div>
                <div><Label>Business Phone</Label><Input placeholder="+91 XXXXX XXXXX" value={form.businessPhone} onChange={e => updateForm('businessPhone', e.target.value)} className="mt-1" /></div>
              </div>
              <div><Label>Business Address</Label><Textarea placeholder="Full business address" value={form.businessAddress} onChange={e => updateForm('businessAddress', e.target.value)} className="mt-1" rows={2} /></div>
              <div><Label>Description</Label><Textarea placeholder="Tell us about your business" value={form.description} onChange={e => updateForm('description', e.target.value)} className="mt-1" rows={2} /></div>

              <h3 className="font-semibold text-sm text-muted-foreground pt-2">Tax & Bank Details (Optional)</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>GST Number</Label><Input placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChange={e => updateForm('gstNumber', e.target.value)} className="mt-1" /></div>
                <div><Label>PAN Number</Label><Input placeholder="AAAAA0000A" value={form.panNumber} onChange={e => updateForm('panNumber', e.target.value)} className="mt-1" /></div>
              </div>
              <div><Label>Bank Name</Label><Input placeholder="Bank name" value={form.bankName} onChange={e => updateForm('bankName', e.target.value)} className="mt-1" /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Bank Account</Label><Input placeholder="Account number" value={form.bankAccount} onChange={e => updateForm('bankAccount', e.target.value)} className="mt-1" /></div>
                <div><Label>IFSC Code</Label><Input placeholder="IFSC code" value={form.bankIfsc} onChange={e => updateForm('bankIfsc', e.target.value)} className="mt-1" /></div>
              </div>

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Vendor Application'}
              </Button>
            </form>
          )}
        </CardContent>

        {/* Footer with demo buttons (login mode only) */}
        <CardFooter className="flex-col gap-3">
          {mode === 'login' && (
            <>
              <Separator className="w-full" />
              <p className="text-xs text-muted-foreground text-center">Quick Demo Access</p>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button variant="outline" size="sm" onClick={() => { setForm({ email: 'admin@markethub.com', password: 'admin123', name: '', phone: '', confirmPassword: '', businessName: '', businessEmail: '', businessPhone: '', businessAddress: '', gstNumber: '', panNumber: '', bankName: '', bankAccount: '', bankIfsc: '', description: '' }); }}>Admin Demo</Button>
                <Button variant="outline" size="sm" onClick={() => { setForm({ email: 'techstore@vendor.com', password: 'vendor123', name: '', phone: '', confirmPassword: '', businessName: '', businessEmail: '', businessPhone: '', businessAddress: '', gstNumber: '', panNumber: '', bankName: '', bankAccount: '', bankIfsc: '', description: '' }); }}>Vendor Demo</Button>
                <Button variant="outline" size="sm" onClick={() => { setForm({ email: 'rahul@example.com', password: 'customer123', name: '', phone: '', confirmPassword: '', businessName: '', businessEmail: '', businessPhone: '', businessAddress: '', gstNumber: '', panNumber: '', bankName: '', bankAccount: '', bankIfsc: '', description: '' }); }}>Customer Demo</Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Admin: admin@markethub.com / admin123<br/>Vendor: techstore@vendor.com / vendor123<br/>Customer: rahul@example.com / customer123</p>
            </>
          )}
          {mode === 'register' && (
            <Button variant="ghost" size="sm" onClick={() => setMode('login')}>Already have an account? Login</Button>
          )}
          {mode === 'vendor-register' && (
            <Button variant="ghost" size="sm" onClick={() => setMode('login')}>Already have an account? Login</Button>
          )}
        </CardFooter>
      </Card>
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
  const { isAuthenticated, navigateTo } = useNavigationStore();

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
              <p className="hover:text-foreground">About Us</p>
              <p className="hover:text-foreground cursor-pointer" onClick={() => useNavigationStore.getState().setCustomerView('contact')}>Contact</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Customer Service</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="hover:text-foreground cursor-pointer" onClick={() => useNavigationStore.getState().setCustomerView('help')}>Help Center</p><p>Returns & Refunds</p><p>Shipping Info</p><p className="hover:text-foreground cursor-pointer" onClick={() => useNavigationStore.getState().setCustomerView('help')}>FAQ</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact Us</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Mail size={14} />support@markethub.com</p>
              <p className="flex items-center gap-2"><Phone size={14} />1800-123-4567</p>
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
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/support/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      return res.json();
    },
    onSuccess: () => { toast.success('Message sent! We\'ll get back to you soon.'); setForm({ name: '', email: '', subject: '', message: '' }); },
    onError: () => toast.error('Failed to send message'),
  });
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
      <Card className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Name</Label><Input className="mt-1" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
          <div><Label>Email</Label><Input type="email" className="mt-1" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
        </div>
        <div><Label>Subject</Label><Input className="mt-1" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} /></div>
        <div><Label>Message</Label><Textarea className="mt-1" rows={5} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} /></div>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || !form.name || !form.email || !form.message}>{submitMutation.isPending ? 'Sending...' : 'Send Message'}</Button>
      </Card>
    </div>
  );
}

// ============ HELP CENTER PAGE ============

function HelpCenterPage() {
  const { data: faqs = [] } = useQuery({ queryKey: ['faqs'], queryFn: () => fetch('/api/faq').then(r => r.json()).then((r: any) => r.data || []) });
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center mb-8">
        <HelpCircle size={48} className="mx-auto text-orange-500 mb-3" />
        <h1 className="text-2xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-1">Find answers to common questions</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: <Package size={24} />, title: 'Orders & Shipping', desc: 'Track orders, shipping info', view: 'orders' },
          { icon: <RotateCcw size={24} />, title: 'Returns & Refunds', desc: 'Return policy, refund status' },
          { icon: <CreditCard size={24} />, title: 'Payments', desc: 'Payment methods, billing' },
        ].map((item, i) => (
          <Card key={i} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => item.view && useNavigationStore.getState().setCustomerView(item.view as any)}>
            <div className="text-orange-500 mb-2">{item.icon}</div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
          </Card>
        ))}
      </div>
      <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.filter((f: any) => f.isActive).map((faq: any) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-left text-sm">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {faqs.length === 0 && <p className="text-center text-muted-foreground py-8">No FAQs available yet</p>}
    </div>
  );
}

// ============ MAIN CUSTOMER APP ============

export default function CustomerApp() {
  const { customerView } = useNavigationStore();

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