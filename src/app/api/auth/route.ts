import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash, compare } from 'bcryptjs';

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { vendor: true, customerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, error: 'Account is deactivated' }, { status: 403 });
    }

    if (user.role === 'VENDOR' && user.vendor?.status === 'PENDING') {
      return NextResponse.json({ success: false, error: 'Vendor account pending approval' }, { status: 403 });
    }

    if (user.role === 'VENDOR' && user.vendor?.status === 'SUSPENDED') {
      return NextResponse.json({ success: false, error: 'Vendor account is suspended' }, { status: 403 });
    }

    // Log activity
    await db.activityLog.create({
      data: { userId: user.id, action: 'LOGIN', details: `${user.role} logged in` },
    });

    // Simple token (in production, use JWT)
    const token = Buffer.from(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 })).toString('base64');

    const { password: _, ...safeUser } = user;
    return NextResponse.json({
      success: true,
      data: {
        user: { id: safeUser.id, email: safeUser.email, name: safeUser.name, role: safeUser.role, avatar: safeUser.avatar, phone: safeUser.phone, isVerified: safeUser.isVerified },
        token,
        vendorId: user.vendor?.id,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/auth/register (customer registration)
export async function PUT(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, and password required' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);
    const user = await db.user.create({
      data: { name, email, password: hashedPassword, phone, role: 'CUSTOMER', isVerified: true },
      include: { customerProfile: true },
    });

    await db.customerProfile.create({ data: { userId: user.id } });

    const token = Buffer.from(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 })).toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, phone: user.phone, isVerified: user.isVerified },
        token,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}