import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/admin/login')

    // Create response with pathname header
    const response = NextResponse.next()
    response.headers.set('x-pathname', req.nextUrl.pathname)

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      return response
    }

    // Check if user has admin or staff role
    if (token && token.role !== 'ADMIN' && token.role !== 'STAFF') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without auth
        if (req.nextUrl.pathname.startsWith('/admin/login')) {
          return true
        }
        // Require auth for all other admin pages
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/cart', '/checkout/:path*', '/account/:path*'],
}
