import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/support/tickets?userId=&status=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { messages: true } } },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: tickets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tickets';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/support/tickets - Create a support ticket
export async function POST(req: NextRequest) {
  try {
    const { userId, subject, message, priority, category } = await req.json();

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ success: false, error: 'Subject and message are required' }, { status: 400 });
    }

    const ticket = await db.supportTicket.create({
      data: {
        userId,
        subject: subject.trim(),
        priority: priority || 'MEDIUM',
        category: category || 'GENERAL',
        messages: {
          create: {
            userId,
            message: message.trim(),
            isStaff: false,
          },
        },
      },
      include: { messages: true, user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create ticket';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}