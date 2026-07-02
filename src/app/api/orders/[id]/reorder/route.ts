import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/orders/[id]/reorder - Add order items to cart
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId, sessionId } = await req.json();

    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

    const cartItems = [];

    for (const item of order.items) {
      if (item.cancelledAt) continue; // Skip cancelled items

      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive || product.stock < 1) continue;

      const identifier = userId ? { userId, productId: item.productId } : { sessionId, productId: item.productId };
      const existing = await db.cartItem.findFirst({ where: identifier });

      if (existing) {
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
        cartItems.push(existing.id);
      } else {
        const created = await db.cartItem.create({
          data: {
            userId,
            sessionId,
            productId: item.productId,
            quantity: item.quantity,
          },
        });
        cartItems.push(created.id);
      }
    }

    return NextResponse.json({ success: true, data: { addedCount: cartItems.length, cartItemIds: cartItems } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to reorder';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}