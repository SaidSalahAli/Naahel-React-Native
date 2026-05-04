/**
 * Protected Route Guard Example
 * Demonstrates how to protect routes based on authentication state
 */

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSegments } from "expo-router";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * HOC to protect routes
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isInitialized } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    if (!isInitialized) return;

    const inTabsGroup = segments[0] === "(guest)";

    if (!isLoggedIn && inTabsGroup) {
      // Redirect to home if not logged in
      router.replace("/");
    } else if (isLoggedIn && !inTabsGroup) {
      // Redirect to tabs if logged in
      router.replace("/");
    }
  }, [isLoggedIn, isInitialized, segments]);

  if (!isInitialized) {
    return null; // Or a loading screen
  }

  return <>{children}</>;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isLoggedIn, isInitialized } = useAuth();
  return isInitialized && isLoggedIn;
}

/**
 * Hook to redirect based on auth state
 */
export function useAuthRedirect() {
  const { isLoggedIn, isInitialized } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    if (!isInitialized) return;

    const inTabsGroup = segments[0] === "(guest)";

    if (!isLoggedIn && inTabsGroup) {
      router.replace("/");
    } else if (isLoggedIn && !inTabsGroup) {
      router.replace("/");
    }
  }, [isLoggedIn, isInitialized]);
}

export default ProtectedRoute;
