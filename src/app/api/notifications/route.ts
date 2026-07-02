import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({ success: true, data: notifications, unreadCount });
  } catch (error: any) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST: Create a notification (system use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type, link } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'title and message are required' }, { status: 400 });
    }

    const notification = await db.notification.create({
      data: {
        userId: userId || null,
        title,
        message,
        type: type || 'INFO',
        link: link || null,
      },
    });

    return NextResponse.json({ success: true, data: notification });
  } catch (error: any) {
    console.error('Notifications POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 });
  }
}

// PUT: Mark notification(s) as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, markAll } = body;

    if (markAll && userId) {
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ success: false, error: 'notificationId or userId+markAll required' }, { status: 400 });
  } catch (error: any) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
  }
}