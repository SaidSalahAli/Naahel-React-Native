// app/(guest)/_layout.tsx

import { ConfigContext } from "@/contexts/ConfigContext";
import { useTenant } from "@/contexts/TenantContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
import React, { useCallback, useContext } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Static tab definitions ────────────────────────────────────────────────────
const STATIC_TABS = [
  { name: "index", title: "Home", icon: "⌂" },
  { name: "courses/index", title: "Courses", icon: "▣" },
  { name: "explore", title: "Explore", icon: "◉" },
  { name: "programs/index", title: "Programs", icon: "◆" },
  { name: "more", title: "More", icon: "☰" },
];

const HIDDEN_SCREENS = [
  "about-us",
  "contact-us",
  "faqs",
  "search",
  "verify-certificate",
  "exams",
];

// ── Custom Tab Bar ─────────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { currentTenant, tenantHeaderInfo, isLoading } = useTenant();
  const config = useContext(ConfigContext);

  const info = tenantHeaderInfo ?? currentTenant;
  const primary = currentTenant?.primarycolor ?? "#123CFF";
  const i18n = config?.i18n ?? "en";

  const handleLanguageToggle = useCallback(async () => {
    const next = i18n === "ar" ? "en" : "ar";
    config?.setLanguage?.(next);
    await AsyncStorage.setItem("language", next);
  }, [config, i18n]);

  // Map route name → static tab config
  const tabMap = Object.fromEntries(STATIC_TABS.map((t) => [t.name, t]));

  // Only routes that are in STATIC_TABS
  const visibleRoutes = state.routes.filter((r: any) => tabMap[r.name]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.floatingCard}>
        {/* Divider */}

        {/* ── TABS ROW ── */}
        <View style={styles.tabsRow}>
          {visibleRoutes.map((route: any) => {
            const realIndex = state.routes.findIndex(
              (r: any) => r.key === route.key,
            );
            const focused = state.index === realIndex;
            const tab = tabMap[route.name];
            if (!tab) return null;

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.8}
                onPress={() => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                style={styles.tabItem}
              >
                <View
                  style={[
                    styles.iconBox,
                    focused && { backgroundColor: primary },
                  ]}
                >
                  <Text style={[styles.icon, focused && styles.iconActive]}>
                    {tab.icon}
                  </Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.label, focused && { color: "#fff" }]}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────
export default function GuestLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {STATIC_TABS.map(({ name, title }) => (
        <Tabs.Screen key={name} name={name} options={{ title }} />
      ))}

      {HIDDEN_SCREENS.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: Platform.OS === "ios" ? 24 : 14,
  },

  floatingCard: {
    backgroundColor: "#0B0F14",
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },

  // ── Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  logo: {
    width: 100,
    height: 28,
  },

  logoFallback: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  logoFallbackText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  actionIcon: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "900",
  },

  loginBtn: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    marginBottom: 8,
    borderRadius: 1,
  },

  // ── Tabs
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  iconBox: {
    width: 42,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },

  icon: {
    color: "#8A8F98",
    fontSize: 17,
    fontWeight: "900",
  },

  iconActive: {
    color: "#fff",
  },

  label: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8A8F98",
  },
});
