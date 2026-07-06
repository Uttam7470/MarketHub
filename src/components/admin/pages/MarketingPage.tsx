'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/sonner';
import { Plus, Trash2, Pencil, Loader2, Sparkles, Zap, Tag, CalendarDays, Gift, FolderOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const formatCurrency = (price: number | undefined | null) => '₹' + (price ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function AdminMarketing() {
  return (
    <Tabs defaultValue="flash-sales" className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Marketing</h1><p className="text-muted-foreground text-sm">Manage promotions and campaigns</p></div>
      <TabsList className="flex-wrap h-auto gap-1"><TabsTrigger value="flash-sales">Flash Sales</TabsTrigger><TabsTrigger value="deals">Deals</TabsTrigger><TabsTrigger value="festival-offers">Festival Offers</TabsTrigger><TabsTrigger value="collections">Collections</TabsTrigger></TabsList>
      <TabsContent value="flash-sales"><FlashSalesTab /></TabsContent>
      <TabsContent value="deals"><DealsTab /></TabsContent>
      <TabsContent value="festival-offers"><FestivalOffersTab /></TabsContent>
      <TabsContent value="collections"><FeaturedCollectionsTab /></TabsContent>
    </Tabs>
  );
}

function FlashSalesTab() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['flash-sales'],
    queryFn: () => fetch('/api/flash-sales').then(r => r.json()).then((r: any) => r.data || []),
  });

  const createMutation = useMutation({
    mutationFn: () => fetch('/api/flash-sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, isActive: true }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['flash-sales'] }); toast.success('Flash sale created'); setShowCreate(false); setForm({ title: '', description: '', startDate: '', endDate: '' }); },
    onError: () => toast.error('Failed to create'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Flash Sales</h3>
        <Button className="bg-amber-600 hover:bg-amber-700" size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" />Create</Button>
      </div>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> :
        <div className="space-y-3">
          {(data || []).map((fs: any) => (
            <Card key={fs.id} className="p-4 flex items-center justify-between">
              <div><p className="font-medium">{fs.title}</p><p className="text-sm text-muted-foreground flex items-center gap-1"><CalendarDays size={12} />{new Date(fs.startDate).toLocaleDateString('en-IN')} — {new Date(fs.endDate).toLocaleDateString('en-IN')}</p><p className="text-xs text-muted-foreground">{fs.items?.length || 0} products</p></div>
              <Badge variant={fs.isActive ? 'default' : 'secondary'}>{fs.isActive ? 'Active' : 'Inactive'}</Badge>
            </Card>
          ))}
          {(!data || data.length === 0) && <div className="flex flex-col items-center justify-center py-12 text-center"><Zap size={40} className="text-muted-foreground/40 mb-3" /><p className="text-muted-foreground font-medium">No flash sales yet</p><p className="text-muted-foreground text-sm mt-1">Create a flash sale to boost product visibility</p></div>}
        </div>}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent><DialogHeader><DialogTitle>Create Flash Sale</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date *</Label><Input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="mt-1" /></div>
              <div><Label>End Date *</Label><Input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button className="bg-amber-600 hover:bg-amber-700" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FestivalOffersTab() {
  const { data: flashSales, isLoading } = useQuery({
    queryKey: ['festival-offers'],
    queryFn: () => fetch('/api/flash-sales').then(r => r.json()).then((r: any) => r.data || []),
  });
  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => fetch('/api/deals').then(r => r.json()).then((r: any) => r.data || []),
  });

  const isLoadingCombined = isLoading || dealsLoading;
  const festivalFlashSales = (flashSales || []).filter((fs: any) => fs.description?.toLowerCase().includes('festival') || fs.title?.toLowerCase().includes('festival'));
  const festivalDeals = (deals || []).filter((d: any) => d.description?.toLowerCase().includes('festival') || d.title?.toLowerCase().includes('festival'));
  const hasFestivalContent = festivalFlashSales.length > 0 || festivalDeals.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Festival Offers</h3>
        <Badge variant="outline" className="text-xs">Filtered from Flash Sales & Deals</Badge>
      </div>
      {isLoadingCombined ? <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> :
      hasFestivalContent ? (
        <div className="space-y-3">
          {festivalFlashSales.length > 0 && <>
            <h4 className="text-sm font-medium text-muted-foreground">Festival Flash Sales</h4>
            {festivalFlashSales.map((fs: any) => (
              <Card key={fs.id} className="p-4 flex items-center justify-between border-l-4 border-l-amber-500">
                <div><p className="font-medium flex items-center gap-2"><Sparkles size={14} className="text-amber-500" />{fs.title}</p><p className="text-sm text-muted-foreground flex items-center gap-1"><CalendarDays size={12} />{new Date(fs.startDate).toLocaleDateString('en-IN')} — {new Date(fs.endDate).toLocaleDateString('en-IN')}</p><p className="text-xs text-muted-foreground">{fs.items?.length || 0} products</p></div>
                <Badge variant={fs.isActive ? 'default' : 'secondary'}>{fs.isActive ? 'Active' : 'Inactive'}</Badge>
              </Card>
            ))}
          </>}
          {festivalDeals.length > 0 && <>
            <h4 className="text-sm font-medium text-muted-foreground">Festival Deals</h4>
            {festivalDeals.map((d: any) => (
              <Card key={d.id} className="p-4 flex items-center justify-between border-l-4 border-l-green-500">
                <div><p className="font-medium flex items-center gap-2"><Sparkles size={14} className="text-green-500" />{d.title}</p><p className="text-sm text-muted-foreground">{d.product?.name || d.productId} • {d.discountPercent}% off</p><p className="text-xs text-muted-foreground">{new Date(d.startDate).toLocaleDateString()} — {new Date(d.endDate).toLocaleDateString()}</p></div>
                <Badge variant={d.isActive ? 'default' : 'secondary'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>
              </Card>
            ))}
          </>}
        </div>
      ) : (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No festival offers yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create flash sales or deals with &quot;festival&quot; in the title or description to see them here</p>
        </div>
      )}
    </div>
  );
}

interface Collection {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  coverImage: string;
  sortOrder: number;
  createdAt: string;
}

function FeaturedCollectionsTab() {
  const [collections, setCollections] = useState<Collection[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('marketplace-collections') || '[]');
    } catch { return []; }
  });
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', coverImage: '', sortOrder: '0' });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const { data: products } = useQuery({
    queryKey: ['all-products-mini'],
    queryFn: () => fetch('/api/products?limit=100').then(r => r.json()).then((r: any) => r.data || []),
  });

  const saveCollections = (updated: Collection[]) => {
    setCollections(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketplace-collections', JSON.stringify(updated));
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const updated = editId
      ? collections.map(c => c.id === editId ? { ...c, name: form.name, description: form.description, coverImage: form.coverImage, sortOrder: parseInt(form.sortOrder), productIds: selectedProductIds } : c)
      : [...collections, { id: Date.now().toString(), name: form.name, description: form.description, coverImage: form.coverImage, sortOrder: parseInt(form.sortOrder), productIds: selectedProductIds, createdAt: new Date().toISOString() }];
    saveCollections(updated);
    toast.success(editId ? 'Collection updated' : 'Collection created');
    setShowCreate(false);
    setEditId(null);
    setForm({ name: '', description: '', coverImage: '', sortOrder: '0' });
    setSelectedProductIds([]);
  };

  const handleEdit = (c: Collection) => {
    setForm({ name: c.name, description: c.description, coverImage: c.coverImage, sortOrder: String(c.sortOrder) });
    setSelectedProductIds(c.productIds);
    setEditId(c.id);
    setShowCreate(true);
  };

  const handleDelete = (id: string) => {
    saveCollections(collections.filter(c => c.id !== id));
    toast.success('Collection deleted');
  };

  const toggleProduct = (pid: string) => {
    setSelectedProductIds(prev => prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid]);
  };

  const productMap = new Map((products || []).map((p: any) => [p.id, p]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Featured Collections</h3>
        <Button className="bg-amber-600 hover:bg-amber-700" size="sm" onClick={() => { setForm({ name: '', description: '', coverImage: '', sortOrder: '0' }); setSelectedProductIds([]); setEditId(null); setShowCreate(true); }}><Plus size={14} className="mr-1" />Create Collection</Button>
      </div>
      {collections.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No collections yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create curated product collections for your customers</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.sort((a, b) => a.sortOrder - b.sortOrder).map(c => (
            <Card key={c.id} className="overflow-hidden">
              {c.coverImage ? <img src={c.coverImage} alt={c.name} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center"><FolderOpen className="h-8 w-8 text-amber-500" /></div>}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{c.name}</h4>
                  <Badge variant="outline" className="text-xs">{c.productIds.length} products</Badge>
                </div>
                {c.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>}
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleEdit(c)}><Pencil size={12} className="mr-1" />Edit</Button>
                  <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => handleDelete(c.id)}><Trash2 size={12} /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={showCreate} onOpenChange={(v) => { if (!v) { setShowCreate(false); setEditId(null); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Collection' : 'Create Collection'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1" /></div>
            <div><Label>Cover Image URL</Label><Input value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className="mt-1" placeholder="https://..." /></div>
            <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="mt-1" /></div>
            <div>
              <Label className="mb-2 block">Select Products ({selectedProductIds.length} selected)</Label>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                {products?.length ? products.map((p: any) => (
                  <label key={p.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer text-sm">
                    <input type="checkbox" checked={selectedProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="rounded" />
                    <span className="truncate flex-1">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{formatCurrency(p.price)}</span>
                  </label>
                )) : <p className="text-sm text-muted-foreground text-center py-4">Loading products...</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSave} disabled={!form.name.trim()}>{editId ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DealsTab() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', productId: '', discountPercent: '10', startDate: '', endDate: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => fetch('/api/deals').then(r => r.json()).then((r: any) => r.data || []),
  });

  const createMutation = useMutation({
    mutationFn: () => fetch('/api/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, discountPercent: parseFloat(form.discountPercent), isActive: true, sortOrder: 0 }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); toast.success('Deal created'); setShowCreate(false); setForm({ title: '', description: '', productId: '', discountPercent: '10', startDate: '', endDate: '' }); },
    onError: () => toast.error('Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/deals?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); toast.success('Deal deleted'); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Deals</h3>
        <Button className="bg-amber-600 hover:bg-amber-700" size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" />Create</Button>
      </div>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> :
        <Card><Table><TableHeader><TableRow><TableHead>Deal</TableHead><TableHead>Product</TableHead><TableHead>Discount</TableHead><TableHead>Period</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>{(data || []).map((d: any) => (
            <TableRow key={d.id}><TableCell className="font-medium text-sm">{d.title}</TableCell><TableCell className="text-sm">{d.product?.name || d.productId}</TableCell><TableCell><Badge className="bg-green-100 text-green-700">{d.discountPercent}%</Badge></TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(d.startDate).toLocaleDateString()} — {new Date(d.endDate).toLocaleDateString()}</TableCell>
              <TableCell><Badge variant={d.isActive ? 'default' : 'secondary'}>{d.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
              <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(d.id)}><Trash2 size={14} /></Button></TableCell></TableRow>
          ))}</TableBody></Table></Card>}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent><DialogHeader><DialogTitle>Create Deal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1" /></div>
            <div><Label>Product ID *</Label><Input value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Discount % *</Label><Input type="number" value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))} className="mt-1" /></div>
              <div><Label>Sort Order</Label><Input type="number" value="0" disabled className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date *</Label><Input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="mt-1" /></div>
              <div><Label>End Date *</Label><Input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button className="bg-amber-600 hover:bg-amber-700" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title || !form.productId}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminMarketing;