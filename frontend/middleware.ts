import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const locale = searchParams.get('locale');
  if (locale && ['en', 'fr', 'ar'].includes(locale)) {
    const newUrl = request.nextUrl.clone();
    newUrl.searchParams.delete('locale');
    const response = NextResponse.redirect(newUrl);
    response.cookies.set('locale', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  const hasRefreshToken = request.cookies.has('refresh_token');
  const isProtectedRoute = pathname.startsWith('/profile');
  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  if (isAuthRoute && hasRefreshToken) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  if (isProtectedRoute && !hasRefreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/onboarding') {
    if (!hasRefreshToken)
      return NextResponse.redirect(new URL('/login', request.url));
    
    const onboardingCookie = request.cookies.get('onboarding_entry');
    if (!onboardingCookie || onboardingCookie.value !== 'granted') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp).*)',
  ],
};