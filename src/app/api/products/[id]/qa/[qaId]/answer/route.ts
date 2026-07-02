import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/products/[id]/qa/[qaId]/answer - Vendor answers a question
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; qaId: string }> }) {
  try {
    const { id, qaId } = await params;
    const { vendorId, answer } = await req.json();

    if (!vendorId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (!answer?.trim()) {
      return NextResponse.json({ success: false, error: 'Answer is required' }, { status: 400 });
    }

    // Verify the product belongs to this vendor
    const product = await db.product.findUnique({ where: { id, vendorId } });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found or not yours' }, { status: 404 });
    }

    const qa = await db.productQA.findUnique({ where: { id: qaId, productId: id } });
    if (!qa) return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });

    const updated = await db.productQA.update({
      where: { id: qaId },
      data: { answer: answer.trim(), answeredBy: vendorId, answeredAt: new Date() },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to answer question';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}