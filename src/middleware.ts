import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a conceptual example. Client-side storage like sessionStorage
// is NOT accessible in server-side middleware. A real implementation
// would use HTTP-only cookies.

// Since we cannot access sessionStorage here, this middleware is a placeholder
// to demonstrate the concept of protecting routes. For it to be effective,
// you would need to switch to a proper authentication mechanism (e.g., using cookies).

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // This is a simple conceptual check. In a real app, you'd verify a secure,
  // httpOnly cookie. We are simulating that the absence of a login mechanism
  // means the user is not authenticated.
  const isLoggedIn = false; // Placeholder

  if (pathname.startsWith('/admin')) {
    // If you had a real auth system, you'd check the session here.
    // For now, we allow access to demonstrate the page, but in a real-world
    // scenario, you would redirect if not logged in.
    //
    // Example with cookies:
    // const session = request.cookies.get('session_token');
    // if (!session) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
