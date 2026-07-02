import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/orders/[id]/cancel - Cancel an order
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { reason } = await req.json();

    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    if (!['NEW', 'PROCESSING'].includes(order.status)) {
      return NextResponse.json({ success: false, error: 'Order cannot be cancelled in current status' }, { status: 400 });
    }

    // Update order status
    const updated = await db.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason || 'Cancelled by customer',
        cancelledAt: new Date(),
        paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : order.paymentStatus,
      },
      include: { items: true },
    });

    // Restore stock for all items
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity }, totalSold: { decrement: item.quantity } },
      });
      await db.inventoryHistory.create({
        data: {
          productId: item.productId,
          type: 'ADDED',
          quantity: item.quantity,
          note: `Order ${order.orderNumber} cancelled - stock restored`,
        },
      });
    }

    // Log activity
    await db.activityLog.create({
      userId: order.userId,
      action: 'ORDER_CANCELLED',
      entityType: 'ORDER',
      entityId: id,
      details: `Cancelled order ${order.orderNumber}. Reason: ${reason || 'Customer requested'}`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to cancel order';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}