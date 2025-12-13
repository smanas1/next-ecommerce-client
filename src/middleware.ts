import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register"];

// Define routes that require super admin role
const SUPER_ADMIN_ROUTES = ["/super-admin", "/super-admin/*"];

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // Check if current route is public
  const isPublicRoute = isPathPublic(pathname);

  // If user has access token, verify it
  if (accessToken) {
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );

      const { role } = payload as { role: string };

      // Check if authenticated user is trying to access super admin routes but doesn't have the role
      const isAccessingSuperAdminRoute = SUPER_ADMIN_ROUTES.some(
        (route) =>
          pathname === route ||
          (route.endsWith("/*") && pathname.startsWith(route.slice(0, -2)))
      );

      if (role !== "SUPER_ADMIN" && isAccessingSuperAdminRoute) {
        // Non-super admin users trying to access super admin routes get redirected to home
        return NextResponse.redirect(new URL("/home", request.url));
      }

      // Allow authenticated users to access their authorized routes
      return NextResponse.next();
    } catch (verificationError) {
      console.error("Token verification failed:", verificationError);

      // Token is invalid, redirect to login and clear cookies
      return redirectToLoginWithCleanup(request);
    }
  }

  // If no access token and not on a public route, redirect to login
  if (!isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

/**
 * Helper function to check if a given path is public
 */
function isPathPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) =>
      pathname === route ||
      (route.endsWith("/*") && pathname.startsWith(route.slice(0, -2)))
  );
}

/**
 * Helper function to redirect to login and clean up invalid cookies
 */
function redirectToLoginWithCleanup(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL("/auth/login", request.url));
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
