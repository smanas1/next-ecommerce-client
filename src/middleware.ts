import { NextRequest, NextResponse } from "next/server";

// Since we moved to localStorage-based authentication,
// middleware can't read tokens. Route protection is now handled
// client-side using the AuthGuard component.

export async function middleware(request: NextRequest) {
  // Allow all routes - authentication is handled client-side
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
