'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Banknote, Smartphone, Building2, ShieldCheck, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthStore, useNavigationStore, useCartStore } from '@/stores';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '../helpers';
import { toast } from '@/lib/sonner';

function CheckoutPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { items, getSubtotal, getShipping, getTax, getTotal, clearCart, couponDiscount } = useCartStore();
  const { navigateTo } = useNavigationStore();
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [address, setAddress] = useState({ fullName: user?.name || '', phone: user?.phone || '', addressLine1: '', city: '', state: '', pincode: '' });
  const [placing, setPlacing] = useState(false);
  const [isGuest, setIsGuest] = useState(!isAuthenticated);
  const [guestInfo, setGuestInfo] = useState({ email: '', phone: '' });
  const [sameAddress, setSameAddress] = useState(true);
  const [billingForm, setBillingForm] = useState({ fullName: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const qc = useQueryClient();

  // Payment form states
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(user?.name || '');
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  const validatePayment = (): boolean => {
    const errors: Record<string, string> = {};
    if (paymentMethod === 'UPI') {
      if (!upiId.trim()) { errors.upiId = 'Enter your UPI ID'; }
      else if (!/^[\w.\-]+@[\w]+$/.test(upiId.trim())) { errors.upiId = 'Invalid UPI ID (e.g. name@upi)'; }
    } else if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
      const num = cardNumber.replace(/\s/g, '');
      if (!num) { errors.cardNumber = 'Enter card number'; }
      else if (!/^\d{16}$/.test(num)) { errors.cardNumber = 'Card number must be 16 digits'; }
      if (!cardExpiry.trim()) { errors.cardExpiry = 'Enter expiry date'; }
      else if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) { errors.cardExpiry = 'Use MM/YY format'; }
      if (!cardCvv.trim()) { errors.cardCvv = 'Enter CVV'; }
      else if (!/^\d{3,4}$/.test(cardCvv.trim())) { errors.cardCvv = 'CVV must be 3 or 4 digits'; }
      if (!cardName.trim()) { errors.cardName = 'Enter cardholder name'; }
    } else if (paymentMethod === 'Net Banking') {
      if (!selectedBank) { errors.bank = 'Select a bank'; }
    }
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank of India', 'IndusInd Bank'];

  useEffect(() => { if (items.length === 0) navigateTo('cart'); }, [items.length, navigateTo]);
  useEffect(() => { setPaymentErrors({}); }, [paymentMethod]);
  if (items.length === 0) return null;
  if (!isAuthenticated && !isGuest) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center space-y-4">
        <Package size={64} className="mx-auto text-muted-foreground/30" />
        <h2 className="text-xl font-bold">Continue to Checkout</h2>
        <p className="text-muted-foreground">Log in for a faster experience, or continue as guest.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigateTo('login')}>Login</Button>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsGuest(true)}>Continue as Guest</Button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (paymentMethod !== 'COD' && !validatePayment()) { toast.error('Please fill payment details'); return; }
    if (!address.fullName) { toast.error('Please enter your full name'); return; }
    if (!address.addressLine1) { toast.error('Please enter your address'); return; }
    if (!address.city) { toast.error('Please enter your city'); return; }
    if (!address.pincode) { toast.error('Please enter your pincode'); return; }
    if (!/^\d{6}$/.test(address.pincode)) { toast.error('Invalid pincode', { description: 'Pincode must be exactly 6 digits.' }); return; }
    if (!address.phone) { toast.error('Please enter your phone number'); return; }
    if (!/^\d{10}$/.test(address.phone.replace(/\s/g, ''))) { toast.error('Invalid phone number', { description: 'Phone number must be exactly 10 digits.' }); return; }
    if (!isAuthenticated && (!guestInfo.email || !guestInfo.phone)) {
      toast.error('Please fill guest email and phone'); return;
    }
    setPlacing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isAuthenticated ? { userId: user!.id } : { guestEmail: guestInfo.email, guestPhone: guestInfo.phone }),
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: {
            name: address.fullName,
            address: `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}`,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            phone: address.phone,
          },
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        toast.success('Order placed successfully!', { description: 'Your order has been confirmed.' });
        navigateTo('orders');
        qc.invalidateQueries({ queryKey: ['orders'] });
      } else { toast.error(data.error || 'Failed to place order'); }
    } catch { toast.error('Something went wrong'); }
    setPlacing(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {isGuest && !isAuthenticated && (
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-3">Guest Information</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Email *</Label><Input className="mt-1" type="email" value={guestInfo.email} onChange={e => setGuestInfo(g => ({...g, email: e.target.value}))} /></div>
            <div><Label>Phone *</Label><Input className="mt-1" value={guestInfo.phone} onChange={e => setGuestInfo(g => ({...g, phone: e.target.value}))} /></div>
          </div>
        </Card>
      )}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={20} className="text-orange-500" />Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full Name</Label><Input value={address.fullName} onChange={e => setAddress(a => ({...a, fullName: e.target.value}))} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={address.phone} onChange={e => setAddress(a => ({...a, phone: e.target.value}))} className="mt-1" /></div>
              <div className="sm:col-span-2"><Label>Address</Label><Textarea value={address.addressLine1} onChange={e => setAddress(a => ({...a, addressLine1: e.target.value}))} className="mt-1" /></div>
              <div><Label>City</Label><Input value={address.city} onChange={e => setAddress(a => ({...a, city: e.target.value}))} className="mt-1" /></div>
              <div><Label>State</Label><Input value={address.state} onChange={e => setAddress(a => ({...a, state: e.target.value}))} className="mt-1" /></div>
              <div><Label>Pincode</Label><Input value={address.pincode} onChange={e => setAddress(a => ({...a, pincode: e.target.value}))} className="mt-1" /></div>
            </div>
          </Card>

          <div className="flex items-center gap-2 mb-4">
            <Checkbox id="same-billing" checked={sameAddress} onCheckedChange={(v) => setSameAddress(v === true)} />
            <Label htmlFor="same-billing" className="text-sm">Billing address same as shipping</Label>
          </div>
          {!sameAddress && (
            <Card className="p-4 mb-4 border-dashed">
              <h3 className="font-semibold mb-3">Billing Address</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Full Name</Label><Input className="mt-1" value={billingForm.fullName} onChange={e => setBillingForm(f => ({...f, fullName: e.target.value}))} /></div>
                <div><Label>Phone</Label><Input className="mt-1" value={billingForm.phone} onChange={e => setBillingForm(f => ({...f, phone: e.target.value}))} /></div>
                <div className="sm:col-span-2"><Label>Address</Label><Textarea className="mt-1" rows={2} value={billingForm.address} onChange={e => setBillingForm(f => ({...f, address: e.target.value}))} /></div>
                <div><Label>City</Label><Input className="mt-1" value={billingForm.city} onChange={e => setBillingForm(f => ({...f, city: e.target.value}))} /></div>
                <div><Label>State</Label><Input className="mt-1" value={billingForm.state} onChange={e => setBillingForm(f => ({...f, state: e.target.value}))} /></div>
                <div><Label>Pincode</Label><Input className="mt-1" value={billingForm.pincode} onChange={e => setBillingForm(f => ({...f, pincode: e.target.value}))} /></div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard size={20} className="text-orange-500" />Payment Method</h2>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              {[
                { value: 'COD', label: 'Cash on Delivery', icon: <Banknote size={20} />, desc: 'Pay when you receive' },
                { value: 'UPI', label: 'UPI Payment', icon: <Smartphone size={20} />, desc: 'GPay, PhonePe, Paytm' },
                { value: 'Credit Card', label: 'Credit Card', icon: <CreditCard size={20} />, desc: 'Visa, Mastercard' },
                { value: 'Debit Card', label: 'Debit Card', icon: <CreditCard size={20} />, desc: 'All banks supported' },
                { value: 'Net Banking', label: 'Net Banking', icon: <Building2 size={20} />, desc: 'All major banks' },
              ].map(pm => (
                <Label key={pm.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${paymentMethod === pm.value ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                  <RadioGroupItem value={pm.value} />
                  <span className="text-orange-500">{pm.icon}</span>
                  <div><p className="font-medium text-sm">{pm.label}</p><p className="text-xs text-muted-foreground">{pm.desc}</p></div>
                </Label>
              ))}
            </RadioGroup>

            {/* UPI Form */}
            {paymentMethod === 'UPI' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-lg border bg-muted/30 space-y-3">
                <div className="flex items-center gap-2 mb-2"><Smartphone size={16} className="text-orange-500" /><span className="font-medium text-sm">Enter UPI Details</span></div>
                <div><Label>UPI ID *</Label><Input className="mt-1" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value.toLowerCase())} />
                {paymentErrors.upiId && <p className="text-xs text-destructive mt-1">{paymentErrors.upiId}</p>}</div>
                <p className="text-xs text-muted-foreground">Pay using Google Pay, PhonePe, Paytm or any UPI app</p>
              </motion.div>
            )}

            {/* Credit/Debit Card Form */}
            {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-lg border bg-muted/30 space-y-3">
                <div className="flex items-center gap-2 mb-2"><CreditCard size={16} className="text-orange-500" /><span className="font-medium text-sm">Enter {paymentMethod} Details</span></div>
                <div><Label>Card Number *</Label><Input className="mt-1 font-mono tracking-wider" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} maxLength={19} />
                {paymentErrors.cardNumber && <p className="text-xs text-destructive mt-1">{paymentErrors.cardNumber}</p>}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Expiry *</Label><Input className="mt-1 font-mono" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} />
                  {paymentErrors.cardExpiry && <p className="text-xs text-destructive mt-1">{paymentErrors.cardExpiry}</p>}</div>
                  <div><Label>CVV *</Label><Input className="mt-1 font-mono" type="password" placeholder="•••" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))} maxLength={4} />
                  {paymentErrors.cardCvv && <p className="text-xs text-destructive mt-1">{paymentErrors.cardCvv}</p>}</div>
                </div>
                <div><Label>Cardholder Name *</Label><Input className="mt-1" placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)} />
                {paymentErrors.cardName && <p className="text-xs text-destructive mt-1">{paymentErrors.cardName}</p>}</div>
                <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <ShieldCheck size={14} className="text-green-500" /> Your card details are encrypted and secure
                </div>
              </motion.div>
            )}

            {/* Net Banking Form */}
            {paymentMethod === 'Net Banking' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-lg border bg-muted/30 space-y-3">
                <div className="flex items-center gap-2 mb-2"><Building2 size={16} className="text-orange-500" /><span className="font-medium text-sm">Select Your Bank</span></div>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger><SelectValue placeholder="Choose a bank" /></SelectTrigger>
                  <SelectContent className="max-h-60">{banks.map(bank => <SelectItem key={bank} value={bank}>{bank}</SelectItem>)}</SelectContent>
                </Select>
                {paymentErrors.bank && <p className="text-xs text-destructive mt-1">{paymentErrors.bank}</p>}
                <p className="text-xs text-muted-foreground">You will be redirected to your bank's login page</p>
              </motion.div>
            )}
          </Card>
        </div>

        <Card className="p-6 h-fit sticky top-24 space-y-4">
          <h3 className="font-bold text-lg">Order Summary</h3>
          <ScrollArea className="max-h-48"><div className="space-y-3">{items.map(item => (
            <div key={item.productId} className="flex gap-3"><div className="w-12 h-12 rounded bg-muted shrink-0 overflow-hidden">{item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}</div><div className="flex-1 min-w-0"><p className="text-sm truncate">{item.name}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity}</p></div><p className="text-sm font-medium shrink-0">{formatCurrency(item.price * item.quantity)}</p></div>
          ))}</div></ScrollArea>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(getSubtotal())}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{getShipping() === 0 ? 'FREE' : formatCurrency(getShipping())}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(getTax())}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(couponDiscount)}</span></div>}
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-orange-500">{formatCurrency(getTotal())}</span></div>
          </div>
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg" onClick={handlePlaceOrder} disabled={placing}>
            {placing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Placing Order...</> : `Place Order • ${formatCurrency(getTotal())}`}
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default CheckoutPage;