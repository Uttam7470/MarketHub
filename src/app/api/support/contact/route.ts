import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const ticket = await db.supportTicket.create({
      data: {
        subject: `${subject} - From: ${name} (${email})`,
        category: 'GENERAL',
        priority: 'MEDIUM',
        status: 'OPEN',
        messages: {
          create: {
            message: `Name: ${name}\nEmail: ${email}\n\n${message}`,
            isStaff: false,
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('Contact error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit contact form' }, { status: 500 });
  }
}