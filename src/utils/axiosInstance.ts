/**
 * Axios Configuration
 * Configured axios instance with interceptors for API communication
 */

import { API_CONFIG, API_TIMEOUT, STORAGE_KEYS } from "@/config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Add Bearer token from AsyncStorage
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error reading token from storage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle errors globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      try {
        // Clear auth data
        await AsyncStorage.removeItem(STORAGE_KEYS.SERVICE_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);

        // Trigger logout event or redirect to login
        // This should be handled by your auth context
        console.warn("Session expired. Please login again.");
      } catch (storageError) {
        console.error("Error clearing storage:", storageError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
