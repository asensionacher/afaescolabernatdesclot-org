import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Excluir /studio y /partes de la internacionalización
  if (request.nextUrl.pathname.startsWith('/studio') || 
      request.nextUrl.pathname.startsWith('/partes')) {
    return;
  }
  
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(ca|es|en|ar|ur)/:path*', '/((?!_next|_vercel|api|.*\\..*).*)']
};
