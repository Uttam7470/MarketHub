import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET /api/search/suggestions?q=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    if (!q.trim()) return NextResponse.json({ success: true, data: [] });

    const userId = searchParams.get('userId') || undefined;
    const sessionId = req.headers.get('x-session-id') || (userId ? undefined : randomUUID());

    const products = await db.product.findMany({
      where: {
        name: { contains: q },
        isActive: true,
        productStatus: 'PUBLISHED',
        deletedAt: null,
      },
      select: { id: true, name: true, slug: true, price: true, compareAtPrice: true, images: { take: 1, select: { url: true } } },
      take: 5,
      orderBy: { totalSold: 'desc' },
    });

    const resultCount = products.length;

    // Log to SearchAnalytics (upsert)
    await db.searchAnalytics.upsert({
      where: { query: q },
      create: {
        query: q,
        searchCount: 1,
        resultCount,
        noResults: resultCount === 0,
      },
      update: {
        searchCount: { increment: 1 },
        resultCount,
        noResults: resultCount === 0,
        lastSearched: new Date(),
      },
    });

    // Log to SearchHistory
    await db.searchHistory.create({
      data: {
        userId,
        sessionId,
        query: q,
        results: resultCount,
      },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch suggestions';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}