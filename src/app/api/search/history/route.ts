import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/search/history?userId=&sessionId=&limit=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    else if (sessionId) where.sessionId = sessionId;

    const history = await db.searchHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch search history';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}