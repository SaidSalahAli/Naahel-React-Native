/**
 * Exam API Service
 * Handles exam-related API calls
 */

import { MOODLE_CONFIG } from "@/config/config";
import { Exam, PaginationParams } from "@/types";
import { callMoodleApi } from "@/utils/coreApi";

/**
 * Get available exams
 */
export async function getAvailableExams(
  tenantId: string,
  language: string,
  params?: PaginationParams,
): Promise<Exam[]> {
  try {
    const response = await callMoodleApi<Exam[]>(
      "local_guestapi_get_available_exams",
      {
        tenantid: tenantId,
        lang: language,
        ...params,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get available exams error:", error);
    throw error;
  }
}

/**
 * Get exam details by ID
 */
export async function getExamDetails(
  examId: string,
  tenantId: string,
  language: string,
): Promise<Exam> {
  try {
    const exams = await getAvailableExams(tenantId, language);
    const exam = exams.find((e) => e.id === examId);

    if (!exam) {
      throw new Error("Exam not found");
    }

    return exam;
  } catch (error) {
    console.error("Get exam details error:", error);
    throw error;
  }
}

export default {
  getAvailableExams,
  getExamDetails,
};
