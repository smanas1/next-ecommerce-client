import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Allow all routes to be accessible without authentication
  // Only protect super admin routes
  const { pathname } = request.nextUrl;

  // Define routes that require super admin role
  const SUPER_ADMIN_ROUTES = ["/super-admin", "/super-admin/*"];

  // Check if the user is accessing a super admin route
  const isAccessingSuperAdminRoute = SUPER_ADMIN_ROUTES.some(
    (route) =>
      pathname === route ||
      (route.endsWith("/*") && pathname.startsWith(route.slice(0, -2)))
  );

  if (isAccessingSuperAdminRoute) {
    // For super admin routes, check authentication
    const accessToken = request.cookies.get("accessToken")?.value;

    if (accessToken) {
      try {
        // Import jwtVerify only when needed
        const { jwtVerify } = await import('jose');
        const { payload } = await jwtVerify(
          accessToken,
          new TextEncoder().encode(process.env.JWT_SECRET!)
        );

        const { role } = payload as { role: string };

        if (role !== "SUPER_ADMIN") {
          // Non-super admin users trying to access super admin routes get redirected to home
          return NextResponse.redirect(new URL("/", request.url));
        }

        // Allow super admin to access super admin routes
        return NextResponse.next();
      } catch (verificationError) {
        console.error("Token verification failed for super admin route:", verificationError);
        // Redirect to login and clear invalid cookies
        const response = NextResponse.redirect(new URL("/auth/login", request.url));
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
      }
    } else {
      // No access token, redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Allow all other routes to be accessed without authentication
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
