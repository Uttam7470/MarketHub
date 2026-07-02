import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/faq?category=
export async function GET(req: NextRequest) {
  try {
    const category = new URL(req.url).searchParams.get('category');

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;

    const faqs = await db.fAQ.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: faqs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch FAQs';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}