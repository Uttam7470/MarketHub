import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT() {
  try {
    await db.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}