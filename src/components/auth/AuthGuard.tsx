'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, requires user to be logged in
  redirectTo?: string; // Where to redirect if not authorized
}

const AuthGuard = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) => {
  const router = useRouter();
  const { user, isLoading, initializeAuthState } = useAuthStore();
  
  useEffect(() => {
    const checkAuth = async () => {
      // Initialize auth state to sync with server cookies
      await initializeAuthState();
      
      // Wait a brief moment to ensure state is updated
      setTimeout(() => {
        // If route requires auth but user is not logged in
        if (requireAuth && !isLoading && !user) {
          router.push(redirectTo);
        }
      }, 100);
    };
    
    checkAuth();
  }, [user, isLoading, requireAuth, redirectTo, router, initializeAuthState]);

  // If requiring auth and user is not loaded yet, show loading or nothing
  if (requireAuth && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If requiring auth and user is not logged in, return nothing (redirect will happen)
  if (requireAuth && !isLoading && !user) {
    return null;
  }

  // If all checks pass, render children
  return <>{children}</>;
};

export default AuthGuard;