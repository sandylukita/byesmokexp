// Web-safe AdMob service that provides no-op implementations

import { log } from '../config/environment';

class WebAdMobService {
  async initialize(): Promise<void> {
    log.info('🎯 AdMob not available on web platform');
  }

  async showInterstitialAd(
    userIsPremium: boolean, 
    context: string = 'unknown'
  ): Promise<boolean> {
    log.info('🎯 AdMob not available on web platform');
    return false;
  }

  isAdLoaded(): boolean {
    return false;
  }
}

const webAdMobService = new WebAdMobService();

export const showInterstitialAd = (userIsPremium: boolean, context?: string) => 
  webAdMobService.showInterstitialAd(userIsPremium, context);

export default webAdMobService;