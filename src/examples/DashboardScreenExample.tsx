/**
 * Dashboard Screen Example
 * Demonstrates using multiple contexts and services
 */

import { useAuth } from "@/contexts/AuthContext";
import { useConfig } from "@/contexts/ConfigContext";
import { useTenant } from "@/contexts/TenantContext";
import { t } from "@/utils/locales";
import React from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { currentTenant, isLoading } = useTenant();
  const { i18n, themeDirection, mode } = useConfig();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const isDark = mode === "dark";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}
    >
      {/* Header with Tenant Logo */}
      {currentTenant?.logo && (
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: currentTenant.logo }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Tenant Name */}
      <Text
        style={[
          styles.tenantName,
          {
            color: currentTenant?.primaryColor || "#007AFF",
            textAlign: themeDirection === "rtl" ? "right" : "left",
          },
        ]}
      >
        {currentTenant?.name}
      </Text>

      {/* User Profile Section */}
      <View
        style={[
          styles.profileCard,
          { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5" },
        ]}
      >
        {user?.avatar && (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        )}

        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: isDark ? "#fff" : "#000" }]}>
            {user?.name}
          </Text>
          <Text style={[styles.userEmail, { color: isDark ? "#aaa" : "#666" }]}>
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: currentTenant?.primaryColor },
          ]}
        >
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>{t("myCourses", i18n)}</Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: currentTenant?.secondaryColor },
          ]}
        >
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>{t("certificates", i18n)}</Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: currentTenant?.teritoryColor },
          ]}
        >
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>{t("myExams", i18n)}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: currentTenant?.primaryColor },
          ]}
        >
          <Text style={styles.actionButtonText}>{t("courses", i18n)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: currentTenant?.secondaryColor },
          ]}
        >
          <Text style={styles.actionButtonText}>{t("exams", i18n)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: currentTenant?.teritoryColor },
          ]}
        >
          <Text style={styles.actionButtonText}>{t("certificates", i18n)}</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>{t("logout", i18n)}</Text>
      </TouchableOpacity>

      {/* Footer */}
      {/* Display footer info from tenant */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 60,
  },
  tenantName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statNumber: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
