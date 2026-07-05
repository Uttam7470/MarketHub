'use client';

import React, { useState } from 'react';
import { HelpCircle, Truck, RotateCcw, CreditCard, Smartphone, Building2, Banknote, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/lib/sonner';

function HelpCenterPage() {
  const { data: faqs = [] } = useQuery({ queryKey: ['faqs'], queryFn: () => fetch('/api/faq').then(r => r.json()).then((r: any) => r.data || []) });
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const topics = [
    {
      id: 'shipping', icon: <Truck size={22} />, title: 'Orders & Shipping', desc: 'Delivery timelines, tracking, shipping charges',
      content: (
        <div className="space-y-6 text-sm">
          <div><h3 className="font-semibold text-base mb-2">🚚 Delivery Timelines</h3>
            <p className="text-muted-foreground mb-3">We strive to deliver your orders as quickly as possible. Delivery times depend on your location and the seller.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { zone: 'Metro Cities (Delhi, Mumbai, Bangalore, etc.)', time: '2-3 business days' },
                { zone: 'Tier 1 Cities', time: '3-5 business days' },
                { zone: 'Tier 2/3 Cities', time: '5-7 business days' },
                { zone: 'Remote Locations', time: '7-10 business days' },
              ].map(z => (
                <div key={z.zone} className="p-3 rounded-lg border"><p className="font-medium text-xs">{z.zone}</p><p className="text-orange-600 font-semibold">{z.time}</p></div>
              ))}
            </div>
          </div>
          <div><h3 className="font-semibold text-base mb-2">📦 Shipping Charges</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>• <span className="font-medium text-foreground">FREE shipping</span> on orders above ₹500</p>
              <p>• Flat shipping fee of <span className="font-medium text-foreground">₹99</span> for orders below ₹500</p>
              <p>• Shipping charges may vary for heavy/bulky items (furniture, appliances)</p>
              <p>• Each vendor ships separately — multi-vendor orders may arrive in multiple packages</p>
            </div>
          </div>
          <div><h3 className="font-semibold text-base mb-2">📍 Order Tracking</h3>
            <div className="text-muted-foreground space-y-1">
              <p>• Track your order in real-time from <strong>My Orders</strong> section</p>
              <p>• You&apos;ll receive email & notification updates at every stage:</p>
              <p className="pl-4">Order Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered</p>
              <p>• Tracking ID is shared once the order is shipped</p>
            </div>
          </div>
          <div><h3 className="font-semibold text-base mb-2">🔒 Safe & Secure Delivery</h3>
            <div className="text-muted-foreground space-y-1">
              <p>• All packages are sealed and tamper-proof</p>
              <p>• OTP-based delivery verification</p>
              <p>• Doorstep delivery with photo confirmation</p>
              <p>• If you receive a damaged package, reject it at delivery and contact us immediately</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'returns', icon: <RotateCcw size={22} />, title: 'Returns & Refunds', desc: 'Return policy, refund process, timelines',
      content: (
        <div className="space-y-6 text-sm">
          <div><h3 className="font-semibold text-base mb-2">↩️ Return Policy</h3>
            <div className="text-muted-foreground space-y-2">
              <p>• <span className="font-medium text-foreground">7-day return window</span> from the date of delivery</p>
              <p>• Products must be unused, unwashed, and in original packaging with all tags intact</p>
              <p>• Returns are not accepted for:</p>
              <p className="pl-4">– Personal hygiene products (opened)<br />– Customized/personalized items<br />– Perishable goods<br />– Software, CDs, DVDs (if seal broken)</p>
            </div>
          </div>
          <div><h3 className="font-semibold text-base mb-2">💰 Refund Process</h3>
            <div className="text-muted-foreground space-y-2">
              <p><strong>Step 1:</strong> Go to <strong>My Orders</strong> → Select order → Click &quot;Request Return&quot;</p>
              <p><strong>Step 2:</strong> Select reason and submit (photos help speed up approval)</p>
              <p><strong>Step 3:</strong> Our team reviews within 24-48 hours</p>
              <p><strong>Step 4:</strong> Once approved, arrange pickup (free for approved returns)</p>
              <p><strong>Step 5:</strong> Refund initiated after product is received and inspected</p>
            </div>
          </div>
          <div><h3 className="font-semibold text-base mb-2">⏱️ Refund Timelines</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { method: 'Original Payment (Card/UPI)', time: '5-7 business days' },
                { method: 'Wallet Credit', time: 'Instant after approval' },
                { method: 'Bank Transfer (NEFT)', time: '3-5 business days' },
                { method: 'Replacement/Exchange', time: '5-8 business days' },
              ].map(r => (
                <div key={r.method} className="p-3 rounded-lg border"><p className="font-medium text-xs">{r.method}</p><p className="text-orange-600 font-semibold">{r.time}</p></div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="font-medium text-orange-700 dark:text-orange-300 mb-1">⚠️ Damaged or Wrong Item?</p>
            <p className="text-muted-foreground text-xs">If you received a damaged, defective, or wrong product, raise a return request within 48 hours of delivery with photos. We&apos;ll arrange a free pickup and provide a full refund or replacement — no questions asked.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'payments', icon: <CreditCard size={22} />, title: 'Payments', desc: 'Payment methods, billing, GST invoices',
      content: (
        <div className="space-y-6 text-sm">
          <div><h3 className="font-semibold text-base mb-2">💳 Accepted Payment Methods</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { method: 'UPI', desc: 'Google Pay, PhonePe, Paytm, BHIM, all UPI apps', icon: <Smartphone size={16} /> },
                { method: 'Credit Card', desc: 'Visa, Mastercard, RuPay, Amex', icon: <CreditCard size={16} /> },
                { method: 'Debit Card', desc: 'All major bank debit cards', icon: <CreditCard size={16} /> },
                { method: 'Net Banking', desc: 'SBI, HDFC, ICICI, Axis, and 50+ banks', icon: <Building2 size={16} /> },
                { method: 'Cash on Delivery', desc: 'Pay when you receive (₹49 extra fee)', icon: <Banknote size={16} /> },
                { method: 'Wallets', desc: 'Paytm Wallet, Amazon Pay, Mobikwik', icon: <Smartphone size={16} /> },
              ].map(p => (
                <div key={p.method} className="flex gap-3 p-3 rounded-lg border items-start">
                  <span className="text-orange-500 mt-0.5">{p.icon}</span>
                  <div><p className="font-medium">{p.method}</p><p className="text-xs text-muted-foreground">{p.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div><h3 className="font-semibold text-base mb-2">🔒 Security</h3>
            <div className="text-muted-foreground space-y-1">
              <p>• All payments are processed through <span className="font-medium text-foreground">Razorpay</span> — PCI DSS Level 1 compliant</p>
              <p>• Your card details are never stored on our servers</p>
              <p>• 256-bit SSL encryption on all transactions</p>
              <p>• 3D Secure authentication for international cards</p>
            </div>
          </div>
          <div><h3 className="font-semibold text-base mb-2">🧾 GST Invoice</h3>
            <div className="text-muted-foreground space-y-1">
              <p>• GST invoice is automatically generated for every order</p>
              <p>• Download from <strong>My Orders</strong> → Order Detail → Invoice</p>
              <p>• For business purchases, add your GSTIN during checkout</p>
              <p>• Input Tax Credit (ITC) can be claimed on B2B purchases</p>
            </div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">❓ Payment Failed?</p>
            <p className="text-muted-foreground text-xs">If money was deducted but order wasn&apos;t placed, don&apos;t worry — it will be automatically refunded to your source within 5-7 business days. If not, contact us with your transaction ID.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <HelpCircle size={48} className="mx-auto text-orange-500 mb-3" />
        <h1 className="text-2xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-1">Find answers to common questions and detailed information</p>
      </div>

      {activeTab === null ? (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {topics.map(topic => (
              <Card key={topic.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setActiveTab(topic.id)}>
                <div className="text-orange-500 mb-3 group-hover:scale-110 transition-transform">{topic.icon}</div>
                <h3 className="font-semibold">{topic.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{topic.desc}</p>
                <p className="text-xs text-orange-500 font-medium mt-3 flex items-center gap-1">View Details <ChevronRight size={12} /></p>
              </Card>
            ))}
          </div>
          <Separator className="my-8" />
          <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.filter((f: any) => f.isActive).map((faq: any) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left text-sm">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {faqs.length === 0 && <p className="text-center text-muted-foreground py-8">No FAQs available yet</p>}
        </>
      ) : (
        <>
          <button onClick={() => setActiveTab(null)} className="text-sm text-orange-500 hover:underline mb-4 flex items-center gap-1"><ChevronLeft size={14} /> Back to Help Center</button>
          <Card className="p-6">{topics.find(t => t.id === activeTab)?.content}</Card>
        </>
      )}
    </div>
  );
}

export default HelpCenterPage;