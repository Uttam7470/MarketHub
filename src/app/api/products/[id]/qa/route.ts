import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products/[id]/qa
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const questions = await db.productQA.findMany({
      where: { productId: id, isActive: true },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: questions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch questions';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/products/[id]/qa - Ask a question (auth required)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId, question } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (!question?.trim()) {
      return NextResponse.json({ success: false, error: 'Question is required' }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

    const qa = await db.productQA.create({
      data: { productId: id, userId, question: question.trim() },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, data: qa }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create question';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}