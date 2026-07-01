import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/vendor/dashboard?vendorId=xxx
export async function GET(req: NextRequest) {
  try {
    const vendorId = new URL(req.url).searchParams.get('vendorId');
    if (!vendorId) return NextResponse.json({ success: false, error: 'Vendor ID required' }, { status: 400 });

    const vendor = await db.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });

    const [totalProducts, recentOrders, topProducts, monthlySales] = await Promise.all([
      db.product.count({ where: { vendorId, isActive: true } }),
      db.order.findMany({
        where: { items: { some: { vendorId } } },
        include: { items: { where: { vendorId } }, user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      db.product.findMany({ where: { vendorId }, orderBy: { totalSold: 'desc' }, take: 5, include: { images: { take: 1 } } } ),
      Promise.all(
        Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          const start = new Date(date.getFullYear(), date.getMonth(), 1);
          const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
          return db.orderItem.aggregate({
            _sum: { total: true },
            where: { vendorId, order: { createdAt: { gte: start, lte: end }, paymentStatus: 'PAID' } },
          }).then(r => ({ month: date.toLocaleString('default', { month: 'short' }), sales: r._sum.total || 0 }));
        })
      ),
    ]);

    const vendorOrders = await db.orderItem.findMany({ where: { vendorId } });
    const totalOrders = new Set(vendorOrders.map(o => o.orderId)).size;

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: vendor.totalRevenue,
        totalOrders,
        totalProducts,
        avgRating: vendor.rating,
        recentOrders,
        topProducts,
        monthlySales,
        lowStockProducts: await db.product.count({ where: { vendorId, stock: { lte: 5 }, isActive: true } }),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load vendor dashboard';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}