import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/payouts?status=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [payouts, total] = await Promise.all([
      db.payout.findMany({
        where,
        include: {
          vendor: { select: { id: true, businessName: true, slug: true, bankName: true, bankAccount: true, bankIfsc: true, user: { select: { name: true, email: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.payout.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: payouts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch payouts';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}