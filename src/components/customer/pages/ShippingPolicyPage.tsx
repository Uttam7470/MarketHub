'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Truck, Clock, MapPin, Package, AlertCircle, Shield, CreditCard, BadgeIndianRupee } from 'lucide-react';

export default function ShippingPolicyPage() {
  const goHome = () => { import('@/stores').then(m => m.useNavigationStore.getState().setCustomerView('home')); };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={goHome} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-muted-foreground">Shipping Policy</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Truck size={36} className="text-orange-500" />
          <h1 className="text-3xl font-bold">Shipping Policy</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">Last updated: January 2025. We strive to deliver your orders as quickly and safely as possible.</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MapPin size={20} className="text-orange-500" />Shipping Coverage</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>We currently deliver to <span className="text-foreground font-medium">all 28 states and 8 union territories</span> across India. Whether you&apos;re in a metro city or a small town, we&apos;ve got you covered.</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <p className="font-medium text-green-700 dark:text-green-400">Metro Cities</p>
                <p className="text-xs mt-1">Delhi NCR, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata, Pune — Delivery in 2-3 business days</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="font-medium text-blue-700 dark:text-blue-400">Tier 1 & 2 Cities</p>
                <p className="text-xs mt-1">Jaipur, Lucknow, Ahmedabad, Chandigarh, Kochi, etc. — Delivery in 3-5 business days</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                <p className="font-medium text-amber-700 dark:text-amber-400">Tier 3 & Rural Areas</p>
                <p className="text-xs mt-1">Small towns and villages — Delivery in 5-7 business days</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <p className="font-medium text-orange-700 dark:text-orange-400">Remote Locations</p>
                <p className="text-xs mt-1">J&K, Northeast states, island territories — Delivery in 7-10 business days</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BadgeIndianRupee size={20} className="text-orange-500" />Shipping Charges</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Shipping charges vary based on product weight, dimensions, and delivery location:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-medium text-foreground">Order Value</th>
                    <th className="py-2 pr-4 font-medium text-foreground">Metro Cities</th>
                    <th className="py-2 pr-4 font-medium text-foreground">Other Cities</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b"><td className="py-2 pr-4">Above ₹500</td><td className="py-2 pr-4"><span className="text-green-600 font-medium">FREE</span></td><td className="py-2 pr-4"><span className="text-green-600 font-medium">FREE</span></td></tr>
                  <tr className="border-b"><td className="py-2 pr-4">₹200 - ₹499</td><td className="py-2 pr-4">₹40</td><td className="py-2 pr-4">₹60</td></tr>
                  <tr><td className="py-2 pr-4">Below ₹200</td><td className="py-2 pr-4">₹49</td><td className="py-2 pr-4">₹79</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs bg-muted p-3 rounded-lg mt-3">📦 <span className="font-medium text-foreground">Free shipping threshold:</span> Orders above ₹500 qualify for free shipping across India. Individual sellers may offer free shipping on specific products regardless of order value.</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock size={20} className="text-orange-500" />Delivery Timeline</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="space-y-3">
              {[
                { step: '1', title: 'Order Placed', desc: 'Your order is confirmed and seller is notified', time: 'Instant' },
                { step: '2', title: 'Processing', desc: 'Seller packs and hands over to courier partner', time: '1-2 days' },
                { step: '3', title: 'Shipped', desc: 'Package is in transit — tracking number provided via SMS & email', time: '1-3 days' },
                { step: '4', title: 'Out for Delivery', desc: 'Package arrives at your local hub and is out for delivery', time: '1 day' },
                { step: '5', title: 'Delivered', desc: 'Package delivered to your doorstep. OTP verification may apply.', time: '—' },
              ].map(s => (
                <div key={s.step} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0 text-sm font-bold">{s.step}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{s.title}</p>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{s.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Package size={20} className="text-orange-500" />Shipping Partners</h2>
          <p className="text-sm text-muted-foreground mb-3">We work with India&apos;s leading logistics partners to ensure safe and timely delivery:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Delhivery', 'BlueDart', 'DTDC', 'Ecom Express', 'XpressBees', 'Shadowfax', 'India Post', 'Dotzot'].map(p => (
              <div key={p} className="bg-muted/50 rounded-lg p-3 text-center text-sm font-medium">{p}</div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-orange-500" />Important Notes</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            {[
              'Delivery timelines are estimated and may vary during festivals, sale events, or natural calamities.',
              'COD (Cash on Delivery) is available for orders up to ₹10,000. Prepaid orders get priority processing.',
              'Some pin codes in remote areas may have limited COD availability.',
              'Multiple items in one order may be shipped separately from different sellers.',
              'If your pin code is not serviceable, you will be notified at checkout.',
              'Heavy/bulky items (above 10 kg) may incur additional shipping charges — displayed at checkout.',
            ].map((n, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-orange-500 shrink-0">•</span>
                <p>{n}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield size={20} className="text-orange-500" />Delivery Issues?</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>If you face any delivery-related issues:</p>
            {[
              { q: 'Delayed delivery?', a: 'Track your order in real-time from the Orders section. If delayed beyond the estimated date, contact our support team.' },
              { q: 'Wrong address delivered?', a: 'Report the issue within 48 hours of delivery. We\'ll arrange a re-delivery or refund.' },
              { q: 'Package damaged?', a: 'Reject the package at delivery or report within 24 hours with photos. We\'ll arrange a replacement.' },
              { q: 'Item missing from package?', a: 'Report within 48 hours with unboxing video/photo. We\'ll verify and send the missing item.' },
            ].map((item, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground text-sm">{item.q}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}