/**
 * Kiran AI Video Studio - Real Automatic Email Notification Service
 * Re-exports the unified notification service from /api/index
 * Ensures full backwards compatibility across the application.
 */
export {
  notifyAdminNewUserSignup,
  notifyAdminVideoRequested,
  notifyAdminVideoCompleted,
  notifyAdminVideoFailed,
  notifyAdminOperationalError,
  sendAdminTestEmail,
  sendAdminNotification,
  isEmailConfigured,
  getAdminNotificationEmail,
  getKathmanduTimestamp,
  sanitizeError
} from '../api/index';
