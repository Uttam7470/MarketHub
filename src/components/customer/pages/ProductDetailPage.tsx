'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/sonner';
import {
  ShoppingCart, Heart, Star, Minus, Plus, MapPin, Package, Truck, RefreshCw,
  Shield, MessageCircle, Facebook, Twitter, Link as LinkIcon, HelpCircle, Send, Ticket, Percent, Banknote, Store,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuthStore, useNavigationStore, useCartStore, useWishlistStore } from '@/stores';
import type { Product, ApiResponse, Coupon } from '@/types';

import { StarRating, formatCurrency, discountPercent, useRequireAuth } from '../helpers';
import { ProductCard, ProductGrid } from '../shared/ProductCard';

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

          {/* Vendor Coupons Banner */}
          <VendorCouponBanner vendorId={product.vendorId} vendorName={product.vendor?.businessName || ''} />

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

// ============ VENDOR COUPON BANNER (shown on product detail) ============

function VendorCouponBanner({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  const { data: coupons = [] } = useQuery({
    queryKey: ['vendor-coupons-product', vendorId],
    queryFn: () => fetch(`/api/coupons?active=true&scope=VENDOR&vendorId=${vendorId}&includeVendor=true`).then(r => r.json()).then((r: ApiResponse<Coupon[]>) => r.data || []),
    enabled: !!vendorId,
  });

  // Also fetch platform coupons
  const { data: platformCoupons = [] } = useQuery({
    queryKey: ['platform-coupons-product'],
    queryFn: () => fetch(`/api/coupons?active=true&scope=PLATFORM&includeVendor=true`).then(r => r.json()).then((r: ApiResponse<Coupon[]>) => r.data || []),
  });

  const allCoupons = [...coupons, ...platformCoupons.filter(pc => pc.autoSuggest)];
  if (allCoupons.length === 0) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!', { description: `Use ${code} at checkout` });
  };

  return (
    <div className="space-y-2 pt-1">
      <p className="text-sm font-medium flex items-center gap-1.5">
        <Ticket size={16} className="text-orange-500" />
        Available Offers
      </p>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {allCoupons.slice(0, 3).map((c: Coupon) => (
          <div
            key={c.id}
            className="flex items-center gap-3 border border-dashed rounded-lg p-2.5 bg-orange-50/50 dark:bg-orange-900/10 cursor-pointer hover:border-orange-300 transition-colors"
            onClick={() => handleCopy(c.code)}
          >
            <div className={`w-10 h-10 rounded-md flex flex-col items-center justify-center shrink-0 ${c.scope === 'VENDOR' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
              {c.discountType === 'PERCENTAGE' ? (
                <><Percent size={12} className="text-orange-600" /><span className="text-[10px] font-bold text-orange-600">{c.discountValue}%</span></>
              ) : (
                <><Banknote size={12} className="text-orange-600" /><span className="text-[10px] font-bold text-orange-600">₹{c.discountValue}</span></>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm">{c.code}</span>
                <Badge variant="outline" className={`text-[9px] px-1 py-0 ${c.scope === 'VENDOR' ? 'border-amber-300 text-amber-600' : 'border-orange-300 text-orange-600'}`}>
                  {c.scope === 'VENDOR' ? <Store size={8} className="mr-0.5" /> : '🌐'} {c.scope === 'VENDOR' ? 'Store' : 'Platform'}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Min {formatCurrency(c.minOrder || 0)}
                {c.maxDiscount && c.discountType === 'PERCENTAGE' ? ` • Up to ${formatCurrency(c.maxDiscount)}` : ''}
                {' '}• Tap to copy
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductDetailPage;