import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/coupons
export async function GET() {
  try {
    const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: coupons });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch coupons';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/coupons
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coupon = await db.coupon.create({ data: body });
    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create coupon';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/coupons?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete coupon';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}