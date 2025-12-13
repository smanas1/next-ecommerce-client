'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

// Component to handle authentication state synchronization
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuthState } = useAuthStore();

  useEffect(() => {
    // Initialize the auth state on component mount
    initializeAuthState();
    
    // Listen for storage events to handle logout from other tabs
    const handleStorageChange = () => {
      initializeAuthState();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeAuthState]);

  return <>{children}</>;
}