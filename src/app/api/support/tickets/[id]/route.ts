import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/support/tickets/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        messages: { orderBy: { createdAt: 'asc' } },
        _count: { select: { messages: true } },
      },
    });

    if (!ticket) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: ticket });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch ticket';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/support/tickets/[id] - Update ticket status or add message
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, assignedTo, message, isStaff } = body;

    const ticket = await db.supportTicket.findUnique({ where: { id } });
    if (!ticket) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });

    // If message is provided, add it
    if (message?.trim()) {
      await db.ticketMessage.create({
        data: {
          ticketId: id,
          userId: isStaff ? undefined : body.userId,
          message: message.trim(),
          isStaff: !!isStaff,
        },
      });
      // Auto-update status when staff replies
      if (isStaff && ticket.status === 'OPEN') {
        await db.supportTicket.update({ where: { id }, data: { status: 'IN_PROGRESS' } });
      }
    }

    // Update ticket fields
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const updated = await db.supportTicket.update({
      where: { id },
      data: updateData,
      include: { messages: { orderBy: { createdAt: 'asc' } }, user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update ticket';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/support/tickets/[id] - Add message to ticket
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId, message, isStaff } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const ticket = await db.supportTicket.findUnique({ where: { id } });
    if (!ticket) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });

    const msg = await db.ticketMessage.create({
      data: {
        ticketId: id,
        userId: isStaff ? undefined : userId,
        message: message.trim(),
        isStaff: !!isStaff,
      },
    });

    // Auto-update status
    if (isStaff && ticket.status === 'OPEN') {
      await db.supportTicket.update({ where: { id }, data: { status: 'IN_PROGRESS' } });
    }

    return NextResponse.json({ success: true, data: msg }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add message';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}