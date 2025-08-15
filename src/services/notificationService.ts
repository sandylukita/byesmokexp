/**
 * ByeSmoke Notification Service
 * 
 * A complete notification system for daily reminders with:
 * - Permission handling
 * - Random motivational messages
 * - Time-based scheduling
 * - Error handling and recovery
 * - Testing utilities
 * 
 * Usage:
 * 1. Initialize listeners in main app: NotificationService.initializeListeners()
 * 2. Request permissions: await NotificationService.requestPermissions()  
 * 3. Schedule reminders: await NotificationService.scheduleDailyReminder('09:00')
 * 4. Test functionality: await NotificationService.testPermissions()
 */

import * as Notifications from 'expo-notifications';
import { Platform, AppState } from 'react-native';
import { translations, Language } from '../utils/translations';
import { User } from '../types';
import { detectStreakRisk, getStreakNotificationContent, shouldScheduleStreakReminder } from '../utils/helpers';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PermissionStatus = 'undetermined' | 'denied' | 'granted';

// Get random notification message based on language
function getRandomNotificationMessage(language: Language = 'id') {
  const t = translations[language];
  const messageTypes = ['reminder', 'motivation', 'healthy', 'consistency', 'journey', 'freedom'] as const;
  const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
  
  return {
    title: t.notifications.titles[randomType],
    body: t.notifications.bodies[randomType]
  };
}

export class NotificationService {
  private static notificationListener: Notifications.Subscription | null = null;
  private static responseListener: Notifications.Subscription | null = null;

  /**
   * Initialize notification listeners
   */
  static initializeListeners(): void {
    try {
      // Listen for notifications received while app is foregrounded
      this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received while app active:', notification);
      });

