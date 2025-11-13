import { Platform } from 'react-native';
import { log, ENV_CONFIG } from '../config/environment';
import { errorTracker } from './errorTracking';

// Only import AdMob on native platforms
let mobileAds: any = null;
let InterstitialAd: any = null;
let RewardedAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;
let TestIds: any = null;

if (Platform.OS !== 'web') {
  const AdMobModule = require('react-native-google-mobile-ads');
  mobileAds = AdMobModule.default;
  InterstitialAd = AdMobModule.InterstitialAd;
  RewardedAd = AdMobModule.RewardedAd;
  AdEventType = AdMobModule.AdEventType;
  RewardedAdEventType = AdMobModule.RewardedAdEventType;
  TestIds = AdMobModule.TestIds;
  
  // Debug log to check what's actually available (development only)
  if (__DEV__) {
    log.debug('📱 AdMob Module loaded:', {
      hasRewardedAd: !!AdMobModule.RewardedAd,
      hasAdEventType: !!AdMobModule.AdEventType,
      hasRewardedAdEventType: !!AdMobModule.RewardedAdEventType,
      allExports: Object.keys(AdMobModule),
      adEventTypeKeys: AdMobModule.AdEventType ? Object.keys(AdMobModule.AdEventType) : 'not found',
      rewardedAdEventTypeKeys: AdMobModule.RewardedAdEventType ? Object.keys(AdMobModule.RewardedAdEventType) : 'not found'
    });
  }
}

// Google's official test ad unit IDs for development
const TEST_INTERSTITIAL_AD_UNIT = 'ca-app-pub-3940256099942544/1033173712';
const TEST_INTERSTITIAL_AD_UNIT_ANDROID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_INTERSTITIAL_AD_UNIT_IOS = 'ca-app-pub-3940256099942544/4411468910';
const TEST_REWARDED_AD_UNIT_ANDROID = 'ca-app-pub-3940256099942544/5224354917';
const TEST_REWARDED_AD_UNIT_IOS = 'ca-app-pub-3940256099942544/1712485313';

// Production ad unit IDs from secure environment configuration
const PRODUCTION_INTERSTITIAL_AD_UNIT_ANDROID = ENV_CONFIG.ADMOB.interstitialAndroid || 'ca-app-pub-9522080569647318/1234567890';
const PRODUCTION_INTERSTITIAL_AD_UNIT_IOS = ENV_CONFIG.ADMOB.interstitialIOS || 'ca-app-pub-9522080569647318/0987654321';
const PRODUCTION_REWARDED_AD_UNIT_ANDROID = ENV_CONFIG.ADMOB.rewardedAndroid || 'ca-app-pub-9522080569647318/2468013579';
const PRODUCTION_REWARDED_AD_UNIT_IOS = ENV_CONFIG.ADMOB.rewardedIOS || 'ca-app-pub-9522080569647318/9753108642';

class AdMobService {
  private interstitialAd: any = null;
  private rewardedAd: any = null;
  private isAdLoaded = false;
  private isRewardedAdLoaded = false;
  private isShowingAd = false;
  private isShowingRewardedAd = false;
  private userEarnedReward = false;
  private lastAdShownTime = 0;
  private readonly AD_COOLDOWN = 3 * 60 * 1000; // 3 minutes cooldown between ads (optimized for revenue while maintaining good UX)
  private sessionAdsShown = 0;
  private readonly MAX_ADS_PER_SESSION = 3; // Maximum ads per app session
  
  // Error handling and retry logic
  private interstitialRetryCount = 0;
  private rewardedRetryCount = 0;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  /**
   * Initialize AdMob
   */
  async initialize(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        log.info('🎯 AdMob not available on web platform');
        return;
      }
      
      log.info('🎯 Initializing AdMob...');
      await mobileAds().initialize();
      
