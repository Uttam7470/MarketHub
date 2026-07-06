'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/sonner';

const formatCurrency = (price: number | undefined | null) => '₹' + (price ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function AdminCoupons() {
  const qc = useQueryClient();
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'PLATFORM' | 'VENDOR'>('ALL');
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm = {
    code: '', scope: 'PLATFORM' as 'PLATFORM' | 'VENDOR', vendorId: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED', discountValue: '10',
    minOrder: '', maxDiscount: '', usageLimit: '',
    startDate: '', endDate: '',
    applicableType: 'ALL' as 'ALL' | 'CATEGORY' | 'VENDOR_PRODUCTS',
    categoryIds: '',
    autoSuggest: false,
  };
  const [form, setForm] = useState(emptyForm);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons', scopeFilter],
    queryFn: () => {
      const params = new URLSearchParams({ includeVendor: 'true' });
      if (scopeFilter !== 'ALL') params.set('scope', scopeFilter);
      return fetch(`/api/coupons?${params}`).then(r => r.json()).then((r: any) => r.data || []);
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json()).then((r: any) => r.data || []),
  });

  const resetAndOpen = (mode: 'create' | 'edit', coupon?: any) => {
    if (mode === 'edit' && coupon) {
      setForm({
        code: coupon.code || '', scope: coupon.scope || 'PLATFORM', vendorId: coupon.vendorId || '',
        discountType: coupon.discountType || 'PERCENTAGE', discountValue: String(coupon.discountValue ?? '10'),
        minOrder: coupon.minOrder != null ? String(coupon.minOrder) : '',
        maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : '',
        usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
        startDate: coupon.startDate ? coupon.startDate.slice(0, 16) : '',
        endDate: coupon.endDate ? coupon.endDate.slice(0, 16) : '',
        applicableType: coupon.applicableType || 'ALL', categoryIds: coupon.categoryIds || '',
        autoSuggest: !!coupon.autoSuggest,
      });
      setEditingId(coupon.id);
    } else { setForm(emptyForm); setEditingId(null); }
    setShowDialog(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: any = {
        code: form.code, scope: form.scope, discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrder: parseFloat(form.minOrder) || null,
        maxDiscount: parseFloat(form.maxDiscount) || null,
        usageLimit: parseInt(form.usageLimit) || null,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : new Date(Date.now() + 86400000 * 30).toISOString(),
        applicableType: form.scope === 'PLATFORM' ? form.applicableType : 'ALL',
        autoSuggest: form.autoSuggest,
      };
      if (form.scope === 'VENDOR' && form.vendorId) payload.vendorId = form.vendorId;
      if (payload.applicableType === 'CATEGORY' && form.categoryIds) payload.categoryIds = form.categoryIds;
      if (editingId) return fetch('/api/coupons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...payload }) }).then(r => r.json());
      return fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); toast.success(editingId ? 'Coupon updated' : 'Coupon created', { description: 'Code: ' + form.code }); setShowDialog(false); },
    onError: () => toast.error('Failed to save coupon'),
  });

  const toggleMutation = useMutation({
    mutationFn: (coupon: any) => fetch('/api/coupons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); toast.success('Coupon status updated'); },
    onError: () => toast.error('Failed to toggle status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/coupons?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); toast.success('Coupon deleted'); },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const filteredCoupons = (coupons as any[] || []).filter((c: any) => scopeFilter === 'ALL' || c.scope === scopeFilter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Coupons</h1><p className="text-muted-foreground text-sm">Manage discount coupons</p></div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => resetAndOpen('create')}><Plus size={16} className="mr-1.5" />Add Coupon</Button>
      </div>
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(['ALL', 'PLATFORM', 'VENDOR'] as const).map((s) => (
          <Button key={s} size="sm" variant={scopeFilter === s ? 'default' : 'ghost'} className="rounded-md text-xs" onClick={() => setScopeFilter(s)}>
            {s === 'ALL' ? 'All' : s === 'PLATFORM' ? 'Platform' : 'Vendor'}
          </Button>
        ))}
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead><TableHead>Scope</TableHead><TableHead>Discount</TableHead>
              <TableHead>Vendor</TableHead><TableHead>Min Order</TableHead><TableHead>Usage</TableHead>
              <TableHead>Status</TableHead><TableHead>Auto</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-8" /></TableCell></TableRow>) :
            filteredCoupons.map((c: any) => (
              <TableRow key={c.id} className="hover:bg-muted/50 transition-colors duration-150">
                <TableCell className="font-mono font-bold">{c.code}</TableCell>
                <TableCell><Badge className={c.scope === 'PLATFORM' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'}>{c.scope === 'PLATFORM' ? 'Platform' : 'Vendor'}</Badge></TableCell>
                <TableCell>{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}{c.maxDiscount ? ` (max ${formatCurrency(c.maxDiscount)})` : ''}</TableCell>
                <TableCell>{c.scope === 'VENDOR' ? (c.vendor?.businessName || '—') : '—'}</TableCell>
                <TableCell>{c.minOrder ? formatCurrency(c.minOrder) : 'N/A'}</TableCell>
                <TableCell className="text-sm">{c.usedCount ?? 0}/{c.usageLimit || '∞'}</TableCell>
                <TableCell><Badge variant={c.isActive ? 'default' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                <TableCell><Switch checked={!!c.autoSuggest} disabled className="scale-75" /></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => resetAndOpen('edit', c)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleMutation.mutate(c)} title={c.isActive ? 'Deactivate' : 'Activate'}>
                      {c.isActive ? <XCircle size={14} className="text-destructive" /> : <CheckCircle2 size={14} className="text-green-600" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(c.id)}><Trash2 size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filteredCoupons.length === 0 && <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No coupons found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="mt-1 uppercase" placeholder="e.g. SAVE20" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Scope</Label><Select value={form.scope} onValueChange={v => setForm(f => ({ ...f, scope: v as any }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PLATFORM">Platform</SelectItem><SelectItem value="VENDOR">Vendor</SelectItem></SelectContent></Select></div>
              {form.scope === 'VENDOR' && <div><Label>Vendor ID</Label><Input value={form.vendorId} onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))} className="mt-1" placeholder="Paste vendor ID" /></div>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Discount Type</Label><Select value={form.discountType} onValueChange={v => setForm(f => ({ ...f, discountType: v as any }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PERCENTAGE">Percentage</SelectItem><SelectItem value="FIXED">Fixed Amount</SelectItem></SelectContent></Select></div>
              <div><Label>Discount Value *</Label><Input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Min Order (₹)</Label><Input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} className="mt-1" /></div>
              <div><Label>Max Discount (₹)</Label><Input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} className="mt-1" /></div>
              <div><Label>Usage Limit</Label><Input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="mt-1" /></div>
              <div><Label>End Date</Label><Input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="mt-1" /></div>
            </div>
            {form.scope === 'PLATFORM' && (
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Applicable Type</Label><Select value={form.applicableType} onValueChange={v => setForm(f => ({ ...f, applicableType: v as any }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Products</SelectItem><SelectItem value="CATEGORY">Specific Categories</SelectItem><SelectItem value="VENDOR_PRODUCTS">Vendor Products</SelectItem></SelectContent></Select></div>
                {form.applicableType === 'CATEGORY' && (
                  <div><Label>Category IDs (comma-separated)</Label><Input value={form.categoryIds} onChange={e => setForm(f => ({ ...f, categoryIds: e.target.value }))} className="mt-1" placeholder="id1, id2, id3" />
                    {(categories as any[] || []).length > 0 && <div className="mt-1 text-xs text-muted-foreground">Available: {(categories as any[]).slice(0, 6).map((cat: any) => cat.name).join(', ')}{(categories as any[]).length > 6 ? '…' : ''}</div>}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2"><Switch checked={form.autoSuggest} onCheckedChange={v => setForm(f => ({ ...f, autoSuggest: v }))} /><Label>Auto-suggest this coupon at checkout</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.code}>
              {saveMutation.isPending && <Loader2 size={14} className="mr-1.5 animate-spin" />}{editingId ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}