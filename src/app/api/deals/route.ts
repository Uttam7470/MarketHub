import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/deals
export async function GET() {
  try {
    const deals = await db.deal.findMany({
      where: { isActive: true },
      include: { product: { select: { id: true, name: true, slug: true, price: true, compareAtPrice: true, images: { take: 1 } } } },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: deals });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch deals';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/deals - Create a deal (admin)
export async function POST(req: NextRequest) {
  try {
    const { title, description, productId, discountPercent, startDate, endDate, sortOrder } = await req.json();

    if (!title || !productId || !discountPercent || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'title, productId, discountPercent, startDate, endDate are required' }, { status: 400 });
    }

    // Check product doesn't already have a deal
    const existingDeal = await db.deal.findUnique({ where: { productId } });
    if (existingDeal) {
      return NextResponse.json({ success: false, error: 'Product already has a deal' }, { status: 400 });
    }

    const deal = await db.deal.create({
      data: {
        title,
        description,
        productId,
        discountPercent,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        sortOrder: sortOrder || 0,
      },
      include: { product: { select: { id: true, name: true, slug: true, price: true, images: { take: 1 } } } },
    });

    return NextResponse.json({ success: true, data: deal }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create deal';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/deals?id= - Delete a deal (admin)
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id query parameter is required' }, { status: 400 });
    }

    await db.deal.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete deal';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}