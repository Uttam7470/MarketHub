import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const vendors = await db.vendor.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        wallet: true,
      },
      orderBy: { totalRevenue: 'desc' },
    });
    return NextResponse.json({ success: true, data: vendors });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}