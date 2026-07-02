import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/notifications?userId=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.notification.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/notifications - Mark all read or mark one read
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, notificationId, markAllRead } = body;

    if (notificationId) {
      // Mark single notification as read
      const updated = await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (markAllRead && userId) {
      // Mark all notifications as read for user
      const result = await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, data: { marked: result.count } });
    }

    return NextResponse.json({ success: false, error: 'Provide notificationId or markAllRead with userId' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update notifications';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const notification = await db.notification.create({ data: body });
    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create notification';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}