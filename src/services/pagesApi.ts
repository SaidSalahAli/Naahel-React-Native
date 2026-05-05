import { callMoodleApi, MOODLE_FUNCTIONS } from "@/utils/coreApi";
import { MOODLE_CONFIG } from "@/config/config";

/**
 * Get About Us Page
 */
export async function getAboutUs(tenantId: string, lang: string) {
  return await callMoodleApi(
    MOODLE_FUNCTIONS.GET_ABOUT_US,
    {
      tenantid: tenantId,
      lang,
    },
    MOODLE_CONFIG.DEFAULT_WS_TOKEN,
  );
}

/**
 * Verify Certificate
 */
export async function getVerifyCertificate(
  tenantId: string,
  lang: string,
  certificatecode: string,
) {
  return await callMoodleApi(
    MOODLE_FUNCTIONS.GET_ISSUED_CERTIFICATE,
    {
      tenantid: tenantId,
      lang,
      certificatecode,
    },
    MOODLE_CONFIG.DEFAULT_WS_TOKEN,
  );
}

/**
 * Get FAQs
 */
export async function getFaqs(tenantId: string, lang: string) {
  return await callMoodleApi(
    MOODLE_FUNCTIONS.GET_FAQS,
    {
      tenantid: tenantId,
      lang,
    },
    MOODLE_CONFIG.DEFAULT_WS_TOKEN,
  );
}

/**
 * Contact Us
 */
export async function sendMessage(params: any) {
  return await callMoodleApi(
    MOODLE_FUNCTIONS.CONTACT_US,
    params,
    MOODLE_CONFIG.DEFAULT_WS_TOKEN,
  );
}