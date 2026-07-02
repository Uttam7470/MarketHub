import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/search/popular
export async function GET() {
  try {
    const popular = await db.searchAnalytics.findMany({
      where: { noResults: false },
      orderBy: { searchCount: 'desc' },
      take: 10,
    });

    return NextResponse.json({ success: true, data: popular });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch popular searches';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}