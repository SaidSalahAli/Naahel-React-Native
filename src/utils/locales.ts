/**
 * Localization Utilities
 * Multi-language support for Arabic and English
 */

export const locales = {
  en: {
    // Common
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    previous: "Previous",
    logout: "Logout",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    username: "Username",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    search: "Search",
    filter: "Filter",
    sort: "Sort",

    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    courses: "Courses",
    programs: "Programs",
    classrooms: "Classrooms",
    learningPaths: "Learning Paths",
    exams: "Exams",
    certificates: "Certificates",
    payments: "Payments",
    profile: "Profile",
    settings: "Settings",

    // Messages
    welcomeMessage: "Welcome to Naahel Learning Platform",
    loginSuccess: "Login successful",
    logoutSuccess: "You have been logged out",
    errorOccurred: "An error occurred. Please try again.",
    sessionExpired: "Your session has expired. Please login again.",

    // Courses
    myCourses: "My Courses",
    courseDetails: "Course Details",
    courseDuration: "Duration",
    courseLevel: "Level",
    instructor: "Instructor",
    enroll: "Enroll",
    enrolled: "Enrolled",

    // Exams
    myExams: "My Exams",
    startExam: "Start Exam",
    submitExam: "Submit Exam",
    examDuration: "Duration",
    totalQuestions: "Total Questions",
    passingScore: "Passing Score",

    // Certificates
    myCertificates: "My Certificates",
    verifyCertificate: "Verify Certificate",
    certificateCode: "Certificate Code",

    // Other
    aboutUs: "About Us",
    contactUs: "Contact Us",
    faqs: "FAQs",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    help: "Help",
    support: "Support",
  },
  ar: {
    // Common
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    retry: "إعادة محاولة",
    cancel: "إلغاء",
    save: "حفظ",
    delete: "حذف",
    edit: "تعديل",
    back: "رجوع",
    next: "التالي",
    previous: "السابق",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    username: "اسم المستخدم",
    rememberMe: "تذكرني",
    forgotPassword: "هل نسيت كلمة المرور؟",
    noAccount: "ليس لديك حساب؟",
    haveAccount: "هل لديك حساب بالفعل؟",
    search: "بحث",
    filter: "تصفية",
    sort: "ترتيب",

    // Navigation
    home: "الرئيسية",
    dashboard: "لوحة التحكم",
    courses: "الدورات",
    programs: "البرامج",
    classrooms: "الفصول الدراسية",
    learningPaths: "مسارات التعلم",
    exams: "الاختبارات",
    certificates: "الشهادات",
    payments: "الدفع",
    profile: "الملف الشخصي",
    settings: "الإعدادات",

    // Messages
    welcomeMessage: "مرحبا بك في منصة نهل للتعليم",
    loginSuccess: "تم تسجيل الدخول بنجاح",
    logoutSuccess: "تم تسجيل الخروج",
    errorOccurred: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    sessionExpired: "انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.",

    // Courses
    myCourses: "دوراتي",
    courseDetails: "تفاصيل الدورة",
    courseDuration: "المدة",
    courseLevel: "المستوى",
    instructor: "المدرب",
    enroll: "التسجيل",
    enrolled: "مسجل",

    // Exams
    myExams: "اختباراتي",
    startExam: "ابدأ الاختبار",
    submitExam: "إرسال الاختبار",
    examDuration: "المدة",
    totalQuestions: "عدد الأسئلة",
    passingScore: "درجة النجاح",

    // Certificates
    myCertificates: "شهاداتي",
    verifyCertificate: "التحقق من الشهادة",
    certificateCode: "رمز الشهادة",

    // Other
    aboutUs: "من نحن",
    contactUs: "تواصل معنا",
    faqs: "الأسئلة الشائعة",
    terms: "الشروط والأحكام",
    privacy: "سياسة الخصوصية",
    help: "مساعدة",
    support: "الدعم",
  },
};

/**
 * Get translation string
 */
export function t(key: string, language: string): string {
  const locale = locales[language as keyof typeof locales] || locales.en;
  return (locale as any)[key] || key;
}

/**
 * Format date to locale string
 */
export function formatDate(date: string | Date, language: string): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

/**
 * Format currency to locale string
 */
export function formatCurrency(
  amount: number,
  language: string,
  currency: string = "USD",
): string {
  try {
    return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return `${amount} ${currency}`;
  }
}

export default {
  locales,
  t,
  formatDate,
  formatCurrency,
};
