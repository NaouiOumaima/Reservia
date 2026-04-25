// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques (accessibles sans authentification)
// ✅ AJOUTEZ /verify-email DANS CETTE LISTE
const publicRoutes = ['/login', '/register', '/about', '/search', '/', '/verify-email'];

// Routes API à exclure du middleware
const apiRoutes = ['/api/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Laisser passer toutes les requêtes API
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // 🆕 Vérification spéciale pour verify-email (même avec query params)
  if (pathname === '/verify-email' || pathname.startsWith('/verify-email')) {
    return NextResponse.next();
  }
  
  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Récupérer le token depuis les cookies ou localStorage (pas disponible dans middleware)
  // Pour le middleware, on vérifie via le cookie
  const token = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!token;

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
    '/((?!_next/static|_next/image|api).*)',
  ],
};