import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackAnalyticsEvent } from './analytics';

export interface CrashReport {
  id: string;
  timestamp: number;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  userContext: {
    userId?: string;
    appVersion: string;
    platform: string;
    deviceInfo?: any;
    userAgent?: string;
  };
  appContext: {
    screen: string;
    action?: string;
    appState: 'active' | 'inactive' | 'background';
    memoryUsage?: number;
    networkState?: 'online' | 'offline';
  };
  breadcrumbs: CrashBreadcrumb[];
}

export interface CrashBreadcrumb {
  timestamp: number;
  category: 'navigation' | 'user_action' | 'api_call' | 'error' | 'info';
  message: string;
  data?: Record<string, any>;
  level: 'error' | 'warning' | 'info' | 'debug';
}

class CrashReporter {
  private breadcrumbs: CrashBreadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private currentScreen = 'unknown';
  private currentUserId?: string;
  private appVersion = '1.0.0'; // Should come from app config
  private isInitialized = false;

  initialize(userId?: string): void {
    if (this.isInitialized) return;

    this.currentUserId = userId;
    this.isInitialized = true;

    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    
    // Load persisted breadcrumbs
    this.loadPersistedBreadcrumbs();

    console.log('🚨 Crash reporting initialized for user:', userId);
  }

  updateUserId(userId: string): void {
    this.currentUserId = userId;
    this.addBreadcrumb('info', 'User logged in', { userId }, 'info');
  }

  setCurrentScreen(screenName: string): void {
    this.currentScreen = screenName;
    this.addBreadcrumb('navigation', `Navigated to ${screenName}`, { screen: screenName }, 'info');
  }

  addBreadcrumb(
    category: CrashBreadcrumb['category'],
    message: string,
    data?: Record<string, any>,
    level: CrashBreadcrumb['level'] = 'info'
  ): void {
    const breadcrumb: CrashBreadcrumb = {
      timestamp: Date.now(),
      category,
      message,
      data,
      level
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }

    // Persist breadcrumbs
    this.persistBreadcrumbs();

    // Log to console in development
    if (__DEV__) {
      console.log(`🍞 [${category}] ${message}`, data);
    }
  }

  logError(error: Error, context?: { screen?: string; action?: string; metadata?: Record<string, any> }): void {
    this.addBreadcrumb('error', `Error: ${error.message}`, {
      errorName: error.name,
      stack: error.stack,
      ...context?.metadata
    }, 'error');

    // Create and store crash report
    this.createCrashReport(error, context);
  }

  logWarning(message: string, context?: Record<string, any>): void {
    this.addBreadcrumb('info', message, context, 'warning');
  }

  logApiCall(endpoint: string, method: string, success: boolean, metadata?: Record<string, any>): void {
    this.addBreadcrumb('api_call', `${method} ${endpoint}`, {
      success,
      ...metadata
    }, success ? 'info' : 'warning');
  }

  logUserAction(action: string, screen: string, metadata?: Record<string, any>): void {
    this.addBreadcrumb('user_action', `${action} on ${screen}`, {
      screen,
      action,
      ...metadata
    }, 'info');
  }

