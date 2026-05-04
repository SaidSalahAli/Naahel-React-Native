/**
 * Tenant Detection Utility
 * Detects tenant from various sources (URL, deep links, etc.)
 */

import * as Linking from "expo-linking";

/**
 * Extract tenant ID from URL hostname
 * Example: tenant-name.naahel.com -> tenant-name
 */
export function getTenantFromHostname(url?: string): string | null {
  try {
    const hostname = url ? new URL(url).hostname : undefined;

    if (!hostname) {
      return null;
    }

    // Extract subdomain (tenant name)
    const parts = hostname.split(".");
    if (parts.length >= 2 && parts[0] !== "www") {
      return parts[0];
    }

    return null;
  } catch (error) {
    console.error("Error extracting tenant from hostname:", error);
    return null;
  }
}

/**
 * Extract tenant ID from deep link
 * Example: app://naahel/tenant-name/home -> tenant-name
 */
export function getTenantFromDeepLink(url: string): string | null {
  try {
    const parsed = Linking.parse(url);

    // Check if path contains tenant ID
    if (parsed.path) {
      const pathParts = parsed.path.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        return pathParts[0];
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting tenant from deep link:", error);
    return null;
  }
}

/**
 * Get initial URL (for handling deep links on app launch)
 */
export async function getInitialURL(): Promise<string | null> {
  try {
    // Check if app was launched from a notification
    // This would be handled by notification library

    // Check for deep link
    const url = await Linking.getInitialURL();

    if (url != null) {
      return url;
    }

    return null;
  } catch (error) {
    console.error("Error getting initial URL:", error);
    return null;
  }
}

/**
 * Generate deep link for a route
 */
export function generateDeepLink(tenantId: string, route: string): string {
  const scheme = "naahel://";
  return `${scheme}${tenantId}/${route}`;
}

export default {
  getTenantFromHostname,
  getTenantFromDeepLink,
  getInitialURL,
  generateDeepLink,
};
