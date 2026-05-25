import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si intenta ir a /admin sin estar logueado, redirige a /login
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('sb-access-token');
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};