  private async createCrashReport(error: Error, context?: { screen?: string; action?: string; metadata?: Record<string, any> }): Promise<void> {
    const crashReport: CrashReport = {
      id: `crash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userContext: {
        userId: this.currentUserId,
        appVersion: this.appVersion,
        platform: 'react-native',
        // Add device info if available
        deviceInfo: await this.getDeviceInfo()
      },
      appContext: {
        screen: context?.screen || this.currentScreen,
        action: context?.action,
        appState: 'active', // Could be enhanced to track actual app state
        networkState: 'online' // Could be enhanced to track actual network state
      },
      breadcrumbs: [...this.breadcrumbs]
    };

    try {
      // Store crash report locally
      await this.storeCrashReport(crashReport);

      // Send to analytics
      trackAnalyticsEvent('app_crash', {
        errorName: error.name,
        errorMessage: error.message,
        screen: crashReport.appContext.screen,
        userId: this.currentUserId,
        breadcrumbsCount: this.breadcrumbs.length
      });

      // In production, this would also upload to a crash reporting service
      await this.uploadCrashReport(crashReport);

      console.error('🚨 Crash report created:', crashReport.id);
    } catch (reportingError) {
      console.error('Failed to create crash report:', reportingError);
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handle JavaScript errors
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      console.error('🚨 Global error caught:', error);
      
      this.logError(error, {
        screen: this.currentScreen,
        metadata: { isFatal, globalError: true }
      });

      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Handle unhandled promise rejections
    const originalRejectionHandler = require('react-native/Libraries/Core/ExceptionsManager').unstable_setGlobalHandler;
    
    if (originalRejectionHandler) {
      const originalHandler = global.__onUnhandledRejection;
      
      global.__onUnhandledRejection = (error: any) => {
        console.error('🚨 Unhandled promise rejection:', error);
        
        this.logError(error instanceof Error ? error : new Error(String(error)), {
          screen: this.currentScreen,
          metadata: { unhandledRejection: true }
        });

        if (originalHandler) {
          originalHandler(error);
        }
      };
    }
  }

  private async getDeviceInfo(): Promise<any> {
    try {
      // Basic device info - could be enhanced with react-native-device-info
      return {
        userAgent: navigator.userAgent,
        platform: 'react-native',
        // Could add more device-specific info here
      };
    } catch (error) {
      return { error: 'Could not get device info' };
    }
  }

  private async storeCrashReport(report: CrashReport): Promise<void> {
    try {
      await AsyncStorage.setItem(`crash_${report.id}`, JSON.stringify(report));
      
      // Also update the crash reports index
      const existingReports = await AsyncStorage.getItem('crash_reports_index');
      const reportsIndex = existingReports ? JSON.parse(existingReports) : [];
      
      reportsIndex.push({
        id: report.id,
        timestamp: report.timestamp,
        errorName: report.error.name
      });

      // Keep only the most recent 20 crash reports
      const recentReports = reportsIndex.slice(-20);
      await AsyncStorage.setItem('crash_reports_index', JSON.stringify(recentReports));
      
    } catch (error) {
      console.error('Failed to store crash report:', error);
    }
  }

  private async uploadCrashReport(report: CrashReport): Promise<void> {
    // In a production app, this would upload to a service like Sentry, Bugsnag, etc.
    // For now, we'll just log it
    console.log('📤 Would upload crash report to service:', {
      id: report.id,
      error: report.error.name,
      screen: report.appContext.screen,
      userId: report.userContext.userId
    });
  }

  private async persistBreadcrumbs(): Promise<void> {
    try {
      await AsyncStorage.setItem('crash_breadcrumbs', JSON.stringify(this.breadcrumbs));
    } catch (error) {
      // Fail silently
    }
  }

  private async loadPersistedBreadcrumbs(): Promise<void> {
    try {
      const persisted = await AsyncStorage.getItem('crash_breadcrumbs');
      if (persisted) {
        this.breadcrumbs = JSON.parse(persisted);
        // Add a breadcrumb indicating app restart
        this.addBreadcrumb('info', 'App started with persisted breadcrumbs', {
          breadcrumbsLoaded: this.breadcrumbs.length
        }, 'info');
      }
    } catch (error) {
      // Fail silently
    }
  }

  async getCrashReports(): Promise<CrashReport[]> {
    try {
      const reportsIndex = await AsyncStorage.getItem('crash_reports_index');
      if (!reportsIndex) return [];

      const index = JSON.parse(reportsIndex);
      const reports: CrashReport[] = [];

      for (const reportMeta of index) {
        try {
          const reportData = await AsyncStorage.getItem(`crash_${reportMeta.id}`);
          if (reportData) {
            reports.push(JSON.parse(reportData));
          }
        } catch (error) {
          console.error('Failed to load crash report:', reportMeta.id, error);
        }
      }

      return reports;
    } catch (error) {
      console.error('Failed to get crash reports:', error);
      return [];
    }
  }

  async clearCrashReports(): Promise<void> {
    try {
      const reportsIndex = await AsyncStorage.getItem('crash_reports_index');
      if (!reportsIndex) return;

      const index = JSON.parse(reportsIndex);
      
      // Remove all crash report files
      const keys = index.map((report: any) => `crash_${report.id}`);
      await AsyncStorage.multiRemove([...keys, 'crash_reports_index', 'crash_breadcrumbs']);
      
      // Clear in-memory breadcrumbs
      this.breadcrumbs = [];
      
      console.log('🧹 Crash reports cleared');
    } catch (error) {
      console.error('Failed to clear crash reports:', error);
    }
  }
}

// Export singleton instance
export const crashReporter = new CrashReporter();

// Convenience functions
export const initializeCrashReporting = (userId?: string) => crashReporter.initialize(userId);
export const setCurrentScreen = (screenName: string) => crashReporter.setCurrentScreen(screenName);
export const logError = (error: Error, context?: any) => crashReporter.logError(error, context);
export const logUserAction = (action: string, screen: string, metadata?: any) => crashReporter.logUserAction(action, screen, metadata);
export const addBreadcrumb = (category: CrashBreadcrumb['category'], message: string, data?: any, level?: CrashBreadcrumb['level']) => 
  crashReporter.addBreadcrumb(category, message, data, level);

export default crashReporter;