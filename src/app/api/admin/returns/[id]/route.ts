import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/admin/returns/[id] - Approve/reject/complete return
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, adminNotes, refundAmount } = await req.json();

    const returnRequest = await db.returnRequest.findUnique({ where: { id } });
    if (!returnRequest) return NextResponse.json({ success: false, error: 'Return request not found' }, { status: 404 });

    if (!['APPROVED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status, adminNotes };
    if (refundAmount !== undefined) updateData.refundAmount = refundAmount;

    // If completing the return, update refund status
    if (status === 'COMPLETED') {
      updateData.refundStatus = 'COMPLETED';
      updateData.refundProcessedAt = new Date();
    }

    // For COMPLETED status, use interactive transaction to atomically:
    // - Update return request
    // - Create vendor wallet transaction (refund deduction)
    // - Restore product stock
    // - Notify user
    if (status === 'COMPLETED') {
      // Pre-fetch order item to get vendorId for wallet operations
      const orderItem = await db.orderItem.findUnique({
        where: { id: returnRequest.orderItemId },
        select: { vendorId: true, productId: true, quantity: true },
      });

      const finalRefundAmount = refundAmount ?? returnRequest.refundAmount ?? 0;

      const updated = await db.$transaction(async (tx) => {
        // 1. Update return request with refund status
        const result = await tx.returnRequest.update({
          where: { id },
          data: updateData,
          include: { order: { select: { orderNumber: true, userId: true } } },
        });

        // 2. Deduct refund from vendor wallet and create wallet transaction
        if (orderItem?.vendorId && finalRefundAmount > 0) {
          const vendorWallet = await tx.vendorWallet.findUnique({ where: { vendorId: orderItem.vendorId } });
          const currentBalance = vendorWallet?.availableBalance ?? 0;
          const newBalance = Math.max(0, currentBalance - finalRefundAmount);

          await tx.vendorWallet.update({
            where: { vendorId: orderItem.vendorId },
            data: { availableBalance: newBalance, totalEarned: { decrement: finalRefundAmount } },
          });

          await tx.walletTransaction.create({
            data: {
              vendorId: orderItem.vendorId,
              type: 'ADJUSTMENT',
              amount: -finalRefundAmount,
              balance: newBalance,
              description: `Refund for return #${id.substring(0, 8)}`,
            },
          });
        }

        // 3. Restore product stock
        if (returnRequest.productId && orderItem?.quantity) {
          await tx.product.update({
            where: { id: returnRequest.productId },
            data: { stock: { increment: orderItem.quantity } },
          });
        }

        // 4. Notify user
        if (result.order?.userId) {
          await tx.notification.create({
            data: {
              userId: result.order.userId,
              title: 'Refund Processed',
              message: `Your refund of ₹${finalRefundAmount} for order ${result.order.orderNumber} has been processed.`,
              type: 'SUCCESS',
            },
          });
        }

        return result;
      });

      return NextResponse.json({ success: true, data: updated });
    }

    // For APPROVED/REJECTED, use array-style transaction
    const order = await db.order.findUnique({ where: { id: returnRequest.orderId }, select: { orderNumber: true, userId: true } });
    let notificationTitle = '';
    let notificationMsg = '';
    let notificationType = 'SUCCESS';

    if (status === 'APPROVED') {
      notificationTitle = 'Return Request Approved';
      notificationMsg = `Your return request for order ${order?.orderNumber || ''} has been approved. Refund of ₹${returnRequest.refundAmount || 0} will be processed.`;
    } else if (status === 'REJECTED') {
      notificationTitle = 'Return Request Rejected';
      notificationMsg = `Your return request for order ${order?.orderNumber || ''} has been rejected.${adminNotes ? ` Reason: ${adminNotes}` : ''}`;
      notificationType = 'WARNING';
    }

    const txOps = [
      db.returnRequest.update({
        where: { id },
        data: updateData,
        include: { order: { select: { orderNumber: true, userId: true } } },
      }),
    ];

    if (notificationTitle && order?.userId) {
      txOps.push(
        db.notification.create({
          data: { userId: order.userId, title: notificationTitle, message: notificationMsg, type: notificationType },
        })
      );
    }

    const [updated] = await db.$transaction(txOps);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update return';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}