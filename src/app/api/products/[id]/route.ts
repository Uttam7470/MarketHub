import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        vendor: { select: { id: true, businessName: true, slug: true, logo: true, rating: true } },
        category: { select: { id: true, name: true, slug: true, parentId: true } },
        brand: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        specs: true,
        reviews: { include: { user: { select: { id: true, name: true, avatar: true } } }, take: 10, orderBy: { createdAt: 'desc' } },
        _count: { select: { reviews: true, orderItems: true } },
      },
    });
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}