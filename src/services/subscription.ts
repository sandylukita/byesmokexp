import { Alert, Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// For production: Install with `expo install expo-in-app-purchases`
// import * as InAppPurchases from 'expo-in-app-purchases';

// Product IDs for store subscriptions (REPLACE WITH YOUR ACTUAL IDs)
const SUBSCRIPTION_SKUS = {
  android: {
    monthly: 'byesmoke_premium_monthly',
    yearly: 'byesmoke_premium_yearly',
  },
  ios: {
    monthly: 'com.zaynstudio.byesmoke.premium.monthly', 
    yearly: 'com.zaynstudio.byesmoke.premium.yearly',
  }
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: 'Coba Gratis',
    price: 'GRATIS',
    duration: '3 hari',
    popular: true,
    features: [
      '🎉 Akses penuh semua fitur premium',
      '🤖 Misi harian dari AI (3 misi)',
      '💡 Motivasi personal dari AI',
      '🌙 Mode gelap eksklusif',
      '🚫 Bebas iklan',
      '📊 Analytics mendalam',
      '⏰ Tanpa komitmen - bisa dibatalkan kapan saja',
    ],
  },
  {
    id: 'monthly',
    name: 'Premium Bulanan',
    price: 'Rp 14.900',
    duration: 'per bulan',
    features: [
      '💸 Lebih murah dari 2 batang rokok!',
      '🤖 Misi harian dari AI (4 misi total)',
      '💡 Motivasi personal dari AI',
      '🌙 Mode gelap eksklusif',
      '🚫 Bebas iklan',
      '📊 Analytics mendalam',
    ],
  },
  {
    id: 'yearly',
    name: 'Premium Tahunan',
    price: 'Rp 149.000',
    duration: 'per tahun',
    features: [
      '🔥 Cuma Rp 12.417/bulan - SUPER HEMAT!',
      '💰 Hemat Rp 29.800 (setara 1 karton rokok)',
      '🤖 Semua fitur premium',
      '📈 Coaching AI mingguan',
      '📊 Laporan progress bulanan',
      '🚀 Akses beta fitur baru',
      '⭐ Support prioritas',
    ],
  },
];

export const PREMIUM_FEATURES = {
  AI_MISSIONS: 'ai_missions',
  AI_MOTIVATION: 'ai_motivation',
  DARK_MODE: 'dark_mode',
  AD_FREE: 'ad_free',
  PERSONAL_TIPS: 'personal_tips',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  WEEKLY_COACHING: 'weekly_coaching',
  MONTHLY_REPORTS: 'monthly_reports',
};

export const checkPremiumFeature = (isPremium: boolean, feature: string, user?: any): boolean => {
  // Check if user is on trial or has premium access
  const hasAccess = isPremium || (user?.isOnTrial && user?.isPremium);
  if (!hasAccess) return false;
  
  // All features are available for premium/trial users
  return Object.values(PREMIUM_FEATURES).includes(feature);
};

export const showUpgradePrompt = (featureName: string): void => {
  Alert.alert(
    'Fitur Premium',
    `${featureName} tersedia untuk pengguna Premium. Upgrade sekarang untuk menikmati pengalaman lengkap ByeSmoke AI!`,
    [
      { text: 'Nanti', style: 'cancel' },
      { text: 'Upgrade', onPress: () => showSubscriptionOptions() },
    ]
  );
};

// Navigation reference for opening subscription screen
let navigationRef: any = null;

export const setSubscriptionNavigation = (navRef: any) => {
  navigationRef = navRef;
};

export const showSubscriptionOptions = (userId?: string): void => {
  if (navigationRef) {
    // Navigate to subscription screen if navigation is available
    navigationRef.navigate('Subscription', { userId });
  } else {
    // Fallback to alert-based system
    const options = SUBSCRIPTION_PLANS.map(plan => 
      `${plan.name} - ${plan.price} ${plan.duration}`
    );
    
    Alert.alert(
      'Pilih Paket Premium',
      'Nikmati fitur lengkap ByeSmoke AI dengan berlangganan premium:',
      [
        { text: 'Batal', style: 'cancel' },
        ...SUBSCRIPTION_PLANS.map(plan => ({
          text: plan.name,
          onPress: () => handleSubscription(plan.id),
        })),
      ]
    );
  }
};

export const handleSubscription = async (planId: string, userId?: string, language: 'en' | 'id' = 'id'): Promise<void> => {
  try {
    if (planId === 'trial') {
      // Handle free trial activation
      if (userId) {
        await startFreeTrial(userId, language);
      } else {
        Alert.alert(
          language === 'en' ? 'Free Trial' : 'Free Trial',
          language === 'en'
            ? 'To start the free trial, you need to login first.'
            : 'Untuk memulai free trial, Anda perlu login terlebih dahulu.',
          [{ text: 'OK' }]
        );
      }
      return;
    }
    
    // Handle paid subscriptions
    // In a real app, this would integrate with payment systems like:
    // - Google Play Billing (Android)
    // - App Store In-App Purchases (iOS)
    // - Stripe or other payment processors
    
    Alert.alert(
      'Pembayaran',
      'Integrasi pembayaran akan segera tersedia. Untuk demo, Anda bisa menggunakan akun admin@byerokok.app yang sudah memiliki akses premium.',
      [{ text: 'OK' }]
    );
    
    // For demo purposes, we'll simulate successful subscription
    // In production, this would be handled by the payment callback
    // await activatePremiumSubscription(userId, planId);
  } catch (error) {
    console.error('Error handling subscription:', error);
    Alert.alert('Error', 'Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.');
  }
};

