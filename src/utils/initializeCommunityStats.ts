/**
 * Initialize Community Stats Collection
 * 
 * Creates the global community stats document with demo data
 * This allows the app to read community statistics without permissions errors
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { generateDemoCommunityStats } from '../services/communityStats';

/**
 * Initialize the communityStats collection with demo data
 * This should be called once to set up the global stats document
 */
export const initializeCommunityStats = async (): Promise<void> => {
  try {
    console.log('🔧 Initializing community stats collection...');
    
    // Check if global stats already exist
    const globalStatsRef = doc(db, 'communityStats', 'global');
    const existingStats = await getDoc(globalStatsRef);
    
    if (existingStats.exists()) {
      console.log('✅ Community stats already initialized');
      return;
    }
    
    // Create initial community stats with demo data
    const demoStats = await generateDemoCommunityStats();

    await setDoc(globalStatsRef, demoStats);
    
    console.log('✅ Community stats collection initialized successfully');
    console.log('📊 Demo stats created with', demoStats.totalUsers, 'users');
    
  } catch (error) {
    console.error('❌ Error initializing community stats:', error);
    // Don't throw - this is a non-critical operation
    console.log('⚠️ Community stats will use fallback demo data');
  }
};

/**
 * Check if community stats are accessible
 * Returns true if the collection can be read, false otherwise
 */
export const checkCommunityStatsAccess = async (): Promise<boolean> => {
  try {
    const globalStatsRef = doc(db, 'communityStats', 'global');
    await getDoc(globalStatsRef);
    console.log('✅ Community stats collection is accessible');
    return true;
  } catch (error) {
    console.error('❌ Cannot access community stats collection:', error);
    return false;
  }
};