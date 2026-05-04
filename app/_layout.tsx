import AppLoader from "@/components/app-Loader";
import { MOODLE_CONFIG } from "@/config/config";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { TenantProvider, useTenant } from "@/contexts/TenantContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(guest)",
};

// Inner component that uses tenant context
function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [isAppLoading, setIsAppLoading] = useState(true);
  const { getTenantInfo, isLoading: isTenantLoading } = useTenant();

  useEffect(() => {
    const loadTenantFromAPI = async () => {
      try {
        const language = (await AsyncStorage.getItem("language")) || "en";

        // Prepare tenant info parameters matching the web payload
        const params = {
          url: MOODLE_CONFIG.URL_INFO, // https://accounts.naahel.com
          lang: language,
          code: "abc",
        };

        // Load tenant info which includes branding, colors, etc.
        await getTenantInfo(params);

        // Add a minimum loading time for better UX
        setTimeout(() => {
          setIsAppLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to load tenant info, using fallback config");
        // Set a fallback loading time even if tenant load fails
        setTimeout(() => {
          setIsAppLoading(false);
        }, 2000);
      }
    };

    loadTenantFromAPI();
  }, [getTenantInfo]);

  const isLoading = isAppLoading || isTenantLoading;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {isLoading ? (
        <AppLoader />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(guest)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
              headerShown: true,
            }}
          />
        </Stack>
      )}

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// Outer component that wraps providers
export default function RootLayout() {
  return (
    <ConfigProvider>
      <TenantProvider>
        <AuthProvider>
          <RootLayoutContent />
        </AuthProvider>
      </TenantProvider>
    </ConfigProvider>
  );
}