      // Create and load ads
      this.createInterstitialAd();
      this.createRewardedAd();
      log.info('✅ AdMob initialized successfully');
    } catch (error) {
      log.error('❌ AdMob initialization failed:', error);
      errorTracker.trackError({
        error: error as Error,
        context: 'admob_initialization',
      });
    }
  }

  /**
   * Create and configure interstitial ad
   */
  private createInterstitialAd(): void {
    try {
      if (Platform.OS === 'web') {
        return;
      }
      // Use test ad unit ID in development, production ID in production
      const adUnitId = __DEV__ 
        ? this.getTestAdUnitId()
        : this.getProductionAdUnitId();

      this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // Set up event listeners
      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        this.isAdLoaded = true;
        this.interstitialRetryCount = 0; // Reset retry count on successful load
        log.info('🎯 Interstitial ad loaded');
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
        this.isAdLoaded = false;

        // Suppress internal-error in development (expected with test ads)
        const isInternalError = error?.message?.includes('internal-error');
        if (isInternalError && __DEV__) {
          log.debug('🎯 AdMob internal error (expected in dev mode, will work in production)');
          return; // Don't track or retry internal errors in dev
        }

        log.error('❌ Interstitial ad error:', error);

        // Handle network errors with retry logic
        if (this.isNetworkError(error) && this.interstitialRetryCount < this.MAX_RETRY_ATTEMPTS) {
          this.interstitialRetryCount++;
          log.info(`🔄 Retrying interstitial ad load (attempt ${this.interstitialRetryCount}/${this.MAX_RETRY_ATTEMPTS})`);

          // Retry after delay
          setTimeout(() => {
            this.createInterstitialAd();
          }, this.RETRY_DELAY * this.interstitialRetryCount);
        } else {
          // Reset retry count after max attempts or non-network errors
          this.interstitialRetryCount = 0;
        }

        errorTracker.trackError({
          error: new Error(`Interstitial ad error: ${error.message}`),
          context: 'interstitial_ad_error',
          additionalData: {
            error,
            retryCount: this.interstitialRetryCount,
            isNetworkError: this.isNetworkError(error)
          },
        });
      });

      this.interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
        this.isShowingAd = true;
        log.info('🎯 Interstitial ad opened');
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        this.isShowingAd = false;
        this.isAdLoaded = false;
        this.lastAdShownTime = Date.now();
        this.sessionAdsShown++;
        log.info('🎯 Interstitial ad closed');
        
        // Preload next ad
        this.createInterstitialAd();
      });

      // Load the ad
      this.interstitialAd.load();
    } catch (error) {
      log.error('❌ Failed to create interstitial ad:', error);
      errorTracker.trackError({
        error: error as Error,
        context: 'create_interstitial_ad',
      });
    }
  }

  /**
   * Create and configure rewarded ad
   */
  private createRewardedAd(): void {
    try {
      if (Platform.OS === 'web') {
        return;
      }

      // Use test ad unit ID in development, production ID in production
      const adUnitId = __DEV__ 
        ? this.getTestRewardedAdUnitId()
        : this.getProductionRewardedAdUnitId();

      this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // Set up event listeners for rewarded ad
      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.isRewardedAdLoaded = true;
        this.rewardedRetryCount = 0; // Reset retry count on successful load
        log.info('🎯 Rewarded ad loaded');
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        log.info('🎯 Rewarded ad - reward earned:', reward);
        this.userEarnedReward = true;
      });

      this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
        this.isRewardedAdLoaded = false;

        // Suppress internal-error in development (expected with test ads)
        const isInternalError = error?.message?.includes('internal-error');
        if (isInternalError && __DEV__) {
          log.debug('🎯 AdMob internal error (expected in dev mode, will work in production)');
          return; // Don't track or retry internal errors in dev
        }

        log.error('❌ Rewarded ad error:', error);

        // Handle network errors with retry logic
        if (this.isNetworkError(error) && this.rewardedRetryCount < this.MAX_RETRY_ATTEMPTS) {
          this.rewardedRetryCount++;
          log.info(`🔄 Retrying rewarded ad load (attempt ${this.rewardedRetryCount}/${this.MAX_RETRY_ATTEMPTS})`);

          // Retry after delay
          setTimeout(() => {
            this.createRewardedAd();
          }, this.RETRY_DELAY * this.rewardedRetryCount);
        } else {
          // Reset retry count after max attempts or non-network errors
          this.rewardedRetryCount = 0;
        }

        errorTracker.trackError({
          error: new Error(`Rewarded ad error: ${error.message}`),
          context: 'rewarded_ad_error',
          additionalData: {
            error,
            retryCount: this.rewardedRetryCount,
            isNetworkError: this.isNetworkError(error)
          },
        });
      });

      this.rewardedAd.addAdEventListener(AdEventType.OPENED, () => {
        this.isShowingRewardedAd = true;
        log.info('🎯 Rewarded ad opened');
      });

      this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        this.isShowingRewardedAd = false;
        this.isRewardedAdLoaded = false;
        log.info('🎯 Rewarded ad closed');
        
        // Preload next rewarded ad
        this.createRewardedAd();
      });

      // Load the ad
      this.rewardedAd.load();

    } catch (error) {
      log.error('❌ Failed to create rewarded ad:', error);
      errorTracker.trackError({
        error: error as Error,
        context: 'create_rewarded_ad',
      });
    }
  }

  /**
   * Check if error is network-related and can be retried
   */
  private isNetworkError(error: any): boolean {
    if (!error || !error.message) return false;
    
    const networkErrorPatterns = [
      'network-error',
      'network_error',
      'no-fill',
      'network timeout',
      'connection failed',
      'internet connection',
      'unable to connect',
      'request timeout'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return networkErrorPatterns.some(pattern => errorMessage.includes(pattern));
  }

  /**
   * Get test ad unit ID based on platform
   */
  private getTestAdUnitId(): string {
    if (Platform.OS === 'ios') {
      return TEST_INTERSTITIAL_AD_UNIT_IOS;
    } else {
      return TEST_INTERSTITIAL_AD_UNIT_ANDROID;
    }
  }

  /**
   * Get production ad unit ID based on platform
   */
  private getProductionAdUnitId(): string {
    if (Platform.OS === 'ios') {
      return PRODUCTION_INTERSTITIAL_AD_UNIT_IOS;
    } else {
      return PRODUCTION_INTERSTITIAL_AD_UNIT_ANDROID;
    }
  }

  /**
   * Get test rewarded ad unit ID based on platform
   */
  private getTestRewardedAdUnitId(): string {
    if (Platform.OS === 'ios') {
      return TEST_REWARDED_AD_UNIT_IOS;
    } else {
      return TEST_REWARDED_AD_UNIT_ANDROID;
    }
  }

  /**
   * Get production rewarded ad unit ID based on platform
   */
  private getProductionRewardedAdUnitId(): string {
    if (Platform.OS === 'ios') {
      return PRODUCTION_REWARDED_AD_UNIT_IOS;
    } else {
      return PRODUCTION_REWARDED_AD_UNIT_ANDROID;
    }
  }

  /**
   * Show interstitial ad if conditions are met
   */
  async showInterstitialAd(
    userIsPremium: boolean, 
    context: string = 'unknown'
  ): Promise<boolean> {
    try {
      // Web platform doesn't support AdMob
      if (Platform.OS === 'web') {
        log.info('🎯 AdMob not available on web platform');
        return false;
      }
      
      // Don't show ads to premium users
      if (userIsPremium) {
        log.info('🎯 Skipping ad for premium user');
        return false;
      }

      // Check session limit
      if (this.sessionAdsShown >= this.MAX_ADS_PER_SESSION) {
        log.info('🎯 Session ad limit reached, skipping ad');
        return false;
      }

      // Check cooldown period
      const timeSinceLastAd = Date.now() - this.lastAdShownTime;
      if (timeSinceLastAd < this.AD_COOLDOWN) {
        const remainingCooldown = Math.ceil((this.AD_COOLDOWN - timeSinceLastAd) / 1000 / 60);
        log.info(`🎯 Ad cooldown active, ${remainingCooldown} minutes remaining`);
        return false;
      }

      // Check if ad is loaded and not currently showing
      if (!this.isAdLoaded || this.isShowingAd || !this.interstitialAd) {
        log.info('🎯 Ad not ready to show');
        return false;
      }

      // Show the ad
      log.info(`🎯 Showing interstitial ad for context: ${context}`);
      await this.interstitialAd.show();
      return true;

    } catch (error) {
      log.error('❌ Failed to show interstitial ad:', error);
      errorTracker.trackError({
        error: error as Error,
        context: 'show_interstitial_ad',
        additionalData: { context, userIsPremium },
      });
      return false;
    }
  }

  /**
   * Show rewarded ad and return promise that resolves when user earns reward
   */
  async showRewardedAd(context: string = 'unknown'): Promise<boolean> {
    try {
      // Web platform doesn't support AdMob
      if (Platform.OS === 'web') {
        log.info('🎯 AdMob not available on web platform');
        return false;
      }

      // Check if rewarded ad is loaded and ready
      if (!this.isRewardedAdLoaded || this.isShowingRewardedAd || !this.rewardedAd) {
        log.info('🎯 Rewarded ad not ready to show - loaded:', this.isRewardedAdLoaded, 'showing:', this.isShowingRewardedAd, 'exists:', !!this.rewardedAd);

        // If ad is not loaded, try to load it again (might help with network issues)
        if (!this.isRewardedAdLoaded && !this.isShowingRewardedAd) {
          log.info('🔄 Attempting to reload rewarded ad due to not being ready');
          this.createRewardedAd();
        }

        return false;
      }

      log.info(`🎯 Showing rewarded ad for context: ${context}`);

      // Reset reward state
      this.userEarnedReward = false;

      // Create a promise that waits for the ad to be closed
      // This is the proper way to detect ad completion across iOS and Android
      const adClosedPromise = new Promise<void>((resolve) => {
        const closeHandler = this.rewardedAd.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            log.info('🎯 Rewarded ad CLOSED event fired');
            closeHandler(); // Remove this temporary listener
            resolve();
          }
        );
      });

      // Show the ad (on iOS this returns immediately, on Android it may wait)
      await this.rewardedAd.show();
      log.info('🎯 Rewarded ad show() completed');

      // Wait for the ad to actually close (regardless of ad duration)
      await adClosedPromise;
      log.info('🎯 Ad closed, checking reward status');

      // By now, EARNED_REWARD event has fired (if user completed the ad)
      log.info('🎯 Rewarded ad completed - user earned reward:', this.userEarnedReward);
      return this.userEarnedReward;

    } catch (error) {
      // Reset state on error
      this.isShowingRewardedAd = false;

      log.error('❌ Failed to show rewarded ad:', error);
      errorTracker.trackError({
        error: error as Error,
        context: 'show_rewarded_ad',
        additionalData: { context },
      });
      return false;
    }
  }

  /**
   * Check if we can show an ad
   */
  canShowAd(userIsPremium: boolean): boolean {
    if (userIsPremium) return false;
    if (this.sessionAdsShown >= this.MAX_ADS_PER_SESSION) return false;
    if (this.isShowingAd) return false;
    
    const timeSinceLastAd = Date.now() - this.lastAdShownTime;
    if (timeSinceLastAd < this.AD_COOLDOWN) return false;
    
    return this.isAdLoaded && this.interstitialAd !== null;
  }

  /**
   * Check if we can show a rewarded ad
   */
  canShowRewardedAd(): boolean {
    if (this.isShowingRewardedAd) return false;
    return this.isRewardedAdLoaded && this.rewardedAd !== null;
  }

  /**
   * Get comprehensive ad status for debugging and user feedback
   */
  getAdStatus() {
    return {
      isAdLoaded: this.isAdLoaded,
      isShowingAd: this.isShowingAd,
      isRewardedAdLoaded: this.isRewardedAdLoaded,
      isShowingRewardedAd: this.isShowingRewardedAd,
      sessionAdsShown: this.sessionAdsShown,
      maxAdsPerSession: this.MAX_ADS_PER_SESSION,
      cooldownRemaining: Math.max(0, this.AD_COOLDOWN - (Date.now() - this.lastAdShownTime)),
      interstitialRetryCount: this.interstitialRetryCount,
      rewardedRetryCount: this.rewardedRetryCount,
      maxRetryAttempts: this.MAX_RETRY_ATTEMPTS,
      adMobInitialized: Platform.OS !== 'web',
      usingTestAds: __DEV__
    };
  }

  /**
   * Get user-friendly status message for ad availability
   */
  getAdStatusMessage(): string {
    if (Platform.OS === 'web') {
      return 'Ads not available on web platform';
    }
    
    if (!this.isRewardedAdLoaded) {
      if (this.rewardedRetryCount > 0) {
        return `Loading ad... (attempt ${this.rewardedRetryCount}/${this.MAX_RETRY_ATTEMPTS})`;
      }
      return 'Loading ad...';
    }
    
    if (this.isShowingRewardedAd) {
      return 'Ad is currently playing';
    }
    
    return 'Ad ready to show';
  }

  /**
   * Reset session counters (call when app resumes or user logs in)
   */
  resetSession(): void {
    this.sessionAdsShown = 0;
    log.info('🎯 AdMob session reset');
  }
}

// Create singleton instance
export const adMobService = new AdMobService();

// Convenience functions
export const initializeAds = () => adMobService.initialize();
export const showInterstitialAd = (userIsPremium: boolean, context?: string) => 
  adMobService.showInterstitialAd(userIsPremium, context);
export const showRewardedAd = (context?: string) => adMobService.showRewardedAd(context);
export const canShowAd = (userIsPremium: boolean) => adMobService.canShowAd(userIsPremium);
export const canShowRewardedAd = () => adMobService.canShowRewardedAd();
export const getAdStatus = () => adMobService.getAdStatus();
export const getAdStatusMessage = () => adMobService.getAdStatusMessage();
export const resetAdSession = () => adMobService.resetSession();

export default adMobService;