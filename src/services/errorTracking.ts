import { trackError as logAnalyticsError } from './analytics';
import { canUseErrorTracking, log } from '../config/environment';

export interface ErrorInfo {
  error: Error;
  errorInfo?: any;
  context?: string;
  userId?: string;
  userAgent?: string;
  additionalData?: Record<string, any>;
}

/**
 * Global error tracking service
 */
class ErrorTrackingService {
  private userId?: string;
  private isInitialized = false;

  /**
   * Initialize error tracking
   */
  initialize(userId?: string) {
    if (this.isInitialized) return;
    
    this.userId = userId;
    if (canUseErrorTracking) {
      this.setupGlobalErrorHandlers();
    }
    this.isInitialized = true;
    
    log.info('🚨 Error tracking initialized', userId ? `for user: ${userId}` : '');
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    // Check if we're in a browser environment with addEventListener support
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError({
          error: new Error(`Unhandled Promise Rejection: ${event.reason}`),
          context: 'unhandled_promise_rejection',
          additionalData: {
            reason: event.reason,
            stack: event.reason?.stack,
          },
        });
      });
    }

    // React Native specific global error handler
    if (typeof global !== 'undefined' && global.ErrorUtils) {
      const originalGlobalHandler = global.ErrorUtils.getGlobalHandler();
      global.ErrorUtils.setGlobalHandler((error, isFatal) => {
        this.trackError({
          error: error,
          context: 'react_native_global_error',
          additionalData: {
            isFatal,
          },
        });
        
        // Call original handler to maintain default behavior
        if (originalGlobalHandler) {
          originalGlobalHandler(error, isFatal);
        }
      });
    }

    // Handle React Native errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this looks like a React error
      const errorMessage = args.join(' ');
      if (errorMessage.includes('Error:') || errorMessage.includes('Warning:')) {
        this.trackError({
          error: new Error(errorMessage),
          context: 'console_error',
          additionalData: {
            args: args,
          },
        });
      }
      
      originalConsoleError.apply(console, args);
    };
  }

  /**
   * Track an error
   */
  trackError(errorInfo: ErrorInfo) {
    try {
      if (!canUseErrorTracking) {
        return;
      }

      const {
        error,
        context = 'unknown',
        userId = this.userId,
        additionalData = {},
      } = errorInfo;

      const errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context,
        userId,
        timestamp: new Date().toISOString(),
        ...additionalData,
      };

      // Log to console
      log.error('🚨 Tracked Error:', errorData);

      // Send to analytics
      logAnalyticsError(error.name, error.message, context);

      // In production, you might want to send to external service like Sentry
      // this.sendToExternalService(errorData);

    } catch (trackingError) {
      log.error('Error in error tracking:', trackingError);
    }
  }

  /**
   * Track authentication errors
   */
  trackAuthError(error: Error, action: 'login' | 'signup' | 'logout') {
    this.trackError({
      error,
      context: `auth_${action}`,
      additionalData: {
        action,
      },
    });
  }

  /**
   * Track Firebase errors
   */
  trackFirebaseError(error: Error, operation: string) {
    this.trackError({
      error,
      context: 'firebase_error',
      additionalData: {
        operation,
        code: (error as any).code,
      },
    });
  }

  /**
   * Track API errors
   */
  trackApiError(error: Error, endpoint: string, method: string) {
    this.trackError({
      error,
      context: 'api_error',
      additionalData: {
        endpoint,
        method,
      },
    });
  }

  /**
   * Track user action errors
   */
  trackUserActionError(error: Error, action: string, screen: string) {
    this.trackError({
      error,
      context: 'user_action_error',
      additionalData: {
        action,
        screen,
      },
    });
  }

  /**
   * Set user ID for error tracking
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Clear user ID (on logout)
   */
  clearUserId() {
    this.userId = undefined;
  }

  /**
   * Track performance issues
   */
  trackPerformanceIssue(operation: string, duration: number, threshold: number = 1000) {
    if (duration > threshold) {
      this.trackError({
        error: new Error(`Performance issue: ${operation} took ${duration}ms`),
        context: 'performance_issue',
        additionalData: {
          operation,
          duration,
          threshold,
        },
      });
    }
  }

  /**
   * Send error to external service (placeholder for production)
   */
  private sendToExternalService(errorData: any) {
    // In production, integrate with services like:
    // - Sentry: Sentry.captureException(error)
    // - Bugsnag: Bugsnag.notify(error)
    // - Custom API endpoint
    
    if (__DEV__) {
      console.log('Would send to external service:', errorData);
    }
  }
}

// Create singleton instance
export const errorTracker = new ErrorTrackingService();

// Convenience functions
export const trackError = (error: Error, context?: string, additionalData?: Record<string, any>) => {
  errorTracker.trackError({ error, context, additionalData });
};

export const trackAuthError = (error: Error, action: 'login' | 'signup' | 'logout') => {
  errorTracker.trackAuthError(error, action);
};

export const trackFirebaseError = (error: Error, operation: string) => {
  errorTracker.trackFirebaseError(error, operation);
};

export const trackApiError = (error: Error, endpoint: string, method: string) => {
  errorTracker.trackApiError(error, endpoint, method);
};

export const trackUserActionError = (error: Error, action: string, screen: string) => {
  errorTracker.trackUserActionError(error, action, screen);
};

export const trackPerformanceIssue = (operation: string, duration: number, threshold?: number) => {
  errorTracker.trackPerformanceIssue(operation, duration, threshold);
};

export default errorTracker;