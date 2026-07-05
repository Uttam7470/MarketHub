'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, CheckCircle, Ban, Loader2, Tags, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/stores';
import { toast } from '@/lib/sonner';
import type { Coupon, ApiResponse } from '@/types';

const formatCurrency = (price: number | undefined | null) => '₹' + (price ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function VendorCoupons() {
  const { vendorId } = useAuthStore();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({ code: '', discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED', discountValue: '', minOrder: '', maxDiscount: '', usageLimit: '', startDate: '', endDate: '', autoSuggest: false });

  const resetForm = () => { setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrder: '', maxDiscount: '', usageLimit: '', startDate: '', endDate: '', autoSuggest: false }); setEditingCoupon(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setForm({ code: c.code, discountType: c.discountType, discountValue: String(c.discountValue), minOrder: c.minOrder ? String(c.minOrder) : '', maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '', usageLimit: c.usageLimit ? String(c.usageLimit) : '', startDate: c.startDate?.slice(0, 10) || '', endDate: c.endDate?.slice(0, 10) || '', autoSuggest: c.autoSuggest });
    setDialogOpen(true);
  };

  const { data: coupons, isLoading } = useQuery({ queryKey: ['vendor-coupons', vendorId], queryFn: () => fetch(`/api/vendor/coupons?vendorId=${vendorId}`).then(r => r.json()).then((r: ApiResponse<Coupon[]>) => r.data), enabled: !!vendorId });

  const createMutation = useMutation({
    mutationFn: () => fetch('/api/vendor/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId, code: form.code.toUpperCase(), discountType: form.discountType, discountValue: parseFloat(form.discountValue), minOrder: form.minOrder ? parseFloat(form.minOrder) : null, maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null, usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null, startDate: form.startDate, endDate: form.endDate, autoSuggest: form.autoSuggest }) }).then(r => r.json()),
    onSuccess: (data) => { if (data.success) { toast.success('Coupon created'); setDialogOpen(false); resetForm(); qc.invalidateQueries({ queryKey: ['vendor-coupons'] }); } else toast.error(data.error || 'Failed'); },
    onError: () => toast.error('Failed to create coupon'),
  });

  const editMutation = useMutation({
    mutationFn: () => fetch('/api/vendor/coupons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingCoupon!.id, vendorId, discountType: form.discountType, discountValue: parseFloat(form.discountValue), minOrder: form.minOrder ? parseFloat(form.minOrder) : null, maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null, usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null, startDate: form.startDate, endDate: form.endDate, autoSuggest: form.autoSuggest }) }).then(r => r.json()),
    onSuccess: (data) => { if (data.success) { toast.success('Coupon updated'); setDialogOpen(false); resetForm(); qc.invalidateQueries({ queryKey: ['vendor-coupons'] }); } else toast.error(data.error || 'Failed'); },
    onError: () => toast.error('Failed to update coupon'),
  });

  const toggleMutation = useMutation({
    mutationFn: (coupon: Coupon) => fetch('/api/vendor/coupons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: coupon.id, vendorId, isActive: !coupon.isActive }) }).then(r => r.json()),
    onSuccess: (data) => { if (data.success) { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['vendor-coupons'] }); } else toast.error(data.error || 'Failed'); },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/vendor/coupons?id=${id}&vendorId=${vendorId}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: (data) => { if (data.success) { toast.success('Coupon deleted'); setDeleteId(null); qc.invalidateQueries({ queryKey: ['vendor-coupons'] }); } else toast.error(data.error || 'Failed'); },
    onError: () => toast.error('Failed to delete'),
  });

  const totalCoupons = coupons?.length || 0;
  const activeCoupons = coupons?.filter(c => c.isActive).length || 0;
  const totalUsed = coupons?.reduce((sum, c) => sum + (c.usedCount || 0), 0) || 0;

  const getStatusBadge = (c: Coupon) => {
    const now = new Date(); const start = new Date(c.startDate); const end = new Date(c.endDate);
    if (!c.isActive) return <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Inactive</Badge>;
    if (now < start) return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Scheduled</Badge>;
    if (now > end) return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Expired</Badge>;
    return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
  };

  const isSaving = createMutation.isPending || editMutation.isPending;
  if (isLoading) return <div className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Coupons</h1><p className="text-muted-foreground text-sm">Create and manage discount coupons for your products</p></div>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={openCreate}><Plus size={16} className="mr-1.5" />Create Coupon</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="p-6 border-orange-200 dark:border-orange-900/50 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-background">
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Tags size={20} className="text-orange-600" /></div><p className="text-sm text-muted-foreground">Total Coupons</p></div>
            <p className="text-3xl font-bold text-orange-600">{totalCoupons}</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="p-6 border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-background">
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><CheckCircle size={20} className="text-green-600" /></div><p className="text-sm text-muted-foreground">Active Coupons</p></div>
            <p className="text-3xl font-bold text-green-600">{activeCoupons}</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card className="p-6 border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-background">
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><BarChart3 size={20} className="text-blue-600" /></div><p className="text-sm text-muted-foreground">Total Used</p></div>
            <p className="text-3xl font-bold text-blue-600">{totalUsed}</p>
          </Card>
        </motion.div>
      </div>
      <Card>
        <CardContent className="p-0">
          {!coupons?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><Tags size={32} className="text-muted-foreground" /></div>
              <h3 className="text-lg font-medium mb-1">No coupons yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first coupon to attract customers</p>
              <Button className="bg-orange-500 hover:bg-orange-600" size="sm" onClick={openCreate}><Plus size={14} className="mr-1" />Create Coupon</Button>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Min Order</TableHead><TableHead>Usage</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                    <TableCell>{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}{c.maxDiscount ? ` (max ${formatCurrency(c.maxDiscount)})` : ''}</TableCell>
                    <TableCell>{c.minOrder ? formatCurrency(c.minOrder) : '—'}</TableCell>
                    <TableCell>{c.usedCount ?? 0}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</TableCell>
                    <TableCell>{getStatusBadge(c)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" className={`h-8 w-8 ${c.isActive ? 'text-amber-600' : 'text-green-600'}`} onClick={() => toggleMutation.mutate(c)} disabled={toggleMutation.isPending}>
                          {toggleMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : c.isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 size={14} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle><DialogDescription>{editingCoupon ? 'Update coupon details' : 'Set up a new discount coupon'}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Coupon Code</Label><Input placeholder="e.g. SAVE20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} disabled={!!editingCoupon} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Discount Type</Label><Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v as 'PERCENTAGE' | 'FIXED' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PERCENTAGE">Percentage (%)</SelectItem><SelectItem value="FIXED">Fixed Amount (₹)</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Discount Value</Label><Input type="number" min="0" step="0.01" placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 100'} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min Order (₹)</Label><Input type="number" min="0" placeholder="Optional" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} /></div>
              <div className="space-y-2"><Label>Max Discount (₹)</Label><Input type="number" min="0" placeholder="Optional" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Usage Limit</Label><Input type="number" min="1" placeholder="e.g. 100 (leave empty for unlimited)" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant={form.autoSuggest ? 'default' : 'outline'} size="sm" className={form.autoSuggest ? 'bg-green-600 hover:bg-green-700' : ''} onClick={() => setForm({ ...form, autoSuggest: !form.autoSuggest })}><CheckCircle size={14} className="mr-1.5" />{form.autoSuggest ? 'Enabled' : 'Disabled'}</Button>
              <Label className="text-sm text-muted-foreground">Auto-suggest at checkout</Label>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" disabled={isSaving || !form.code || !form.discountValue || !form.startDate || !form.endDate} onClick={() => editingCoupon ? editMutation.mutate() : createMutation.mutate()}>
              {isSaving ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : null}{editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Coupon</AlertDialogTitle><AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteId) deleteMutation.mutate(deleteId); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}