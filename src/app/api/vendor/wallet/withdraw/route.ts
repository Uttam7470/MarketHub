import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/vendor/wallet/withdraw - Request a withdrawal
export async function POST(req: NextRequest) {
  try {
    const { vendorId, amount, notes } = await req.json();

    if (!vendorId || !amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'vendorId and valid amount are required' }, { status: 400 });
    }

    // Get or create wallet
    let wallet = await db.vendorWallet.findUnique({ where: { vendorId } });
    if (!wallet) {
      wallet = await db.vendorWallet.create({ data: { vendorId } });
    }

    if (wallet.availableBalance < amount) {
      return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
    }

    // Get vendor bank details
    const vendor = await db.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });

    // Use DB transaction to atomically deduct wallet, create transaction record, and create payout
    const newBalance = wallet.availableBalance - amount;
    const [, , payout] = await db.$transaction([
      // 1. Deduct from available balance, add to pending balance
      db.vendorWallet.update({
        where: { vendorId },
        data: { availableBalance: newBalance, pendingBalance: wallet.pendingBalance + amount },
      }),
      // 2. Create wallet transaction record
      db.walletTransaction.create({
        data: {
          vendorId,
          type: 'WITHDRAWAL',
          amount: -amount,
          balance: newBalance,
          description: notes || 'Withdrawal request',
        },
      }),
      // 3. Create payout request
      db.payout.create({
        data: {
          vendorId,
          amount,
          status: 'PENDING',
          bankName: vendor.bankName,
          bankAccount: vendor.bankAccount,
          bankIfsc: vendor.bankIfsc,
          notes: notes || 'Withdrawal request',
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: payout }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to request withdrawal';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}