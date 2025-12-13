import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

// Custom hook to sync auth state on component mount
export const useAuthSync = () => {
  const { initializeAuthState, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on mount to sync with server cookies
    initializeAuthState();
  }, [initializeAuthState]);

  return { isLoading };
};