import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const collections = await db.collection.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ success: true, data: collections });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, productIds } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const collection = await db.collection.create({
      data: { name, slug, description, productIds: JSON.stringify(productIds || []) },
    });
    return NextResponse.json({ success: true, data: collection });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}