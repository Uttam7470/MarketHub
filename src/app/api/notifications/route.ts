import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/notifications?userId=
export async function GET(req: NextRequest) {
  try {
    const userId = new URL(req.url).searchParams.get('userId');
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ success: true, data: notifications });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
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