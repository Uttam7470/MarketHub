import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/reviews/[id]/helpful
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const review = await db.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });

    const updated = await db.review.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to mark helpful';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}