      // Listen for user tapping notifications
      this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('User tapped notification:', response);
        // Could navigate to specific screen or perform action here
      });

      console.log('Notification listeners initialized');
    } catch (error) {
      console.error('Error initializing notification listeners:', error);
    }
  }

  /**
   * Clean up notification listeners
   */
  static removeListeners(): void {
    try {
      if (this.notificationListener) {
        Notifications.removeNotificationSubscription(this.notificationListener);
        this.notificationListener = null;
      }
      
      if (this.responseListener) {
        Notifications.removeNotificationSubscription(this.responseListener);
        this.responseListener = null;
      }
      
      console.log('Notification listeners removed');
    } catch (error) {
      console.error('Error removing notification listeners:', error);
    }
  }
  /**
   * Get current permission status
   */
  static async getPermissionStatus(): Promise<PermissionStatus> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status as PermissionStatus;
    } catch (error) {
      console.error('Error getting notification permission status:', error);
      return 'undetermined';
    }
  }

  /**
   * Request notification permissions with detailed handling
   */
  static async requestPermissions(): Promise<PermissionStatus> {
    try {
      // Check if we already have permissions
      const currentStatus = await this.getPermissionStatus();
      if (currentStatus === 'granted') {
        console.log('Permissions already granted');
        return 'granted';
      }

      console.log('Requesting notification permissions...');
      
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      console.log('Permission request result:', status);
      return status as PermissionStatus;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return 'denied';
    }
  }

  /**
   * Check if notification permissions are granted
   */
  static async hasPermissions(): Promise<boolean> {
    const status = await this.getPermissionStatus();
    return status === 'granted';
  }

  /**
   * Check if we can ask for permissions (not permanently denied)
   */  
  static async canAskForPermissions(): Promise<boolean> {
    const status = await this.getPermissionStatus();
    return status === 'undetermined';
  }

  /**
   * Schedule a daily reminder notification
   */
  static async scheduleDailyReminder(time: string, language: Language = 'id', customTitle?: string, customBody?: string): Promise<string | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        console.log('No notification permissions');
        return null;
      }

      // Parse time (format: "HH:MM")
      const [hours, minutes] = time.split(':').map(Number);
      
      // Validate time
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error('Invalid time format:', time);
        return null;
      }

      // Use custom message or get random message
      const message = customTitle && customBody 
        ? { title: customTitle, body: customBody }
        : getRandomNotificationMessage(language);
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          sound: 'default',
          data: {
            type: 'daily_reminder',
            scheduledTime: time,
          },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });

      console.log(`Scheduled daily reminder for ${time}:`, identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('Cancelled notification:', identifier);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      const beforeCount = (await this.getScheduledNotifications()).length;
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log(`Cancelled all notifications (${beforeCount} notifications removed)`);
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  /**
   * Reschedule notifications (useful for app state changes or settings updates)
   */
  static async rescheduleIfNeeded(
    notificationsEnabled: boolean, 
    reminderTime: string,
    language: Language = 'id'
  ): Promise<boolean> {
    try {
      if (!notificationsEnabled) {
        console.log('Notifications disabled, ensuring all are cancelled');
        await this.cancelAllNotifications();
        return true;
      }

      const hasPermissions = await this.hasPermissions();
      if (!hasPermissions) {
        console.log('No permissions, cannot reschedule notifications');
        return false;
      }

      // Check if we already have the correct notification scheduled
      const scheduled = await this.getScheduledNotifications();
      const dailyReminders = scheduled.filter(
        n => n.content.data?.type === 'daily_reminder' && 
             n.content.data?.scheduledTime === reminderTime
      );

      if (dailyReminders.length === 1) {
        console.log('Correct notification already scheduled');
        return true;
      }

      // Cancel all and reschedule
      console.log('Rescheduling notifications for correct time');
      await this.cancelAllNotifications();
      const result = await this.scheduleDailyReminder(reminderTime, language);
      return result !== null;
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
      return false;
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Get permission status with user-friendly message
   */
  static getPermissionMessage(status: PermissionStatus, language: Language = 'id'): string {
    const t = translations[language];
    switch (status) {
      case 'granted':
        return t.notifications.permissionGranted;
      case 'denied':
        return t.notifications.permissionDenied;
      case 'undetermined':
        return t.notifications.permissionUndetermined;
      default:
        return 'Status izin tidak diketahui'; // Fallback for unknown status
    }
  }

  /**
   * Schedule a test notification (immediate)
   */
  static async scheduleTestNotification(language: Language = 'id'): Promise<string | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        console.log('No notification permissions for test');
        return null;
      }

      const message = getRandomNotificationMessage(language);
      const testSuffix = language === 'en' ? ' (Test notification in 5 seconds)' : ' (Test notification dalam 5 detik)';
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `[TEST] ${message.title}`,
          body: `${message.body}${testSuffix}`,
          sound: 'default',
          data: {
            type: 'test_notification',
          },
        },
        trigger: {
          seconds: 5,
        } as Notifications.TimeIntervalTriggerInput,
      });

      console.log('Test notification scheduled for 5 seconds:', identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      return null;
    }
  }

  /**
   * Get debugging info about scheduled notifications
   */
  static async getDebugInfo(): Promise<void> {
    try {
      console.log('=== Notification Debug Info ===');
      const scheduled = await this.getScheduledNotifications();
      console.log(`Total scheduled notifications: ${scheduled.length}`);
      
      scheduled.forEach((notification, index) => {
        console.log(`${index + 1}. ID: ${notification.identifier}`);
        console.log(`   Title: ${notification.content.title}`);
        console.log(`   Body: ${notification.content.body}`);
        console.log(`   Trigger:`, notification.trigger);
        console.log('---');
      });
      
      console.log('=== Debug Info Complete ===');
    } catch (error) {
      console.error('Error getting debug info:', error);
    }
  }

  /**
   * Simple test function to verify service works (not called automatically)
   */
  static async testPermissions(language: Language = 'id'): Promise<void> {
    try {
      console.log('=== Testing Notification Service ===');
      console.log('Language:', language);
      const status = await this.getPermissionStatus();
      console.log('Current permission status:', status);
      console.log('Permission message:', this.getPermissionMessage(status, language));
      console.log('Has permissions:', await this.hasPermissions());
      console.log('Can ask for permissions:', await this.canAskForPermissions());
      
      // Schedule test notification if permissions granted
      if (await this.hasPermissions()) {
        console.log('Scheduling test notification...');
        await this.scheduleTestNotification(language);
      }
      
      // Show debug info
      await this.getDebugInfo();
      
      console.log('=== Test Complete ===');
    } catch (error) {
      console.error('Error testing notification service:', error);
    }
  }

  /**
   * Test both languages quickly
   */
  static async testBothLanguages(): Promise<void> {
    console.log('\n🇮🇩 Testing Indonesian notifications...');
    await this.testPermissions('id');
    
    console.log('\n🇺🇸 Testing English notifications...');
    await this.testPermissions('en');
  }

  // Smart Streak Notifications

  /**
   * Schedule a streak protection notification
   */
  static async scheduleStreakReminder(
    user: User, 
    delayHours: number = 0,
    language: Language = 'id'
  ): Promise<string | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        console.log('No notification permissions for streak reminder');
        return null;
      }

      const streakRisk = detectStreakRisk(user);
      if (!streakRisk.shouldNotify) {
        console.log('No streak notification needed at this time');
        return null;
      }

      const notificationContent = getStreakNotificationContent(streakRisk, language);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationContent.title,
          body: notificationContent.body,
          sound: 'default',
          data: {
            type: 'streak_reminder',
            streakCount: streakRisk.currentStreak,
            riskLevel: streakRisk.riskLevel,
            userId: user.id,
          },
        },
        trigger: delayHours > 0 ? {
          seconds: delayHours * 3600, // Convert hours to seconds
        } as Notifications.TimeIntervalTriggerInput : null, // Immediate if no delay
      });

      console.log(`Scheduled streak reminder (${streakRisk.riskLevel}):`, identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling streak notification:', error);
      return null;
    }
  }

  /**
   * Schedule escalating streak reminders
   */
  static async scheduleEscalatingStreakReminders(
    user: User,
    language: Language = 'id'
  ): Promise<string[]> {
    try {
      if (!shouldScheduleStreakReminder(user)) {
        console.log('Streak reminders not needed for user');
        return [];
      }

      // Cancel existing streak notifications to avoid duplicates
      await this.cancelStreakNotifications();

      const scheduledIds: string[] = [];
      const now = new Date();
      const currentHour = now.getHours();

      // Schedule immediate notification if it's already past 8 PM
      if (currentHour >= 20) {
        const immediateId = await this.scheduleStreakReminder(user, 0, language);
        if (immediateId) {
          scheduledIds.push(immediateId);
        }
      }

      // Schedule future notifications based on current time
      const futureHours = [];
      
      if (currentHour < 20) {
        // Schedule 8 PM reminder
        const hoursUntil8PM = 20 - currentHour;
        futureHours.push(hoursUntil8PM);
      }
      
      if (currentHour < 21) {
        // Schedule 9 PM reminder
        const hoursUntil9PM = 21 - currentHour;
        futureHours.push(hoursUntil9PM);
      }
      
      if (currentHour < 22) {
        // Schedule 10 PM reminder
        const hoursUntil10PM = 22 - currentHour;
        futureHours.push(hoursUntil10PM);
      }

      // Schedule all future notifications
      for (const delayHours of futureHours) {
        const id = await this.scheduleStreakReminder(user, delayHours, language);
        if (id) {
          scheduledIds.push(id);
        }
      }

      console.log(`Scheduled ${scheduledIds.length} escalating streak reminders`);
      return scheduledIds;
    } catch (error) {
      console.error('Error scheduling escalating streak reminders:', error);
      return [];
    }
  }

  /**
   * Cancel all streak-related notifications
   */
  static async cancelStreakNotifications(): Promise<void> {
    try {
      const scheduled = await this.getScheduledNotifications();
      const streakNotifications = scheduled.filter(
        n => n.content.data?.type === 'streak_reminder'
      );

      for (const notification of streakNotifications) {
        await this.cancelNotification(notification.identifier);
      }

      console.log(`Cancelled ${streakNotifications.length} streak notifications`);
    } catch (error) {
      console.error('Error cancelling streak notifications:', error);
    }
  }

  /**
   * Check if user needs streak protection and schedule accordingly
   */
  static async manageStreakProtection(user: User, language: Language = 'id'): Promise<void> {
    try {
      if (!user.settings?.notifications) {
        console.log('Notifications disabled, skipping streak protection');
        return;
      }

      const streakRisk = detectStreakRisk(user);
      
      if (streakRisk.currentStreak === 0) {
        console.log('No streak to protect');
        return;
      }

      if (!streakRisk.isAtRisk) {
        console.log('Streak not at risk, no notifications needed');
        // Cancel any existing streak notifications since they're not needed
        await this.cancelStreakNotifications();
        return;
      }

      console.log(`Managing streak protection for ${streakRisk.currentStreak}-day streak (${streakRisk.riskLevel} risk)`);
      await this.scheduleEscalatingStreakReminders(user, language);
    } catch (error) {
      console.error('Error managing streak protection:', error);
    }
  }

  /**
   * Test streak notifications (for development)
   */
  static async testStreakNotification(user: User, language: Language = 'id'): Promise<void> {
    try {
      console.log('=== Testing Streak Notifications ===');
      
      const streakRisk = detectStreakRisk(user);
      console.log('Streak risk analysis:', {
        isAtRisk: streakRisk.isAtRisk,
        currentStreak: streakRisk.currentStreak,
        riskLevel: streakRisk.riskLevel,
        hoursUntilExpiry: streakRisk.hoursUntilExpiry
      });

      if (await this.hasPermissions()) {
        console.log('Scheduling test streak notification...');
        const testId = await this.scheduleStreakReminder(user, 0, language);
        console.log('Test streak notification scheduled:', testId);
      } else {
        console.log('No permissions for streak notification test');
      }

      console.log('=== Streak Test Complete ===');
    } catch (error) {
      console.error('Error testing streak notifications:', error);
    }
  }
}