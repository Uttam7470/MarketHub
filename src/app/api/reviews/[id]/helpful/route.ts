import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const review = await db.review.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: { helpfulCount: review.helpfulCount } });
  } catch (error: any) {
    console.error('Review helpful error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}