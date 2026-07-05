'use client';

import React from 'react';
import { Store, ShoppingBag, Users, Package, TrendingUp, Shield, CheckCircle, Search, ShoppingCart, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useNavigationStore } from '@/stores';
import { toast } from '@/lib/sonner';

function AboutPage() {
  const stats = [
    { label: 'Active Vendors', value: '5,000+', icon: <Store size={20} /> },
    { label: 'Products Listed', value: '2 Lakh+', icon: <ShoppingBag size={20} /> },
    { label: 'Happy Customers', value: '10 Lakh+', icon: <Users size={20} /> },
    { label: 'Orders Delivered', value: '25 Lakh+', icon: <Package size={20} /> },
  ];
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb className="mb-6"><BreadcrumbList><BreadcrumbItem><BreadcrumbLink onClick={() => useNavigationStore.getState().setCustomerView('home')}>Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><span className="text-muted-foreground">About Us</span></BreadcrumbItem></BreadcrumbList></Breadcrumb>

      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-4"><Store size={36} className="text-orange-500" /><h1 className="text-3xl font-bold">About MarketHub</h1></div>
        <p className="text-muted-foreground max-w-2xl mx-auto">India&apos;s trusted multi-vendor marketplace connecting millions of buyers with thousands of verified sellers across 500+ categories.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <Card key={s.label} className="p-4 text-center"><div className="text-orange-500 mx-auto mb-2">{s.icon}</div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><TrendingUp size={20} className="text-orange-500" />Our Mission</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">To empower small and medium businesses across India by providing them with a world-class digital marketplace. We believe every entrepreneur deserves access to the same tools and reach as the biggest brands. MarketHub levels the playing field — whether you&apos;re a handmade crafts seller from Jaipur or an electronics wholesaler from Delhi, we help you reach customers nationwide.</p>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><Shield size={20} className="text-orange-500" />Our Promise</h2>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex gap-2"><CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /><p><span className="font-medium text-foreground">100% Genuine Products</span> — Every seller is verified and products are quality-checked</p></div>
            <div className="flex gap-2"><CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /><p><span className="font-medium text-foreground">Secure Payments</span> — PCI DSS Level 1 compliant via Razorpay</p></div>
            <div className="flex gap-2"><CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /><p><span className="font-medium text-foreground">Easy Returns</span> — 7-day hassle-free return policy</p></div>
            <div className="flex gap-2"><CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /><p><span className="font-medium text-foreground">Fast Delivery</span> — 2-3 days in metro cities</p></div>
            <div className="flex gap-2"><CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /><p><span className="font-medium text-foreground">24/7 Support</span> — Email, chat, and phone support</p></div>
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-10">
        <h2 className="font-semibold text-lg mb-3">How MarketHub Works</h2>
        <div className="grid sm:grid-cols-4 gap-6 text-center text-sm">
          {[
            { step: '1', title: 'Browse & Discover', desc: 'Explore thousands of products across 500+ categories with smart filters and search', icon: <Search size={24} /> },
            { step: '2', title: 'Add to Cart', desc: 'Compare prices, read reviews, check seller ratings, and add to your cart', icon: <ShoppingCart size={24} /> },
            { step: '3', title: 'Secure Checkout', desc: 'Multiple payment options with 256-bit encryption and buyer protection', icon: <Shield size={24} /> },
            { step: '4', title: 'Fast Delivery', desc: 'Track your order in real-time and receive it at your doorstep', icon: <Truck size={24} /> },
          ].map(s => (
            <div key={s.step}>
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center mx-auto mb-2">{s.icon}</div>
              <p className="font-semibold">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-3">Want to Sell on MarketHub?</h2>
        <p className="text-sm text-muted-foreground mb-4">Join 5,000+ verified sellers and reach millions of customers across India. Zero listing fees, low commissions, and dedicated seller support.</p>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => useNavigationStore.getState().setCustomerView('register')}>Register as a Vendor</Button>
      </Card>
    </div>
  );
}

export default AboutPage;