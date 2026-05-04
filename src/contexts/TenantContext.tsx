/**
 * Tenant Context
 * Manages multi-tenant configuration
 */

import { DEFAULT_LANGUAGE, STORAGE_KEYS } from "@/config/config";
import tenantApi from "@/services/tenantApi";
import {
  Tenant,
  TenantContextType,
  TenantFooterInfo,
  TenantHeaderInfo,
} from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useReducer } from "react";

// Tenant Actions
type TenantAction =
  | { type: "SET_TENANT"; payload: Tenant }
  | { type: "SET_HEADER_INFO"; payload: TenantHeaderInfo }
  | { type: "SET_FOOTER_INFO"; payload: TenantFooterInfo }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_COLORS_LOADED"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

interface TenantState {
  currentTenant: Tenant | null;
  tenantHeaderInfo: TenantHeaderInfo | null;
  tenantFooterInfo: TenantFooterInfo | null;
  isLoading: boolean;
  colorsLoaded: boolean;
  error: string | null;
}

const initialState: TenantState = {
  currentTenant: null,
  tenantHeaderInfo: null,
  tenantFooterInfo: null,
  isLoading: false,
  colorsLoaded: false,
  error: null,
};

// Reducer function
function tenantReducer(state: TenantState, action: TenantAction): TenantState {
  switch (action.type) {
    case "SET_TENANT":
      return {
        ...state,
        currentTenant: action.payload,
      };
    case "SET_HEADER_INFO":
      return {
        ...state,
        tenantHeaderInfo: action.payload,
      };
    case "SET_FOOTER_INFO":
      return {
        ...state,
        tenantFooterInfo: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_COLORS_LOADED":
      return {
        ...state,
        colorsLoaded: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

// Create context
export const TenantContext = createContext<TenantContextType | undefined>(
  undefined,
);

interface TenantProviderProps {
  children: React.ReactNode;
}

/**
 * Tenant Provider Component
 */
export function TenantProvider({ children }: TenantProviderProps) {
  const [state, dispatch] = useReducer(tenantReducer, initialState);

  // Set current tenant
  const setCurrentTenant = useCallback((tenant: Tenant) => {
    dispatch({ type: "SET_TENANT", payload: tenant });
  }, []);

  // Get tenant info - supports both old and new call signatures
  const getTenantInfo = useCallback(
    async (paramsOrTenantId: any, language?: string) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        // Determine parameters based on input type
        let params: any;
        if (typeof paramsOrTenantId === "string") {
          // Old format: getTenantInfo(tenantId, language)
          params = {
            tenantid: paramsOrTenantId,
            lang: language || DEFAULT_LANGUAGE,
          };
        } else {
          // New format: getTenantInfo({ url, lang, code })
          params = paramsOrTenantId;
        }

        // Check cache first
        const cachedTenant = await AsyncStorage.getItem(
          STORAGE_KEYS.TENANT_CONFIG,
        );
        if (cachedTenant) {
          const tenant = JSON.parse(cachedTenant);
          dispatch({ type: "SET_TENANT", payload: tenant });
          dispatch({ type: "SET_COLORS_LOADED", payload: true });
        }

        // Fetch fresh data
        const tenant = await tenantApi.getTenantInfo(params);
        dispatch({ type: "SET_TENANT", payload: tenant });

        // Cache tenant config
        await AsyncStorage.setItem(
          STORAGE_KEYS.TENANT_CONFIG,
          JSON.stringify(tenant),
        );

        // Fetch header info if we have tenantid
        if (params.tenantid) {
          const headerInfo = await tenantApi.getTenantHeaderInfo(
            params.tenantid,
            params.lang || DEFAULT_LANGUAGE,
          );
          dispatch({ type: "SET_HEADER_INFO", payload: headerInfo });

          // Fetch footer info
          const footerInfo = await tenantApi.getTenantFooterInfo(
            params.tenantid,
            params.lang || DEFAULT_LANGUAGE,
          );
          dispatch({ type: "SET_FOOTER_INFO", payload: footerInfo });
        }

        dispatch({ type: "SET_COLORS_LOADED", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to load tenant info";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        console.error("Tenant info error:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [],
  );

  const value: TenantContextType = {
    currentTenant: state.currentTenant,
    tenantHeaderInfo: state.tenantHeaderInfo,
    tenantFooterInfo: state.tenantFooterInfo,
    setCurrentTenant,
    getTenantInfo,
    isLoading: state.isLoading,
    colorsLoaded: state.colorsLoaded,
    error: state.error,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

// Custom hook to use tenant context
export function useTenant(): TenantContextType {
  const context = React.useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return context;
}
