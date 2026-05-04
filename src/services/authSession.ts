/**
 * Authentication Session Service
 * Handles session validation and logout
 */

import { User } from "@/types";
import { callMoodleApi, MOODLE_FUNCTIONS } from "@/utils/coreApi";

/**
 * Validate current session and get user data
 */
export async function getSessionUser(
  tenantId: string,
  language: string,
  token: string,
): Promise<User | null> {
  try {
    const response = await callMoodleApi<User>(
      MOODLE_FUNCTIONS.GET_SESSION_USER,
      {
        tenantid: tenantId,
        lang: language,
      },
      token,
    );

    return response || null;
  } catch (error) {
    console.error("Get session user error:", error);
    return null;
  }
}

/**
 * Logout from Moodle session
 */
export async function logoutMoodleSession(
  tenantId: string,
  language: string,
  token: string,
): Promise<void> {
  try {
    await callMoodleApi(
      MOODLE_FUNCTIONS.LOGOUT_MOODLE_SESSION,
      {
        tenantid: tenantId,
        lang: language,
      },
      token,
    );
  } catch (error) {
    console.error("Logout moodle session error:", error);
    // Continue with logout even if API call fails
  }
}

export default {
  getSessionUser,
  logoutMoodleSession,
};
