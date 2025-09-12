/**
 * Firebase Cost Monitoring & Alerts
 * Critical for protecting 9900 IDR ($0.66) subscription revenue
 * Prevents cost overruns that could bankrupt the app
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Cost constants (USD per operation)
const FIREBASE_COSTS = {
  READ: 0.06 / 100000,      // $0.06 per 100K reads
  WRITE: 0.18 / 100000,     // $0.18 per 100K writes  
  DELETE: 0.02 / 100000     // $0.02 per 100K deletes
} as const;

// Revenue constants
const REVENUE = {
  ADMOB_PER_USER_DAY: 0.005,    // $0.005 per user per day (Indonesia)
  SUBSCRIPTION_MONTHLY: 0.66,    // 9900 IDR = $0.66 USD
  BREAK_EVEN_COST_PER_USER: 0.0003  // Max cost per user per month to stay profitable
} as const;

// Alert thresholds
const ALERT_THRESHOLDS = {
  DAILY_COST_WARNING: 0.50,      // $0.50 daily spend warning
  DAILY_COST_CRITICAL: 1.00,     // $1.00 daily spend critical
  HOURLY_READ_WARNING: 1000,     // 1000 reads per hour warning
  HOURLY_WRITE_WARNING: 500,     // 500 writes per hour warning
  COST_PER_USER_WARNING: 0.0005  // $0.0005 per user monthly warning
} as const;

interface CostMetrics {
  reads: number;
  writes: number;
  deletes: number;
  totalCost: number;
  timestamp: number;
  userId?: string;
}

interface DailyCostSummary {
  date: string;
  totalReads: number;
  totalWrites: number;
  totalDeletes: number;
  totalCost: number;
  activeUsers: number;
  costPerUser: number;
  revenueEstimate: number;
  profitMargin: number;
}

export class CostMonitor {
  private static readonly STORAGE_KEYS = {
    HOURLY_METRICS: 'byesmoke_hourly_metrics',
    DAILY_SUMMARY: 'byesmoke_daily_summary',
    TOTAL_METRICS: 'byesmoke_total_metrics',
    LAST_ALERT: 'byesmoke_last_alert'
  };

  private static currentHourMetrics: CostMetrics = {
    reads: 0,
    writes: 0,
    deletes: 0,
    totalCost: 0,
    timestamp: Date.now()
  };

  private static alertsEnabled = true;

  /**
   * Track Firebase read operation
   */
  static trackRead(count: number = 1, userId?: string): void {
    this.currentHourMetrics.reads += count;
    const cost = count * FIREBASE_COSTS.READ;
    this.currentHourMetrics.totalCost += cost;
    
    console.log(`📊 READ: ${count} operations, Cost: $${cost.toFixed(6)}, User: ${userId || 'anonymous'}`);
    
    this.checkHourlyThresholds();
    this.persistMetrics();
  }

  /**
   * Track Firebase write operation
   */
  static trackWrite(count: number = 1, userId?: string): void {
    this.currentHourMetrics.writes += count;
    const cost = count * FIREBASE_COSTS.WRITE;
    this.currentHourMetrics.totalCost += cost;
    
    console.log(`✍️ WRITE: ${count} operations, Cost: $${cost.toFixed(6)}, User: ${userId || 'anonymous'}`);
    
    this.checkHourlyThresholds();
    this.persistMetrics();
  }

  /**
   * Track Firebase delete operation
   */
  static trackDelete(count: number = 1, userId?: string): void {
    this.currentHourMetrics.deletes += count;
    const cost = count * FIREBASE_COSTS.DELETE;
    this.currentHourMetrics.totalCost += cost;
    
    console.log(`🗑️ DELETE: ${count} operations, Cost: $${cost.toFixed(6)}, User: ${userId || 'anonymous'}`);
    
    this.persistMetrics();
  }

  /**
   * Check if hourly thresholds are exceeded
   */
  private static checkHourlyThresholds(): void {
    const { reads, writes, totalCost } = this.currentHourMetrics;
    
    // Check read threshold
    if (reads >= ALERT_THRESHOLDS.HOURLY_READ_WARNING) {
      this.triggerAlert('high_reads', `⚠️ HIGH READS: ${reads} reads this hour. Cost: $${totalCost.toFixed(4)}`);
    }
    
    // Check write threshold  
    if (writes >= ALERT_THRESHOLDS.HOURLY_WRITE_WARNING) {
      this.triggerAlert('high_writes', `⚠️ HIGH WRITES: ${writes} writes this hour. Cost: $${totalCost.toFixed(4)}`);
    }
    
    // Check hourly cost (extrapolate to daily)
    const projectedDailyCost = totalCost * 24;
    if (projectedDailyCost >= ALERT_THRESHOLDS.DAILY_COST_WARNING) {
      this.triggerAlert('high_cost', `🚨 COST ALERT: Projected daily cost $${projectedDailyCost.toFixed(4)}`);
    }
  }

  /**
   * Trigger cost alert with rate limiting
   */
  private static async triggerAlert(type: string, message: string): Promise<void> {
    if (!this.alertsEnabled) return;
    
    try {
      // Rate limit alerts (max 1 per hour per type)
      const lastAlertKey = `${this.STORAGE_KEYS.LAST_ALERT}_${type}`;
      const lastAlert = await AsyncStorage.getItem(lastAlertKey);
      const lastAlertTime = lastAlert ? parseInt(lastAlert) : 0;
      const hoursSinceLastAlert = (Date.now() - lastAlertTime) / (1000 * 60 * 60);
      
      if (hoursSinceLastAlert < 1) {
        console.log(`🔇 Alert suppressed (rate limited): ${type}`);
        return;
      }
      
      // Log to console (always)
      console.warn(`🚨 COST ALERT: ${message}`);
      
      // Show user alert for critical costs
      if (type === 'high_cost') {
        Alert.alert(
          '💰 Cost Warning',
          `Firebase costs are higher than expected. This could impact profitability.\n\n${message}`,
          [
            { text: 'Disable Alerts', onPress: () => this.alertsEnabled = false },
            { text: 'OK', style: 'default' }
          ]
        );
      }
      
      // Update last alert time
      await AsyncStorage.setItem(lastAlertKey, Date.now().toString());
      
    } catch (error) {
      console.error('Error triggering cost alert:', error);
    }
  }

  /**
   * Persist current metrics to storage
   */
  private static async persistMetrics(): Promise<void> {
    try {
      const hourKey = this.getHourlyKey();
      await AsyncStorage.setItem(hourKey, JSON.stringify(this.currentHourMetrics));
    } catch (error) {
      console.error('Error persisting metrics:', error);
    }
  }

  /**
   * Generate hourly storage key
   */
  private static getHourlyKey(): string {
    const hour = Math.floor(Date.now() / (1000 * 60 * 60));
    return `${this.STORAGE_KEYS.HOURLY_METRICS}_${hour}`;
  }

  /**
   * Reset hourly metrics (called every hour)
   */
  static resetHourlyMetrics(): void {
    console.log(`📊 Hourly reset - Previous: ${this.currentHourMetrics.reads} reads, ${this.currentHourMetrics.writes} writes, $${this.currentHourMetrics.totalCost.toFixed(6)}`);
    
    this.currentHourMetrics = {
      reads: 0,
      writes: 0,
      deletes: 0,
      totalCost: 0,
      timestamp: Date.now()
    };
  }

  /**
   * Get current hour metrics
   */
  static getCurrentMetrics(): CostMetrics {
    return { ...this.currentHourMetrics };
  }

  /**
   * Generate daily cost summary
   */
  static async generateDailySummary(activeUsers: number = 1): Promise<DailyCostSummary> {
    try {
      // Get last 24 hours of data
      const last24Hours = [];
      const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
      
      for (let i = 0; i < 24; i++) {
        const hourKey = `${this.STORAGE_KEYS.HOURLY_METRICS}_${currentHour - i}`;
        const hourData = await AsyncStorage.getItem(hourKey);
        if (hourData) {
          last24Hours.push(JSON.parse(hourData) as CostMetrics);
        }
      }

      // Aggregate metrics
      const totalReads = last24Hours.reduce((sum, hour) => sum + hour.reads, 0);
      const totalWrites = last24Hours.reduce((sum, hour) => sum + hour.writes, 0);
      const totalDeletes = last24Hours.reduce((sum, hour) => sum + hour.deletes, 0);
      const totalCost = last24Hours.reduce((sum, hour) => sum + hour.totalCost, 0);

      // Calculate revenue and profitability
      const costPerUser = activeUsers > 0 ? totalCost / activeUsers : totalCost;
      const revenueEstimate = activeUsers * REVENUE.ADMOB_PER_USER_DAY;
      const profitMargin = revenueEstimate - totalCost;

      const summary: DailyCostSummary = {
        date: new Date().toISOString().split('T')[0],
        totalReads,
        totalWrites, 
        totalDeletes,
        totalCost,
        activeUsers,
        costPerUser,
        revenueEstimate,
        profitMargin
      };

      // Store daily summary
      const summaryKey = `${this.STORAGE_KEYS.DAILY_SUMMARY}_${summary.date}`;
      await AsyncStorage.setItem(summaryKey, JSON.stringify(summary));

      return summary;
    } catch (error) {
      console.error('Error generating daily summary:', error);
      
      // Return default summary on error
      return {
        date: new Date().toISOString().split('T')[0],
        totalReads: 0,
        totalWrites: 0,
        totalDeletes: 0,
        totalCost: 0,
        activeUsers,
        costPerUser: 0,
        revenueEstimate: 0,
        profitMargin: 0
      };
    }
  }

  /**
   * Get profitability status
   */
  static async getProfitabilityStatus(activeUsers: number): Promise<{
    isProfitable: boolean;
    costPerUser: number;
    breakEvenPoint: number;
    recommendation: string;
  }> {
    const summary = await this.generateDailySummary(activeUsers);
    const monthlyCostPerUser = summary.costPerUser * 30;
    const isProfitable = monthlyCostPerUser <= REVENUE.BREAK_EVEN_COST_PER_USER;
    
    let recommendation = '';
    if (!isProfitable) {
      recommendation = '🚨 URGENT: Costs exceed revenue. Enable more aggressive caching or reduce Firebase usage.';
    } else if (monthlyCostPerUser > REVENUE.BREAK_EVEN_COST_PER_USER * 0.8) {
      recommendation = '⚠️ Warning: Close to break-even. Monitor costs closely.';
    } else {
      recommendation = '✅ Healthy profit margins. Current optimizations are working well.';
    }

    return {
      isProfitable,
      costPerUser: monthlyCostPerUser,
      breakEvenPoint: REVENUE.BREAK_EVEN_COST_PER_USER,
      recommendation
    };
  }

  /**
   * Log session summary for debugging
   */
  static logSessionSummary(): void {
    const metrics = this.getCurrentMetrics();
    const sessionDuration = (Date.now() - metrics.timestamp) / 1000 / 60; // minutes
    
    console.log('💰 SESSION COST SUMMARY:');
    console.log(`  Duration: ${sessionDuration.toFixed(1)} minutes`);
    console.log(`  Reads: ${metrics.reads}`);
    console.log(`  Writes: ${metrics.writes}`);
    console.log(`  Deletes: ${metrics.deletes}`);
    console.log(`  Total Cost: $${metrics.totalCost.toFixed(6)}`);
    console.log(`  Projected Daily: $${(metrics.totalCost * (1440 / sessionDuration)).toFixed(4)}`);
    console.log(`  Projected Monthly: $${(metrics.totalCost * (43800 / sessionDuration)).toFixed(2)}`);
  }

  /**
   * Initialize cost monitoring
   */
  static async initialize(): Promise<void> {
    console.log('💰 Initializing Firebase cost monitoring...');
    
    // Load current hour metrics if they exist
    try {
      const hourKey = this.getHourlyKey();
      const stored = await AsyncStorage.getItem(hourKey);
      if (stored) {
        this.currentHourMetrics = JSON.parse(stored);
        console.log('📊 Loaded existing hour metrics');
      }
    } catch (error) {
      console.error('Error loading hour metrics:', error);
    }

    // Set up hourly reset timer
    const msUntilNextHour = (60 - new Date().getMinutes()) * 60 * 1000;
    setTimeout(() => {
      this.resetHourlyMetrics();
      // Set up recurring hourly reset
      setInterval(() => this.resetHourlyMetrics(), 60 * 60 * 1000);
    }, msUntilNextHour);

    // Clean up old metrics (keep last 30 days)
    this.cleanupOldMetrics();

    console.log('✅ Cost monitoring initialized');
  }

  /**
   * Cleanup old metrics to save storage space
   */
  private static async cleanupOldMetrics(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const metricsKeys = keys.filter(key => 
        key.startsWith(this.STORAGE_KEYS.HOURLY_METRICS) || 
        key.startsWith(this.STORAGE_KEYS.DAILY_SUMMARY)
      );

      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const keysToDelete = metricsKeys.filter(key => {
        const timestamp = key.split('_').pop();
        return timestamp && parseInt(timestamp) < thirtyDaysAgo;
      });

      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
        console.log(`🧹 Cleaned up ${keysToDelete.length} old metric entries`);
      }
    } catch (error) {
      console.error('Error cleaning up old metrics:', error);
    }
  }

  /**
   * Enable/disable alerts
   */
  static setAlertsEnabled(enabled: boolean): void {
    this.alertsEnabled = enabled;
    console.log(`🔔 Cost alerts ${enabled ? 'enabled' : 'disabled'}`);
  }
}

/**
 * Export for easy integration
 */
export const trackFirebaseCosts = {
  read: (count?: number, userId?: string) => CostMonitor.trackRead(count, userId),
  write: (count?: number, userId?: string) => CostMonitor.trackWrite(count, userId),
  delete: (count?: number, userId?: string) => CostMonitor.trackDelete(count, userId),
  getCurrentMetrics: () => CostMonitor.getCurrentMetrics(),
  getDailySummary: (activeUsers: number) => CostMonitor.generateDailySummary(activeUsers),
  getProfitabilityStatus: (activeUsers: number) => CostMonitor.getProfitabilityStatus(activeUsers),
  logSessionSummary: () => CostMonitor.logSessionSummary(),
  setAlertsEnabled: (enabled: boolean) => CostMonitor.setAlertsEnabled(enabled)
};

export default CostMonitor;