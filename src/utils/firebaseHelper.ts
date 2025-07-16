import { auth } from '../services/firebase';
import { demoGetCurrentUser } from '../services/demoAuth';

/**
 * Utility to check if we should use Firebase or demo mode
 */
export const shouldUseFirebase = (): boolean => {
  return auth.currentUser !== null;
};

/**
 * Utility to check if we should use demo mode
 */
export const shouldUseDemo = (): boolean => {
  return !auth.currentUser && demoGetCurrentUser() !== null;
};

/**
 * Get current user ID regardless of whether using Firebase or demo
 */
export const getCurrentUserId = (): string | null => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    return firebaseUser.uid;
  }
  
  const demoUser = demoGetCurrentUser();
  return demoUser?.id || null;
};

/**
 * Check Firebase connectivity with timeout
 */
export const checkFirebaseConnectivity = async (timeoutMs: number = 5000): Promise<boolean> => {
  try {
    // Simple way to check if Firebase is reachable
    // We'll try to check the current user which should be fast
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), timeoutMs);
      
      try {
        // Try to access Firebase auth
        const user = auth.currentUser;
        clearTimeout(timeout);
        resolve(true);
      } catch (error) {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  } catch (error) {
    console.error('Firebase connectivity check failed:', error);
    return false;
  }
};

/**
 * Execute Firebase operation with automatic fallback to demo
 */
export const executeWithFallback = async <T>(
  firebaseOperation: () => Promise<T>,
  demoFallback: () => Promise<T>,
  operationName: string = 'operation'
): Promise<T> => {
  try {
    // Check if we should use Firebase
    if (shouldUseFirebase()) {
      console.log(`Executing ${operationName} with Firebase...`);
      return await firebaseOperation();
    } else {
      console.log(`Executing ${operationName} with demo mode...`);
      return await demoFallback();
    }
  } catch (firebaseError) {
    console.error(`Firebase ${operationName} failed, trying demo fallback:`, firebaseError);
    
    try {
      console.log(`Falling back to demo for ${operationName}...`);
      return await demoFallback();
    } catch (demoError) {
      console.error(`Both Firebase and demo ${operationName} failed:`, demoError);
      throw new Error(`${operationName} failed on both Firebase and demo: ${firebaseError.message}`);
    }
  }
};

/**
 * Retry Firebase operation with exponential backoff
 */
export const retryFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.log(`Firebase operation failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};