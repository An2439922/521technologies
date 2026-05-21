import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isApiAuth = request.nextUrl.pathname.startsWith('/api/auth');
  
  // Разрешаем доступ к публичным файлам, если нужно, но по умолчанию защищаем всё,
  // кроме авторизации и статики.
  if (!authCookie && !isLoginPage && !isApiAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};
