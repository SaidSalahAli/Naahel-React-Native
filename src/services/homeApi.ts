/**
 * Home API Service
 * Handles home page related API calls (courses, programs, etc.)
 */

import { MOODLE_CONFIG } from "@/config/config";
import { callMoodleApi, MOODLE_FUNCTIONS } from "@/utils/coreApi";

interface FilterParams {
  maxResults?: number;
  page?: number;
  perpage?: number;
  search?: string;
  [key: string]: any;
}

/**
 * Build filter parameters for API calls
 */
function buildFilterParams(filter: FilterParams = {}) {
  const params: any = {};

  // Simple filters
  const simpleFilters = ["page", "perpage", "search"];
  simpleFilters.forEach((key) => {
    if (filter[key]) {
      params[key] = filter[key];
    }
  });

  // MaxResults with different key
  if (filter.maxResults) {
    params["maxresults"] = filter.maxResults;
  }

  return params;
}

/**
 * Get courses for home page
 */
export async function getCourses(
  tenantId: string,
  language: string = "en",
  filter: FilterParams = {},
) {
  try {
    const params = {
      tenantid: tenantId,
      lang: language,
      ...buildFilterParams(filter),
    };

    const response = await callMoodleApi(
      MOODLE_FUNCTIONS.GET_COURSES,
      params,
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get courses error:", error);
    throw error;
  }
}

/**
 * Get programs for home page
 */
export async function getPrograms(
  tenantId: string,
  language: string = "en",
  filter: FilterParams = {},
) {
  try {
    const params = {
      tenantid: tenantId,
      lang: language,
      ...buildFilterParams(filter),
    };

    const response = await callMoodleApi(
      MOODLE_FUNCTIONS.GET_PROGRAMS,
      params,
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get programs error:", error);
    throw error;
  }
}

/**
 * Get classrooms for home page
 */
export async function getClassrooms(
  tenantId: string,
  language: string = "en",
  filter: FilterParams = {},
) {
  try {
    const params = {
      tenantid: tenantId,
      lang: language,
      ...buildFilterParams(filter),
    };

    const response = await callMoodleApi(
      MOODLE_FUNCTIONS.GET_CLASSROOMS,
      params,
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get classrooms error:", error);
    throw error;
  }
}

/**
 * Get learning paths for home page
 */
export async function getLearningPaths(
  tenantId: string,
  language: string = "en",
  filter: FilterParams = {},
) {
  try {
    const params = {
      tenantid: tenantId,
      lang: language,
      ...buildFilterParams(filter),
    };

    const response = await callMoodleApi(
      MOODLE_FUNCTIONS.GET_LEARNING_PATH,
      params,
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get learning paths error:", error);
    throw error;
  }
}

/**
 * Get exams for home page
 */
export async function getExams(
  tenantId: string,
  language: string = "en",
  filter: FilterParams = {},
) {
  try {
    const params = {
      tenantid: tenantId,
      lang: language,
      ...buildFilterParams(filter),
    };

    const response = await callMoodleApi(
      "local_guestapi_get_available_onlineexams",
      params,
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get exams error:", error);
    throw error;
  }
}

/**
 * Get reviews/feedbacks
 */
export async function getReviews(tenantId: string, language: string = "en") {
  try {
    const params = {
      tenantid: tenantId,
      lang: language,
    };

    const response = await callMoodleApi(
      "local_guestapi_get_available_feedbacks",
      params,
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get reviews error:", error);
    throw error;
  }
}

/**
 * Get partners/providers
 */
export async function getPartners(tenantId: string, language: string = "en") {
  try {
    const params = {
      tenantid: tenantId,
      lang: language,
    };

    const response = await callMoodleApi(
      "local_guestapi_get_tenant_partners_section",
      params,
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get partners error:", error);
    throw error;
  }
}

/**
 * Get hero section data
 */
export async function getHero(tenantId: string, language: string = "en") {
  try {
    const params = {
      tenantid: tenantId,
      lang: language,
    };

    const response = await callMoodleApi(
      "local_guestapi_get_tenant_hero_section",
      params,
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Get hero error:", error);
    throw error;
  }
}

/**
 * Search across services
 */
export async function search(
  tenantId: string,
  language: string = "en",
  searchText: string,
  service: string = "all",
) {
  try {
    const params = {
      tenantid: tenantId,
      lang: language,
      search: searchText,
      service: service,
    };

    const response = await callMoodleApi(
      "local_guestapi_get_tenant_header_search",
      params,
      MOODLE_CONFIG.DEFAULT_WS_TOKEN,
    );

    return response;
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}

// Export all functions as default
export default {
  getCourses,
  getPrograms,
  getClassrooms,
  getLearningPaths,
  getExams,
  getReviews,
  getPartners,
  getHero,
  search,
};
