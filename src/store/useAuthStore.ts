import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "SUPER_ADMIN";
  createdAt: string;
};

type AuthStore = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | null>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  updateProfile: (name: string, email: string) => Promise<boolean>;
  fetchProfile: () => Promise<boolean>;
  initializeAuthState: () => Promise<void>;
};

const axiosInstance = axios.create({
  baseURL: API_ROUTES.AUTH,
  // withCredentials is now set globally in api.ts
});

// Add response interceptor to handle authentication failures
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only trigger logout on 401 for auth-related endpoints
    // This prevents logout from being triggered by non-auth API calls that fail
    const url = error.config?.url || '';
    const isAuthEndpoint = ['/login', '/logout', '/profile', '/refresh-token'].some(endpoint =>
      url.includes(endpoint)
    );

    // If we get a 401 (unauthorized) response on auth-related endpoints, the token might be invalid/expired
    if (error.response?.status === 401 && isAuthEndpoint) {
      // Clear the auth store to force re-authentication
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Track if initialization is in progress to prevent multiple simultaneous calls
let initializationInProgress = false;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: typeof window !== 'undefined' ? true : false, // Initialize as loading if in browser
      error: null,
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/register", {
            name,
            email,
            password,
          });

          set({ isLoading: false });
          return response.data.userId;
        } catch (error) {
          set({
            isLoading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Registration failed"
              : "Registration failed",
          });

          return null;
        }
      },
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/login", {
            email,
            password,
          });

          // Set the user in the store
          set({ isLoading: false, user: response.data.user });

          // Redirect to listing page after successful login
          // Using window.location to ensure clean state transition
          if (typeof window !== 'undefined') {
            window.location.href = '/listing';
          }

          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Login failed"
              : "Login failed",
          });

          return false;
        }
      },
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.post("/logout");
          set({ user: null, isLoading: false });
        } catch (error) {
          // Even if logout API fails, clear local state
          set({ user: null, isLoading: false });
          console.error('Logout API error:', error);
        } finally {
          // Ensure all persisted state is cleared
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
          }
        }
      },
      refreshAccessToken: async () => {
        try {
          const response = await axiosInstance.post("/refresh-token");
          if (response.data.success && response.data.user) {
            set({ user: response.data.user });
          }
          return true;
        } catch (e) {
          console.error(e);
          return false;
        }
      },
      updateProfile: async (name: string, email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.put("/profile", {
            name,
            email,
          });

          if (response.data.success && response.data.user) {
            set({ user: response.data.user, isLoading: false });
            return true;
          } else {
            set({ isLoading: false, error: response.data.error || "Failed to update profile" });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Profile update failed"
              : "Profile update failed",
          });
          return false;
        }
      },
      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.get("/profile");

          if (response.data.success && response.data.user) {
            set({ user: response.data.user, isLoading: false });
            return true;
          } else {
            set({ isLoading: false, error: response.data.error || "Failed to fetch profile" });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Failed to fetch profile"
              : "Failed to fetch profile",
          });
          return false;
        }
      },
      initializeAuthState: async () => {
        // Prevent multiple simultaneous initializations
        if (initializationInProgress) {
          // If already initializing, wait a bit and return
          await new Promise(resolve => setTimeout(resolve, 100));
          return;
        }

        initializationInProgress = true;
        set({ isLoading: true });

        try {
          // Check if we have user data in the persisted store
          const hasStoredUser = get().user !== null;

          if (hasStoredUser) {
            // Verify the stored user is still valid by fetching profile
            const isValid = await get().fetchProfile();
            if (!isValid) {
              // If profile fetch failed, clear the invalid state
              set({ user: null });
            }
          }
        } catch (error) {
          console.error("Error initializing auth state:", error);
          // Don't clear user state on network errors to prevent accidental logouts
          if (axios.isAxiosError(error)) {
            if (error.code === 'ERR_NETWORK' || error.code === 'ERR_INSUFFICIENT_RESOURCES') {
              // For network errors or resource errors, keep the existing state and just finish loading
              console.warn("Network or resource error during auth initialization, keeping existing state");
            } else {
              // For other axios errors (like 401), clear the user state
              set({ user: null });
            }
          } else {
            // For non-axios errors, clear the user state
            set({ user: null });
          }
        } finally {
          set({ isLoading: false });
          initializationInProgress = false;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => {
        // Return a callback that runs before state is rehydrated
        return (state, error) => {
          if (error) {
            console.error("An error happened during hydration", error);
          } else if (state) {
            // Set loading state during hydration
            state.isLoading = true;
          }
        };
      },
    }
  )
);

// Extract the hydrated state checking function
export const useHydrated = () => {
  const hydrated = useAuthStore.persist.hasHydrated;
  return hydrated;
};

// Add function to manually clear initialization flag if needed
export const clearAuthInitialization = () => {
  initializationInProgress = false;
};