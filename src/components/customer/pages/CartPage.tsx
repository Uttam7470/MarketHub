'use client';

import React, { useState } from 'react';
import { Package, ShoppingBag, Minus, Plus, Trash2, Bookmark } from 'lucide-react';
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
import type { ApiResponse } from '@/types';

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

export default CartPage;