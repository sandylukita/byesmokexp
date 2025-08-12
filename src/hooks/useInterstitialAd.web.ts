import { useCallback } from 'react';
import { User } from '../types';

interface UseInterstitialAdReturn {
  showAd: (context?: string) => Promise<boolean>;
  canShow: boolean;
  isAdLoaded: boolean;
  adStatus: {
    isAdLoaded: boolean;
    isShowingAd: boolean;
    sessionAdsShown: number;
    maxAdsPerSession: number;
    cooldownRemaining: number;
  };
}

// Web-safe no-op implementations
export const useInterstitialAd = (user: User | null): UseInterstitialAdReturn => {
  const showAd = useCallback(async (context: string = 'unknown'): Promise<boolean> => {
    console.log('🎯 AdMob not available on web platform');
    return false;
  }, []);

  return {
    showAd,
    canShow: false,
    isAdLoaded: false,
    adStatus: {
      isAdLoaded: false,
      isShowingAd: false,
      sessionAdsShown: 0,
      maxAdsPerSession: 3,
      cooldownRemaining: 0,
    },
  };
};

export const useDelayedInterstitialAd = (
  user: User | null,
  delay: number = 1000
) => {
  const showAdAfterDelay = useCallback((context?: string) => {
    console.log('🎯 AdMob not available on web platform');
  }, []);

  return { showAdAfterDelay };
};

export default useInterstitialAd;