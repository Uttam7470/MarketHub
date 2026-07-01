import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/brands
export async function GET() {
  try {
    const brands = await db.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: brands });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch brands';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/brands
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const brand = await db.brand.create({
      data: { ...body, slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-') },
    });
    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create brand';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/brands?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    await db.brand.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Brand deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete brand';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}