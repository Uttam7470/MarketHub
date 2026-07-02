import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: List admin users
export async function GET() {
  try {
    const admins = await db.user.findMany({
      where: {
        OR: [
          { role: { contains: 'ADMIN' } },
          { adminRole: { not: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        adminRole: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: admins });
  } catch (error: any) {
    console.error('Admin roles GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch admins' }, { status: 500 });
  }
}

// POST: Create new admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, adminRole } = body;

    if (!name || !email || !password || !adminRole) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        password,
        role: adminRole,
        adminRole,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: { id: user.id, name: user.name, email: user.email, adminRole: user.adminRole } });
  } catch (error: any) {
    console.error('Admin roles POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create admin' }, { status: 500 });
  }
}

// PUT: Update admin role
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, adminRole } = body;

    if (!userId || !adminRole) {
      return NextResponse.json({ success: false, error: 'userId and adminRole are required' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { role: adminRole, adminRole },
    });

    return NextResponse.json({ success: true, data: { id: user.id, adminRole: user.adminRole } });
  } catch (error: any) {
    console.error('Admin roles PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update role' }, { status: 500 });
  }
}