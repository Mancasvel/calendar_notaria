import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { isAdminRole } from './lib/permissions';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = isAdminRole(token?.role as string);
    const userRole = token?.role;

    // Admin routes - only users with admin roles (admin, polizas) can access
    if (req.nextUrl.pathname.startsWith('/admin/') && !isAdmin) {
      return NextResponse.redirect(new URL('/mis-vacaciones', req.url));
    }

    // Role-based vacation access
    if (req.nextUrl.pathname.startsWith('/api/vacaciones/rol')) {
      // Allow access if user is admin or if they're requesting their own role
      const url = new URL(req.url);
      const requestedRole = url.searchParams.get('rol');

      if (!isAdmin && requestedRole && requestedRole !== userRole) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/vacaciones/:path*',
    '/api/usuarios/:path*',
    '/mis-vacaciones',
    '/solicitar-vacaciones'
  ]
};
