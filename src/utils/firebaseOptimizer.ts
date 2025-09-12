/**
 * Firebase Cost Optimizer
 * Ultra-aggressive optimization for revenue protection
 * Target: <$0.0003 per user/month to stay profitable
 */

import { doc, getDoc, updateDoc, writeBatch, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User } from '../types';

// Global listener management to prevent duplicate listeners
class ListenerManager {
  private listeners: Map<string, Unsubscribe> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds aggressive caching
  private readonly MAX_LISTENERS = 1; // Only allow 1 listener at a time
  private activeListener: string | null = null;

  /**
   * Get cached data if available and fresh
   */
  getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`💰 Using cache for ${key} - SAVED 1 read ($0.0006)`);
    return cached.data;
  }

  /**
   * Cache data with timestamp
   */
  setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Single shared listener for all screens
   */
  getSharedUserListener(userId: string, callback: (data: User) => void): void {
    const listenerId = `user_${userId}`;

    // Verify user is still authenticated before creating listener
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      console.log('🔐 User not authenticated, skipping listener setup');
      return;
    }

    // If we already have a listener for this user, reuse it
    if (this.activeListener === listenerId) {
      console.log('💰 Reusing existing listener - SAVED setup cost');
      return;
    }

    // Clean up any existing listener first
    this.cleanup();

    console.log('🔥 Creating new shared listener for:', listenerId);
    
    const userDocRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userDocRef, 
      {
        includeMetadataChanges: false, // Only listen for actual data changes
        source: 'default' // Allow cached data to reduce reads
      },
      (doc) => {
        // Verify user is still authenticated before processing data
        if (!auth.currentUser || auth.currentUser.uid !== userId) {
          console.log('🔐 User no longer authenticated, ignoring listener data');
          return;
        }
        
        // Only process if doc exists and is not from cache
        if (doc.exists() && !doc.metadata.fromCache) {
          const userData = { ...doc.data(), id: userId } as User;
          this.setCache(listenerId, userData);
          callback(userData);
          console.log('📊 Listener read - Cost: $0.0006');
        }
      }, 
      (error) => {
        // Handle different types of authentication errors
        if (error.code === 'permission-denied') {
          console.log('🔐 User authentication changed, cleaning up listener...');
          // Cleanup this specific listener when permission denied
          this.listeners.delete(listenerId);
          this.activeListener = null;
          return; // Don't log error for expected auth changes
        }
        
        // Handle other Firebase errors
        if (error.code === 'unavailable' || error.code === 'failed-precondition') {
          console.log('📶 Firebase temporarily unavailable, will retry when available');
          return; // Don't log error for expected network issues
        }
        
        // Log unexpected errors
        console.error('Shared listener error:', error.code || error.message);
      });

    this.listeners.set(listenerId, unsubscribe);
    this.activeListener = listenerId;
  }

  /**
   * Get user data with aggressive caching
   */
  async getUserData(userId: string): Promise<User | null> {
    const cacheKey = `user_${userId}`;
    
    // Try cache first
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Fallback to Firebase read
    try {
      console.log('🔥 Firebase read - Cost: $0.0006');
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = { ...userDoc.data(), id: userId } as User;
        this.setCache(cacheKey, userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Cleanup all listeners
   */
  cleanup(): void {
    this.listeners.forEach((unsubscribe, key) => {
      unsubscribe();
      console.log(`🧹 Cleaned up listener: ${key}`);
    });
    this.listeners.clear();
    this.activeListener = null;
  }

  /**
   * Get cache stats for monitoring
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // TODO: Implement hit rate tracking
    };
  }
}

// Global singleton instance
export const listenerManager = new ListenerManager();

/**
 * Batch Writer - Combine multiple writes to save costs
 */
class BatchWriter {
  private pendingWrites: Array<{
    ref: any;
    data: any;
    timestamp: number;
  }> = [];
  private readonly BATCH_DELAY = 2000; // 2 second delay for batching
  private batchTimeout: NodeJS.Timeout | null = null;

  /**
   * Add write to batch queue
   */
  queueWrite(ref: any, data: any): void {
    this.pendingWrites.push({
      ref,
      data,
      timestamp: Date.now()
    });

    // Reset timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.executeBatch();
    }, this.BATCH_DELAY);

    console.log(`📝 Queued write - Batch size: ${this.pendingWrites.length}`);
  }

  /**
   * Execute all pending writes in a single batch
   */
  private async executeBatch(): Promise<void> {
    if (this.pendingWrites.length === 0) return;

    const batch = writeBatch(db);
    const writeCount = this.pendingWrites.length;

    this.pendingWrites.forEach(({ ref, data }) => {
      batch.update(ref, data);
    });

    try {
      await batch.commit();
      const savedCost = (writeCount - 1) * 0.0018; // Each write costs $0.0018/1000
      console.log(`💰 Batch executed: ${writeCount} writes in 1 batch - SAVED $${savedCost.toFixed(6)}`);
      
      this.pendingWrites = [];
      this.batchTimeout = null;
    } catch (error) {
      console.error('Batch write failed:', error);
      
      // Try individual writes as fallback
      console.log('🔄 Attempting individual writes as fallback...');
      for (const { ref, data } of this.pendingWrites) {
        try {
          await updateDoc(ref, data);
          console.log('✓ Individual write succeeded');
        } catch (individualError) {
          console.error('Individual write failed:', individualError);
          // Continue with other writes even if one fails
        }
      }
      // Retry individual writes
      this.retryIndividualWrites();
    }
  }

  /**
   * Fallback: retry writes individually
   */
  private async retryIndividualWrites(): Promise<void> {
    for (const { ref, data } of this.pendingWrites) {
      try {
        await updateDoc(ref, data);
        console.log('🔄 Individual retry successful');
      } catch (error) {
        console.error('Individual write failed:', error);
      }
    }
    this.pendingWrites = [];
  }

  /**
   * Force execute batch immediately
   */
  async flush(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    await this.executeBatch();
  }
}

// Global batch writer instance
export const batchWriter = new BatchWriter();

/**
 * Cost tracking utilities
 */
export class CostTracker {
  private static reads = 0;
  private static writes = 0;
  private static startTime = Date.now();

  static trackRead(count: number = 1): void {
    this.reads += count;
    const cost = count * 0.0006; // $0.06 per 100K reads
    console.log(`📊 Read tracked - Count: ${count}, Cost: $${cost.toFixed(6)}`);
  }

  static trackWrite(count: number = 1): void {
    this.writes += count;
    const cost = count * 0.0018; // $0.18 per 100K writes
    console.log(`✍️ Write tracked - Count: ${count}, Cost: $${cost.toFixed(6)}`);
  }

  static getStats(): {
    reads: number;
    writes: number;
    totalCost: number;
    sessionDuration: number;
  } {
    const totalCost = (this.reads * 0.0006) + (this.writes * 0.0018);
    const sessionDuration = Date.now() - this.startTime;

    return {
      reads: this.reads,
      writes: this.writes,
      totalCost,
      sessionDuration
    };
  }

  static reset(): void {
    this.reads = 0;
    this.writes = 0;
    this.startTime = Date.now();
  }

  static logSessionSummary(): void {
    const stats = this.getStats();
    console.log('💰 SESSION COST SUMMARY:', {
      duration: `${Math.round(stats.sessionDuration / 1000)}s`,
      reads: stats.reads,
      writes: stats.writes,
      totalCost: `$${stats.totalCost.toFixed(6)}`,
      projectedMonthlyCost: `$${(stats.totalCost * 30).toFixed(4)}`
    });
  }
}

/**
 * Optimized user data operations
 */
export const OptimizedUserOperations = {
  /**
   * Get user data with aggressive caching
   */
  async getUser(userId: string): Promise<User | null> {
    CostTracker.trackRead();
    return await listenerManager.getUserData(userId);
  },

  /**
   * Update user data with batching
   */
  updateUser(userId: string, data: Partial<User>): void {
    CostTracker.trackWrite();
    const userRef = doc(db, 'users', userId);
    batchWriter.queueWrite(userRef, data);
  },

  /**
   * Set up shared listener (replaces individual screen listeners)
   */
  setupSharedListener(userId: string, callback: (data: User) => void): void {
    listenerManager.getSharedUserListener(userId, callback);
  },

  /**
   * Cleanup all optimizations
   */
  cleanup(): void {
    listenerManager.cleanup();
    batchWriter.flush();
  }
};

/**
 * Initialize cost tracking
 */
export const initializeCostOptimization = (): void => {
  console.log('💰 Firebase cost optimization initialized');
  
  // Log session summary on app background/close
  const logSummaryOnExit = () => {
    CostTracker.logSessionSummary();
  };

  // Cleanup listeners on app exit
  const cleanupOnExit = () => {
    OptimizedUserOperations.cleanup();
  };

  // Mobile-specific event listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', logSummaryOnExit);
    window.addEventListener('pagehide', cleanupOnExit);
  }

  // React Native AppState listeners would go here
  console.log('💰 Cost tracking and optimization hooks installed');
};

export default {
  listenerManager,
  batchWriter,
  CostTracker,
  OptimizedUserOperations,
  initializeCostOptimization
};