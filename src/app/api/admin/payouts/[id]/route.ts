import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/admin/payouts/[id] - Approve/process/complete payout
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, notes, processedBy } = await req.json();

    if (!['APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const payout = await db.payout.findUnique({ where: { id }, include: { vendor: true } });
    if (!payout) return NextResponse.json({ success: false, error: 'Payout not found' }, { status: 404 });

    const updateData: Record<string, unknown> = { status, notes };
    if (processedBy) updateData.processedBy = processedBy;

    // If approved, move from pending to available (already done at withdrawal)
    // If completed, finalize
    if (status === 'COMPLETED') {
      updateData.processedAt = new Date();
    }

    const updated = await db.payout.update({
      where: { id },
      data: updateData,
      include: { vendor: { select: { id: true, businessName: true, user: { select: { name: true, email: true } } } } },
    });

    // Update vendor wallet on completion or failure
    if (status === 'COMPLETED') {
      const wallet = await db.vendorWallet.findUnique({ where: { vendorId: payout.vendorId } });
      if (wallet) {
        await db.vendorWallet.update({
          where: { vendorId: payout.vendorId },
          data: {
            pendingBalance: { decrement: payout.amount },
            totalWithdrawn: { increment: payout.amount },
          },
        });
        await db.walletTransaction.create({
          data: {
            vendorId: payout.vendorId,
            type: 'WITHDRAWAL',
            amount: -payout.amount,
            balance: wallet.availableBalance,
            description: `Payout completed - ${payout.id}`,
            payoutId: payout.id,
          },
        });
      }
    } else if (status === 'FAILED') {
      // Return amount to available balance
      const wallet = await db.vendorWallet.findUnique({ where: { vendorId: payout.vendorId } });
      if (wallet) {
        await db.vendorWallet.update({
          where: { vendorId: payout.vendorId },
          data: {
            pendingBalance: { decrement: payout.amount },
            availableBalance: { increment: payout.amount },
          },
        });
      }
    }

    // Notify vendor
    await db.notification.create({
      data: {
        userId: payout.vendor.userId,
        title: status === 'COMPLETED' ? 'Payout Completed' : status === 'FAILED' ? 'Payout Failed' : 'Payout Update',
        message: status === 'COMPLETED'
          ? `Your payout of ₹${payout.amount} has been processed successfully.`
          : status === 'FAILED'
          ? `Your payout of ₹${payout.amount} has failed.${notes ? ` Reason: ${notes}` : ''}`
          : `Your payout of ₹${payout.amount} status changed to ${status}.`,
        type: status === 'COMPLETED' ? 'SUCCESS' : status === 'FAILED' ? 'ERROR' : 'INFO',
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update payout';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}