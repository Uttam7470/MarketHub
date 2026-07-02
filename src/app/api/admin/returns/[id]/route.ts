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

    const updated = await db.returnRequest.update({
      where: { id },
      data: updateData,
      include: { order: { select: { orderNumber: true, userId: true } } },
    });

    // Notify user
    if (updated.order?.userId) {
      let title = '';
      let msg = '';
      if (status === 'APPROVED') {
        title = 'Return Request Approved';
        msg = `Your return request for order ${updated.order.orderNumber} has been approved. Refund of ₹${returnRequest.refundAmount || 0} will be processed.`;
      } else if (status === 'REJECTED') {
        title = 'Return Request Rejected';
        msg = `Your return request for order ${updated.order.orderNumber} has been rejected.${adminNotes ? ` Reason: ${adminNotes}` : ''}`;
      } else if (status === 'COMPLETED') {
        title = 'Refund Processed';
        msg = `Your refund of ₹${returnRequest.refundAmount || 0} for order ${updated.order.orderNumber} has been processed.`;
      }

      if (title) {
        await db.notification.create({
          data: { userId: updated.order.userId, title, message: msg, type: status === 'REJECTED' ? 'WARNING' : 'SUCCESS' },
        });
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update return';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}