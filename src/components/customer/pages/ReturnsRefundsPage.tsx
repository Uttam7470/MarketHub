'use client';

import React from 'react';
import { RotateCcw, RefreshCw, Shield, Truck, Clock, AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useNavigationStore } from '@/stores';

const returnSteps = [
  { step: '1', title: 'Initiate Return', desc: 'Go to My Orders → Select order → Click "Request Return"', icon: <RotateCcw size={20} /> },
  { step: '2', title: 'Select Reason', desc: 'Choose a reason and optionally add photos for faster approval', icon: <RotateCcw size={20} /> },
  { step: '3', title: 'Approval', desc: 'Our team reviews your request within 24-48 hours', icon: <Clock size={20} /> },
  { step: '4', title: 'Pickup', desc: 'Free pickup scheduled at your doorstep for approved returns', icon: <Truck size={20} /> },
  { step: '5', title: 'Refund', desc: 'Refund initiated after product inspection (5-7 business days)', icon: <RefreshCw size={20} /> },
];

const refundTimelines = [
  { method: 'Original Payment (Card/UPI)', time: '5-7 business days' },
  { method: 'Wallet Credit', time: 'Instant after approval' },
  { method: 'Bank Transfer (NEFT)', time: '3-5 business days' },
  { method: 'Replacement / Exchange', time: '5-8 business days' },
];

const nonReturnable = [
  'Personal hygiene products (if opened)',
  'Customized or personalized items',
  'Perishable goods (food, flowers)',
  'Software, CDs, DVDs (if seal broken)',
  'Items with warranty (contact brand service center)',
];

export default function ReturnsRefundsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={() => useNavigationStore.getState().setCustomerView('home')} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-muted-foreground">Returns & Refunds</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3"><RotateCcw size={36} className="text-orange-500" /><h1 className="text-3xl font-bold">Returns & Refunds</h1></div>
        <p className="text-muted-foreground max-w-xl mx-auto">Hassle-free returns within 7 days of delivery. Your satisfaction is our priority.</p>
      </div>

      {/* Return Policy */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield size={22} className="text-orange-500" />7-Day Return Policy</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>• <span className="font-medium text-foreground">7-day return window</span> from the date of delivery</p>
          <p>• Products must be <span className="font-medium text-foreground">unused, unwashed</span>, and in <span className="font-medium text-foreground">original packaging</span> with all tags intact</p>
          <p>• Items should be returned in the same condition as received</p>
          <p>• Return shipping is <span className="font-medium text-foreground">FREE</span> for approved returns</p>
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">How to Return</h2>
        <div className="grid sm:grid-cols-5 gap-4 text-center text-sm">
          {returnSteps.map(s => (
            <div key={s.step}>
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center mx-auto mb-2">{s.icon}</div>
              <p className="font-semibold text-xs">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Refund Timelines */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><RefreshCw size={20} className="text-orange-500" />Refund Timelines</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {refundTimelines.map(r => (
            <div key={r.method} className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm font-medium">{r.method}</span>
              <span className="text-sm font-bold text-orange-600">{r.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Non-Returnable Items */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><XCircle size={20} className="text-red-500" />Non-Returnable Items</h2>
        <div className="space-y-2">
          {nonReturnable.map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle size={14} className="text-red-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Damaged/Wrong Item */}
      <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800 mb-6">
        <p className="font-medium text-orange-700 dark:text-orange-300 mb-1 flex items-center gap-2"><AlertTriangle size={16} />Damaged or Wrong Item?</p>
        <p className="text-sm text-muted-foreground">If you received a damaged, defective, or wrong product, raise a return request within <strong>48 hours</strong> of delivery with photos. We&apos;ll arrange a free pickup and provide a full refund or replacement — no questions asked.</p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => useNavigationStore.getState().setCustomerView('orders')}>
          <ArrowRight size={16} className="mr-2" />Go to My Orders
        </Button>
      </div>
    </div>
  );
}