import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    const productId = searchParams.get('productId');

    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      return NextResponse.json({ success: false, error: 'Invalid pincode' }, { status: 400 });
    }

    // Simulate delivery check
    // Some pincodes are "not serviceable" for demo purposes
    const notServiceable = ['000000', '111111', '999999'];
    const available = !notServiceable.includes(pincode);

    let estimatedDays = 5;
    if (productId) {
      const product = await db.product.findUnique({ where: { id: productId }, select: { estimatedDeliveryDays: true } });
      if (product) estimatedDays = product.estimatedDeliveryDays || 5;
    }

    // Add 2-4 random days for shipping
    const shippingDays = Math.floor(Math.random() * 3) + 2;
    const totalDays = estimatedDays + shippingDays;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + totalDays);

    return NextResponse.json({
      success: true,
      data: {
        available,
        estimatedDate: estimatedDate.toISOString().split('T')[0],
        estimatedDays: totalDays,
        pincode,
        message: available
          ? `Delivery available by ${estimatedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
          : 'Delivery is not available to this pincode',
      },
    });
  } catch (error: any) {
    console.error('Delivery check error:', error);
    return NextResponse.json({ success: false, error: 'Failed to check delivery' }, { status: 500 });
  }
}