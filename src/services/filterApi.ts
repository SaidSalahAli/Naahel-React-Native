import { MOODLE_CONFIG } from "@/config/config";
import { callMoodleApi } from "@/utils/coreApi";

export async function getAllFilter(
  tenantId: string,
  language: string = "en",
  service: string = "courses"
) {
  try {
    return await callMoodleApi(
      "local_guestapi_get_tenant_filter_metadata",
      {
        tenantid: tenantId,
        lang: language,
        service,
      },
      MOODLE_CONFIG.DEFAULT_WS_TOKEN
    );
  } catch (error) {
    console.error("Get filters error:", error);
    throw error;
  }
}