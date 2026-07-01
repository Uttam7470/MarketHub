import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/vendors/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vendor = await db.vendor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true } },
        products: { include: { category: true, brand: true, images: { take: 1 } }, take: 20, orderBy: { createdAt: 'desc' } },
        settlements: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { products: true } },
      },
    });
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: vendor });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vendor';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/vendors/[id] - Update vendor (approve, suspend, etc.)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const vendor = await db.vendor.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, data: vendor });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update vendor';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}