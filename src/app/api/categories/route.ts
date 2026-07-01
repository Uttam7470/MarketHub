import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/categories - List all categories with hierarchy
export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        children: { where: { isActive: true }, include: { _count: { select: { products: true } } } },
        _count: { select: { products: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    // Only return root categories (with children)
    const roots = categories.filter(c => !c.parentId);
    return NextResponse.json({ success: true, data: roots });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch categories';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/categories - Create category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = await db.category.create({
      data: { ...body, slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-') },
    });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create category';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/categories - Update category
export async function PUT(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    const category = await db.category.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: category });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update category';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/categories?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete category';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}