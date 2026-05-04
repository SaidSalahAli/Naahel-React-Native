/**
 * Toast/Notification Utilities
 * Simple toast notification system for React Native
 */

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Store for listeners
let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];
let idCounter = 0;

/**
 * Show toast notification
 */
export function showToast(
  message: string,
  type: ToastType = "info",
  duration: number = 3000,
): string {
  const id = `toast-${idCounter++}`;

  const toast: Toast = {
    id,
    message,
    type,
    duration,
  };

  toasts = [...toasts, toast];
  notifyListeners();

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      hideToast(id);
    }, duration);
  }

  return id;
}

/**
 * Hide toast notification
 */
export function hideToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

/**
 * Clear all toasts
 */
export function clearToasts(): void {
  toasts = [];
  notifyListeners();
}

/**
 * Subscribe to toast changes
 */
export function subscribeToToasts(listener: (toasts: Toast[]) => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/**
 * Notify all listeners
 */
function notifyListeners(): void {
  listeners.forEach((listener) => listener([...toasts]));
}

// Convenience functions
export function showSuccessToast(message: string, duration?: number): string {
  return showToast(message, "success", duration);
}

export function showErrorToast(message: string, duration?: number): string {
  return showToast(message, "error", duration);
}

export function showWarningToast(message: string, duration?: number): string {
  return showToast(message, "warning", duration);
}

export function showInfoToast(message: string, duration?: number): string {
  return showToast(message, "info", duration);
}

export default {
  showToast,
  hideToast,
  clearToasts,
  subscribeToToasts,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
};
