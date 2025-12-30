/**
 * Logger utility for consistent logging across the backend
 * In production, only errors and warnings are logged
 * In development, all log levels are enabled
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  /**
   * Log debug information (only in development)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log informational messages (only in development)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Log general messages (only in development)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (always logged)
   */
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Log errors (always logged)
   */
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
};

export default logger;

