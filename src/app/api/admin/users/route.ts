import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/users?role=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }];

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, isVerified: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    await db.user.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true, message: 'User deactivated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to deactivate user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}