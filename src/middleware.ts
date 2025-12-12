import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/", "/auth/register", "/auth/login"];
const superAdminRoutes = ["/super-admin", "/super-admin/*"];
const protectedRoutes = ["/home", "/account", "/cart", "/checkout", "/listing"]; // Add other protected routes as needed

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // Check if the current route is public
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/login");

  // If user has access token, attempt to verify it
  if (accessToken) {
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      const { role } = payload as {
        role: string;
      };

      // If authenticated user tries to access super admin routes but is not super admin
      if (
        role !== "SUPER_ADMIN" &&
        (pathname.startsWith("/super-admin"))
      ) {
        // Non-super admin users trying to access super admin routes get redirected to home
        return NextResponse.redirect(new URL("/home", request.url));
      }

      // Allow authenticated users to access their authorized routes
      return NextResponse.next();
    } catch (e) {
      console.error("Token verification failed", e);

      // Token verification failed, try to refresh
      try {
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh-token`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (refreshResponse.ok) {
          // Token refresh successful, continue with request
          return NextResponse.next();
        } else {
          // Refresh failed, remove invalid cookies and redirect to login
          const response = NextResponse.redirect(
            new URL("/auth/login", request.url)
          );
          response.cookies.delete("accessToken");
          response.cookies.delete("refreshToken");
          return response;
        }
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        const response = NextResponse.redirect(
          new URL("/auth/login", request.url)
        );
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
      }
    }
  }

  // If no access token and not on a public route, redirect to login
  if (!isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
