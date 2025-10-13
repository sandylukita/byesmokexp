/**
 * Feature Health Monitoring System
 * Tracks feature usage and health to prevent regressions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLog } from './performanceOptimizer';

interface FeatureMetric {
  featureName: string;
  attempts: number;
  successes: number;
  failures: number;
  lastUsed: number;
  errorMessages: string[];
}

interface FeatureHealth {
  successRate: number;
  isHealthy: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}

export class FeatureHealthMonitor {
  private static readonly STORAGE_KEY = 'byesmoke_feature_health';
  private static metrics: Map<string, FeatureMetric> = new Map();

  /**
   * Track feature usage attempt
   */
  static async trackFeatureAttempt(featureName: string): Promise<void> {
    try {
      await this.loadMetrics();

      const metric = this.metrics.get(featureName) || {
        featureName,
        attempts: 0,
        successes: 0,
        failures: 0,
        lastUsed: Date.now(),
        errorMessages: []
      };

      metric.attempts++;
      metric.lastUsed = Date.now();

      this.metrics.set(featureName, metric);
      await this.saveMetrics();

      debugLog.log(`📊 Feature attempt tracked: ${featureName}`);
    } catch (error) {
      debugLog.error('Error tracking feature attempt:', error);
    }
  }

  /**
   * Track feature success
   */
  static async trackFeatureSuccess(featureName: string): Promise<void> {
    try {
      await this.loadMetrics();

      const metric = this.metrics.get(featureName);
      if (metric) {
        metric.successes++;
        await this.saveMetrics();
        debugLog.log(`✅ Feature success tracked: ${featureName}`);
      }
    } catch (error) {
      debugLog.error('Error tracking feature success:', error);
    }
  }

  /**
   * Track feature failure
   */
  static async trackFeatureFailure(featureName: string, errorMessage?: string): Promise<void> {
    try {
      await this.loadMetrics();

      const metric = this.metrics.get(featureName);
      if (metric) {
        metric.failures++;
        if (errorMessage) {
          metric.errorMessages.push(errorMessage);
          // Keep only last 5 errors
          if (metric.errorMessages.length > 5) {
            metric.errorMessages = metric.errorMessages.slice(-5);
          }
        }
        await this.saveMetrics();
        debugLog.log(`❌ Feature failure tracked: ${featureName} - ${errorMessage}`);
      }
    } catch (error) {
      debugLog.error('Error tracking feature failure:', error);
    }
  }

  /**
   * Get feature health status
   */
  static async getFeatureHealth(featureName: string): Promise<FeatureHealth | null> {
    try {
      await this.loadMetrics();

      const metric = this.metrics.get(featureName);
      if (!metric || metric.attempts === 0) {
        return null;
      }

      const successRate = (metric.successes / metric.attempts) * 100;

      let isHealthy = true;
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      let recommendation = 'Feature is performing well';

      if (successRate < 50) {
        isHealthy = false;
        riskLevel = 'high';
        recommendation = '🚨 CRITICAL: Feature failing >50% of the time. Immediate attention required.';
      } else if (successRate < 80) {
        isHealthy = false;
        riskLevel = 'medium';
        recommendation = '⚠️ WARNING: Feature has elevated failure rate. Monitor closely.';
      } else if (successRate < 95) {
        riskLevel = 'medium';
        recommendation = '💡 NOTICE: Feature working but could be improved.';
      }

      return {
        successRate,
        isHealthy,
        riskLevel,
        recommendation
      };
    } catch (error) {
      debugLog.error('Error getting feature health:', error);
      return null;
    }
  }

  /**
   * Get all feature metrics
   */
  static async getAllFeatureMetrics(): Promise<FeatureMetric[]> {
    try {
      await this.loadMetrics();
      return Array.from(this.metrics.values());
    } catch (error) {
      debugLog.error('Error getting all feature metrics:', error);
      return [];
    }
  }

  /**
   * Generate health report for all features
   */
  static async generateHealthReport(): Promise<{
    totalFeatures: number;
    healthyFeatures: number;
    unhealthyFeatures: number;
    criticalFeatures: string[];
    warningFeatures: string[];
    summary: string;
  }> {
    try {
      await this.loadMetrics();

      const allMetrics = Array.from(this.metrics.values());
      const healthyFeatures: string[] = [];
      const unhealthyFeatures: string[] = [];
      const criticalFeatures: string[] = [];
      const warningFeatures: string[] = [];

      for (const metric of allMetrics) {
        if (metric.attempts === 0) continue;

        const health = await this.getFeatureHealth(metric.featureName);
        if (health) {
          if (health.isHealthy) {
            healthyFeatures.push(metric.featureName);
          } else {
            unhealthyFeatures.push(metric.featureName);

            if (health.riskLevel === 'high') {
              criticalFeatures.push(metric.featureName);
            } else if (health.riskLevel === 'medium') {
              warningFeatures.push(metric.featureName);
            }
          }
        }
      }

      let summary = `📊 HEALTH REPORT: ${healthyFeatures.length}/${allMetrics.length} features healthy`;

      if (criticalFeatures.length > 0) {
        summary += ` | 🚨 ${criticalFeatures.length} CRITICAL`;
      }

      if (warningFeatures.length > 0) {
        summary += ` | ⚠️ ${warningFeatures.length} WARNING`;
      }

      return {
        totalFeatures: allMetrics.length,
        healthyFeatures: healthyFeatures.length,
        unhealthyFeatures: unhealthyFeatures.length,
        criticalFeatures,
        warningFeatures,
        summary
      };
    } catch (error) {
      debugLog.error('Error generating health report:', error);
      return {
        totalFeatures: 0,
        healthyFeatures: 0,
        unhealthyFeatures: 0,
        criticalFeatures: [],
        warningFeatures: [],
        summary: 'Error generating health report'
      };
    }
  }

  /**
   * Load metrics from storage
   */
  private static async loadMetrics(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.metrics = new Map(Object.entries(data));
      }
    } catch (error) {
      debugLog.error('Error loading feature metrics:', error);
    }
  }

  /**
   * Save metrics to storage
   */
  private static async saveMetrics(): Promise<void> {
    try {
      const data = Object.fromEntries(this.metrics);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      debugLog.error('Error saving feature metrics:', error);
    }
  }

  /**
   * Clear all metrics (for testing)
   */
  static async clearMetrics(): Promise<void> {
    try {
      this.metrics.clear();
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      debugLog.log('🧹 Feature metrics cleared');
    } catch (error) {
      debugLog.error('Error clearing feature metrics:', error);
    }
  }
}

