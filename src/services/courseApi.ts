/**
 * Course API Service
 * Handles course-related API calls
 */

import { MOODLE_CONFIG } from "@/config/config";
import { Course, PaginationParams } from "@/types";
import { callMoodleApi, MOODLE_FUNCTIONS } from "@/utils/coreApi";

/**
 * Get available courses
 */
export async function getAvailableCourses(
  tenantId: string,
  language: string,
  params?: PaginationParams,
): Promise<Course[]> {
  try {
    const response = await callMoodleApi<Course[]>(
      MOODLE_FUNCTIONS.GET_COURSES,
      {
        tenantid: tenantId,
        lang: language,
        ...params,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get available courses error:", error);
    throw error;
  }
}

/**
 * Get course details by ID
 */
export async function getCourseDetails(
  courseId: string,
  tenantId: string,
  language: string,
): Promise<Course> {
  try {
    const courses = await getAvailableCourses(tenantId, language);
    const course = courses.find((c) => c.id === courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    return course;
  } catch (error) {
    console.error("Get course details error:", error);
    throw error;
  }
}

export default {
  getAvailableCourses,
  getCourseDetails,
};
