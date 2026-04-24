import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAccessToken } from './lib/helpers/storage';

// Routes publiques (accessibles sans authentification)
const publicRoutes = ['/login', '/register', '/about', '/search', '/'];

// Routes API à exclure du middleware
const apiRoutes = ['/api/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ✅ IMPORTANT : Laisser passer toutes les requêtes API
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  const token = getAccessToken();
  const isAuthenticated = !!token;

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclure les fichiers statiques et API du middleware
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};