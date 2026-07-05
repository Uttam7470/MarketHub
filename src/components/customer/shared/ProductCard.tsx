'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/lib/sonner';
import {
  ShoppingCart, Heart, GitCompare, Package, SearchX,
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore, useCartStore, useWishlistStore, useCompareStore } from '@/stores';
import type { Product } from '@/types';
import { formatCurrency, discountPercent, StarRating, useRequireAuth } from '../helpers';

const badgeColors: Record<string, string> = { BEST_SELLER: 'bg-emerald-500 text-white', NEW_ARRIVAL: 'bg-blue-500 text-white', LIMITED_TIME: 'bg-red-500 text-white', FESTIVAL_OFFER: 'bg-amber-500 text-white' };
const badgeLabels: Record<string, string> = { BEST_SELLER: 'Best Seller', NEW_ARRIVAL: 'New', LIMITED_TIME: 'Limited', FESTIVAL_OFFER: 'Festival' };

export function ProductCard({ product }: { product: Product }) {
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

export function ProductGrid({ products, loading }: { products: Product[]; loading?: boolean }) {
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