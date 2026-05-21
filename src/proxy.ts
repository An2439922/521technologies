import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  
  const token = request.cookies.get('auth-token')?.value;

  if (!token && !isAuthPage && !request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};
