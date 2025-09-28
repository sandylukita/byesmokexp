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
import { debugLog } from '../utils/performanceOptimizer';
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

// Get progress-based notification message based on days since quit
function getProgressBasedNotificationMessage(daysSinceQuit: number, language: Language = 'id') {
  const t = translations[language];
  
  if (daysSinceQuit <= 3) {
    // Days 1-3: Focus on immediate healing and encouragement
    const messages = [
      {
        title: language === 'en' ? 'Your Body is Healing! 🌱' : 'Tubuhmu Sedang Sembuh! 🌱',
        body: language === 'en' ? 'Your lungs are already starting to heal! Time to check-in and celebrate this amazing progress.' : 'Paru-parumu sudah mulai sembuh! Waktunya check-in dan rayakan kemajuan luar biasa ini.'
      },
      {
        title: language === 'en' ? 'Amazing Start! 💪' : 'Awal yang Luar Biasa! 💪',
        body: language === 'en' ? 'Every hour without smoking is a victory! Don\'t forget to track your incredible progress today.' : 'Setiap jam tanpa rokok adalah kemenangan! Jangan lupa catat kemajuan luar biasamu hari ini.'
      },
      {
        title: language === 'en' ? 'You\'re Doing Great! ⭐' : 'Kamu Hebat! ⭐',
        body: language === 'en' ? 'Your body is thanking you right now! Time for your daily check-in to keep the momentum going.' : 'Tubuhmu berterima kasih padamu sekarang! Waktunya check-in harian untuk menjaga momentum.'
      }
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else if (daysSinceQuit <= 14) {
    // Days 4-14: Physical recovery focus
    const messages = [
      {
        title: language === 'en' ? 'Taste & Smell Improving! 👃' : 'Rasa & Penciuman Membaik! 👃',
        body: language === 'en' ? 'Your senses are getting sharper every day! Check-in to track these amazing changes.' : 'Indera perasamu semakin tajam setiap hari! Check-in untuk catat perubahan luar biasa ini.'
      },
      {
        title: language === 'en' ? 'Breathing Easier! 🫁' : 'Napas Lebih Lega! 🫁',
        body: language === 'en' ? 'Feel that? Your lungs are getting stronger! Time to record today\'s progress.' : 'Rasakan itu? Paru-parumu semakin kuat! Waktunya catat progress hari ini.'
      },
      {
        title: language === 'en' ? 'Circulation Improving! ❤️' : 'Sirkulasi Membaik! ❤️',
        body: language === 'en' ? 'Your blood flow is improving daily! Don\'t miss today\'s check-in to celebrate recovery.' : 'Aliran darahmu membaik setiap hari! Jangan lewatkan check-in hari ini untuk rayakan pemulihan.'
      }
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else if (daysSinceQuit <= 30) {
    // Days 15-30: Psychological benefits and confidence building
    const messages = [
      {
        title: language === 'en' ? 'Confidence Growing! 🚀' : 'Percaya Diri Tumbuh! 🚀',
        body: language === 'en' ? 'You\'re proving to yourself that you can do anything! Time for your empowering check-in.' : 'Kamu membuktikan pada diri sendiri bahwa kamu bisa apa saja! Waktunya check-in yang memberdayakan.'
      },
      {
        title: language === 'en' ? 'Mental Clarity Rising! 🧠' : 'Kejernihan Mental Meningkat! 🧠',
        body: language === 'en' ? 'Your mind is sharper and clearer! Check-in to acknowledge this mental transformation.' : 'Pikiranmu lebih tajam dan jernih! Check-in untuk mengakui transformasi mental ini.'
      },
      {
        title: language === 'en' ? 'Self-Control Mastered! 🎯' : 'Kontrol Diri Dikuasai! 🎯',
        body: language === 'en' ? 'You\'re mastering self-discipline like a champion! Time to record this powerful progress.' : 'Kamu menguasai disiplin diri seperti juara! Waktunya catat kemajuan hebat ini.'
      }
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else {
    // 30+ days: Identity reinforcement and long-term vision
    const messages = [
      {
        title: language === 'en' ? 'You\'re a Non-Smoker! 🎉' : 'Kamu Bukan Perokok! 🎉',
        body: language === 'en' ? 'This is who you are now - a healthy, strong non-smoker! Time to celebrate with check-in.' : 'Ini dirimu sekarang - orang sehat dan kuat yang tidak merokok! Waktunya rayakan dengan check-in.'
      },
      {
        title: language === 'en' ? 'Lifestyle Transformed! ✨' : 'Gaya Hidup Berubah! ✨',
        body: language === 'en' ? 'You\'ve completely transformed your life! Check-in to honor this incredible achievement.' : 'Kamu benar-benar mengubah hidupmu! Check-in untuk menghormati pencapaian luar biasa ini.'
      },
      {
        title: language === 'en' ? 'Inspiring Others! 👑' : 'Menginspirasi Orang Lain! 👑',
        body: language === 'en' ? 'Your success story inspires others to change! Time for your daily victory check-in.' : 'Kisah suksesmu menginspirasi orang lain untuk berubah! Waktunya check-in kemenangan harian.'
      }
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
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
        debugLog.log('Notification received while app active:', notification);
      });

      // Listen for user tapping notifications
      this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        debugLog.log('User tapped notification:', response);
        // Could navigate to specific screen or perform action here
      });

      debugLog.log('Notification listeners initialized');
    } catch (error) {
      debugLog.error('Error initializing notification listeners:', error);
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
      
      debugLog.log('Notification listeners removed');
    } catch (error) {
      debugLog.error('Error removing notification listeners:', error);
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
      debugLog.error('Error getting notification permission status:', error);
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
        debugLog.log('Permissions already granted');
        return 'granted';
      }

      debugLog.log('Requesting notification permissions...');
      
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      debugLog.log('Permission request result:', status);
      return status as PermissionStatus;
    } catch (error) {
      debugLog.error('Error requesting notification permissions:', error);
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
  static async scheduleDailyReminder(time: string, language: Language = 'id', customTitle?: string, customBody?: string, user?: User): Promise<string | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        debugLog.log('No notification permissions');
        return null;
      }

      // Parse time (format: "HH:MM")
      const [hours, minutes] = time.split(':').map(Number);
      
      // Validate time
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        debugLog.error('Invalid time format:', time);
        return null;
      }

      // Use custom message, progress-based message, or fallback to random message
      let message;
      if (customTitle && customBody) {
        message = { title: customTitle, body: customBody };
      } else if (user?.quitDate) {
        // Calculate days since quit for progress-based messaging
        const quitDate = new Date(user.quitDate);
        const now = new Date();
        const daysSinceQuit = Math.floor((now.getTime() - quitDate.getTime()) / (1000 * 60 * 60 * 24));
        message = getProgressBasedNotificationMessage(Math.max(1, daysSinceQuit), language);
        debugLog.log(`Using progress-based message for day ${daysSinceQuit}`);
      } else {
        message = getRandomNotificationMessage(language);
      }
      
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

      debugLog.log(`Scheduled daily reminder for ${time}:`, identifier);
      return identifier;
    } catch (error) {
      debugLog.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      debugLog.log('Cancelled notification:', identifier);
    } catch (error) {
      debugLog.error('Error cancelling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      const beforeCount = (await this.getScheduledNotifications()).length;
      await Notifications.cancelAllScheduledNotificationsAsync();
      debugLog.log(`Cancelled all notifications (${beforeCount} notifications removed)`);
    } catch (error) {
      debugLog.error('Error cancelling all notifications:', error);
    }
  }

  /**
   * Reschedule notifications (useful for app state changes or settings updates)
   */
  static async rescheduleIfNeeded(
    notificationsEnabled: boolean, 
    reminderTime: string,
    language: Language = 'id',
    user?: User
  ): Promise<boolean> {
    try {
      if (!notificationsEnabled) {
        debugLog.log('Notifications disabled, ensuring all are cancelled');
        await this.cancelAllNotifications();
        return true;
      }

      const hasPermissions = await this.hasPermissions();
      if (!hasPermissions) {
        debugLog.log('No permissions, cannot reschedule notifications');
        return false;
      }

      // Check if we already have the correct notification scheduled
      const scheduled = await this.getScheduledNotifications();
      const dailyReminders = scheduled.filter(
        n => n.content.data?.type === 'daily_reminder' && 
             n.content.data?.scheduledTime === reminderTime
      );

      if (dailyReminders.length === 1) {
        debugLog.log('Correct notification already scheduled');
        return true;
      }

      // Cancel all and reschedule
      debugLog.log('Rescheduling notifications for correct time');
      await this.cancelAllNotifications();
      const result = await this.scheduleDailyReminder(reminderTime, language, undefined, undefined, user);
      return result !== null;
    } catch (error) {
      debugLog.error('Error rescheduling notifications:', error);
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
      debugLog.error('Error getting scheduled notifications:', error);
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
        debugLog.log('No notification permissions for test');
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

      debugLog.log('Test notification scheduled for 5 seconds:', identifier);
      return identifier;
    } catch (error) {
      debugLog.error('Error scheduling test notification:', error);
      return null;
    }
  }

  /**
   * Get debugging info about scheduled notifications
   */
  static async getDebugInfo(): Promise<void> {
    try {
      debugLog.log('=== Notification Debug Info ===');
      const scheduled = await this.getScheduledNotifications();
      debugLog.log(`Total scheduled notifications: ${scheduled.length}`);
      
      scheduled.forEach((notification, index) => {
        debugLog.log(`${index + 1}. ID: ${notification.identifier}`);
        debugLog.log(`   Title: ${notification.content.title}`);
        debugLog.log(`   Body: ${notification.content.body}`);
        debugLog.log(`   Trigger:`, notification.trigger);
        debugLog.log('---');
      });
      
      debugLog.log('=== Debug Info Complete ===');
    } catch (error) {
      debugLog.error('Error getting debug info:', error);
    }
  }


  /**
   * Simple test function to verify service works (not called automatically)
   */
  static async testPermissions(language: Language = 'id'): Promise<void> {
    try {
      debugLog.log('=== Testing Notification Service ===');
      debugLog.log('Language:', language);
      const status = await this.getPermissionStatus();
      debugLog.log('Current permission status:', status);
      debugLog.log('Permission message:', this.getPermissionMessage(status, language));
      debugLog.log('Has permissions:', await this.hasPermissions());
      debugLog.log('Can ask for permissions:', await this.canAskForPermissions());
      
      // Schedule test notification if permissions granted
      if (await this.hasPermissions()) {
        debugLog.log('Scheduling test notification...');
        await this.scheduleTestNotification(language);
      }
      
      // Show debug info
      await this.getDebugInfo();
      
      debugLog.log('=== Test Complete ===');
    } catch (error) {
      debugLog.error('Error testing notification service:', error);
    }
  }

  /**
   * Test both languages quickly
   */
  static async testBothLanguages(): Promise<void> {
    debugLog.log('\n🇮🇩 Testing Indonesian notifications...');
    await this.testPermissions('id');
    
    debugLog.log('\n🇺🇸 Testing English notifications...');
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
        debugLog.log('No notification permissions for streak reminder');
        return null;
      }

      const streakRisk = detectStreakRisk(user);
      if (!streakRisk.shouldNotify) {
        debugLog.log('No streak notification needed at this time');
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

      debugLog.log(`Scheduled streak reminder (${streakRisk.riskLevel}):`, identifier);
      return identifier;
    } catch (error) {
      debugLog.error('Error scheduling streak notification:', error);
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
        debugLog.log('Streak reminders not needed for user');
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

      debugLog.log(`Scheduled ${scheduledIds.length} escalating streak reminders`);
      return scheduledIds;
    } catch (error) {
      debugLog.error('Error scheduling escalating streak reminders:', error);
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

      debugLog.log(`Cancelled ${streakNotifications.length} streak notifications`);
    } catch (error) {
      debugLog.error('Error cancelling streak notifications:', error);
    }
  }

  /**
   * Check if user needs streak protection and schedule accordingly
   */
  static async manageStreakProtection(user: User, language: Language = 'id'): Promise<void> {
    try {
      if (!user.settings?.notifications) {
        debugLog.log('Notifications disabled, skipping streak protection');
        return;
      }

      const streakRisk = detectStreakRisk(user);
      
      if (streakRisk.currentStreak === 0) {
        debugLog.log('No streak to protect');
        return;
      }

      if (!streakRisk.isAtRisk) {
        debugLog.log('Streak not at risk, no notifications needed');
        // Cancel any existing streak notifications since they're not needed
        await this.cancelStreakNotifications();
        return;
      }

      debugLog.log(`Managing streak protection for ${streakRisk.currentStreak}-day streak (${streakRisk.riskLevel} risk)`);
      await this.scheduleEscalatingStreakReminders(user, language);
    } catch (error) {
      debugLog.error('Error managing streak protection:', error);
    }
  }

  /**
   * Test streak notifications (for development)
   */
  static async testStreakNotification(user: User, language: Language = 'id'): Promise<void> {
    try {
      debugLog.log('=== Testing Streak Notifications ===');
      
      const streakRisk = detectStreakRisk(user);
      debugLog.log('Streak risk analysis:', {
        isAtRisk: streakRisk.isAtRisk,
        currentStreak: streakRisk.currentStreak,
        riskLevel: streakRisk.riskLevel,
        hoursUntilExpiry: streakRisk.hoursUntilExpiry
      });

      if (await this.hasPermissions()) {
        debugLog.log('Scheduling test streak notification...');
        const testId = await this.scheduleStreakReminder(user, 0, language);
        debugLog.log('Test streak notification scheduled:', testId);
      } else {
        debugLog.log('No permissions for streak notification test');
      }

      debugLog.log('=== Streak Test Complete ===');
    } catch (error) {
      debugLog.error('Error testing streak notifications:', error);
    }
  }

  // Lungcat Notifications

  /**
   * Get lungcat notification content based on care type
   */
  static getLungcatNotificationContent(
    type: 'feeding' | 'playing' | 'health_good' | 'health_bad' | 'energy_low',
    language: Language = 'id'
  ): { title: string; body: string } {
    const messages = {
      feeding: {
        en: {
          title: 'Your Lungcat is Hungry! 🍽️',
          body: 'Time to feed your lungcat! A well-fed lungcat is a happy lungcat.'
        },
        id: {
          title: 'Lungcat Anda Lapar! 🍽️',
          body: 'Waktunya memberi makan lungcat! Lungcat yang kenyang adalah lungcat yang bahagia.'
        }
      },
      playing: {
        en: {
          title: 'Your Lungcat Wants to Play! 🎾',
          body: 'Your lungcat is ready for some fun! Playing keeps your lungcat energetic and happy.'
        },
        id: {
          title: 'Lungcat Anda Ingin Bermain! 🎾',
          body: 'Lungcat Anda siap untuk bersenang-senang! Bermain membuat lungcat energik dan bahagia.'
        }
      },
      health_good: {
        en: {
          title: 'Your Lungcat is Thriving! 🌟',
          body: 'Amazing progress! Your lungcat is healthy and happy thanks to your daily care.'
        },
        id: {
          title: 'Lungcat Anda Berkembang Pesat! 🌟',
          body: 'Progress luar biasa! Lungcat Anda sehat dan bahagia berkat perawatan harian Anda.'
        }
      },
      health_bad: {
        en: {
          title: 'Your Lungcat Needs Care! 💔',
          body: 'Your lungcat is feeling unwell. Regular check-ins and care will help them recover!'
        },
        id: {
          title: 'Lungcat Anda Butuh Perawatan! 💔',
          body: 'Lungcat Anda kurang sehat. Check-in dan perawatan rutin akan membantu mereka pulih!'
        }
      },
      energy_low: {
        en: {
          title: 'Your Lungcat is Tired! 😴',
          body: 'Your lungcat\'s energy is running low. Time for a check-in to boost their spirits!'
        },
        id: {
          title: 'Lungcat Anda Capek! 😴',
          body: 'Energi lungcat Anda menurun. Waktunya check-in untuk meningkatkan semangat mereka!'
        }
      }
    };

    return messages[type][language];
  }

  /**
   * Schedule lungcat care reminder (feeding or playing)
   */
  static async scheduleLungcatCareReminder(
    type: 'feeding' | 'playing',
    delayHours: number,
    language: Language = 'id'
  ): Promise<string | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        debugLog.log('No notification permissions for lungcat care reminder');
        return null;
      }

      const content = this.getLungcatNotificationContent(type, language);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          sound: 'default',
          data: {
            type: 'lungcat_care',
            careType: type,
          },
        },
        trigger: {
          seconds: delayHours * 3600, // Convert hours to seconds
        } as Notifications.TimeIntervalTriggerInput,
      });

      debugLog.log(`Scheduled lungcat ${type} reminder for ${delayHours} hours:`, identifier);
      return identifier;
    } catch (error) {
      debugLog.error(`Error scheduling lungcat ${type} reminder:`, error);
      return null;
    }
  }

  /**
   * Schedule lungcat health status notification
   */
  static async scheduleLungcatHealthNotification(
    isHealthy: boolean,
    language: Language = 'id',
    delayHours: number = 0
  ): Promise<string | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        debugLog.log('No notification permissions for lungcat health notification');
        return null;
      }

      const type = isHealthy ? 'health_good' : 'health_bad';
      const content = this.getLungcatNotificationContent(type, language);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          sound: 'default',
          data: {
            type: 'lungcat_health',
            isHealthy,
          },
        },
        trigger: delayHours > 0 ? {
          seconds: delayHours * 3600,
        } as Notifications.TimeIntervalTriggerInput : null,
      });

      debugLog.log(`Scheduled lungcat health notification (${type}):`, identifier);
      return identifier;
    } catch (error) {
      debugLog.error('Error scheduling lungcat health notification:', error);
      return null;
    }
  }

  /**
   * Schedule lungcat energy low notification
   */
  static async scheduleLungcatEnergyNotification(
    language: Language = 'id',
    delayHours: number = 0
  ): Promise<string | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        debugLog.log('No notification permissions for lungcat energy notification');
        return null;
      }

      const content = this.getLungcatNotificationContent('energy_low', language);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          sound: 'default',
          data: {
            type: 'lungcat_energy',
          },
        },
        trigger: delayHours > 0 ? {
          seconds: delayHours * 3600,
        } as Notifications.TimeIntervalTriggerInput : null,
      });

      debugLog.log('Scheduled lungcat energy notification:', identifier);
      return identifier;
    } catch (error) {
      debugLog.error('Error scheduling lungcat energy notification:', error);
      return null;
    }
  }

  /**
   * Cancel all lungcat-related notifications
   */
  static async cancelLungcatNotifications(): Promise<void> {
    try {
      const scheduled = await this.getScheduledNotifications();
      const lungcatNotifications = scheduled.filter(
        n => n.content.data?.type?.startsWith('lungcat_')
      );

      for (const notification of lungcatNotifications) {
        await this.cancelNotification(notification.identifier);
      }

      debugLog.log(`Cancelled ${lungcatNotifications.length} lungcat notifications`);
    } catch (error) {
      debugLog.error('Error cancelling lungcat notifications:', error);
    }
  }

  /**
   * Smart lungcat care management - schedules appropriate notifications based on pet stats
   */
  static async manageLungcatCare(
    petStats: {
      happiness: number;
      health: number;
      energy: number;
      lastFed: number;
      lastPlayed: number;
    },
    enabled: boolean,
    language: Language = 'id'
  ): Promise<void> {
    try {
      if (!enabled) {
        debugLog.log('Lungcat notifications disabled, cancelling all');
        await this.cancelLungcatNotifications();
        return;
      }

      // Cancel existing lungcat notifications to avoid duplicates
      await this.cancelLungcatNotifications();

      const now = Date.now();
      const feedingScheduled: string[] = [];
      const playingScheduled: string[] = [];

      // Schedule feeding reminders based on last fed time
      const timeSinceFed = now - petStats.lastFed;
      const hoursSinceFed = timeSinceFed / (1000 * 60 * 60);

      if (hoursSinceFed >= 2) {
        // Already can feed - schedule immediate reminder
        const feedId = await this.scheduleLungcatCareReminder('feeding', 0, language);
        if (feedId) feedingScheduled.push(feedId);
      } else {
        // Schedule reminder when feeding becomes available
        const hoursUntilFeed = 2 - hoursSinceFed;
        const feedId = await this.scheduleLungcatCareReminder('feeding', hoursUntilFeed, language);
        if (feedId) feedingScheduled.push(feedId);
      }

      // Schedule playing reminders based on last played time
      const timeSincePlayed = now - petStats.lastPlayed;
      const hoursSincePlayed = timeSincePlayed / (1000 * 60 * 60);

      if (hoursSincePlayed >= 1) {
        // Already can play - schedule immediate reminder
        const playId = await this.scheduleLungcatCareReminder('playing', 0, language);
        if (playId) playingScheduled.push(playId);
      } else {
        // Schedule reminder when playing becomes available
        const hoursUntilPlay = 1 - hoursSincePlayed;
        const playId = await this.scheduleLungcatCareReminder('playing', hoursUntilPlay, language);
        if (playId) playingScheduled.push(playId);
      }

      // Schedule health notifications based on current stats
      if (petStats.health < 40) {
        await this.scheduleLungcatHealthNotification(false, language, 0);
      } else if (petStats.health >= 80) {
        await this.scheduleLungcatHealthNotification(true, language, 0);
      }

      // Schedule energy notification if energy is low
      if (petStats.energy < 30) {
        await this.scheduleLungcatEnergyNotification(language, 0);
      }

      debugLog.log(`Scheduled ${feedingScheduled.length} feeding and ${playingScheduled.length} playing reminders`);
    } catch (error) {
      debugLog.error('Error managing lungcat care notifications:', error);
    }
  }

  /**
   * Test lungcat notifications (for development)
   */
  static async testLungcatNotifications(language: Language = 'id'): Promise<void> {
    try {
      debugLog.log('=== Testing Lungcat Notifications ===');

      if (!await this.hasPermissions()) {
        debugLog.log('No permissions for lungcat notification test');
        return;
      }

      // Test each type of notification
      const types: Array<'feeding' | 'playing' | 'health_good' | 'health_bad' | 'energy_low'> = [
        'feeding', 'playing', 'health_good', 'health_bad', 'energy_low'
      ];

      for (let i = 0; i < types.length; i++) {
        const type = types[i];
        const content = this.getLungcatNotificationContent(type, language);

        debugLog.log(`Testing ${type}:`, content.title);

        // Schedule test notification with delay
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `[TEST] ${content.title}`,
            body: content.body,
            sound: 'default',
            data: { type: 'lungcat_test' },
          },
          trigger: {
            seconds: (i + 1) * 3, // 3, 6, 9, 12, 15 seconds
          } as Notifications.TimeIntervalTriggerInput,
        });
      }

      debugLog.log('Scheduled 5 test lungcat notifications');
      debugLog.log('=== Lungcat Test Complete ===');
    } catch (error) {
      debugLog.error('Error testing lungcat notifications:', error);
    }
  }
}