import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/dashboard
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalRevenue, todayRevenue, totalOrders, todayOrders, totalProducts, totalCustomers, totalVendors,
      pendingVendors, pendingReturns, lowStockProducts, recentOrders, topProducts, monthlySales,
      topCategories,
    ] = await Promise.all([
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: today } } }),
      db.order.count(),
      db.order.count({ where: { createdAt: { gte: today } } }),
      db.product.count({ where: { isActive: true } }),
      db.user.count({ where: { role: 'CUSTOMER' } }),
      db.vendor.count({ where: { status: 'APPROVED' } }),
      db.vendor.count({ where: { status: 'PENDING' } }),
      db.returnRequest.count({ where: { status: { in: ['PENDING', 'APPROVED'] } } }),
      db.product.count({ where: { isActive: true, stock: { lte: db.product.fields.lowStockAlert }, deletedAt: null } }),
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
      // Top categories by product count and revenue
      db.category.findMany({
        where: { isActive: true, parentId: null },
        include: {
          _count: { select: { products: true } },
          products: {
            select: { price: true, totalSold: true },
          },
        },
        take: 10,
      }).then(categories =>
        categories.map(cat => {
          const count = cat._count.products;
          const revenue = cat.products.reduce((sum, p) => sum + p.price * p.totalSold, 0);
          return { name: cat.name, count, revenue };
        }).sort((a, b) => b.revenue - a.revenue)
      ),
    ]);

    const platformEarnings = (totalRevenue._sum.total || 0) * 0.12;

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.total || 0,
        todayRevenue: todayRevenue._sum.total || 0,
        todayOrders,
        totalOrders,
        totalProducts,
        totalCustomers,
        totalVendors,
        activeVendors: totalVendors,
        pendingVendors,
        platformEarnings,
        pendingReturns,
        lowStockProducts,
        recentOrders,
        topProducts,
        topCategories,
        monthlySales,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load dashboard';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}