import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/register"];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Define routes that require super admin role
  const superAdminRoutes = ["/super-admin", "/super-admin/*"];

  // Check if the user is accessing a super admin route
  const isAccessingSuperAdminRoute = superAdminRoutes.some(
    (route) =>
      pathname === route ||
      (route.endsWith("/*") && pathname.startsWith(route.slice(0, -2)))
  );

  // Check if user is authenticated by checking for access token cookie
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    // No access token, redirect to login for all non-public routes
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAccessingSuperAdminRoute) {
    // For super admin routes, verify the user has the correct role
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
  }

  // If user has access token and is not accessing super admin routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
