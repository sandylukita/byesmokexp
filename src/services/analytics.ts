import { getAnalytics, logEvent, setUserId, setUserProperties, isSupported } from 'firebase/analytics';
import app from './firebase';
import { canUseAnalytics, log } from '../config/environment';

// Initialize Firebase Analytics only if supported
let analytics: any = null;

// Initialize analytics only if supported (mainly for web compatibility)
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(() => {
  log.info('📊 Firebase Analytics not supported in this environment');
});

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

/**
 * Log custom events to Firebase Analytics
 */
export const logAnalyticsEvent = (eventName: string, parameters?: Record<string, any>) => {
  try {
    if (!canUseAnalytics || !analytics) {
      log.debug('📊 Analytics Event:', eventName, parameters);
      return; // Don't log to Firebase when analytics is disabled or not available
    }
    
    logEvent(analytics, eventName, parameters);
    log.debug('📊 Analytics Event logged:', eventName, parameters);
  } catch (error: any) {
    log.error('Error logging analytics event:', error);
  }
};

/**
 * Set user ID for analytics tracking
 */
export const setAnalyticsUserId = (userId: string) => {
  try {
    if (!canUseAnalytics || !analytics) {
      log.debug('📊 Analytics User ID set:', userId);
      return;
    }
    
    setUserId(analytics, userId);
    log.debug('📊 Analytics User ID set:', userId);
  } catch (error: any) {
    log.error('Error setting analytics user ID:', error);
  }
};

/**
 * Set user properties for analytics
 */
export const setAnalyticsUserProperties = (properties: Record<string, string>) => {
  try {
    if (!canUseAnalytics || !analytics) {
      log.debug('📊 Analytics User Properties set:', properties);
      return;
    }
    
    setUserProperties(analytics, properties);
    log.debug('📊 Analytics User Properties set:', properties);
  } catch (error: any) {
    log.error('Error setting analytics user properties:', error);
  }
};

// Pre-defined event functions for common actions

export const trackUserLogin = (method: 'email' | 'demo') => {
  logAnalyticsEvent('login', {
    method: method,
  });
};

export const trackUserSignup = (method: 'email') => {
  logAnalyticsEvent('sign_up', {
    method: method,
  });
};

export const trackDailyCheckIn = (streak: number, xpEarned: number) => {
  logAnalyticsEvent('daily_checkin', {
    streak_count: streak,
    xp_earned: xpEarned,
  });
};

export const trackMissionCompleted = (missionId: string, xpReward: number, difficulty: string) => {
  logAnalyticsEvent('mission_completed', {
    mission_id: missionId,
    xp_reward: xpReward,
    difficulty: difficulty,
  });
};

export const trackBadgeUnlocked = (badgeId: string, badgeName: string) => {
  logAnalyticsEvent('badge_unlocked', {
    badge_id: badgeId,
    badge_name: badgeName,
  });
};

export const trackProgressShared = (shareType: 'summary' | 'achievement', platform?: string) => {
  logAnalyticsEvent('share_progress', {
    share_type: shareType,
    platform: platform || 'unknown',
  });
};

export const trackReferralCodeShared = () => {
  logAnalyticsEvent('referral_shared');
};

export const trackReferralSuccess = (referralCode: string) => {
  logAnalyticsEvent('referral_success', {
    referral_code: referralCode,
  });
};

export const trackScreenView = (screenName: string) => {
  logAnalyticsEvent('screen_view', {
    screen_name: screenName,
  });
};

export const trackFeatureUsed = (featureName: string, context?: string) => {
  logAnalyticsEvent('feature_used', {
    feature_name: featureName,
    context: context,
  });
};

export const trackError = (errorType: string, errorMessage: string, context?: string) => {
  logAnalyticsEvent('app_error', {
    error_type: errorType,
    error_message: errorMessage,
    context: context,
  });
};

export const trackOnboardingCompleted = (timeSpent: number) => {
  logAnalyticsEvent('onboarding_completed', {
    time_spent_seconds: timeSpent,
  });
};

export const trackSettingsChanged = (settingName: string, newValue: any) => {
  logAnalyticsEvent('settings_changed', {
    setting_name: settingName,
    new_value: String(newValue),
  });
};

// Health-specific tracking
export const trackQuitDataEntered = (cigarettesPerDay: number, cigarettePrice: number) => {
  logAnalyticsEvent('quit_data_entered', {
    cigarettes_per_day: cigarettesPerDay,
    cigarette_price: cigarettePrice,
  });
};

export const trackMilestoneReached = (milestoneType: string, daysSmokeFree: number) => {
  logAnalyticsEvent('milestone_reached', {
    milestone_type: milestoneType,
    days_smoke_free: daysSmokeFree,
  });
};

export const trackHealthBenefit = (benefitName: string, achieved: boolean) => {
  logAnalyticsEvent('health_benefit', {
    benefit_name: benefitName,
    achieved: achieved,
  });
};

export default {
  logEvent: logAnalyticsEvent,
  setUserId: setAnalyticsUserId,
  setUserProperties: setAnalyticsUserProperties,
  trackUserLogin,
  trackUserSignup,
  trackDailyCheckIn,
  trackMissionCompleted,
  trackBadgeUnlocked,
  trackProgressShared,
  trackReferralCodeShared,
  trackReferralSuccess,
  trackScreenView,
  trackFeatureUsed,
  trackError,
  trackOnboardingCompleted,
  trackSettingsChanged,
  trackQuitDataEntered,
  trackMilestoneReached,
  trackHealthBenefit,
};