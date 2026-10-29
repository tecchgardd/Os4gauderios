// Sem o cookie de sessão, qualquer página do painel vai direto para o login.
// (A conferência de verdade acontece no servidor, em requireUser.)
import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIES = ['better-auth.session_token', '__Secure-better-auth.session_token'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === '/admin/login' || SESSION_COOKIES.some(c => req.cookies.has(c))) return NextResponse.next();
  const url = new URL('/admin/login', req.url);
  url.searchParams.set('next', pathname + search);
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
