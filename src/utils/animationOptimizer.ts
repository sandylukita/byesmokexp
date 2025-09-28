/**
 * Animation Optimization Utilities
 * Advanced optimizations for Lottie animations
 */

import { debugLog } from './performanceOptimizer';

export interface AnimationStats {
  fileName: string;
  stage: 'cat' | 'tiger' | 'lion';
  state: string;
  sizeKB: number;
  loadTime: number;
  isPreloaded: boolean;
}

export class AnimationOptimizer {
  private static stats: Map<string, AnimationStats> = new Map();
  private static preloadQueue: Set<string> = new Set();

  /**
   * Get file size estimate for an animation
   */
  static estimateSize(stage: 'cat' | 'tiger' | 'lion', state: string): number {
    // Size estimates based on actual files (in KB)
    const sizeMap = {
      cat: {
        idle: 486,
        happy: 493,
        sick: 494,
        sleeping: 545,
        exercising: 501,
        celebrate: 467
      },
      tiger: {
        idle: 587,
        happy: 580,
        sick: 575,
        sleeping: 619,
        exercising: 583,
        celebrate: 579
      },
      lion: {
        idle: 573,
        happy: 599,
        sick: 563,
        sleeping: 571,
        exercising: 559,
        celebrate: 614
      }
    };

    return sizeMap[stage]?.[state as keyof typeof sizeMap.cat] || 500;
  }

  /**
   * Priority-based preloading strategy
   */
  static getPreloadPriority(stage: 'cat' | 'tiger' | 'lion', state: string): number {
    // Higher priority = preload first
    const priorities = {
      // Most common states get highest priority
      idle: 10,
      happy: 8,
      sick: 6,
      sleeping: 4,
      exercising: 3,
      celebrate: 2
    };

    // Current stage gets bonus priority
    const stageBonus = stage === 'cat' ? 5 : stage === 'tiger' ? 3 : 1;

    return (priorities[state as keyof typeof priorities] || 1) + stageBonus;
  }

  /**
   * Smart preloading based on user behavior
   */
  static async preloadCriticalAnimations(currentStage: 'cat' | 'tiger' | 'lion'): Promise<void> {
    const criticalStates = ['idle', 'happy'];
    const preloadPromises: Promise<void>[] = [];

    // Preload current stage critical animations
    for (const state of criticalStates) {
      const key = `${currentStage}-${state}`;
      if (!this.preloadQueue.has(key)) {
        this.preloadQueue.add(key);
        preloadPromises.push(this.preloadAnimation(currentStage, state));
      }
    }

    // Preload next stage idle animation if applicable
    const nextStage = currentStage === 'cat' ? 'tiger' : currentStage === 'tiger' ? 'lion' : null;
    if (nextStage) {
      const nextKey = `${nextStage}-idle`;
      if (!this.preloadQueue.has(nextKey)) {
        this.preloadQueue.add(nextKey);
        preloadPromises.push(this.preloadAnimation(nextStage, 'idle'));
      }
    }

    await Promise.allSettled(preloadPromises);
    debugLog.log(`🎬 Preloaded ${preloadPromises.length} critical animations`);
  }

  /**
   * Preload a specific animation
   */
  private static async preloadAnimation(stage: 'cat' | 'tiger' | 'lion', state: string): Promise<void> {
    const startTime = Date.now();

    try {
      // This would be connected to the actual animation loading
      // For now, we simulate the preload timing
      const size = this.estimateSize(stage, state);
      const simulatedLoadTime = Math.min(size / 100, 50); // Simulate load time

      await new Promise(resolve => setTimeout(resolve, simulatedLoadTime));

      const stats: AnimationStats = {
        fileName: `lung${stage}-${state}.json`,
        stage,
        state,
        sizeKB: size,
        loadTime: Date.now() - startTime,
        isPreloaded: true
      };

      this.stats.set(`${stage}-${state}`, stats);
      debugLog.log(`✅ Preloaded: ${stage}-${state} (${size}KB in ${stats.loadTime}ms)`);

    } catch (error) {
      debugLog.error(`❌ Failed to preload ${stage}-${state}:`, error);
    }
  }

  /**
   * Generate optimization report
   */
  static generateReport(): {
    totalAnimations: number;
    totalSizeKB: number;
    preloadedAnimations: number;
    preloadedSizeKB: number;
    averageLoadTime: number;
    recommendations: string[];
  } {
    const allStats = Array.from(this.stats.values());
    const preloadedStats = allStats.filter(s => s.isPreloaded);

    const totalSizeKB = allStats.reduce((sum, s) => sum + s.sizeKB, 0);
    const preloadedSizeKB = preloadedStats.reduce((sum, s) => sum + s.sizeKB, 0);
    const averageLoadTime = allStats.length > 0
      ? allStats.reduce((sum, s) => sum + s.loadTime, 0) / allStats.length
      : 0;

    const recommendations: string[] = [];

    if (preloadedSizeKB > 2000) {
      recommendations.push('Consider reducing preloaded animations to < 2MB total');
    }

    if (averageLoadTime > 100) {
      recommendations.push('Animation load times are high - consider further compression');
    }

    if (preloadedStats.length < 4) {
      recommendations.push('Preload more critical animations for better UX');
    }

    return {
      totalAnimations: allStats.length,
      totalSizeKB,
      preloadedAnimations: preloadedStats.length,
      preloadedSizeKB,
      averageLoadTime,
      recommendations
    };
  }

  /**
   * Get animation statistics
   */
  static getAnimationStats(): AnimationStats[] {
    return Array.from(this.stats.values());
  }

  /**
   * Clear all cached data
   */
  static clearCache(): void {
    this.stats.clear();
    this.preloadQueue.clear();
    debugLog.log('🧹 Animation optimizer cache cleared');
  }
}

export default AnimationOptimizer;