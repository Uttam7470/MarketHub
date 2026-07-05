'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { FileText, Scale, AlertTriangle, ShoppingCart, UserCheck, Ban, Shield, Gavel, RefreshCw } from 'lucide-react';

export default function TermsOfServicePage() {
  const goHome = () => { import('@/stores').then(m => m.useNavigationStore.getState().setCustomerView('home')); };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={goHome} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-muted-foreground">Terms of Service</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText size={36} className="text-orange-500" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">Last updated: January 2025. Please read these terms carefully before using MarketHub.</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <h2 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">Agreement to Terms</h2>
          <p className="text-sm text-amber-800 dark:text-amber-300">By accessing or using MarketHub (the &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, please do not use our services. These terms apply to all users including customers, vendors, and visitors.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><ShoppingCart size={20} className="text-orange-500" />1. Use of the Platform</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>You agree to use MarketHub only for lawful purposes. You must:</p>
            <ul className="space-y-1.5">
              {['Provide accurate and complete information during registration', 'Maintain the security of your account credentials', 'Be at least 18 years old to create an account', 'Not use the platform for any illegal or unauthorized purpose', 'Not attempt to gain unauthorized access to any part of the platform', 'Not interfere with or disrupt the platform\'s operation'].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-orange-500">•</span>{item}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserCheck size={20} className="text-orange-500" />2. User Accounts</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>You are responsible for all activities under your account. MarketHub reserves the right to:</p>
            <ul className="space-y-1.5">
              {['Suspend or terminate accounts that violate these Terms', 'Require additional verification for suspicious accounts', 'Limit account features for unverified users', 'Remove accounts that have been inactive for 24+ months'].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-orange-500">•</span>{item}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Scale size={20} className="text-orange-500" />3. Product Listings & Pricing</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>MarketHub is a marketplace connecting buyers and sellers. Important points:</p>
            <ul className="space-y-1.5">
              {['Product listings are created by individual sellers, not by MarketHub', 'Prices may change without prior notice', 'Product images are for illustration purposes and may vary slightly', 'We strive for accuracy but do not guarantee 100% accuracy of all product information', 'Sellers are responsible for product quality, descriptions, and compliance', 'MarketHub is not a party to the sale transaction between buyer and seller'].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-orange-500">•</span>{item}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><RefreshCw size={20} className="text-orange-500" />4. Orders & Payments</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <ul className="space-y-1.5">
              {['Placing an order constitutes an offer to purchase. Acceptance is confirmed via order confirmation.', 'All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise.', 'Payment is processed securely via Razorpay. MarketHub does not store card details.', 'COD orders must be paid in exact change at the time of delivery.', 'Order cancellation is subject to our Cancellation Policy.', 'MarketHub reserves the right to cancel orders due to pricing errors, stock issues, or suspected fraud.', 'Promotional offers and discounts are subject to terms specified in the promotion.'].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-orange-500">•</span>{item}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Ban size={20} className="text-orange-500" />5. Prohibited Activities</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              'Selling counterfeit or pirated products',
              'Posting fake reviews or ratings',
              'Using automated bots or scrapers',
              'Engaging in price manipulation',
              'Harassment or abusive behavior',
              'Spamming other users',
              'Circumventing platform fees',
              'Creating multiple fake accounts',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-muted-foreground">
                <span className="text-red-400 shrink-0">✕</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield size={20} className="text-orange-500" />6. Intellectual Property</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>All content on MarketHub including logos, design, text, graphics, and software is the property of MarketHub and protected by intellectual property laws.</p>
            <ul className="space-y-1.5">
              {['You may not reproduce, distribute, or create derivative works without permission', 'Product reviews and user-generated content remain the property of the creator', 'By posting content, you grant MarketHub a non-exclusive, royalty-free license to use it', 'Trademark names used on the platform belong to their respective owners'].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-orange-500">•</span>{item}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlertTriangle size={20} className="text-orange-500" />7. Limitation of Liability</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="bg-muted p-3 rounded-lg">MarketHub acts as an intermediary platform and is not liable for:</p>
            <ul className="space-y-1.5">
              {['Quality, safety, or legality of products listed by sellers', 'Accuracy of product descriptions, images, or specifications', 'Any loss or damage arising from transactions between buyers and sellers', 'Delivery delays caused by logistics partners or force majeure events', 'Any indirect, incidental, or consequential damages', 'Service interruptions due to maintenance, upgrades, or technical issues'].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-orange-500">•</span>{item}</li>
              ))}
            </ul>
            <p className="text-xs bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mt-2">Our total liability shall not exceed the amount paid by you for the specific order in question.</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Gavel size={20} className="text-orange-500" />8. Dispute Resolution</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Any disputes arising from these Terms shall be governed by the laws of India. All disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.</p>
            <p>Before taking legal action, you agree to attempt to resolve disputes through:</p>
            <ol className="space-y-1.5 list-decimal list-inside">
              <li>Our customer support team (via email, phone, or support tickets)</li>
              <li>Formal written complaint to dispute@markethub.com</li>
              <li>Mediation through a mutually agreed mediator</li>
            </ol>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText size={20} className="text-orange-500" />9. Modifications</h2>
          <p className="text-sm text-muted-foreground">MarketHub reserves the right to modify these Terms at any time. We will provide notice of significant changes via email or a prominent notice on the platform. Continued use after modifications constitutes acceptance of the updated Terms.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">10. Contact</h2>
          <p className="text-sm text-muted-foreground mb-3">For any questions about these Terms of Service, please contact us:</p>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p>📧 <span className="text-foreground">Email:</span> legal@markethub.com</p>
            <p>📞 <span className="text-foreground">Phone:</span> 1800-123-4567 (Toll Free)</p>
            <p>📍 <span className="text-foreground">Address:</span> MarketHub HQ, 4th Floor, Infinity Tower, Outer Ring Road, Marathahalli, Bangalore, Karnataka 560037, India</p>
          </div>
        </Card>
      </div>
    </div>
  );
}