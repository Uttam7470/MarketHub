import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/dashboard
export async function GET() {
  try {
    const [
      totalRevenue, totalOrders, totalProducts, totalCustomers, totalVendors,
      pendingVendors, recentOrders, topProducts, monthlySales
    ] = await Promise.all([
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
      db.order.count(),
      db.product.count({ where: { isActive: true } }),
      db.user.count({ where: { role: 'CUSTOMER' } }),
      db.vendor.count({ where: { status: 'APPROVED' } }),
      db.vendor.count({ where: { status: 'PENDING' } }),
      db.order.findMany({ include: { items: true, user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }),
      db.product.findMany({ orderBy: { totalSold: 'desc' }, take: 5, include: { vendor: { select: { businessName: true } }, images: { take: 1 } } }),
      Promise.all(
        Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          const start = new Date(date.getFullYear(), date.getMonth(), 1);
          const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
          return db.order.aggregate({
            _sum: { total: true },
            where: { createdAt: { gte: start, lte: end }, paymentStatus: 'PAID' },
          }).then(r => ({ month: date.toLocaleString('default', { month: 'short' }), sales: r._sum.total || 0 }));
        })
      ),
    ]);

    const platformEarnings = (totalRevenue._sum.total || 0) * 0.12;

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        totalProducts,
        totalCustomers,
        totalVendors,
        pendingVendors,
        platformEarnings,
        recentOrders,
        topProducts,
        monthlySales,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load dashboard';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}