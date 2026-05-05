/**
 * Program API Service
 * Handles program-related API calls
 */

import { MOODLE_CONFIG } from "@/config/config";
import { PaginationParams, Program } from "@/types";
import { callMoodleApi, MOODLE_FUNCTIONS } from "@/utils/coreApi";

/**
 * Get available programs
 */
export async function getAvailablePrograms(
  tenantId: string,
  language: string,
  params?: PaginationParams,
): Promise<Program[]> {
  try {
    const response = await callMoodleApi<Program[]>(
      MOODLE_FUNCTIONS.GET_PROGRAMS,
      {
        tenantid: tenantId,
        lang: language,
        ...params,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get available programs error:", error);
    throw error;
  }
}

/**
 * Get program details by ID
 */
export async function getProgramDetails(
  programId: string,
  tenantId: string,
  language: string,
): Promise<Program> {
  try {
    const response = await callMoodleApi<Program[]>(
      "local_guestapi_get_program_details",
      {
        tenantid: tenantId,
        programid: programId,
        lang: language,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );
    const program = response.find((p) => p.id === programId);

    if (!program) {
      throw new Error("Program not found");
    }

    return program;
  } catch (error) {
    console.error("Get program details error:", error);
    throw error;
  }
}

export default {
  getAvailablePrograms,
  getProgramDetails,
};
