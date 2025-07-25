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

// Notification content templates
const NOTIFICATION_MESSAGES = [
  {
    title: 'ByeSmoke Reminder 🚭',
    body: 'Waktunya check-in harian! Tetap konsisten dalam perjalanan bebas rokok Anda.'
  },
  {
    title: 'Tetap Semangat! 💪',
    body: 'Hari ini adalah hari baru untuk menjadi lebih sehat. Jangan lupa check-in ya!'
  },
  {
    title: 'Hidup Sehat Menanti 🌟',
    body: 'Setiap hari tanpa rokok adalah kemenangan! Mari catat progress hari ini.'
  },
  {
    title: 'Konsistensi adalah Kunci 🔑',
    body: 'Streak Anda sangat berharga. Waktunya melakukan check-in harian!'
  },
  {
    title: 'Perjalanan Hebat Berlanjut 🎯',
    body: 'Kamu sudah sejauh ini, terus maju! Jangan lupa update progress hari ini.'
  },
  {
    title: 'Bebas Rokok, Hidup Lebih Baik ✨',
    body: 'Investasi kesehatan terbaik dimulai hari ini. Yuk check-in sekarang!'
  }
];

// Get random notification message
function getRandomNotificationMessage() {
  const randomIndex = Math.floor(Math.random() * NOTIFICATION_MESSAGES.length);
  return NOTIFICATION_MESSAGES[randomIndex];
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
  static async scheduleDailyReminder(time: string, customTitle?: string, customBody?: string): Promise<string | null> {
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
        : getRandomNotificationMessage();
      
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
    reminderTime: string
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
      const result = await this.scheduleDailyReminder(reminderTime);
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
  static getPermissionMessage(status: PermissionStatus): string {
    switch (status) {
      case 'granted':
        return 'Notifikasi diizinkan';
      case 'denied':
        return 'Notifikasi ditolak - Aktifkan di pengaturan perangkat';
      case 'undetermined':
        return 'Izin notifikasi belum diminta';
      default:
        return 'Status izin tidak diketahui';
    }
  }

  /**
   * Schedule a test notification (immediate)
   */
  static async scheduleTestNotification(): Promise<string | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        console.log('No notification permissions for test');
        return null;
      }

      const message = getRandomNotificationMessage();
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `[TEST] ${message.title}`,
          body: `${message.body} (Test notification dalam 5 detik)`,
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
  static async testPermissions(): Promise<void> {
    try {
      console.log('=== Testing Notification Service ===');
      const status = await this.getPermissionStatus();
      console.log('Current permission status:', status);
      console.log('Permission message:', this.getPermissionMessage(status));
      console.log('Has permissions:', await this.hasPermissions());
      console.log('Can ask for permissions:', await this.canAskForPermissions());
      
      // Schedule test notification if permissions granted
      if (await this.hasPermissions()) {
        console.log('Scheduling test notification...');
        await this.scheduleTestNotification();
      }
      
      // Show debug info
      await this.getDebugInfo();
      
      console.log('=== Test Complete ===');
    } catch (error) {
      console.error('Error testing notification service:', error);
    }
  }
}