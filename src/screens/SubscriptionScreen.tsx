import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { 
  SUBSCRIPTION_PLANS, 
  PAYMENT_METHODS, 
  processPayment,
  SubscriptionPlan 
} from '../services/subscription';
import { COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

const { width } = Dimensions.get('window');

interface SubscriptionScreenProps {
  onClose: () => void;
  onSubscriptionSuccess?: () => void;
  userId?: string;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ 
  onClose, 
  onSubscriptionSuccess,
  userId = 'demo-user' 
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(SUBSCRIPTION_PLANS[1].id); // Default to yearly
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlanSelect = (planId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(planId);
  };

  const handlePaymentSelect = (paymentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPayment(paymentId);
  };

  const handleSubscribe = async () => {
    if (!selectedPayment) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await processPayment(selectedPlan, selectedPayment, userId);
      
      if (result.success) {
        Alert.alert(
          'Success! 🎉',
          result.message,
          [
            {
              text: 'Continue',
              onPress: () => {
                onSubscriptionSuccess?.();
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFeature = (feature: string, isPremium: boolean = true) => (
    <View key={feature} style={styles.featureItem}>
      <MaterialIcons 
        name={isPremium ? "check-circle" : "cancel"} 
        size={20} 
        color={isPremium ? COLORS.success : COLORS.gray} 
      />
      <Text style={[styles.featureText, !isPremium && styles.featureTextDisabled]}>
        {feature}
      </Text>
    </View>
  );

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan === plan.id;
    
    return (
      <TouchableOpacity
        key={plan.id}
        style={[styles.planCard, isSelected && styles.planCardSelected]}
        onPress={() => handlePlanSelect(plan.id)}
        activeOpacity={0.8}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.planPrice}>{plan.price}</Text>
            <Text style={styles.planDuration}>{plan.duration}</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature) => renderFeature(feature))}
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <MaterialIcons name="check-circle" size={24} color={COLORS.secondary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderPaymentMethod = (method: any) => {
    const isSelected = selectedPayment === method.id;
    
    return (
      <TouchableOpacity
        key={method.id}
        style={[styles.paymentMethod, isSelected && styles.paymentMethodSelected]}
        onPress={() => handlePaymentSelect(method.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.paymentIcon}>{method.icon}</Text>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentName}>{method.name}</Text>
          <Text style={styles.paymentDescription}>{method.description}</Text>
        </View>
        {isSelected && (
          <MaterialIcons name="radio-button-checked" size={24} color={COLORS.secondary} />
        )}
        {!isSelected && (
          <MaterialIcons name="radio-button-unchecked" size={24} color={COLORS.gray} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Upgrade to Premium</Text>
          <Text style={styles.headerSubtitle}>
            Unlock the full power of ByeSmoke AI
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Go Premium?</Text>
          <View style={styles.benefitsContainer}>
            {[
              '🧠 AI-Powered Personal Coach',
              '🚫 Completely Ad-Free Experience',
              '📊 Advanced Progress Analytics',
              '🌙 Exclusive Dark Mode Theme',
              '💡 Personalized Daily Tips',
              '🏆 Premium Badge Collection',
            ].map((benefit) => (
              <View key={benefit} style={styles.benefitItem}>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plans Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <View style={styles.plansContainer}>
            {SUBSCRIPTION_PLANS.map(renderPlanCard)}
          </View>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentContainer}>
            {PAYMENT_METHODS.map(renderPaymentMethod)}
          </View>
        </View>

        {/* Subscribe Button */}
        <View style={styles.subscribeSection}>
          <TouchableOpacity
            style={[styles.subscribeButton, isProcessing && styles.subscribeButtonDisabled]}
            onPress={handleSubscribe}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.secondaryDark]}
              style={styles.subscribeGradient}
            >
              <Text style={styles.subscribeButtonText}>
                {isProcessing ? 'Processing...' : 'Subscribe Now'}
              </Text>
              {!isProcessing && (
                <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.subscribeNote}>
            Cancel anytime. No hidden fees.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1White,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyMediumWhite,
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
  },
  benefitItem: {
    paddingVertical: 8,
  },
  benefitText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight + '20',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: 'center',
  },
  planPrice: {
    ...TYPOGRAPHY.h2,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  planDuration: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    flex: 1,
  },
  featureTextDisabled: {
    color: COLORS.gray,
    textDecorationLine: 'line-through',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  paymentContainer: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  paymentMethodSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight + '20',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  paymentDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subscribeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  subscribeButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  subscribeNote: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SubscriptionScreen;