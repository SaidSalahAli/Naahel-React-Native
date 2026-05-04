/**
 * Authentication Service
 * Handles authentication-related API calls to Moodle
 */

import { MOODLE_CONFIG } from "@/config/config";
import { AuthResponse } from "@/types";
import { callMoodleApi, MOODLE_FUNCTIONS } from "@/utils/coreApi";

/**
 * Authenticate user against Moodle
 */
export async function moodleLogin(
  username: string,
  password: string,
  tenantid: string,
  lang: string,
): Promise<AuthResponse> {
  try {
    const response = await callMoodleApi<AuthResponse>(
      MOODLE_FUNCTIONS.TENANT_LOGIN,
      {
        username,
        password,
        tenantid,
        lang,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Moodle login error:", error);
    throw error;
  }
}

/**
 * Get tenant login configuration
 */
export async function getTenantLoginInfo(
  tenantid: string,
  lang: string,
): Promise<any> {
  try {
    const response = await callMoodleApi(
      MOODLE_FUNCTIONS.GET_TENANT_LOGIN_INFO,
      {
        tenantid,
        lang,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get tenant login info error:", error);
    throw error;
  }
}

export default {
  moodleLogin,
  getTenantLoginInfo,
};
