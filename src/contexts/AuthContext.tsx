/**
 * Authentication Context
 * Manages user authentication state and session
 */

import {
    DEFAULT_LANGUAGE,
    SESSION_CHECK_INTERVAL,
    STORAGE_KEYS,
} from "@/config/config";
import authService from "@/services/authService";
import authSessionService from "@/services/authSession";
import { AuthContextType, AuthResponse, LoginCredentials, User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useEffect,
    useReducer,
    useRef,
} from "react";
import { AppState, AppStateStatus } from "react-native";

// Auth Actions
type AuthAction =
  | { type: "INITIALIZE" }
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "REGISTER"; payload: User }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean };

interface AuthState {
  isLoggedIn: boolean;
  isInitialized: boolean;
  user: User | null;
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  error: null,
  loading: true,
};

// Reducer function
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        isInitialized: true,
        loading: false,
      };
    case "LOGIN":
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload,
        error: null,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        error: null,
        loading: false,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const sessionCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Initialize app - check if user is already logged in
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_TOKEN);
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            const tenantId = await AsyncStorage.getItem(STORAGE_KEYS.TENANT_ID);
            const language =
              (await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE)) ||
              DEFAULT_LANGUAGE;

            if (tenantId) {
              // Validate session
              const sessionUser = await authSessionService.getSessionUser(
                tenantId,
                language,
                token,
              );

              if (sessionUser) {
                dispatch({ type: "LOGIN", payload: user });
              } else {
                // Session expired
                await AsyncStorage.removeItem(STORAGE_KEYS.SERVICE_TOKEN);
                await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
                dispatch({ type: "INITIALIZE" });
              }
            } else {
              dispatch({ type: "INITIALIZE" });
            }
          } catch (error) {
            console.error("Session validation error:", error);
            dispatch({ type: "INITIALIZE" });
          }
        } else {
          dispatch({ type: "INITIALIZE" });
        }
      } catch (error) {
        console.error("App initialization error:", error);
        dispatch({ type: "INITIALIZE" });
      }
    };

    initializeApp();
  }, []);

  // Setup periodic session checking
  useEffect(() => {
    if (!state.isLoggedIn) {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
      return;
    }

    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_TOKEN);
        const tenantId = await AsyncStorage.getItem(STORAGE_KEYS.TENANT_ID);
        const language =
          (await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE)) ||
          DEFAULT_LANGUAGE;

        if (token && tenantId) {
          const sessionUser = await authSessionService.getSessionUser(
            tenantId,
            language,
            token,
          );

          if (!sessionUser) {
            // Session expired, logout
            await logout();
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    // Start periodic checks
    sessionCheckIntervalRef.current = setInterval(
      checkSession,
      SESSION_CHECK_INTERVAL,
    );

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [state.isLoggedIn]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appStateRef.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // App has come to foreground, check session
      if (state.isLoggedIn) {
        await checkSession();
      }
    }
    appStateRef.current = nextAppState;
  };

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response: AuthResponse = await authService.moodleLogin(
        credentials.username,
        credentials.password,
        credentials.tenantId,
        credentials.language,
      );

      // Store token
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_TOKEN, response.token);

      // Prepare user object
      const user: User = {
        id: response.userid,
        name: response.fullname,
        email: response.email,
        avatar: response.pictureurl,
        tenantid: credentials.tenantId,
        fullname: response.fullname,
        pictureurl: response.pictureurl,
      };

      // Store user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.TENANT_ID, credentials.tenantId);
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, credentials.language);

      dispatch({ type: "LOGIN", payload: user });
    } catch (error: any) {
      const errorMessage = error?.message || "Login failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_TOKEN);
      const tenantId = await AsyncStorage.getItem(STORAGE_KEYS.TENANT_ID);
      const language =
        (await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE)) || DEFAULT_LANGUAGE;

      if (token && tenantId) {
        await authSessionService.logoutMoodleSession(tenantId, language, token);
      }

      // Clear storage
      await AsyncStorage.removeItem(STORAGE_KEYS.SERVICE_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);

      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if API call fails
      await AsyncStorage.removeItem(STORAGE_KEYS.SERVICE_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  // Check session function
  const checkSession = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_TOKEN);
      const tenantId = await AsyncStorage.getItem(STORAGE_KEYS.TENANT_ID);
      const language =
        (await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE)) || DEFAULT_LANGUAGE;

      if (token && tenantId) {
        const sessionUser = await authSessionService.getSessionUser(
          tenantId,
          language,
          token,
        );

        if (!sessionUser) {
          await logout();
        }
      }
    } catch (error) {
      console.error("Session check error:", error);
    }
  }, [logout]);

  // Register function (stub)
  const register = useCallback(async (data: any) => {
    console.warn("Register function not implemented yet");
    throw new Error("Register not implemented");
  }, []);

  // Reset password function (stub)
  const resetPassword = useCallback(async (email: string) => {
    console.warn("Reset password function not implemented yet");
    throw new Error("Reset password not implemented");
  }, []);

  // Update profile function (stub)
  const updateProfile = useCallback(async (data: Partial<User>) => {
    console.warn("Update profile function not implemented yet");
    throw new Error("Update profile not implemented");
  }, []);

  const value: AuthContextType = {
    isLoggedIn: state.isLoggedIn,
    isInitialized: state.isInitialized,
    user: state.user,
    login,
    logout,
    checkSession,
    register,
    resetPassword,
    updateProfile,
    error: state.error,
    loading: state.loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
