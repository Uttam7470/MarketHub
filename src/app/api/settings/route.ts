import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings
export async function GET() {
  try {
    let settings = await db.platformSettings.findFirst();
    if (!settings) {
      settings = await db.platformSettings.create({
        data: { siteName: 'MarketHub', currency: 'INR', currencySymbol: '₹', taxRate: 18, freeShippingMin: 500 },
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/settings
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const settings = await db.platformSettings.upsert({
      where: { id: body.id || 'default-id' },
      update: body,
      create: body,
    });
    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}