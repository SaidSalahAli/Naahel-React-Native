import { ConfigContext } from "@/contexts/ConfigContext";
import { useTenant } from "@/contexts/TenantContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useContext, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TenantHeader() {
  const { currentTenant, tenantHeaderInfo, isLoading } = useTenant();
  const config = useContext(ConfigContext);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const i18n = config?.i18n || "en";

  const primary =
    currentTenant?.primarycolor || currentTenant?.primaryColor || "#123CFF";

  const logo = currentTenant?.logo || tenantHeaderInfo?.logo;

  const handleLanguageChange = useCallback(
    async (lang: string) => {
      config?.setLanguage?.(lang);
      await AsyncStorage.setItem("language", lang);
      setShowLanguageMenu(false);
    },
    [config],
  );

  const nextLang = i18n === "ar" ? "en" : "ar";

  if (isLoading) {
    return (
      <View style={styles.header}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoArea}
          onPress={() => router.push("/" as any)}
        >
          {logo ? (
            <Image
              source={{ uri: logo }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.logoFallback, { backgroundColor: primary }]}>
              <Text style={styles.logoFallbackText}>N</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.iconButton}
            onPress={() => router.push("/search" as any)}
          >
            <Text style={styles.iconText}>⌕</Text>
          </TouchableOpacity>

          <View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.langButton}
              onPress={() => setShowLanguageMenu((prev) => !prev)}
            >
              <Text style={[styles.langText, { color: primary }]}>
                {i18n.toUpperCase()}
              </Text>
            </TouchableOpacity>

            {showLanguageMenu && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.langMenu}
                onPress={() => handleLanguageChange(nextLang)}
              >
                <Text style={styles.langMenuText}>
                  {nextLang === "ar" ? "العربية" : "English"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.loginButton, { backgroundColor: primary }]}
            onPress={() => router.push("/login" as any)}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fffff",
    paddingTop: Platform.OS === "ios" ? 56 : 38,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  header: {
    height: 66,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  logoArea: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },

  logo: {
    width: 145,
    height: 42,
  },

  logoFallback: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  logoFallbackText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFE58A",
    alignItems: "center",
    justifyContent: "center",
  },

  iconText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
  },

  langButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  langText: {
    fontSize: 14,
    fontWeight: "900",
  },

  langMenu: {
    position: "absolute",
    top: 50,
    right: 0,
    minWidth: 110,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 999,
  },

  langMenuText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },

  loginButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },

  loading: {
    color: "#999",
    fontSize: 13,
    fontWeight: "700",
  },
});
