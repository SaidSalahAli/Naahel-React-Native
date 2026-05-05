// app/(guest)/more.tsx

import { ConfigContext } from "@/contexts/ConfigContext";
import { useTenant } from "@/contexts/TenantContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useContext } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MenuItem = {
  key: string;
  icon: string;
  labelEn: string;
  labelAr: string;
  route?: string;
  action?: () => void;
  danger?: boolean;
};

export default function MoreScreen() {
  const { currentTenant, tenantHeaderInfo } = useTenant();
  const config = useContext(ConfigContext);

  const i18n = config?.i18n ?? "en";
  const isAr = i18n === "ar";
  const primary = currentTenant?.primarycolor ?? "#123CFF";
  const secondary = currentTenant?.secondarycolor ?? "#FFE58A";
  const logo = currentTenant?.logo;
  const appName = currentTenant?.name;

  const aboutusEnabled = tenantHeaderInfo?.aboutus?.[0]?.status === "1";
  const contactEnabled = !!tenantHeaderInfo?.contactus;
  const faqEnabled = tenantHeaderInfo?.faq?.[0]?.status === "1";

  const toggleLanguage = useCallback(async () => {
    const next = isAr ? "en" : "ar";
    config?.setLanguage?.(next);
    await AsyncStorage.setItem("language", next);
  }, [isAr, config]);

  const accountItems: MenuItem[] = [
    {
      key: "login",
      icon: "→",
      labelEn: "Login",
      labelAr: "تسجيل الدخول",
      route: "/login",
    },
  ];

  const generalItems: MenuItem[] = [
    ...(aboutusEnabled
      ? [
          {
            key: "about",
            icon: "ℹ",
            labelEn: "About Us",
            labelAr: "من نحن",
            route: "/about-us",
          },
        ]
      : []),
    ...(contactEnabled
      ? [
          {
            key: "contact",
            icon: "✉",
            labelEn: "Contact Us",
            labelAr: "اتصل بنا",
            route: "/contact-us",
          },
        ]
      : []),
    ...(faqEnabled
      ? [
          {
            key: "faq",
            icon: "?",
            labelEn: "FAQs",
            labelAr: "الأسئلة الشائعة",
            route: "/faqs",
          },
        ]
      : []),
    {
      key: "certificate",
      icon: "✓",
      labelEn: "Verify Certificate",
      labelAr: "التحقق من الشهادة",
      route: "/verify-certificate",
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "ios" ? 160 : 140 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Brand header ── */}
      <View style={[styles.brandCard, { backgroundColor: primary }]}>
        {logo ? (
          <Image
            source={{ uri: logo }}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.logoFallback, { backgroundColor: secondary }]}>
            <Text style={[styles.logoFallbackText, { color: primary }]}>N</Text>
          </View>
        )}
        {/* ✅ استبدلنا info?.name بـ appName */}
        {appName ? <Text style={styles.brandName}>{appName}</Text> : null}
      </View>

      {/* ── Account section ── */}
      <SectionLabel label={isAr ? "الحساب" : "Account"} />
      <View style={styles.card}>
        {accountItems.map((item, idx) => (
          <MenuRow
            key={item.key}
            item={item}
            isAr={isAr}
            primary={primary}
            isLast={idx === accountItems.length - 1}
            onPress={() => item.route && router.push(item.route as any)}
          />
        ))}
      </View>

      {/* ── Language toggle ── */}
      <SectionLabel label={isAr ? "الإعدادات" : "Settings"} />
      <View style={styles.card}>
        <View style={styles.langRow}>
          <View style={styles.langLeft}>
            <View
              style={[styles.iconCircle, { backgroundColor: primary + "18" }]}
            >
              <Text style={[styles.rowIcon, { color: primary }]}>⊕</Text>
            </View>
            <Text style={styles.rowLabel}>{isAr ? "اللغة" : "Language"}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleLanguage}
            style={[styles.langToggle, { borderColor: primary }]}
          >
            <View
              style={[styles.langOption, !isAr && { backgroundColor: primary }]}
            >
              <Text style={[styles.langOptionText, !isAr && { color: "#fff" }]}>
                EN
              </Text>
            </View>
            <View
              style={[styles.langOption, isAr && { backgroundColor: primary }]}
            >
              <Text style={[styles.langOptionText, isAr && { color: "#fff" }]}>
                ع
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── General section ── */}
      {generalItems.length > 0 && (
        <>
          <SectionLabel label={isAr ? "عام" : "General"} />
          <View style={styles.card}>
            {generalItems.map((item, idx) => (
              <MenuRow
                key={item.key}
                item={item}
                isAr={isAr}
                primary={primary}
                isLast={idx === generalItems.length - 1}
                onPress={() => item.route && router.push(item.route as any)}
              />
            ))}
          </View>
        </>
      )}

      <Text style={styles.version}>v1.0.0</Text>
    </ScrollView>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function MenuRow({
  item,
  isAr,
  primary,
  isLast,
  onPress,
}: {
  item: MenuItem;
  isAr: boolean;
  primary: string;
  isLast: boolean;
  onPress: () => void;
}) {
  const label = isAr ? item.labelAr : item.labelEn;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.menuRow, isAr && styles.menuRowRTL]}
        onPress={onPress}
      >
        <View style={[styles.iconCircle, { backgroundColor: primary + "18" }]}>
          <Text style={[styles.rowIcon, { color: primary }]}>{item.icon}</Text>
        </View>
        <Text style={[styles.rowLabel, item.danger && { color: "#FF3B30" }]}>
          {label}
        </Text>
        <Text style={[styles.chevron, isAr && styles.chevronRTL]}>›</Text>
      </TouchableOpacity>
      {!isLast && <View style={styles.separator} />}
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F4F8",
  },
  content: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 16,
    gap: 4,
  },
  brandCard: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  brandLogo: {
    width: 160,
    height: 44,
  },
  logoFallback: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: {
    fontSize: 24,
    fontWeight: "900",
  },
  brandName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8A8F98",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuRowRTL: {
    flexDirection: "row-reverse",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIcon: {
    fontSize: 16,
    fontWeight: "900",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0B0F14",
  },
  chevron: {
    fontSize: 20,
    color: "#C7C9D1",
    fontWeight: "300",
  },
  chevronRTL: {
    transform: [{ scaleX: -1 }],
  },
  separator: {
    height: 1,
    backgroundColor: "#F2F4F8",
    marginLeft: 64,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  langLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  langToggle: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  langOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  langOptionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8A8F98",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: "#C7C9D1",
    fontWeight: "600",
    marginTop: 24,
  },
});
