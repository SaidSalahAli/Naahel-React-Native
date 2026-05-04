/**
 * Learning Path API Service
 * Handles learning path-related API calls
 */

import { MOODLE_CONFIG } from "@/config/config";
import { LearningPath, PaginationParams } from "@/types";
import { callMoodleApi, MOODLE_FUNCTIONS } from "@/utils/coreApi";

/**
 * Get available learning paths
 */
export async function getAvailableLearningPaths(
  tenantId: string,
  language: string,
  params?: PaginationParams,
): Promise<LearningPath[]> {
  try {
    const response = await callMoodleApi<LearningPath[]>(
      MOODLE_FUNCTIONS.GET_LEARNING_PATH,
      {
        tenantid: tenantId,
        lang: language,
        ...params,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get available learning paths error:", error);
    throw error;
  }
}

/**
 * Get learning path details by ID
 */
export async function getLearningPathDetails(
  pathId: string,
  tenantId: string,
  language: string,
): Promise<LearningPath> {
  try {
    const paths = await getAvailableLearningPaths(tenantId, language);
    const path = paths.find((p) => p.id === pathId);

    if (!path) {
      throw new Error("Learning path not found");
    }

    return path;
  } catch (error) {
    console.error("Get learning path details error:", error);
    throw error;
  }
}

export default {
  getAvailableLearningPaths,
  getLearningPathDetails,
};
