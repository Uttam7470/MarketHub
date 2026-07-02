import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/analytics
export async function GET() {
  try {
    // Top searches
    const topSearches = await db.searchAnalytics.findMany({
      where: { noResults: false },
      orderBy: { searchCount: 'desc' },
      take: 10,
    });

    // No-result searches
    const noResultSearches = await db.searchAnalytics.findMany({
      where: { noResults: true },
      orderBy: { searchCount: 'desc' },
      take: 10,
    });

    // Customer growth (monthly new users for last 6 months)
    const customerGrowth = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        return db.user
          .count({ where: { role: 'CUSTOMER', createdAt: { gte: start, lte: end } } })
          .then(count => ({
            month: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
            newUsers: count,
          }));
      })
    );

    // Vendor performance (top 10 by revenue)
    const vendorPerformance = await db.vendor.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        businessName: true,
        totalSales: true,
        totalRevenue: true,
        rating: true,
        _count: { select: { products: true } },
      },
      orderBy: { totalSales: 'desc' },
      take: 10,
    });

    // Average order value
    const orderStats = await db.order.aggregate({
      _avg: { total: true },
      _count: true,
      where: { paymentStatus: 'PAID' },
    });
    const avgOrderValue = orderStats._avg.total || 0;

    // Conversion estimate (orders / (orders + carts)) - rough approximation
    const [paidOrders, activeCarts] = await Promise.all([
      db.order.count({ where: { paymentStatus: 'PAID' } }),
      db.cartItem.groupBy({ by: ['userId', 'sessionId'], where: { userId: { not: null } } }).then(r => r.length),
    ]);
    const conversionEstimate = activeCarts > 0 ? ((paidOrders / (paidOrders + activeCarts)) * 100).toFixed(2) : '0';

    return NextResponse.json({
      success: true,
      data: {
        topSearches,
        noResultSearches,
        customerGrowth,
        vendorPerformance,
        avgOrderValue,
        conversionEstimate: parseFloat(conversionEstimate as string),
        totalPaidOrders: paidOrders,
        activeCarts,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load analytics';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}