import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/vendor/coupons?vendorId=xxx
export async function GET(req: NextRequest) {
  try {
    const vendorId = new URL(req.url).searchParams.get('vendorId');
    if (!vendorId) {
      return NextResponse.json({ success: false, error: 'Vendor ID required' }, { status: 400 });
    }

    const coupons = await db.coupon.findMany({
      where: { vendorId, scope: 'VENDOR' },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: coupons });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch coupons';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/vendor/coupons — Vendor creates coupon
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendorId, code, discountType, discountValue, minOrder, maxDiscount, usageLimit, startDate, endDate, applicableType, autoSuggest } = body;

    if (!vendorId || !code || !discountValue) {
      return NextResponse.json({ success: false, error: 'Vendor ID, code, and discount value are required' }, { status: 400 });
    }

    // Verify vendor exists and is approved
    const vendor = await db.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }
    if (vendor.status !== 'APPROVED') {
      return NextResponse.json({ success: false, error: 'Vendor account must be approved to create coupons' }, { status: 403 });
    }

    const existing = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 400 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        scope: 'VENDOR',
        vendorId,
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 86400000),
        applicableType: 'VENDOR_PRODUCTS',
        autoSuggest: autoSuggest || false,
      },
    });

    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create coupon';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/vendor/coupons — Vendor updates their coupon
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, vendorId, ...data } = body;

    if (!id || !vendorId) {
      return NextResponse.json({ success: false, error: 'Coupon ID and Vendor ID are required' }, { status: 400 });
    }

    // Verify coupon belongs to this vendor
    const existing = await db.coupon.findFirst({ where: { id, vendorId, scope: 'VENDOR' } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Coupon not found or not owned by you' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = parseFloat(data.discountValue);
    if (data.minOrder !== undefined) updateData.minOrder = data.minOrder ? parseFloat(data.minOrder) : null;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount ? parseFloat(data.maxDiscount) : null;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.autoSuggest !== undefined) updateData.autoSuggest = data.autoSuggest;

    const coupon = await db.coupon.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: coupon });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update coupon';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/vendor/coupons?id=xxx&vendorId=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const vendorId = searchParams.get('vendorId');

    if (!id || !vendorId) {
      return NextResponse.json({ success: false, error: 'Coupon ID and Vendor ID are required' }, { status: 400 });
    }

    const coupon = await db.coupon.findFirst({ where: { id, vendorId, scope: 'VENDOR' } });
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found or not owned by you' }, { status: 404 });
    }

    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete coupon';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}