import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

// Legal documents content is embedded below

interface LegalScreenProps {
  route: {
    params?: {
      document?: 'privacy' | 'terms';
    };
  };
  navigation: any;
}

const LegalScreen: React.FC<LegalScreenProps> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const [activeDocument, setActiveDocument] = useState<'privacy' | 'terms'>(
    route.params?.document || 'privacy'
  );

  const privacyPolicyContent = `# Privacy Policy for ByeSmoke AI

**Last Updated: January 2025**

## Introduction

ByeSmoke AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application ByeSmoke AI (the "App").

## Information We Collect

### Personal Information
- **Account Information**: Email address, display name, username
- **Health Data**: Quit date, cigarettes per day, cigarette price, smoking habits
- **Progress Data**: Daily check-ins, XP points, achievements, badges, streaks
- **Usage Data**: App interactions, feature usage, session duration

### Automatically Collected Information
- **Device Information**: Device type, operating system, app version
- **Technical Data**: IP address, crash reports, performance data
- **Analytics Data**: Feature usage patterns, user engagement metrics

## How We Use Your Information

We use your information to:
- Provide personalized quit-smoking coaching and recommendations
- Track your progress and calculate achievements
- Send you motivational notifications and reminders
- Improve our AI coaching algorithms
- Analyze app usage to enhance user experience
- Provide customer support
- Comply with legal obligations

## Data Storage and Security

- **Cloud Storage**: Your data is securely stored using Firebase/Google Cloud Platform
- **Encryption**: All data is encrypted in transit and at rest
- **Access Controls**: Strict access controls limit who can view your data
- **Data Retention**: We retain your data as long as your account is active

## Data Sharing

We do not sell, trade, or rent your personal information. We may share information in these limited circumstances:
- **Service Providers**: With trusted third-party services (Firebase, analytics providers) under strict confidentiality agreements
- **Legal Requirements**: When required by law or to protect our rights
- **Business Transfers**: In connection with a merger, acquisition, or sale of assets

## Your Rights

You have the right to:
- **Access**: Request a copy of your personal data
- **Correction**: Update or correct your information
- **Deletion**: Delete your account and associated data
- **Portability**: Export your data in a machine-readable format
- **Withdrawal**: Withdraw consent for data processing

## Contact Us

If you have questions about this Privacy Policy, contact us at:
- Email: sandy@zaynstudio.app

## Consent

By using ByeSmoke AI, you consent to the collection and use of your information as described in this Privacy Policy.`;

  const termsOfServiceContent = `# Terms of Service for ByeSmoke AI

**Last Updated: January 2025**

## 1. Acceptance of Terms

By downloading, installing, or using ByeSmoke AI ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.

## 2. Description of Service

ByeSmoke AI is a mobile application designed to help users quit smoking through:
- Progress tracking and statistics
- Achievement and badge systems
- AI-powered coaching and recommendations
- Community features and referrals
- Motivational content and reminders

## 3. Medical Disclaimer

**IMPORTANT**: ByeSmoke AI is NOT a medical device or treatment. It is a wellness app for informational and motivational purposes only.

- The App does not provide medical advice, diagnosis, or treatment
- Always consult healthcare professionals for medical concerns
- Do not disregard professional medical advice because of information from the App
- In case of medical emergencies, contact emergency services immediately

## 4. User Accounts and Responsibilities

### Account Creation
- You must provide accurate and complete information
- You are responsible for maintaining account security
- You must be at least 13 years old to use the App
- One account per person

### Prohibited Uses
You may not:
- Use the App for illegal purposes
- Share false or misleading health information
- Attempt to hack, reverse engineer, or compromise the App
- Create multiple accounts or impersonate others
- Spam or harass other users
- Upload malicious content or viruses

## 5. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW:
- The App is provided "AS IS" without warranties
- We are not liable for any damages arising from App use
- Our liability is limited to the amount you paid for the App
- We are not responsible for third-party content or services

## 6. Contact Information

For questions about these Terms, contact us at:
- Email: sandy@zaynstudio.app

---

**By using ByeSmoke AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.**`;

  const renderDocumentContent = (content: string) => {
    // Simple markdown-like rendering for headings and basic formatting
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <Text key={index} style={[styles.heading1, { color: colors.textPrimary }]}>
            {line.replace('# ', '')}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        return (
          <Text key={index} style={[styles.heading2, { color: colors.textPrimary }]}>
            {line.replace('## ', '')}
          </Text>
        );
      } else if (line.startsWith('### ')) {
        return (
          <Text key={index} style={[styles.heading3, { color: colors.textPrimary }]}>
            {line.replace('### ', '')}
          </Text>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Text key={index} style={[styles.bold, { color: colors.textPrimary }]}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      } else if (line.startsWith('- ')) {
        return (
          <Text key={index} style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            {line}
          </Text>
        );
      } else if (line.trim() === '') {
        return <View key={index} style={styles.spacing} />;
      } else {
        return (
          <Text key={index} style={[styles.bodyText, { color: colors.textSecondary }]}>
            {line}
          </Text>
        );
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {language === 'en' ? 'Legal Documents' : 'Dokumen Legal'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Document Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeDocument === 'privacy' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveDocument('privacy')}
        >
          <Text style={[
            styles.tabText,
            { color: activeDocument === 'privacy' ? colors.white : colors.textSecondary }
          ]}>
            {language === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeDocument === 'terms' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveDocument('terms')}
        >
          <Text style={[
            styles.tabText,
            { color: activeDocument === 'terms' ? colors.white : colors.textSecondary }
          ]}>
            {language === 'en' ? 'Terms of Service' : 'Syarat Layanan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Document Content */}
      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.documentContent}>
          {renderDocumentContent(
            activeDocument === 'privacy' ? privacyPolicyContent : termsOfServiceContent
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: SIZES.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: SIZES.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SIZES.sm,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.screenPadding,
    marginVertical: SIZES.sm,
    borderRadius: SIZES.buttonRadius,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.buttonRadius - 2,
    alignItems: 'center',
  },
  tabText: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
  },
  documentContent: {
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: SIZES.xl,
  },
  heading1: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    fontWeight: '700',
    marginTop: SIZES.lg,
    marginBottom: SIZES.md,
  },
  heading2: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    fontWeight: '600',
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  heading3: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    fontWeight: '600',
    marginTop: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  bold: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    marginBottom: SIZES.xs,
  },
  bulletPoint: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: 4,
    marginLeft: SIZES.sm,
  },
  bodyText: {
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 20,
    marginBottom: SIZES.xs,
  },
  spacing: {
    height: SIZES.sm,
  },
});

export default LegalScreen;