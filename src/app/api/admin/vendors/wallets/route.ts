import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const wallets = await db.vendorWallet.findMany({
      include: {
        vendor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get latest 5 transactions per vendor
    const walletsWithTransactions = await Promise.all(
      wallets.map(async (wallet) => {
        const transactions = await db.walletTransaction.findMany({
          where: { vendorId: wallet.vendorId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });
        return { ...wallet, recentTransactions: transactions };
      })
    );

    return NextResponse.json({ success: true, data: walletsWithTransactions });
  } catch (error: any) {
    console.error('Vendor wallets error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch vendor wallets' }, { status: 500 });
  }
}