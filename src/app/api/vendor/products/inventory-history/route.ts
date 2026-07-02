import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({ success: false, error: 'vendorId is required' }, { status: 400 });
    }

    const history = await db.inventoryHistory.findMany({
      where: {
        product: { vendorId },
      },
      include: {
        product: {
          select: { name: true, sku: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    console.error('Inventory history error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory history' }, { status: 500 });
  }
}