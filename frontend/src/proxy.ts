import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // 1. If accessing dashboard but token is missing, redirect to login page with alert param
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('unauthorized', 'true');
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in and accessing auth pages (login/register), redirect to dashboard
  if (pathname.startsWith('/auth') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
