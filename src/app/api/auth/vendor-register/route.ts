import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

// POST /api/auth/vendor-register
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      gstNumber,
      panNumber,
      bankName,
      bankAccount,
      bankIfsc,
      description,
    } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !businessName) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and business name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if business slug already exists
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existingSlug = await db.vendor.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'A vendor with a similar business name already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // Create user with VENDOR role
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'VENDOR',
        isVerified: false,
      },
    });

    // Create vendor profile with PENDING status
    const vendor = await db.vendor.create({
      data: {
        userId: user.id,
        businessName,
        slug,
        businessEmail: businessEmail || email,
        businessPhone,
        businessAddress,
        gstNumber,
        panNumber,
        bankName,
        bankAccount,
        bankIfsc,
        description,
        status: 'PENDING',
        commissionRate: 10.0,
      },
    });

    // Create notification for admin
    await db.notification.create({
      data: {
        title: 'New Vendor Application',
        message: `${businessName} has applied to become a vendor. Please review and approve or reject the application.`,
        type: 'INFO',
      },
    });

    // Create activity log
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'VENDOR_REGISTER',
        details: `Vendor application submitted for ${businessName}`,
      },
    });

    // Simple token
    const token = Buffer.from(
      JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 })
    ).toString('base64');

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            isVerified: user.isVerified,
          },
          token,
          vendorId: vendor.id,
          vendorStatus: vendor.status,
        },
        message: 'Application submitted! Your account is pending admin approval.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}