export const activatePremiumSubscription = async (
  userId: string, 
  planId: string
): Promise<void> => {
  try {
    const subscriptionData = {
      isPremium: true,
      subscriptionPlan: planId,
      subscriptionStartDate: new Date().toISOString(),
      subscriptionEndDate: getSubscriptionEndDate(planId),
      subscriptionStatus: 'active',
    };

    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, subscriptionData);

    Alert.alert(
      'Selamat!',
      'Premium subscription berhasil diaktifkan. Nikmati fitur lengkap ByeSmoke AI!',
      [{ text: 'OK' }]
    );
  } catch (error) {
    console.error('Error activating premium subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (userId: string): Promise<void> => {
  try {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      subscriptionStatus: 'cancelled',
      subscriptionCancelledAt: new Date().toISOString(),
    });

    Alert.alert(
      'Subscription Dibatalkan',
      'Premium subscription Anda telah dibatalkan. Anda masih dapat menggunakan fitur premium hingga akhir periode berlangganan.',
      [{ text: 'OK' }]
    );
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

export const checkSubscriptionStatus = async (user: any): Promise<boolean> => {
  try {
    if (!user.isPremium) return false;
    
    // Check if subscription is still valid
    if (user.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      const now = new Date();
      
      if (now > endDate) {
        // Subscription expired, update user status
        const userDoc = doc(db, 'users', user.id);
        await updateDoc(userDoc, {
          isPremium: false,
          subscriptionStatus: 'expired',
        });
        
        Alert.alert(
          'Subscription Berakhir',
          'Premium subscription Anda telah berakhir. Upgrade kembali untuk menikmati fitur premium.',
          [
            { text: 'Nanti', style: 'cancel' },
            { text: 'Upgrade', onPress: () => showSubscriptionOptions() },
          ]
        );
        
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return user.isPremium || false;
  }
};

const getSubscriptionEndDate = (planId: string): string => {
  const now = new Date();
  
  switch (planId) {
    case 'trial':
      now.setDate(now.getDate() + 3); // 3 days for trial
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'yearly':
      now.setFullYear(now.getFullYear() + 1);
      break;
    default:
      now.setMonth(now.getMonth() + 1); // Default to monthly
  }
  
  return now.toISOString();
};

export const getSubscriptionRemainingDays = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(diffDays, 0);
};

export const formatSubscriptionStatus = (user: any): string => {
  if (user.isOnTrial) {
    const remainingDays = user.trialEndDate ? getSubscriptionRemainingDays(user.trialEndDate) : 0;
    if (remainingDays > 0) {
      return `Trial Premium (${remainingDays} hari tersisa)`;
    } else {
      return 'Trial Berakhir';
    }
  }
  
  if (!user.isPremium) return 'Free';
  
  if (user.subscriptionEndDate) {
    const remainingDays = getSubscriptionRemainingDays(user.subscriptionEndDate);
    
    if (remainingDays > 0) {
      return `Premium (${remainingDays} hari tersisa)`;
    } else {
      return 'Premium (Berakhir)';
    }
  }
  
  return 'Premium';
};

// Trial-specific functions
export const startFreeTrial = async (userId: string, language: 'en' | 'id' = 'id'): Promise<void> => {
  try {
    const now = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(now.getDate() + 3); // 3 days trial

    const trialData = {
      isOnTrial: true,
      isPremium: true, // Give premium access during trial
      trialStartDate: now.toISOString(),
      trialEndDate: trialEndDate.toISOString(),
      hasUsedTrial: true,
      subscriptionPlan: 'trial',
      subscriptionStatus: 'trial_active',
    };

    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, trialData);

    Alert.alert(
      language === 'en' ? '🎉 Trial Started!' : '🎉 Trial Dimulai!',
      language === 'en'
        ? 'Congratulations! Your 3-day Premium free trial is now active. Enjoy all premium features for free!'
        : 'Selamat! Free trial Premium 3 hari Anda sudah aktif. Nikmati semua fitur premium secara gratis!',
      [{ text: language === 'en' ? 'Start Now!' : 'Mulai Sekarang!' }]
    );
  } catch (error) {
    console.error('Error starting free trial:', error);
    Alert.alert(
      'Error',
      language === 'en'
        ? 'Failed to start free trial. Please try again.'
        : 'Gagal memulai free trial. Silakan coba lagi.'
    );
    throw error;
  }
};

export const checkTrialEligibility = (user: any): { eligible: boolean; reason?: string } => {
  if (user.hasUsedTrial) {
    return { eligible: false, reason: 'Anda sudah pernah menggunakan free trial sebelumnya.' };
  }
  
  if (user.isPremium && !user.isOnTrial) {
    return { eligible: false, reason: 'Anda sudah berlangganan Premium.' };
  }
  
  return { eligible: true };
};

export const checkTrialStatus = async (user: any): Promise<boolean> => {
  try {
    if (!user.isOnTrial) return false;
    
    // Check if trial is still valid
    if (user.trialEndDate) {
      const endDate = new Date(user.trialEndDate);
      const now = new Date();
      
      if (now > endDate) {
        // Trial expired, update user status
        const userDoc = doc(db, 'users', user.id);
        await updateDoc(userDoc, {
          isOnTrial: false,
          isPremium: false,
          subscriptionStatus: 'trial_expired',
        });
        
        Alert.alert(
          '⏰ Trial Berakhir',
          'Free trial Premium Anda sudah berakhir. Upgrade sekarang untuk terus menikmati fitur premium!',
          [
            { text: 'Nanti', style: 'cancel' },
            { text: 'Upgrade Sekarang', onPress: () => showSubscriptionOptions(user.id) },
          ]
        );
        
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking trial status:', error);
    return user.isOnTrial || false;
  }
};

export const getTrialRemainingDays = (user: any): number => {
  if (!user.isOnTrial || !user.trialEndDate) return 0;
  return getSubscriptionRemainingDays(user.trialEndDate);
};

// Mock payment methods for demo
export const PAYMENT_METHODS = [
  {
    id: 'google_play',
    name: 'Google Play',
    icon: '🔵',
    description: 'Pembayaran melalui Google Play Store',
  },
  {
    id: 'apple_pay',
    name: 'App Store',
    icon: '🍎',
    description: 'Pembayaran melalui Apple App Store',
  },
  {
    id: 'credit_card',
    name: 'Kartu Kredit',
    icon: '💳',
    description: 'Visa, Mastercard, atau kartu kredit lainnya',
  },
  {
    id: 'bank_transfer',
    name: 'Transfer Bank',
    icon: '🏦',
    description: 'Transfer bank lokal Indonesia',
  },
  {
    id: 'gopay',
    name: 'GoPay',
    icon: '📱',
    description: 'Pembayaran digital GoPay',
  },
  {
    id: 'ovo',
    name: 'OVO',
    icon: '💜',
    description: 'Pembayaran digital OVO',
  },
];

export const processPayment = async (
  planId: string,
  paymentMethodId: string,
  userId: string,
  language: 'en' | 'id' = 'id'
): Promise<{ success: boolean; message: string }> => {
  try {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    // Handle free trial separately (no payment processing needed)
    if (planId === 'trial') {
      await startFreeTrial(userId, language);
      return {
        success: true,
        message: `🎉 ${plan.name} dimulai!\n\nAnda sekarang memiliki akses penuh ke semua fitur premium selama 3 hari gratis!`,
      };
    }

    // Simulate payment processing time for paid plans
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different payment method behaviors
    switch (paymentMethodId) {
      case 'google_play':
      case 'apple_pay':
        // Simulate in-app purchase flow
        console.log(`Processing ${paymentMethodId} payment...`);
        break;
      
      case 'credit_card':
        // Simulate credit card processing
        console.log('Processing credit card payment...');
        // In production: integrate with Stripe, Square, etc.
        break;
      
      case 'bank_transfer':
        // For bank transfer, we might show different success message
        console.log('Processing bank transfer...');
        break;
      
      case 'gopay':
      case 'ovo':
        // Indonesian digital wallet processing
        console.log(`Processing ${paymentMethodId} payment...`);
        // In production: integrate with Midtrans or similar
        break;
      
      default:
        throw new Error('Unsupported payment method');
    }
    
    // For demo purposes, always succeed
    // In production, this would depend on actual payment result
    const paymentSuccess = true;
    
    if (paymentSuccess) {
      // Activate premium subscription
      await activatePremiumSubscription(userId, planId);
      
      return {
        success: true,
        message: `🎉 ${plan.name} subscription activated successfully!\n\nPayment Method: ${PAYMENT_METHODS.find(p => p.id === paymentMethodId)?.name}\nAmount: ${plan.price}`,
      };
    } else {
      return {
        success: false,
        message: 'Payment was declined. Please check your payment method and try again.',
      };
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      message: 'Payment processing failed. Please try again or contact support.',
    };
  }
};

// Real payment integration helpers (for future implementation)
export const initializeRealPayments = async () => {
  // This would initialize actual payment SDKs
  console.log('🔄 Initializing payment systems...');
  
  // Example integrations:
  // 1. Google Play Billing
  // 2. Apple In-App Purchases  
  // 3. Stripe
  // 4. Midtrans (Indonesia)
  // 5. PayPal
};

export const getPlatformPaymentMethods = (): any[] => {
  // Return platform-specific payment methods
  // This would filter based on Platform.OS and region
  return PAYMENT_METHODS.filter(method => {
    // Platform-specific filtering logic
    return true; // For demo, show all methods
  });
};