/**
 * Convenience functions for common feature tracking
 */
export const trackFeature = {
  // Authentication
  loginAttempt: () => FeatureHealthMonitor.trackFeatureAttempt('user_login'),
  loginSuccess: () => FeatureHealthMonitor.trackFeatureSuccess('user_login'),
  loginFailure: (error: string) => FeatureHealthMonitor.trackFeatureFailure('user_login', error),

  // Dashboard
  dashboardLoad: () => FeatureHealthMonitor.trackFeatureAttempt('dashboard_load'),
  dashboardSuccess: () => FeatureHealthMonitor.trackFeatureSuccess('dashboard_load'),
  dashboardFailure: (error: string) => FeatureHealthMonitor.trackFeatureFailure('dashboard_load', error),

  // Progress tracking
  heatmapLoad: () => FeatureHealthMonitor.trackFeatureAttempt('heatmap_load'),
  heatmapSuccess: () => FeatureHealthMonitor.trackFeatureSuccess('heatmap_load'),
  heatmapFailure: (error: string) => FeatureHealthMonitor.trackFeatureFailure('heatmap_load', error),

  // Missions
  missionComplete: () => FeatureHealthMonitor.trackFeatureAttempt('mission_complete'),
  missionSuccess: () => FeatureHealthMonitor.trackFeatureSuccess('mission_complete'),
  missionFailure: (error: string) => FeatureHealthMonitor.trackFeatureFailure('mission_complete', error),

  // Animation
  animationLoad: () => FeatureHealthMonitor.trackFeatureAttempt('animation_load'),
  animationSuccess: () => FeatureHealthMonitor.trackFeatureSuccess('animation_load'),
  animationFailure: (error: string) => FeatureHealthMonitor.trackFeatureFailure('animation_load', error),
};

export default FeatureHealthMonitor;