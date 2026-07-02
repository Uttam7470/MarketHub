import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/vendor/wallet?vendorId=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!vendorId) {
      return NextResponse.json({ success: false, error: 'vendorId is required' }, { status: 400 });
    }

    const [wallet, transactions, total] = await Promise.all([
      db.vendorWallet.findUnique({ where: { vendorId } }),
      db.walletTransaction.findMany({
        where: { vendorId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.walletTransaction.count({ where: { vendorId } }),
    ]);

    // Auto-create wallet if not exists
    let walletData = wallet;
    if (!walletData) {
      walletData = await db.vendorWallet.create({
        data: { vendorId },
      });
    }

    return NextResponse.json({
      success: true,
      data: { wallet: walletData, transactions },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch wallet';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}