import AppLoader from "@/components/app-Loader";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ConfigProvider>
      <TenantProvider>
        <AuthProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            {isAppLoading ? (
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
        </AuthProvider>
      </TenantProvider>
    </ConfigProvider>
  );
}
