import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/search/popular
export async function GET() {
  try {
    const popular = await db.searchAnalytics.findMany({
      where: { noResults: false, searchCount: { gt: 0 } },
      orderBy: { searchCount: 'desc' },
      take: 10,
    });
    return NextResponse.json({ success: true, data: popular });
  } catch (error: unknown) {
    // If table doesn't exist yet or query fails, return empty array gracefully
    console.error('Popular search error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}