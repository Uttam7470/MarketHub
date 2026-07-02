import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/orders/[id]/return - Create a return request
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { orderItemId, userId, reason, productId } = await req.json();

    if (!orderItemId || !reason) {
      return NextResponse.json({ success: false, error: 'orderItemId and reason are required' }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    if (!['DELIVERED', 'SHIPPED'].includes(order.status)) {
      return NextResponse.json({ success: false, error: 'Order must be delivered or shipped to request a return' }, { status: 400 });
    }

    const orderItem = order.items.find(item => item.id === orderItemId);
    if (!orderItem) return NextResponse.json({ success: false, error: 'Order item not found' }, { status: 404 });

    // Check if return already exists for this item
    const existingReturn = await db.returnRequest.findFirst({
      where: { orderItemId, status: { in: ['PENDING', 'APPROVED'] } },
    });
    if (existingReturn) {
      return NextResponse.json({ success: false, error: 'Return request already exists for this item' }, { status: 400 });
    }

    const returnRequest = await db.returnRequest.create({
      data: {
        orderId: id,
        orderItemId,
        userId: userId || order.userId,
        productId: productId || orderItem.productId,
        reason,
        refundAmount: orderItem.total,
      },
    });

    // Log activity
    await db.activityLog.create({
      userId: userId || order.userId,
      action: 'RETURN_REQUESTED',
      entityType: 'RETURN',
      entityId: returnRequest.id,
      details: `Return requested for order ${order.orderNumber}, item: ${orderItem.productName}`,
    });

    return NextResponse.json({ success: true, data: returnRequest }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create return request';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}