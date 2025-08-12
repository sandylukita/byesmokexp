import { useCallback, useEffect, useState } from 'react';
import { showInterstitialAd, canShowAd, getAdStatus } from '../services/adMob';
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

/**
 * Hook for managing interstitial ads
 * @param user - Current user object (to check premium status)
 * @returns Object with ad management functions and status
 */
export const useInterstitialAd = (user: User | null): UseInterstitialAdReturn => {
  const [adStatus, setAdStatus] = useState(getAdStatus());

  // Update ad status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAdStatus(getAdStatus());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  /**
   * Show interstitial ad with context
   */
  const showAd = useCallback(async (context: string = 'unknown'): Promise<boolean> => {
    if (!user) {
      console.log('🎯 No user available, skipping ad');
      return false;
    }

    try {
      const wasShown = await showInterstitialAd(user.isPremium, context);
      
      // Update status after attempting to show ad
      setAdStatus(getAdStatus());
      
      return wasShown;
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }, [user]);

  /**
   * Check if we can show an ad right now
   */
  const canShow = user ? canShowAd(user.isPremium) : false;

  return {
    showAd,
    canShow,
    isAdLoaded: adStatus.isAdLoaded,
    adStatus,
  };
};

/**
 * Simple hook that just shows an ad after a delay (for fire-and-forget scenarios)
 */
export const useDelayedInterstitialAd = (
  user: User | null,
  delay: number = 1000
) => {
  const { showAd } = useInterstitialAd(user);

  const showAdAfterDelay = useCallback((context?: string) => {
    setTimeout(() => {
      showAd(context);
    }, delay);
  }, [showAd, delay]);

  return { showAdAfterDelay };
};

export default useInterstitialAd;