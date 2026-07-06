import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders?userId=&vendorId=&status=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const vendorId = searchParams.get('vendorId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const includeItems = { include: { items: true, user: { select: { id: true, name: true, email: true } } } };

    let orders;
    let total;

    if (vendorId) {
      // For vendor: get orders that contain their products
      const vendorItems = await db.orderItem.findMany({
        where: { vendorId },
        distinct: ['orderId'],
        select: { orderId: true },
      });
      const orderIds = vendorItems.map(i => i.orderId);
      if (status) {
        const filteredItems = await db.orderItem.findMany({
          where: { vendorId, status },
          distinct: ['orderId'],
          select: { orderId: true },
        });
        const filteredIds = filteredItems.map(i => i.orderId);
        const finalIds = [...new Set(filteredIds)];
        [orders, total] = await Promise.all([
          db.order.findMany({
            where: { id: { in: finalIds } },
            ...includeItems,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          finalIds.length
        ]);
      } else {
        [orders, total] = await Promise.all([
          db.order.findMany({
            where: { id: { in: orderIds } },
            ...includeItems,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          orderIds.length
        ]);
      }
    } else {
      [orders, total] = await Promise.all([
        db.order.findMany({ where, ...includeItems, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
        db.order.count({ where }),
      ]);
    }

    return NextResponse.json({ success: true, data: orders, meta: { total: total as number, page, limit, totalPages: Math.ceil((total as number) / limit) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/orders - Create order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, items, shippingAddress, paymentMethod, couponId, discount: clientDiscount } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Items are required and must be a non-empty array' }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json({ success: false, error: 'Shipping address is required' }, { status: 400 });
    }

    const addr = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;

    if (!addr.name || !addr.address || !addr.city || !addr.pincode || !addr.phone) {
      return NextResponse.json({ success: false, error: 'Shipping address must include name, address, city, pincode, and phone' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(String(addr.pincode))) {
      return NextResponse.json({ success: false, error: 'Pincode must be exactly 6 digits' }, { status: 400 });
    }

    if (!/^\d{10,}$/.test(String(addr.phone).replace(/\D/g, ''))) {
      return NextResponse.json({ success: false, error: 'Phone number must be at least 10 digits' }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ success: false, error: 'Payment method is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId }, include: { vendor: true } });
      if (!product) {
        return NextResponse.json({ success: false, error: `"${item.name || item.productId}" not found. Please remove it from cart and add again.` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ success: false, error: `"${product.name}" has only ${product.stock} left in stock. Please reduce quantity or remove it.` }, { status: 400 });
      }
      if (!product.isActive) {
        return NextResponse.json({ success: false, error: `"${product.name}" is no longer available.` }, { status: 400 });
      }
      subtotal += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        vendorId: product.vendorId,
        productName: product.name,
        productImage: `https://placehold.co/100x100/333/fff?text=${encodeURIComponent(product.name.substring(0, 10))}`,
        quantity: item.quantity,
        price: product.price,
        total: product.price * item.quantity,
        vendorName: product.vendor.businessName,
      });
    }

    const shippingCost = subtotal >= 500 ? 0 : 99;
    const tax = subtotal * 0.18;
    const discount = Math.max(0, clientDiscount || 0);
    const total = Math.max(0, subtotal + shippingCost + tax - discount);
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Build transaction operations
    const txOps: any[] = [
      // 1. Create the order with its items
      db.order.create({
        data: {
          userId,
          orderNumber,
          subtotal, shippingCost, tax, discount, total,
          couponId: couponId || null,
          paymentMethod: paymentMethod || 'COD',
          shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
          items: { create: orderItems },
        },
        include: { items: true },
      }),
      // 2. Decrement stock and increment totalSold for each product
      ...items.map(item =>
        db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity }, totalSold: { increment: item.quantity } },
        })
      ),
      // 3. Update vendor totalSales for each vendor in the order
      ...orderItems.map(oi =>
        db.vendor.update({
          where: { id: oi.vendorId },
          data: { totalSales: { increment: oi.total } },
        })
      ),
      // 4. Create activity log
      db.activityLog.create({
        data: { userId, action: 'ORDER_PLACE', details: `Placed order ${orderNumber}` },
      }),
    ];

    // 5. If coupon used, increment usedCount
    if (couponId) {
      txOps.push(db.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } }));
    }

    const [order] = await db.$transaction(txOps);

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}