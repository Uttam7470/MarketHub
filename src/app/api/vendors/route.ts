import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/vendors?status=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [vendors, total] = await Promise.all([
      db.vendor.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
          _count: { select: { products: true } },
          ...(includeProducts ? { products: { take: 5, include: { category: true, images: true } } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.vendor.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: vendors, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vendors';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/vendors - Create vendor application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vendor = await db.vendor.create({
      data: {
        ...body,
        slug: body.slug || body.businessName.toLowerCase().replace(/\s+/g, '-'),
        status: 'PENDING',
      },
    });
    return NextResponse.json({ success: true, data: vendor }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create vendor';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}