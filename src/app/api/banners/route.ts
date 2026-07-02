import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/banners?position=
export async function GET(req: NextRequest) {
  try {
    const position = new URL(req.url).searchParams.get('position');
    const where: Record<string, unknown> = { isActive: true };
    if (position) where.position = position;
    const banners = await db.banner.findMany({ where, orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ success: true, data: banners });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch banners';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/banners
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const banner = await db.banner.create({ data: body });
    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create banner';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/banners?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    await db.banner.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete banner';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}