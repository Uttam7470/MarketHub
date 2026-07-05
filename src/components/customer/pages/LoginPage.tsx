'use client';

import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore, useNavigationStore } from '@/stores';
import { EMAIL_REGEX } from '../helpers';
import { toast } from '@/lib/sonner';
import { authToast, authErrorToast, vendorStatusToast } from '@/lib/auth-toast';

function LoginPage() {
  const { login, setLoading, isLoading } = useAuthStore();
  const { navigateTo, setAppView } = useNavigationStore();
  const [mode, setMode] = useState<'login' | 'register' | 'vendor-register'>('login');
  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', confirmPassword: '',
    businessName: '', businessEmail: '', businessPhone: '',
    businessAddress: '', gstNumber: '', panNumber: '',
    bankName: '', bankAccount: '', bankIfsc: '', description: '',
  });

  const updateForm = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    if (!EMAIL_REGEX.test(form.email)) { toast.error('Invalid email format'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, password: form.password }) });
      const data = await res.json();
      if (data.success) {
        login(data.data.user, data.data.token, data.data.vendorId, data.data.vendorStatus);
        // Show vendor status warning if pending/rejected
        if (data.data.user.role === 'VENDOR' && data.data.vendorStatus && data.data.vendorStatus !== 'APPROVED') {
          authToast.loginSuccess(data.data.user.name, data.data.user.role);
          vendorStatusToast(data.data.vendorStatus);
        } else {
          authToast.loginSuccess(data.data.user.name, data.data.user.role);
        }
        if (data.data.user.role === 'ADMIN') { useNavigationStore.getState().setAppView('admin'); }
        else if (data.data.user.role === 'VENDOR') { useNavigationStore.getState().setAppView('vendor'); }
        else { navigateTo('home'); }
      } else { authErrorToast(data.error || 'Login failed', res.status); }
    } catch { toast.error('Something went wrong. Please check your connection.'); }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all required fields'); return; }
    if (!EMAIL_REGEX.test(form.email)) { toast.error('Invalid email format'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone }) });
      const data = await res.json();
      if (data.success) { login(data.data.user, data.data.token); authToast.registerSuccess(data.data.user.name); navigateTo('home'); }
      else { authErrorToast(data.error || 'Registration failed', res.status); }
    } catch { toast.error('Something went wrong'); }
    setLoading(false);
  };

  const handleVendorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.businessName) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!EMAIL_REGEX.test(form.email)) { toast.error('Invalid email format'); return; }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) { toast.error('Invalid phone number', { description: 'Phone number must be exactly 10 digits.' }); return; }
    if (form.gstNumber && form.gstNumber.length !== 15) { toast.error('Invalid GST number', { description: 'GST number must be exactly 15 characters.' }); return; }
    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) { toast.error('Invalid PAN number', { description: 'PAN format should be: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F).' }); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/vendor-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          businessName: form.businessName,
          businessEmail: form.businessEmail || form.email,
          businessPhone: form.businessPhone,
          businessAddress: form.businessAddress,
          gstNumber: form.gstNumber,
          panNumber: form.panNumber,
          bankName: form.bankName,
          bankAccount: form.bankAccount,
          bankIfsc: form.bankIfsc,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.data.user, data.data.token, data.data.vendorId, data.data.vendorStatus);
        authToast.vendorApplicationSubmitted(form.businessName);
        setAppView('vendor');
      } else {
        authErrorToast(data.error || 'Registration failed', res.status);
      }
    } catch { toast.error('Something went wrong'); }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Become a Vendor'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Login to your account' : mode === 'register' ? 'Join MarketHub today' : 'Start selling on MarketHub'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mode Tabs */}
          <div className="flex mb-6 bg-muted rounded-lg p-1">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'register' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setMode('register')}
            >
              Customer
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'vendor-register' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setMode('vendor-register')}
            >
              Vendor
            </button>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div><Label>Email</Label><Input type="email" placeholder="you@example.com" value={form.email} onChange={e => updateForm('email', e.target.value)} className="mt-1" /></div>
              <div><Label>Password</Label><Input type="password" placeholder="••••••••" value={form.password} onChange={e => updateForm('password', e.target.value)} className="mt-1" /></div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Login'}</Button>
            </form>
          )}

          {/* Customer Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div><Label>Full Name *</Label><Input placeholder="John Doe" value={form.name} onChange={e => updateForm('name', e.target.value)} className="mt-1" /></div>
              <div><Label>Email *</Label><Input type="email" placeholder="you@example.com" value={form.email} onChange={e => updateForm('email', e.target.value)} className="mt-1" /></div>
              <div><Label>Password *</Label><Input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => updateForm('password', e.target.value)} className="mt-1" /></div>
              <div><Label>Confirm Password *</Label><Input type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} className="mt-1" /></div>
              <div><Label>Phone (optional)</Label><Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => updateForm('phone', e.target.value)} className="mt-1" /></div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Create Account'}</Button>
            </form>
          )}

          {/* Vendor Register Form */}
          {mode === 'vendor-register' && (
            <form onSubmit={handleVendorRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 flex items-start gap-2">
                <Shield size={16} className="shrink-0 mt-0.5" />
                Your application will be reviewed by our admin team. Once approved, you can start selling products.
              </p>

              <h3 className="font-semibold text-sm text-muted-foreground mt-2">Account Details</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Full Name *</Label><Input placeholder="Your name" value={form.name} onChange={e => updateForm('name', e.target.value)} className="mt-1" /></div>
                <div><Label>Email *</Label><Input type="email" placeholder="you@business.com" value={form.email} onChange={e => updateForm('email', e.target.value)} className="mt-1" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Password *</Label><Input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => updateForm('password', e.target.value)} className="mt-1" /></div>
                <div><Label>Phone</Label><Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => updateForm('phone', e.target.value)} className="mt-1" /></div>
              </div>

              <h3 className="font-semibold text-sm text-muted-foreground pt-2">Business Details</h3>
              <div><Label>Business Name *</Label><Input placeholder="Your Store Name" value={form.businessName} onChange={e => updateForm('businessName', e.target.value)} className="mt-1" /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Business Email</Label><Input type="email" placeholder="business@email.com" value={form.businessEmail} onChange={e => updateForm('businessEmail', e.target.value)} className="mt-1" /></div>
                <div><Label>Business Phone</Label><Input placeholder="+91 XXXXX XXXXX" value={form.businessPhone} onChange={e => updateForm('businessPhone', e.target.value)} className="mt-1" /></div>
              </div>
              <div><Label>Business Address</Label><Textarea placeholder="Full business address" value={form.businessAddress} onChange={e => updateForm('businessAddress', e.target.value)} className="mt-1" rows={2} /></div>
              <div><Label>Description</Label><Textarea placeholder="Tell us about your business" value={form.description} onChange={e => updateForm('description', e.target.value)} className="mt-1" rows={2} /></div>

              <h3 className="font-semibold text-sm text-muted-foreground pt-2">Tax & Bank Details (Optional)</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>GST Number</Label><Input placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChange={e => updateForm('gstNumber', e.target.value)} className="mt-1" /></div>
                <div><Label>PAN Number</Label><Input placeholder="AAAAA0000A" value={form.panNumber} onChange={e => updateForm('panNumber', e.target.value)} className="mt-1" /></div>
              </div>
              <div><Label>Bank Name</Label><Input placeholder="Bank name" value={form.bankName} onChange={e => updateForm('bankName', e.target.value)} className="mt-1" /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Bank Account</Label><Input placeholder="Account number" value={form.bankAccount} onChange={e => updateForm('bankAccount', e.target.value)} className="mt-1" /></div>
                <div><Label>IFSC Code</Label><Input placeholder="IFSC code" value={form.bankIfsc} onChange={e => updateForm('bankIfsc', e.target.value)} className="mt-1" /></div>
              </div>

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Vendor Application'}
              </Button>
            </form>
          )}
        </CardContent>

        {/* Footer with demo buttons (login mode only) */}
        <CardFooter className="flex-col gap-3">
          {mode === 'login' && (
            <>
              <Separator className="w-full" />
              <p className="text-xs text-muted-foreground text-center">Quick Demo Access</p>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button variant="outline" size="sm" onClick={() => { setForm({ email: 'admin@markethub.com', password: 'admin123', name: '', phone: '', confirmPassword: '', businessName: '', businessEmail: '', businessPhone: '', businessAddress: '', gstNumber: '', panNumber: '', bankName: '', bankAccount: '', bankIfsc: '', description: '' }); }}>Admin Demo</Button>
                <Button variant="outline" size="sm" onClick={() => { setForm({ email: 'techstore@vendor.com', password: 'vendor123', name: '', phone: '', confirmPassword: '', businessName: '', businessEmail: '', businessPhone: '', businessAddress: '', gstNumber: '', panNumber: '', bankName: '', bankAccount: '', bankIfsc: '', description: '' }); }}>Vendor Demo</Button>
                <Button variant="outline" size="sm" onClick={() => { setForm({ email: 'rahul@example.com', password: 'customer123', name: '', phone: '', confirmPassword: '', businessName: '', businessEmail: '', businessPhone: '', businessAddress: '', gstNumber: '', panNumber: '', bankName: '', bankAccount: '', bankIfsc: '', description: '' }); }}>Customer Demo</Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Admin: admin@markethub.com / admin123<br/>Vendor: techstore@vendor.com / vendor123<br/>Customer: rahul@example.com / customer123</p>
            </>
          )}
          {mode === 'register' && (
            <Button variant="ghost" size="sm" onClick={() => setMode('login')}>Already have an account? Login</Button>
          )}
          {mode === 'vendor-register' && (
            <Button variant="ghost" size="sm" onClick={() => setMode('login')}>Already have an account? Login</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;