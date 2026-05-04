/**
 * Config Context
 * Manages app configuration (theme, language, RTL)
 */

import {
    DEFAULT_LANGUAGE,
    DEFAULT_THEME_MODE,
    STORAGE_KEYS,
} from "@/config/config";
import { ConfigContextType } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useEffect,
    useReducer,
} from "react";
import { Appearance } from "react-native";

// Config Actions
type ConfigAction =
  | { type: "SET_LANGUAGE"; payload: string }
  | { type: "SET_MODE"; payload: "light" | "dark" }
  | { type: "SET_DIRECTION"; payload: "rtl" | "ltr" };

interface ConfigState {
  i18n: string;
  mode: "light" | "dark";
  themeDirection: "rtl" | "ltr";
}

const initialState: ConfigState = {
  i18n: DEFAULT_LANGUAGE,
  mode: DEFAULT_THEME_MODE as "light" | "dark",
  themeDirection: "ltr",
};

// Reducer function
function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case "SET_LANGUAGE":
      return {
        ...state,
        i18n: action.payload,
        themeDirection: action.payload === "ar" ? "rtl" : "ltr",
      };
    case "SET_MODE":
      return {
        ...state,
        mode: action.payload,
      };
    case "SET_DIRECTION":
      return {
        ...state,
        themeDirection: action.payload,
      };
    default:
      return state;
  }
}

// Create context
export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined,
);

interface ConfigProviderProps {
  children: React.ReactNode;
}

/**
 * Config Provider Component
 */
export function ConfigProvider({ children }: ConfigProviderProps) {
  const [state, dispatch] = useReducer(configReducer, initialState);

  // Initialize config from storage
  useEffect(() => {
    const initializeConfig = async () => {
      try {
        const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
        const themeMode = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);

        if (language) {
          dispatch({ type: "SET_LANGUAGE", payload: language });
        }

        if (themeMode) {
          dispatch({
            type: "SET_MODE",
            payload: themeMode as "light" | "dark",
          });
        } else {
          // Use system theme
          const systemTheme = Appearance.getColorScheme();
          if (systemTheme) {
            dispatch({
              type: "SET_MODE",
              payload: systemTheme as "light" | "dark",
            });
          }
        }
      } catch (error) {
        console.error("Config initialization error:", error);
      }
    };

    initializeConfig();
  }, []);

  // Set language
  const setLanguage = useCallback(async (language: string) => {
    dispatch({ type: "SET_LANGUAGE", payload: language });
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, []);

  // Set theme mode
  const setMode = useCallback(async (mode: "light" | "dark") => {
    dispatch({ type: "SET_MODE", payload: mode });
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  }, []);

  // Set theme direction
  const setDirection = useCallback(async (direction: "rtl" | "ltr") => {
    dispatch({ type: "SET_DIRECTION", payload: direction });
  }, []);

  const value: ConfigContextType = {
    i18n: state.i18n,
    mode: state.mode,
    themeDirection: state.themeDirection,
    setLanguage,
    setMode,
    setDirection,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

// Custom hook to use config context
export function useConfig(): ConfigContextType {
  const context = React.useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within ConfigProvider");
  }
  return context;
}
