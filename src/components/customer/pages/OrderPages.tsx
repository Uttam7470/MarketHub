'use client';

import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, CheckCircle, ChevronLeft, XCircle, RotateCcw, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useNavigationStore, useCartStore } from '@/stores';
import { formatCurrency } from '../helpers';
import { toast } from '@/lib/sonner';
import type { Order, ApiResponse } from '@/types';

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

function formatShippingAddress(addr: string | Record<string, string>): string {
  if (typeof addr === 'object' && addr !== null) {
    const a = addr as Record<string, string>;
    return `${a.name}, ${a.address}, ${a.city}, ${a.state} - ${a.pincode}, Phone: ${a.phone}`;
  }
  return String(addr);
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
          <div className="text-sm"><p className="text-muted-foreground mb-1">Shipping Address</p><p>{formatShippingAddress(order.shippingAddress as string | Record<string, string>)}</p></div>
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
              <div className="text-right"><p className="font-medium text-gray-500">Ship To</p><p>{formatShippingAddress(order.shippingAddress as string | Record<string, string>)}</p></div>
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

export { OrdersPage, OrderDetailPage };