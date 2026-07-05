'use client';

import React from 'react';
import { Truck, Clock, Shield, Package, MapPin, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useNavigationStore } from '@/stores';

const zones = [
  { zone: 'Metro Cities (Delhi, Mumbai, Bangalore, etc.)', time: '2-3 business days' },
  { zone: 'Tier 1 Cities (Pune, Hyderabad, Chennai, etc.)', time: '3-5 business days' },
  { zone: 'Tier 2/3 Cities', time: '5-7 business days' },
  { zone: 'Remote Locations', time: '7-10 business days' },
];

export default function ShippingInfoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={() => useNavigationStore.getState().setCustomerView('home')} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-muted-foreground">Shipping Info</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3"><Truck size={36} className="text-orange-500" /><h1 className="text-3xl font-bold">Shipping Information</h1></div>
        <p className="text-muted-foreground max-w-xl mx-auto">Fast and reliable delivery across India. Track your orders in real-time.</p>
      </div>

      {/* Delivery Timelines */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Clock size={22} className="text-orange-500" />Delivery Timelines</h2>
        <p className="text-sm text-muted-foreground mb-4">Delivery times depend on your location and the seller. We strive to deliver as quickly as possible.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {zones.map(z => (
            <div key={z.zone} className="p-4 rounded-lg border">
              <p className="font-medium text-sm">{z.zone}</p>
              <p className="text-orange-600 font-bold mt-1">{z.time}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Shipping Charges */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Package size={20} className="text-orange-500" />Shipping Charges</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle size={20} className="text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">FREE Shipping</p>
              <p>On all orders above ₹500</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Truck size={20} className="text-orange-500 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Flat ₹99</p>
              <p>For orders below ₹500</p>
            </div>
          </div>
          <p className="pl-1">• Shipping charges may vary for heavy/bulky items (furniture, appliances)</p>
          <p className="pl-1">• Each vendor ships separately — multi-vendor orders may arrive in multiple packages</p>
        </div>
      </Card>

      {/* Order Tracking */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin size={20} className="text-orange-500" />Order Tracking</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Track your order in real-time from <strong>My Orders</strong> section</p>
          <p>• You&apos;ll receive email & notification updates at every stage:</p>
          <div className="flex flex-wrap gap-2 py-2">
            {['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map((stage, i) => (
              <span key={stage} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                {stage}
              </span>
            ))}
          </div>
          <p>• Tracking ID is shared once the order is shipped</p>
        </div>
      </Card>

      {/* Safe Delivery */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield size={20} className="text-orange-500" />Safe & Secure Delivery</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• All packages are <span className="font-medium text-foreground">sealed and tamper-proof</span></p>
          <p>• <span className="font-medium text-foreground">OTP-based</span> delivery verification</p>
          <p>• Doorstep delivery with <span className="font-medium text-foreground">photo confirmation</span></p>
          <p>• If you receive a damaged package, <span className="font-medium text-foreground">reject it at delivery</span> and contact us immediately</p>
        </div>
      </Card>

      {/* Note */}
      <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800 mb-6">
        <p className="font-medium text-orange-700 dark:text-orange-300 mb-1 flex items-center gap-2"><AlertTriangle size={16} />Delivery Delays</p>
        <p className="text-sm text-muted-foreground">During festive seasons (Diwali, Holi, etc.) or weather disruptions, delivery may take 1-2 extra days. We appreciate your patience.</p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => useNavigationStore.getState().setCustomerView('products')}>
          <ArrowRight size={16} className="mr-2" />Start Shopping
        </Button>
      </div>
    </div>
  );
}