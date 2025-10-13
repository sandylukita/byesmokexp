import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackAnalyticsEvent } from './analytics';

export interface UserJourneyEvent {
  eventType: string;
  screen: string;
  action?: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ConversionFunnelStep {
  step: string;
  completed: boolean;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  events: UserJourneyEvent[];
  userId?: string;
  appVersion: string;
}

class UserJourneyTracker {
  private currentSession: UserSession | null = null;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private sessionTimer: NodeJS.Timeout | null = null;

  // Conversion funnel definitions
  private readonly conversionFunnels = {
    onboarding: [
      'app_opened',
      'onboarding_started', 
      'onboarding_data_entered',
      'onboarding_completed',
      'tutorial_started',
      'tutorial_completed'
    ],
    mission_engagement: [
      'mission_viewed',
      'mission_attempted',
      'mission_completed',
      'mission_streak_achieved'
    ],
    retention: [
      'day_1_return',
      'day_3_return', 
      'day_7_return',
      'day_30_return'
    ],
    monetization: [
      'ad_viewed',
      'ad_completed',
      'premium_viewed',
      'premium_trial_started',
      'premium_purchased'
    ]
  };

  async initializeSession(userId?: string): Promise<void> {
    const sessionId = this.generateSessionId();
    
    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      events: [],
      userId,
      appVersion: '1.0.0' // Should come from app config
    };

    await this.saveSessionToStorage();
    this.trackEvent('session_started', 'app', 'session_init');
    
    console.log(`🔍 User journey session started: ${sessionId}`);
    this.scheduleSessionTimeout();
  }

  async trackEvent(
    eventType: string, 
    screen: string, 
    action?: string, 
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!this.currentSession) {
      await this.initializeSession();
    }

    const event: UserJourneyEvent = {
      eventType,
      screen,
      action,
      timestamp: Date.now(),
      sessionId: this.currentSession!.sessionId,
      userId: this.currentSession!.userId,
      metadata
    };

    this.currentSession!.events.push(event);
    await this.saveSessionToStorage();

    // Also send to analytics
    trackAnalyticsEvent(eventType, {
      screen,
      action,
      sessionId: this.currentSession!.sessionId,
      ...metadata
    });

