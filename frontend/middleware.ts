// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques
const publicRoutes = [
  '/', 
  '/login', 
  '/register', 
  '/about', 
  '/search', 
  '/verify-email',
  '/client/carte',  // Pour tester la carte
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Laisser passer les API
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Laisser passer les assets
  if (pathname.startsWith('/_next') || pathname.includes('favicon')) {
    return NextResponse.next();
  }
  
  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Vérifier l'authentification via le cookie
  const token = request.cookies.get('accessToken')?.value;
  
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|logo.ico).*)'],
};