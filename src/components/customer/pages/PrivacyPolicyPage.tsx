'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, Bell, UserCheck, Cookie, Globe, FileText, Users } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const goHome = () => { import('@/stores').then(m => m.useNavigationStore.getState().setCustomerView('home')); };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={goHome} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-muted-foreground">Privacy Policy</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield size={36} className="text-orange-500" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">Last updated: January 2025. We are committed to protecting your privacy and personal information.</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <h2 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Your Privacy Matters to Us</h2>
          <p className="text-sm text-blue-800 dark:text-blue-300">MarketHub (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Database size={20} className="text-orange-500" />Information We Collect</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-2">Personal Information</p>
              <ul className="space-y-1.5">
                {['Name, email address, and phone number during registration', 'Shipping and billing addresses', 'Payment information (processed securely via Razorpay — we never store card details)', 'Profile information like gender, date of birth (optional)', 'Order history and purchase preferences'].map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-orange-500">•</span>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">Automatically Collected Information</p>
              <ul className="space-y-1.5">
                {['IP address, browser type, and device information', 'Pages visited, time spent, and navigation patterns', 'Search queries and product browsing history', 'Location data (city-level, based on IP)', 'Cookies and similar tracking technologies'].map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-orange-500">•</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Eye size={20} className="text-orange-500" />How We Use Your Information</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              { title: 'Order Processing', desc: 'Process, fulfill, and deliver your orders' },
              { title: 'Communication', desc: 'Send order updates, receipts, and support responses' },
              { title: 'Personalization', desc: 'Show relevant products and recommendations' },
              { title: 'Account Security', desc: 'Verify identity and prevent fraud' },
              { title: 'Improvement', desc: 'Improve our platform and user experience' },
              { title: 'Marketing', desc: 'Send promotional offers (with your consent)' },
              { title: 'Analytics', desc: 'Understand usage patterns and trends' },
              { title: 'Legal Compliance', desc: 'Comply with applicable laws and regulations' },
            ].map((item, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users size={20} className="text-orange-500" />Information Sharing</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>We <span className="font-medium text-foreground">do not sell</span> your personal information to third parties. We may share your information with:</p>
            <ul className="space-y-2">
              {[
                'Sellers — Your shipping address and phone number are shared with the seller only for order delivery purposes.',
                'Logistics Partners — Shipping address and order details for delivery.',
                'Payment Processors — Razorpay processes payments securely; we do not store card details.',
                'Analytics Providers — Anonymized, aggregated data for platform improvement.',
                'Legal Authorities — When required by law or to protect our rights and safety.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-orange-500">•</span>{item}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Lock size={20} className="text-orange-500" />Data Security</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>We implement industry-standard security measures to protect your data:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: '🔒', title: 'SSL/TLS Encryption', desc: 'All data in transit is encrypted' },
                { icon: '🛡️', title: 'Secure Payments', desc: 'PCI DSS Level 1 compliant via Razorpay' },
                { icon: '🔑', title: 'Password Hashing', desc: 'Bcrypt hashing for all passwords' },
                { icon: '🔍', title: 'Access Controls', desc: 'Role-based access for internal teams' },
              ].map((item, i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-foreground flex items-center gap-2">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Cookie size={20} className="text-orange-500" />Cookies Policy</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>We use cookies and similar technologies for:</p>
            <ul className="space-y-1.5">
              {['Essential cookies — Required for site functionality (cart, login, etc.)', 'Analytics cookies — Help us understand how you use the site', 'Preference cookies — Remember your settings (language, currency, etc.)', 'Marketing cookies — Show relevant ads (only with your consent)'].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-orange-500">•</span>{item}</li>
              ))}
            </ul>
            <p className="text-xs bg-muted p-3 rounded-lg mt-2">You can manage your cookie preferences through your browser settings. Disabling essential cookies may affect site functionality.</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Bell size={20} className="text-orange-500" />Your Rights</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>As a user, you have the right to:</p>
            {[
              'Access — Request a copy of your personal data we hold',
              'Correction — Update or correct your personal information',
              'Deletion — Request deletion of your account and data',
              'Withdrawal — Withdraw consent for marketing communications anytime',
              'Portability — Request your data in a machine-readable format',
            ].map((item, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-orange-500">•</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Globe size={20} className="text-orange-500" />Third-Party Links</h2>
          <p className="text-sm text-muted-foreground">Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before sharing any personal information.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText size={20} className="text-orange-500" />Changes to This Policy</h2>
          <p className="text-sm text-muted-foreground">We may update this privacy policy from time to time. We will notify you of any significant changes by posting a prominent notice on our website or sending you an email. Your continued use of our services after any changes constitutes your acceptance of the updated policy.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserCheck size={20} className="text-orange-500" />Contact Us</h2>
          <p className="text-sm text-muted-foreground">If you have any questions about this Privacy Policy, you can reach us at:</p>
          <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <p>📧 <span className="text-foreground">Email:</span> privacy@markethub.com</p>
            <p>📞 <span className="text-foreground">Phone:</span> 1800-123-4567 (Toll Free)</p>
            <p>📍 <span className="text-foreground">Address:</span> MarketHub HQ, 4th Floor, Infinity Tower, Outer Ring Road, Marathahalli, Bangalore, Karnataka 560037, India</p>
          </div>
        </Card>
      </div>
    </div>
  );
}