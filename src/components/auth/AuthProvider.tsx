'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

// Component to handle authentication state synchronization
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuthState, user } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Initialize the auth state on component mount, but only once
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeAuthState();
    }

    // Listen for storage events to handle logout from other tabs
    const handleStorageChange = () => {
      initializeAuthState();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeAuthState]); // Only initialize on mount and when initializeAuthState function changes

  return <>{children}</>;
}