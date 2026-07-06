'use client';

import React, { useState } from 'react';
import { Package, ShoppingBag, Minus, Plus, Trash2, Bookmark, Loader2, Tag, Ticket, ChevronDown, ChevronUp, X, Store, Percent, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useNavigationStore, useCartStore } from '@/stores';
import { formatCurrency, useRequireAuth } from '../helpers';
import { toast } from '@/lib/sonner';
import type { ApiResponse, Coupon } from '@/types';

function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getShipping, getTax, getTotal, couponCode, couponDiscount, couponId, applyCoupon, removeCoupon, clearCart, addItem } = useCartStore();
  const { navigateTo } = useNavigationStore();
  const requireAuth = useRequireAuth();
  const { data: coupons, isLoading: couponsLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => fetch('/api/coupons?active=true&includeVendor=true').then(r => r.json()).then((r: ApiResponse<Coupon[]>) => r.data || [])
  });
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [savedForLater, setSavedForLater] = useState<any[]>([]);
  const [cartPageRemoveTarget, setCartPageRemoveTarget] = useState<{id: string; name: string} | null>(null);
  const [showCoupons, setShowCoupons] = useState(true);
  const qc = useQueryClient();

  const handleApplyCoupon = async (code?: string) => {
    const codeToApply = (code || couponInput).trim().toUpperCase();
    if (!codeToApply) return;
    setApplyingCoupon(true);
    try {
      const cartItems = items.map(i => ({ productId: i.productId, vendorId: i.vendorId, price: i.price, quantity: i.quantity }));
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToApply, cartItems }),
      });
      const data = await res.json();
      if (data.success) {
        applyCoupon(data.data.code, data.data.discount, data.data.id);
        toast.success('Coupon applied!', { description: `You save ${formatCurrency(data.data.discount)}${data.data.vendorName ? ` on ${data.data.vendorName} products` : ''}` });
        setCouponInput('');
      } else {
        toast.error(data.error || 'Invalid coupon code', { description: 'Please check the code and try again.' });
      }
    } catch {
      toast.error('Something went wrong', { description: 'Could not validate coupon.' });
    }
    setApplyingCoupon(false);
  };

  const handleCartPageRemove = (id: string, name: string) => {
    removeItem(id);
    toast.info('Removed from cart', { description: `${name} removed.` });
    setCartPageRemoveTarget(null);
  };

  // Get applicable coupons for cart items
  const applicableCoupons = (coupons || []).filter(c => c.isActive);
  const autoSuggestCoupons = applicableCoupons.filter(c => c.autoSuggest);
  const platformCoupons = applicableCoupons.filter(c => c.scope === 'PLATFORM');
  const vendorCoupons = applicableCoupons.filter(c => c.scope === 'VENDOR');

  // Get unique vendor IDs in cart
  const cartVendorIds = [...new Set(items.map(i => i.vendorId).filter(Boolean))];
  const cartVendorCoupons = vendorCoupons.filter(vc => cartVendorIds.includes(vc.vendorId || ''));

  const allRelevantCoupons = [...platformCoupons, ...cartVendorCoupons];

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
          {/* Cart Items */}
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

          {/* Saved for Later */}
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

          {/* ===== COUPONS & OFFERS SECTION ===== */}
          <Card className="p-5 border-dashed border-orange-300 dark:border-orange-700">
            <button className="flex items-center justify-between w-full" onClick={() => setShowCoupons(!showCoupons)}>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Ticket size={20} className="text-orange-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-base">Coupons & Offers</h3>
                  <p className="text-xs text-muted-foreground">
                    {allRelevantCoupons.length > 0 ? `${allRelevantCoupons.length} coupon${allRelevantCoupons.length > 1 ? 's' : ''} available` : 'Apply a coupon code to get discount'}
                  </p>
                </div>
              </div>
              {showCoupons ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
            </button>

            {showCoupons && (
              <div className="mt-4 space-y-4">
                {/* Already applied coupon */}
                {couponCode && (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                        <Tag size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-green-700 dark:text-green-400 text-sm">{couponCode}</p>
                        <p className="text-xs text-green-600 dark:text-green-500">You save {formatCurrency(couponDiscount)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={removeCoupon}>
                      <X size={16} />
                    </Button>
                  </div>
                )}

                {/* Manual coupon code input */}
                {!couponCode && (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        className="uppercase pl-9"
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      />
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white shrink-0" onClick={() => handleApplyCoupon()} disabled={applyingCoupon || !couponInput.trim()}>
                      {applyingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}

                {/* Available Coupons List */}
                {couponsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                ) : allRelevantCoupons.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      🎉 Available Coupons
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {allRelevantCoupons.map((c: Coupon) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                          onClick={() => !couponCode && handleApplyCoupon(c.code)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 ${c.scope === 'VENDOR' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                              {c.discountType === 'PERCENTAGE' ? (
                                <>
                                  <Percent size={14} className={c.scope === 'VENDOR' ? 'text-amber-600' : 'text-orange-500'} />
                                  <span className={`text-xs font-bold ${c.scope === 'VENDOR' ? 'text-amber-600' : 'text-orange-500'}`}>{c.discountValue}%</span>
                                </>
                              ) : (
                                <>
                                  <Banknote size={14} className={c.scope === 'VENDOR' ? 'text-amber-600' : 'text-orange-500'} />
                                  <span className={`text-[10px] font-bold ${c.scope === 'VENDOR' ? 'text-amber-600' : 'text-orange-500'}`}>₹{c.discountValue}</span>
                                </>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm">{c.code}</p>
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${c.scope === 'VENDOR' ? 'border-amber-300 text-amber-600' : 'border-orange-300 text-orange-600'}`}>
                                  {c.scope === 'VENDOR' ? '🏪 Vendor' : '🌐 Platform'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {c.scope === 'VENDOR' && c.vendor?.businessName && <span className="text-amber-600">{c.vendor.businessName} • </span>}
                                Min order {formatCurrency(c.minOrder || 0)}
                                {c.maxDiscount && c.discountType === 'PERCENTAGE' ? ` • Max ${formatCurrency(c.maxDiscount)}` : ''}
                              </p>
                            </div>
                          </div>
                          {!couponCode && (
                            <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity text-orange-500 border-orange-300 hover:bg-orange-50 shrink-0">
                              Apply
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-3">No coupons available at the moment</p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="p-6 sticky top-24 space-y-4">
            <h3 className="font-bold text-lg">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(getSubtotal())}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{getShipping() === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatCurrency(getShipping())}</span></div>
              <div className="flex justify-between"><span>Tax (GST 18%)</span><span>{formatCurrency(getTax())}</span></div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>🎯 Coupon ({couponCode})</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-orange-500">{formatCurrency(getTotal())}</span></div>
            </div>

            {/* Quick apply in sidebar too */}
            {!couponCode && allRelevantCoupons.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-muted-foreground w-full">Quick apply:</span>
                {allRelevantCoupons.slice(0, 3).map((c: Coupon) => (
                  <Badge
                    key={c.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 text-xs"
                    onClick={() => handleApplyCoupon(c.code)}
                  >
                    {c.code}
                  </Badge>
                ))}
              </div>
            )}

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

export default CartPage;