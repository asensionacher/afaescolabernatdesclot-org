import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Excluir /studio de la internacionalización
  if (request.nextUrl.pathname.startsWith('/studio')) {
    return;
  }
  
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(ca|es|en|ar|ur)/:path*', '/((?!_next|_vercel|api|.*\\..*).*)']
};
