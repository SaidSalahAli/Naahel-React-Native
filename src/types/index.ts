/**
 * TypeScript Type Definitions
 * Centralized type definitions for the application
 */

// User Type
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tenantid: string;
  fullname?: string;
  pictureurl?: string;
}

// Subscription Plan Type
export interface SubscriptionPlan {
  id: number;
  name: string;
}

// Service Type
export interface Service {
  id: string;
  name: string;
  link?: string;
  seacrh_key?: string;
}

// Tenant Type
export interface Tenant {
  id: number | string;
  name: string;
  language?: string;
  direction?: "rtl" | "ltr";
  primaryColor?: string;
  primarycolor?: string;
  secondaryColor?: string;
  secondarycolor?: string;
  teritoryColor?: string;
  territoreycolor?: string;
  logo?: string;
  services?: Service[] | string[];
  expirationdate?: number;
  subscriptionplan?: SubscriptionPlan;
}

// Tenant Header Info
export interface TenantHeaderInfo {
  id?: number | string;
  logo?: string;
  name?: string;
  description?: string;
  primarycolor?: string;
  secondarycolor?: string;
  territoreycolor?: string;
  aboutus?: Array<{ status: string; link: string }>;
  contactus?: string;
  faq?: Array<{ status: string; link: string }>;
  services?: Service[];
  expirationdate?: number;
  subscriptionplan?: SubscriptionPlan;
}

// Tenant Footer Info
export interface TenantFooterInfo {
  copyright?: string;
  links?: Array<{ title: string; url: string }>;
}

// Course Type
export interface Course {
  id: string;
  name: string;
  description: string;
  image: string;
  duration: number;
  level: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
  enrolledCount?: number;
  rating?: number;
}

// Program Type
export interface Program {
  id: string;
  name: string;
  description: string;
  image: string;
  coursesCount: number;
  duration: number;
  level: string;
  price?: number;
}

// Classroom Type
export interface Classroom {
  id: string;
  name: string;
  description: string;
  image: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
  studentsCount: number;
  startDate: string;
}

// Learning Path Type
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  image: string;
  coursesCount: number;
  duration: number;
  skillLevel: string;
}

// Exam Type
export interface Exam {
  id: string;
  name: string;
  description: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  startDate: string;
  endDate: string;
}

// Auth Response Type
export interface AuthResponse {
  userid: string;
  fullname: string;
  email: string;
  pictureurl: string;
  token: string;
  redirecturl?: string;
}

// API Error Type
export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

// Pagination Type
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

// Login Credentials Type
export interface LoginCredentials {
  username: string;
  password: string;
  tenantId: string;
  language: string;
}

// Auth Context Type
export interface AuthContextType {
  isLoggedIn: boolean;
  isInitialized: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  register: (data: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  error: string | null;
  loading: boolean;
}

// Tenant Context Type
export interface TenantContextType {
  currentTenant: Tenant | null;
  tenantHeaderInfo: TenantHeaderInfo | null;
  tenantFooterInfo: TenantFooterInfo | null;
  setCurrentTenant: (tenant: Tenant) => void;
  getTenantInfo: (paramsOrTenantId: any, language?: string) => Promise<void>;
  isLoading: boolean;
  colorsLoaded: boolean;
  error: string | null;
}

// Config Context Type
export interface ConfigContextType {
  i18n: string;
  mode: "light" | "dark";
  themeDirection: "rtl" | "ltr";
  setLanguage: (language: string) => void;
  setMode: (mode: "light" | "dark") => void;
  setDirection: (direction: "rtl" | "ltr") => void;
}
