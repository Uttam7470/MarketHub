import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/vendors/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vendor = await db.vendor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true } },
        products: { include: { category: true, brand: true, images: { take: 1 } }, take: 20, orderBy: { createdAt: 'desc' } },
        settlements: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { products: true } },
      },
    });
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: vendor });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vendor';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/vendors/[id] - Update vendor (approve, suspend, reject, etc.)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existingVendor = await db.vendor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingVendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    const oldStatus = existingVendor.status;
    const newStatus = body.status;

    // Update vendor
    const vendor = await db.vendor.update({
      where: { id },
      data: body,
    });

    // Create notifications when status changes
    if (oldStatus !== newStatus) {
      if (newStatus === 'APPROVED') {
        await db.notification.create({
          data: {
            userId: existingVendor.userId,
            title: 'Vendor Account Approved!',
            message: `Congratulations! Your vendor account "${existingVendor.businessName}" has been approved. You can now start selling products.`,
            type: 'SUCCESS',
          },
        });
        // Mark user as verified on approval
        await db.user.update({
          where: { id: existingVendor.userId },
          data: { isVerified: true },
        });
        await db.activityLog.create({
          data: {
            userId: existingVendor.userId,
            action: 'VENDOR_APPROVED',
            details: `Vendor ${existingVendor.businessName} approved`,
          },
        });
      } else if (newStatus === 'REJECTED') {
        const reason = body.rejectionReason ? ` Reason: ${body.rejectionReason}` : '';
        await db.notification.create({
          data: {
            userId: existingVendor.userId,
            title: 'Vendor Application Rejected',
            message: `Your vendor application for "${existingVendor.businessName}" has been rejected.${reason} Please contact support if you believe this is an error.`,
            type: 'WARNING',
          },
        });
        await db.activityLog.create({
          data: {
            userId: existingVendor.userId,
            action: 'VENDOR_REJECTED',
            details: `Vendor ${existingVendor.businessName} rejected. ${body.rejectionReason || ''}`,
          },
        });
      } else if (newStatus === 'SUSPENDED') {
        await db.notification.create({
          data: {
            userId: existingVendor.userId,
            title: 'Vendor Account Suspended',
            message: `Your vendor account "${existingVendor.businessName}" has been suspended. Please contact support for more information.`,
            type: 'ERROR',
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: vendor });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update vendor';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}