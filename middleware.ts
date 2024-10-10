import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames

  // if user click on link to /personal or any other page he should be redirected to /en/personal or /ar/personal or /cn/personal
  matcher: [
    '/',
    '/(ar|en|cn)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};