/**
 * Classroom API Service
 * Handles classroom-related API calls
 */

import { MOODLE_CONFIG } from "@/config/config";
import { Classroom, PaginationParams } from "@/types";
import { callMoodleApi, MOODLE_FUNCTIONS } from "@/utils/coreApi";

/**
 * Get available classrooms
 */
export async function getAvailableClassrooms(
  tenantId: string,
  language: string,
  params?: PaginationParams,
): Promise<Classroom[]> {
  try {
    const response = await callMoodleApi<Classroom[]>(
      MOODLE_FUNCTIONS.GET_CLASSROOMS,
      {
        tenantid: tenantId,
        lang: language,
        ...params,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get available classrooms error:", error);
    throw error;
  }
}

/**
 * Get classroom details by ID
 */
export async function getClassroomDetails(
  classroomId: string,
  tenantId: string,
  language: string,
): Promise<Classroom> {
  try {
    const classrooms = await getAvailableClassrooms(tenantId, language);
    const classroom = classrooms.find((c) => c.id === classroomId);

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    return classroom;
  } catch (error) {
    console.error("Get classroom details error:", error);
    throw error;
  }
}

export default {
  getAvailableClassrooms,
  getClassroomDetails,
};
