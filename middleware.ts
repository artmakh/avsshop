import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect /uploads/* to /api/uploads/*
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    const url = request.nextUrl.clone();
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/uploads/:path*',
};