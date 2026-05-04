/**
 * Core Moodle API Utility
 * Handles REST API calls to Moodle webservice
 */

import { MOODLE_CONFIG, MOODLE_FUNCTIONS } from "@/config/config";
import axiosInstance from "./axiosInstance";

interface ApiParams {
  [key: string]: string | number | boolean;
}

/**
 * Build full Moodle API URL with parameters
 */
export function buildMoodleApiUrl(
  wsfunction: string,
  params: ApiParams,
  token: string,
): string {
  const queryParams = new URLSearchParams();

  queryParams.append("wstoken", token);
  queryParams.append("wsfunction", wsfunction);
  queryParams.append("moodlewsrestformat", MOODLE_CONFIG.FORMAT);

  // Add all additional parameters
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });

  return `${MOODLE_CONFIG.BASE_URL}?${queryParams.toString()}`;
}

/**
 * Make API call to Moodle webservice
 */
export async function callMoodleApi<T = any>(
  wsfunction: string,
  params: ApiParams,
  token: string,
): Promise<T> {
  try {
    const url = buildMoodleApiUrl(wsfunction, params, token);

    const response = await axiosInstance.post<T>(
      MOODLE_CONFIG.BASE_URL,
      new URLSearchParams({
        wstoken: token,
        wsfunction: wsfunction,
        moodlewsrestformat: MOODLE_CONFIG.FORMAT,
        ...Object.entries(params).reduce(
          (acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          },
          {} as Record<string, string>,
        ),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // Check for Moodle errors in response
    if (
      response.data &&
      typeof response.data === "object" &&
      "exception" in response.data
    ) {
      const error = response.data as any;
      throw new Error(error.message || "Moodle API error");
    }

    return response.data;
  } catch (error) {
    console.error("Moodle API error:", error);
    throw error;
  }
}

export { MOODLE_FUNCTIONS };