    console.log(`📊 Journey event tracked: ${eventType} on ${screen}`, metadata);
    this.resetSessionTimeout();
  }

  async trackConversionStep(funnel: keyof typeof this.conversionFunnels, step: string, metadata?: Record<string, any>): Promise<void> {
    const steps = this.conversionFunnels[funnel];
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex === -1) {
      console.warn(`Unknown conversion step: ${step} for funnel: ${funnel}`);
      return;
    }

    await this.trackEvent(`conversion_${funnel}`, 'funnel', step, {
      funnel,
      step,
      stepIndex,
      ...metadata
    });

    // Store conversion data for analysis
    await this.saveConversionStep(funnel, step, metadata);
  }

  async trackScreenView(screenName: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent('screen_view', screenName, 'view', metadata);
  }

  async trackUserAction(screen: string, action: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent('user_action', screen, action, metadata);
  }

  async trackMissionEngagement(missionId: string, action: 'viewed' | 'started' | 'completed', metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent('mission_engagement', 'dashboard', action, {
      missionId,
      ...metadata
    });

    // Track conversion funnel
    if (action === 'viewed') {
      await this.trackConversionStep('mission_engagement', 'mission_viewed', { missionId });
    } else if (action === 'started') {
      await this.trackConversionStep('mission_engagement', 'mission_attempted', { missionId });
    } else if (action === 'completed') {
      await this.trackConversionStep('mission_engagement', 'mission_completed', { missionId });
    }
  }

  async trackRetention(daysSinceInstall: number): Promise<void> {
    let retentionStep: string;
    
    if (daysSinceInstall === 1) retentionStep = 'day_1_return';
    else if (daysSinceInstall === 3) retentionStep = 'day_3_return';
    else if (daysSinceInstall === 7) retentionStep = 'day_7_return';
    else if (daysSinceInstall === 30) retentionStep = 'day_30_return';
    else return; // Don't track other days

    await this.trackConversionStep('retention', retentionStep, { daysSinceInstall });
  }

  async trackMonetization(action: 'ad_viewed' | 'ad_completed' | 'premium_viewed' | 'premium_trial_started' | 'premium_purchased', metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent('monetization', 'app', action, metadata);
    await this.trackConversionStep('monetization', action, metadata);
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    await this.trackEvent('session_ended', 'app', 'session_end', {
      duration: this.currentSession.endTime - this.currentSession.startTime,
      eventCount: this.currentSession.events.length
    });

    await this.saveSessionToStorage();
    await this.uploadSessionData();
    
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }

    console.log(`🔍 User journey session ended: ${this.currentSession.sessionId}`);
    this.currentSession = null;
  }

  async getConversionFunnelAnalysis(funnel: keyof typeof this.conversionFunnels): Promise<{
    steps: { step: string; completions: number; dropoffRate: number }[];
    totalStarted: number;
    completionRate: number;
  }> {
    try {
      const funnelData = await AsyncStorage.getItem(`conversion_${funnel}`);
      if (!funnelData) {
        return {
          steps: this.conversionFunnels[funnel].map(step => ({ step, completions: 0, dropoffRate: 0 })),
          totalStarted: 0,
          completionRate: 0
        };
      }

      const data = JSON.parse(funnelData) as Record<string, number>;
      const steps = this.conversionFunnels[funnel];
      const totalStarted = data[steps[0]] || 0;
      
      const analysis = steps.map((step, index) => {
        const completions = data[step] || 0;
        const previousCompletions = index > 0 ? (data[steps[index - 1]] || 0) : totalStarted;
        const dropoffRate = previousCompletions > 0 ? ((previousCompletions - completions) / previousCompletions) * 100 : 0;
        
        return {
          step,
          completions,
          dropoffRate
        };
      });

      const completionRate = totalStarted > 0 ? ((data[steps[steps.length - 1]] || 0) / totalStarted) * 100 : 0;

      return {
        steps: analysis,
        totalStarted,
        completionRate
      };
    } catch (error) {
      console.error('Error analyzing conversion funnel:', error);
      return {
        steps: this.conversionFunnels[funnel].map(step => ({ step, completions: 0, dropoffRate: 0 })),
        totalStarted: 0,
        completionRate: 0
      };
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveSessionToStorage(): Promise<void> {
    if (!this.currentSession) return;
    
    try {
      await AsyncStorage.setItem(
        `journey_session_${this.currentSession.sessionId}`,
        JSON.stringify(this.currentSession)
      );
    } catch (error) {
      console.error('Error saving journey session:', error);
    }
  }

  private async saveConversionStep(funnel: string, step: string, metadata?: Record<string, any>): Promise<void> {
    try {
      const key = `conversion_${funnel}`;
      const existing = await AsyncStorage.getItem(key);
      const data = existing ? JSON.parse(existing) : {};
      
      data[step] = (data[step] || 0) + 1;
      
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving conversion step:', error);
    }
  }

  private scheduleSessionTimeout(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    this.sessionTimer = setTimeout(() => {
      this.endSession();
    }, this.sessionTimeout);
  }

  private resetSessionTimeout(): void {
    this.scheduleSessionTimeout();
  }

  private async uploadSessionData(): Promise<void> {
    // In a production app, this would upload to analytics service
    // For now, we'll just log the session summary
    if (!this.currentSession) return;

    const sessionSummary = {
      sessionId: this.currentSession.sessionId,
      duration: (this.currentSession.endTime || Date.now()) - this.currentSession.startTime,
      eventCount: this.currentSession.events.length,
      screens: [...new Set(this.currentSession.events.map(e => e.screen))],
      actions: [...new Set(this.currentSession.events.map(e => e.action).filter(Boolean))]
    };

    console.log('📊 Session summary for upload:', sessionSummary);
  }
}

// Export singleton instance
export const userJourneyTracker = new UserJourneyTracker();

// Convenience functions
export const trackScreenView = (screen: string, metadata?: Record<string, any>) =>
  userJourneyTracker.trackScreenView(screen, metadata);

export const trackUserAction = (screen: string, action: string, metadata?: Record<string, any>) =>
  userJourneyTracker.trackUserAction(screen, action, metadata);

export const trackMissionEngagement = (missionId: string, action: 'viewed' | 'started' | 'completed', metadata?: Record<string, any>) =>
  userJourneyTracker.trackMissionEngagement(missionId, action, metadata);

export const trackConversionStep = (funnel: 'onboarding' | 'mission_engagement' | 'retention' | 'monetization', step: string, metadata?: Record<string, any>) =>
  userJourneyTracker.trackConversionStep(funnel, step, metadata);

export const initializeUserJourney = (userId?: string) =>
  userJourneyTracker.initializeSession(userId);

export const endUserJourney = () =>
  userJourneyTracker.endSession();

export default userJourneyTracker;