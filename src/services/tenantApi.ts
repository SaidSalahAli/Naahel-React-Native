/**
 * Tenant API Service
 * Handles tenant-related API calls
 */

import { MOODLE_CONFIG } from "@/config/config";
import { Tenant, TenantFooterInfo, TenantHeaderInfo } from "@/types";
import { callMoodleApi, MOODLE_FUNCTIONS } from "@/utils/coreApi";

/**
 * Get tenant information and configuration
 */
export async function getTenantInfo(
  tenantId: string,
  language: string,
): Promise<Tenant> {
  try {
    const response = await callMoodleApi<Tenant>(
      MOODLE_FUNCTIONS.GET_TENANT_INFO,
      {
        tenantid: tenantId,
        lang: language,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get tenant info error:", error);
    throw error;
  }
}

/**
 * Get tenant header/branding information
 */
export async function getTenantHeaderInfo(
  tenantId: string,
  language: string,
): Promise<TenantHeaderInfo> {
  try {
    const response = await callMoodleApi<TenantHeaderInfo>(
      MOODLE_FUNCTIONS.GET_TENANT_HEADER_INFO,
      {
        tenantid: tenantId,
        lang: language,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get tenant header info error:", error);
    throw error;
  }
}

/**
 * Get tenant footer information
 */
export async function getTenantFooterInfo(
  tenantId: string,
  language: string,
): Promise<TenantFooterInfo> {
  try {
    const response = await callMoodleApi<TenantFooterInfo>(
      MOODLE_FUNCTIONS.GET_FOOTER_INFO,
      {
        tenantid: tenantId,
        lang: language,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get tenant footer info error:", error);
    throw error;
  }
}

export default {
  getTenantInfo,
  getTenantHeaderInfo,
  getTenantFooterInfo,
};
