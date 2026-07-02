import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/flash-sales
export async function GET() {
  try {
    const flashSales = await db.flashSale.findMany({
      where: { isActive: true },
      include: { items: { include: { product: { select: { id: true, name: true, slug: true, images: { take: 1 } } } }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: flashSales });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch flash sales';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/flash-sales - Create flash sale (admin)
export async function POST(req: NextRequest) {
  try {
    const { title, description, banner, startDate, endDate, items } = await req.json();

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'title, startDate, and endDate are required' }, { status: 400 });
    }

    const flashSale = await db.flashSale.create({
      data: {
        title,
        description,
        banner,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        items: items?.length
          ? {
              create: items.map((item: { productId: string; salePrice: number; originalPrice: number; totalStock: number; sortOrder?: number }) => ({
                productId: item.productId,
                salePrice: item.salePrice,
                originalPrice: item.originalPrice,
                discountPercent: Math.round(((item.originalPrice - item.salePrice) / item.originalPrice) * 100),
                totalStock: item.totalStock || 0,
                sortOrder: item.sortOrder || 0,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: flashSale }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create flash sale';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}