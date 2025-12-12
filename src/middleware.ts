import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/auth/register", "/auth/login", "/"];
const superAdminRoutes = ["/super-admin", "/super-admin/:path*"];
const userRoutes = ["/home"];

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  if (accessToken) {
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      const { role } = payload as {
        role: string;
      };

      if (publicRoutes.some((route) => pathname.startsWith(route))) {
        // If user is authenticated and on a public route, redirect to appropriate dashboard
        return NextResponse.redirect(
          new URL(
            role === "SUPER_ADMIN" ? "/super-admin" : "/home",
            request.url
          )
        );
      }

      if (
        role === "SUPER_ADMIN" &&
        userRoutes.some((route) => pathname.startsWith(route))
      ) {
        return NextResponse.redirect(new URL("/super-admin", request.url));
      }
      if (
        role !== "SUPER_ADMIN" &&
        superAdminRoutes.some((route) => pathname.startsWith(route))
      ) {
        return NextResponse.redirect(new URL("/home", request.url));
      }

      return NextResponse.next();
    } catch (e) {
      console.error("Token verification failed", e);

      // Attempt to refresh the token
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
          // The refresh endpoint should have set new cookies automatically
          // Just continue with the request, cookies are now updated
          return NextResponse.next();
        } else {
          // Refresh failed, redirect to login
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

  // If not authenticated and not on a public route, redirect to login
  if (!publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
