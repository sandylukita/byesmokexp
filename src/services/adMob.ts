import { Platform } from 'react-native';
import { log } from '../config/environment';
import { errorTracker } from './errorTracking';

// Only import AdMob on native platforms
let mobileAds: any = null;
let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;

if (Platform.OS !== 'web') {
  const AdMobModule = require('react-native-google-mobile-ads');
  mobileAds = AdMobModule.default;
  InterstitialAd = AdMobModule.InterstitialAd;
  AdEventType = AdMobModule.AdEventType;
  TestIds = AdMobModule.TestIds;
}

// Google's official test ad unit IDs for development
const TEST_INTERSTITIAL_AD_UNIT = 'ca-app-pub-3940256099942544/1033173712';
const TEST_INTERSTITIAL_AD_UNIT_ANDROID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_INTERSTITIAL_AD_UNIT_IOS = 'ca-app-pub-3940256099942544/4411468910';

// Production ad unit IDs (replace with your actual ad unit IDs from AdMob console)
const PRODUCTION_INTERSTITIAL_AD_UNIT_ANDROID = 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy';
const PRODUCTION_INTERSTITIAL_AD_UNIT_IOS = 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy';

class AdMobService {
  private interstitialAd: InterstitialAd | null = null;
  private isAdLoaded = false;
  private isShowingAd = false;
  private lastAdShownTime = 0;
  private readonly AD_COOLDOWN = 5 * 60 * 1000; // 5 minutes cooldown between ads
  private sessionAdsShown = 0;
  private readonly MAX_ADS_PER_SESSION = 3; // Maximum ads per app session

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
      
      // Create and load the first interstitial ad
      this.createInterstitialAd();
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
        log.info('🎯 Interstitial ad loaded');
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
        this.isAdLoaded = false;
        log.error('❌ Interstitial ad error:', error);
        errorTracker.trackError({
          error: new Error(`Interstitial ad error: ${error.message}`),
          context: 'interstitial_ad_error',
          additionalData: { error },
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
   * Get ad status for debugging
   */
  getAdStatus() {
    return {
      isAdLoaded: this.isAdLoaded,
      isShowingAd: this.isShowingAd,
      sessionAdsShown: this.sessionAdsShown,
      maxAdsPerSession: this.MAX_ADS_PER_SESSION,
      cooldownRemaining: Math.max(0, this.AD_COOLDOWN - (Date.now() - this.lastAdShownTime)),
    };
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
export const canShowAd = (userIsPremium: boolean) => adMobService.canShowAd(userIsPremium);
export const getAdStatus = () => adMobService.getAdStatus();
export const resetAdSession = () => adMobService.resetSession();

export default adMobService;