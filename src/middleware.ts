import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate limit API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const ipClean = ip.split(',')[0].trim();

  // Determine limit based on route
  let maxRequests = 100; // Default: 100/min
  if (pathname.startsWith('/api/auth/')) maxRequests = 10; // Auth: 10/min
  if (pathname.startsWith('/api/search/')) maxRequests = 30; // Search: 30/min

  const result = rateLimit(ipClean, maxRequests);

  if (!result.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(result.retryAfter || 60) },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};