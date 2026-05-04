/**
 * Application Configuration
 * Centralized configuration for API endpoints, Moodle settings, and app constants
 */

export const API_CONFIG = {
  BASE_URL:
    process.env.EXPO_PUBLIC_API_URL || "https://naahelapi.dolfprojects.com",
  VERSION: "1.0.0",
};

export const MOODLE_CONFIG = {
  BASE_URL: "/webservice/rest/server.php",
  URL_INFO: "https://accounts.naahel.com",
  DEFAULT_WS_TOKEN: "5e2b2559f3a4052a78c062cae22948bb",
  FORMAT: "json",
};

// Moodle Web Service Functions
export const MOODLE_FUNCTIONS = {
  GET_TENANT_INFO: "local_guestapi_get_tenant_info",
  GET_TENANT_HEADER_INFO: "local_guestapi_get_tenant_header_info",
  GET_FOOTER_INFO: "local_guestapi_get_tenant_footer_info",
  GET_PROGRAMS: "local_guestapi_get_available_programs",
  GET_CLASSROOMS: "local_guestapi_get_available_classes",
  GET_COURSES: "local_guestapi_get_available_courses",
  GET_LEARNING_PATH: "local_guestapi_get_available_learningpaths",
  TENANT_LOGIN: "local_guestapi_tenant_login_process",
  GET_TENANT_LOGIN_INFO: "local_guestapi_get_tenant_login_info",
  GET_SESSION_USER: "local_guestapi_get_session_user",
  LOGOUT_MOODLE_SESSION: "local_guestapi_logout_moodle_session",
};

// Default language and direction
export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_THEME_MODE = "light";

// Storage Keys
export const STORAGE_KEYS = {
  SERVICE_TOKEN: "serviceToken",
  USER_DATA: "userData",
  LANGUAGE: "language",
  THEME_MODE: "themeMode",
  TENANT_ID: "tenantId",
  TENANT_CONFIG: "tenantConfig",
};

// Session check interval (in milliseconds)
export const SESSION_CHECK_INTERVAL = 30000; // 30 seconds

// API Timeout
export const API_TIMEOUT = 30000; // 30 seconds
