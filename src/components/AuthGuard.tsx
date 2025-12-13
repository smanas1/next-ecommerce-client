"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/auth/login", "/auth/register"];

  // Define routes that require super admin role
  const superAdminRoutes = [
    "/super-admin",
    "/super-admin/coupons",
    "/super-admin/orders",
    "/super-admin/products",
    "/super-admin/reviews",
    "/super-admin/settings",
  ];

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem("accessToken");
      const isAuthenticated = !!accessToken && !!user;

      // Check if current route is public
      const isPublicRoute = publicRoutes.includes(pathname);

      // Check if current route is a super admin route
      const isSuperAdminRoute = superAdminRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );

      if (isAuthenticated) {
        // User is logged in
        if (pathname === "/auth/login" || pathname === "/auth/register") {
          // Redirect authenticated users away from login/register pages
          const redirectPath =
            user?.role === "SUPER_ADMIN" ? "/super-admin" : "/";
          router.push(redirectPath);
          return;
        }

        // Check super admin routes
        if (isSuperAdminRoute && user?.role !== "SUPER_ADMIN") {
          // Non-super admin users trying to access super admin routes
          router.push("/");
          return;
        }
      } else {
        // User is not logged in
        if (!isPublicRoute) {
          // Redirect unauthenticated users to login
          router.push("/auth/login");
          return;
        }
      }

      setIsLoading(false);
    };

    // Small delay to ensure auth state is loaded
    const timer = setTimeout(checkAuth, 100);

    return () => clearTimeout(timer);
  }, [pathname, user, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
