import AppLoader from "@/components/app-Loader";
import { MOODLE_CONFIG } from "@/config/config";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { TenantProvider, useTenant } from "@/contexts/TenantContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  registerForPushNotificationsAsync,
  showWelcomeNotification,
} from "@/services/notificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(guest)",
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [isAppLoading, setIsAppLoading] = useState(true);
  const { getTenantInfo, isLoading: isTenantLoading } = useTenant();

  const notificationStarted = useRef(false);

  useEffect(() => {
    const loadTenantFromAPI = async () => {
      try {
        const language = (await AsyncStorage.getItem("language")) || "en";

        const params = {
          url: MOODLE_CONFIG.URL_INFO,
          lang: language,
          code: "abc",
        };

        await getTenantInfo(params);

        setTimeout(() => {
          setIsAppLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to load tenant info, using fallback config");

        setTimeout(() => {
          setIsAppLoading(false);
        }, 2000);
      }
    };

    loadTenantFromAPI();
  }, [getTenantInfo]);

  const isLoading = isAppLoading || isTenantLoading;

  useEffect(() => {
    if (isLoading) return;
    if (notificationStarted.current) return;

    notificationStarted.current = true;

    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();

        console.log("Saved token:", token);

        await showWelcomeNotification();
      } catch (error) {
        console.log("Notification setup error:", error);
      }
    };

    setupNotifications();
  }, [isLoading]);

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
