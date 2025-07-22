import { Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

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
    id: 'monthly',
    name: 'Premium Bulanan',
    price: 'Rp 29.000',
    duration: 'per bulan',
    features: [
      'Misi harian dari AI (3 misi)',
      'Motivasi personal dari AI',
      'Mode gelap eksklusif',
      'Bebas iklan',
      'Tips personal harian',
      'Analytics mendalam',
    ],
  },
  {
    id: 'yearly',
    name: 'Premium Tahunan',
    price: 'Rp 299.000',
    duration: 'per tahun',
    popular: true,
    features: [
      'Semua fitur bulanan',
      'Hemat 2 bulan (17% diskon)',
      'Coaching AI mingguan',
      'Laporan progress bulanan',
      'Akses beta fitur baru',
      'Support prioritas',
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

export const checkPremiumFeature = (isPremium: boolean, feature: string): boolean => {
  if (!isPremium) return false;
  
  // All features are available for premium users
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

export const showSubscriptionOptions = (): void => {
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
};

export const handleSubscription = async (planId: string): Promise<void> => {
  try {
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
  userId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would call actual payment APIs
    // For demo, we'll simulate success
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }
    
    // Activate premium subscription
    await activatePremiumSubscription(userId, planId);
    
    return {
      success: true,
      message: `Pembayaran ${plan.name} berhasil diproses!`,
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      message: 'Pembayaran gagal. Silakan coba lagi.',
    };
  }
};