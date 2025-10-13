import { collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';
import { CravingLog } from '../types';
import { demoGetCurrentUser, demoUpdateUser } from './demoAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate simple ID for offline storage
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Log a craving event
export const logCraving = async (intensity: number, method?: 'breathing' | 'distraction' | 'reasons'): Promise<CravingLog> => {
  const cravingLog: CravingLog = {
    id: generateId(),
    userId: '', // Will be set below
    timestamp: new Date(),
    intensity,
    method
  };

  try {
    // Try to get current user (Firebase or demo)
    const demoUser = demoGetCurrentUser();
    if (demoUser) {
      cravingLog.userId = demoUser.id;
      
      // Store in AsyncStorage for demo users
      const existingLogs = await getCravingLogs();
      const updatedLogs = [cravingLog, ...existingLogs];
      
      // Keep only last 100 logs to prevent storage bloat
      const trimmedLogs = updatedLogs.slice(0, 100);
      await AsyncStorage.setItem(`craving_logs_${demoUser.id}`, JSON.stringify(trimmedLogs));
      
      // Update user craving statistics
      const today = new Date().toISOString().split('T')[0];
      const updatedUser = {
        ...demoUser,
        cravingsHandled: (demoUser.cravingsHandled || 0) + 1,
        lastCravingDate: today
      };
      await demoUpdateUser(demoUser.id, {
        cravingsHandled: updatedUser.cravingsHandled,
        lastCravingDate: today
      });
      
      console.log('✓ Craving logged for demo user:', intensity);
      return cravingLog;
    }

    // TODO: Add Firebase user support when needed
    throw new Error('No user found');
    
  } catch (error) {
    console.log('⚠️ Could not log craving to cloud, storing locally:', error.message);
    
    // Fallback to local storage
    cravingLog.userId = 'local';
    const existingLogs = await getCravingLogs();
    const updatedLogs = [cravingLog, ...existingLogs].slice(0, 100);
    await AsyncStorage.setItem('craving_logs_local', JSON.stringify(updatedLogs));
    
    return cravingLog;
  }
};

// Get recent craving logs
export const getCravingLogs = async (limitCount: number = 50): Promise<CravingLog[]> => {
  try {
    const demoUser = demoGetCurrentUser();
    const userId = demoUser ? demoUser.id : 'local';
    
    const stored = await AsyncStorage.getItem(`craving_logs_${userId}`);
    if (stored) {
      const logs: CravingLog[] = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return logs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      })).slice(0, limitCount);
    }
    
    return [];
  } catch (error) {
    console.log('⚠️ Could not fetch craving logs:', error.message);
    return [];
  }
};

// Get craving statistics
export const getCravingStats = async (): Promise<{
  totalCravings: number;
  thisWeek: number;
  averageIntensity: number;
  mostUsedMethod: string | null;
}> => {
  try {
    const logs = await getCravingLogs();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekLogs = logs.filter(log => log.timestamp >= weekAgo);
    const totalIntensity = logs.reduce((sum, log) => sum + log.intensity, 0);
    const averageIntensity = logs.length > 0 ? totalIntensity / logs.length : 0;
    
    // Find most used method
    const methodCounts: { [key: string]: number } = {};
    logs.forEach(log => {
      if (log.method) {
        methodCounts[log.method] = (methodCounts[log.method] || 0) + 1;
      }
    });
    
    const mostUsedMethod = Object.keys(methodCounts).length > 0 
      ? Object.keys(methodCounts).reduce((a, b) => methodCounts[a] > methodCounts[b] ? a : b)
      : null;
    
    return {
      totalCravings: logs.length,
      thisWeek: thisWeekLogs.length,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      mostUsedMethod
    };
  } catch (error) {
    console.log('⚠️ Could not calculate craving stats:', error.message);
    return {
      totalCravings: 0,
      thisWeek: 0,
      averageIntensity: 0,
      mostUsedMethod: null
    };
  }
};