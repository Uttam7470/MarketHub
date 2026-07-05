'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { RotateCcw, Clock, AlertTriangle, CheckCircle, XCircle, CreditCard, Shield, Package, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReturnPolicyPage() {
  const goHome = () => { import('@/stores').then(m => m.useNavigationStore.getState().setCustomerView('home')); };
  const goToContact = () => { import('@/stores').then(m => m.useNavigationStore.getState().setCustomerView('contact')); };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={goHome} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-muted-foreground">Returns & Refund Policy</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <RotateCcw size={36} className="text-orange-500" />
          <h1 className="text-3xl font-bold">Returns & Refund Policy</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">Last updated: January 2025. Your satisfaction is our priority. Read our hassle-free return and refund policy below.</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400"><CheckCircle size={20} />Return Window</h2>
          <p className="text-sm text-green-800 dark:text-green-300"><span className="text-2xl font-bold">7 Days</span> — You can return most items within 7 days of delivery. Some categories may have different return windows as listed below.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock size={20} className="text-orange-500" />Category-wise Return Policy</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 font-medium text-foreground">Category</th>
                  <th className="py-2 pr-4 font-medium text-foreground">Return Window</th>
                  <th className="py-2 pr-4 font-medium text-foreground">Conditions</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  { cat: 'Clothing & Fashion', window: '7 days', cond: 'Unworn, with tags attached' },
                  { cat: 'Electronics & Gadgets', window: '7 days', cond: 'Unused, with original packaging & accessories' },
                  { cat: 'Mobile Phones', window: '7 days', cond: 'Unused, no physical damage, IMEI intact' },
                  { cat: 'Home & Kitchen', window: '7 days', cond: 'Unused, original packaging' },
                  { cat: 'Books', window: '7 days', cond: 'Undamaged, no writing/highlighting' },
                  { cat: 'Beauty & Personal Care', window: '7 days', cond: 'Unopened/sealed, unused' },
                  { cat: 'Grocery & Gourmet', window: 'No returns', cond: 'Perishable items — contact for damaged delivery' },
                  { cat: 'Customized Products', window: 'No returns', cond: 'Made-to-order items are non-returnable' },
                ].map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="py-2.5 pr-4 font-medium text-foreground">{r.cat}</td>
                    <td className="py-2.5 pr-4"><span className={r.window === 'No returns' ? 'text-red-500' : 'text-green-600'}>{r.window}</span></td>
                    <td className="py-2.5 pr-4 text-xs">{r.cond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlertTriangle size={20} className="text-orange-500" />Non-Returnable Items</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              'Customized or personalized products',
              'Perishable goods (grocery, flowers, food)',
              'Items with broken seal (beauty, hygiene)',
              'Intimate apparel & swimwear',
              'Gift cards, vouchers & coupons',
              'Software, digital downloads & subscriptions',
              'Items damaged due to misuse or negligence',
              'Products with removed warranty seals',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-muted-foreground">
                <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Package size={20} className="text-orange-500" />How to Initiate a Return</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Go to Your Orders', desc: 'Navigate to the Orders section in your profile and select the order you want to return.' },
              { step: '2', title: 'Select Items & Reason', desc: 'Choose the specific item(s) and select a return reason from the dropdown.' },
              { step: '3', title: 'Upload Photos (Optional)', desc: 'For damaged or defective items, upload clear photos to speed up the process.' },
              { step: '4', title: 'Pickup Scheduled', desc: 'Once approved, our logistics partner will schedule a pickup from your address.' },
              { step: '5', title: 'Refund Processed', desc: 'After quality check, refund will be initiated to your original payment method.' },
            ].map(s => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0 text-sm font-bold">{s.step}</div>
                <div>
                  <p className="font-medium text-foreground text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><CreditCard size={20} className="text-orange-500" />Refund Process</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Refunds are processed to your <span className="font-medium text-foreground">original payment method</span>:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground">UPI / Net Banking</p>
                <p className="text-xs mt-1">3-5 business days after pickup confirmation</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground">Credit/Debit Card</p>
                <p className="text-xs mt-1">5-7 business days (depends on your bank)</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground">Wallet / Credits</p>
                <p className="text-xs mt-1">Instant after pickup confirmation</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground">COD Orders</p>
                <p className="text-xs mt-1">Refund to bank account (3-7 business days)</p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
              <p className="text-xs text-amber-800 dark:text-amber-300"><span className="font-bold">Note:</span> If your return is approved but the pickup fails twice, the return request will be cancelled. You can raise a new request.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield size={20} className="text-orange-500" />Exchange Policy</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>We offer <span className="font-medium text-foreground">easy exchanges</span> for the same product in a different size, color, or variant:</p>
            <ul className="space-y-2">
              <li className="flex gap-2"><span className="text-orange-500">•</span>Exchange request must be raised within the return window (7 days)</li>
              <li className="flex gap-2"><span className="text-orange-500">•</span>Product must be unused, unwashed, and with all tags intact</li>
              <li className="flex gap-2"><span className="text-orange-500">•</span>Exchange is subject to availability of the desired variant</li>
              <li className="flex gap-2"><span className="text-orange-500">•</span>If the variant is unavailable, a refund will be processed instead</li>
              <li className="flex gap-2"><span className="text-orange-500">•</span>Exchange shipping is FREE for the first exchange</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText size={20} className="text-orange-500" />Cancellation Policy</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            {[
              { stage: 'Before shipment', policy: 'Full refund — no questions asked', color: 'text-green-600' },
              { stage: 'After shipment', policy: 'Wait for delivery, then initiate return', color: 'text-amber-600' },
              { stage: 'COD order before shipment', policy: 'No charges — just cancel from Orders page', color: 'text-green-600' },
              { stage: 'COD order after shipment', policy: 'Refuse delivery or accept and return', color: 'text-amber-600' },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground min-w-[160px]">{c.stage}</p>
                <p className={c.color}>{c.policy}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground mb-3">Need help with a return or refund?</p>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={goToContact}>Contact Support</Button>
        </div>
      </div>
    </div>
  );
}