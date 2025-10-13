# Pre-Publishing Checklist for App Store & Play Store

**Last Updated:** 2025-10-11
**App Version:** 1.0.0
**Status:** Preparing for First Release

---

## 🚨 CRITICAL - Must Complete Before Building

### 1. Replace Placeholder AdMob IDs
**File:** [app.json:82-84](../app.json#L82-L84)

Current (PLACEHOLDER - MUST FIX):
```json
"androidAppId": "ca-app-pub-9522080569647318~1234567890",
"iosAppId": "ca-app-pub-9522080569647318~0987654321"
```

**Action Required:**
- [ ] Go to [Google AdMob Console](https://apps.admob.com/)
- [ ] Create Android app (if not exists) → Get real App ID
- [ ] Create iOS app (if not exists) → Get real App ID
- [ ] Replace the ~1234567890 and ~0987654321 with real IDs in app.json

### 2. Set Up Production Environment Variables
**File:** [src/config/environment.ts](../src/config/environment.ts)

The app uses environment variables for sensitive data. Create a `.env` file or configure via EAS Secrets:

**Required Environment Variables:**
- [ ] `EXPO_PUBLIC_FIREBASE_API_KEY` - From Firebase Console
- [ ] `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - From Firebase Console
- [ ] `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - From Firebase Console
- [ ] `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - From Firebase Console
- [ ] `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - From Firebase Console
- [ ] `EXPO_PUBLIC_FIREBASE_APP_ID` - From Firebase Console
- [ ] `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` - From Firebase Console (optional)
- [ ] `EXPO_PUBLIC_GEMINI_API_KEY` - From Google AI Studio
- [ ] `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID` - Ad Unit ID from AdMob
- [ ] `EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS` - Ad Unit ID from AdMob
- [ ] `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID` - Ad Unit ID from AdMob
- [ ] `EXPO_PUBLIC_ADMOB_REWARDED_IOS` - Ad Unit ID from AdMob

**Using EAS Secrets (Recommended for Production):**
```bash
eas secret:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your-key-here" --scope project
eas secret:create --name EXPO_PUBLIC_GEMINI_API_KEY --value "your-key-here" --scope project
# ... repeat for all variables
```

### 3. Verify Production Configuration
**File:** [src/config/environment.ts:144-160](../src/config/environment.ts#L144-L160)

- [ ] Verify `apiUrl: 'https://api.byesmoke.ai'` is correct (or update to your actual API)
- [ ] Confirm `enableDemoMode: false` for production (line 150)
- [ ] Confirm `enableLogging: false` for production (line 149)

### 4. Update Version Numbers
**Files:** [app.json](../app.json), [package.json](../package.json)

- [ ] Set appropriate version number (currently 1.0.0)
- [ ] For iOS: Update `buildNumber` in [app.json:24](../app.json#L24)
- [ ] For Android: Version code will auto-increment via EAS, or set manually

---

## 📱 Platform: Google Play Store (Android)

### Phase 1: Google Play Console Setup

- [ ] **Create Google Play Developer Account**
  - Go to: https://play.google.com/console
  - Cost: $25 one-time registration fee
  - Complete identity verification

- [ ] **Create New App in Play Console**
  - App name: "ByeSmoke AI - Smart Quit Coach"
  - Default language: English (or your preference)
  - App type: App
  - Free or Paid: Free

### Phase 2: Store Listing Assets (Android)

**App Icon:**
- [x] 512x512 PNG (exists: [assets/images/icon.png](../assets/images/icon.png))
- [ ] Verify icon looks good on Play Store

**Screenshots (Required):**
- [ ] **Phone screenshots** (minimum 2, recommended 8)
  - Size: 16:9 ratio (1080x1920 recommended)
  - Capture: Dashboard, Progress, Tamagotchi, Community screens
  - Tools: Android device screenshots or emulator

- [ ] **Tablet screenshots** (optional but recommended for tablet support)
  - Size: 10-inch tablet

**Feature Graphic (Required):**
- [ ] Create 1024x500 PNG featuring app name + key visual
  - Suggestion: Use Lungcat mascot + "ByeSmoke AI" text + tagline

**Promotional Assets (Optional but helps visibility):**
- [ ] Promotional video (30s-2min YouTube link)
- [ ] Promo graphic (180x120)

### Phase 3: Store Listing Content

- [ ] **App Description**
  - Short description (80 chars max):
    ```
    AI-powered quit smoking coach with personalized guidance and progress tracking
    ```

  - Full description (4000 chars max):
    ```
    🫁 ByeSmoke AI - Your Personal Quit Smoking Coach

    Take control of your health with ByeSmoke AI, the intelligent quit smoking
    companion that provides personalized guidance, tracks your progress, and
    celebrates your milestones.

    ✨ KEY FEATURES:
    • AI-Powered Coach: Get personalized advice and motivation from our smart AI
    • Progress Tracking: See your health improvements in real-time
    • Lungcat Companion: Nurture your virtual pet as you improve your health
    • Community Support: Connect with others on the same journey
    • Health Insights: Track money saved, cigarettes avoided, and health gains
    • Daily Missions: Stay motivated with engaging daily challenges
    • Offline Support: Access core features even without internet

    🎯 PERFECT FOR:
    • Anyone ready to quit smoking
    • People who need motivation and accountability
    • Those who want to track their quit journey
    • Users seeking a supportive community

    💪 WHY BYESMOKE AI?
    Our app combines proven quit smoking techniques with AI technology to provide
    personalized support exactly when you need it. Watch your Lungcat grow healthier
    as you progress - a fun, visual reminder of your success!

    🔒 PRIVACY & SECURITY:
    Your data is secure and private. We use industry-standard encryption and never
    share your personal information.

    Start your smoke-free journey today! 🚭
    ```

- [ ] **Categorization**
  - Category: Health & Fitness
  - Tags: quit smoking, health, wellness, AI

- [ ] **Contact Details**
  - Email: [Your support email]
  - Website: https://zaynstudio.app
  - Privacy Policy: https://zaynstudio.app/byesmokeai/privacy-policy ✅

- [ ] **Content Rating**
  - Complete questionnaire (expect: Everyone or Teen rating)

### Phase 4: Build Production APK/AAB

- [ ] **Configure Signing**
  - EAS will auto-manage signing (recommended)
  - Or provide your own keystore

- [ ] **Build Production Android App Bundle (AAB)**
  ```bash
  eas build --platform android --profile production
  ```
  - This creates optimized AAB for Play Store
  - Build time: 10-20 minutes typically
  - Downloads automatically when complete

- [ ] **Test the Production Build**
  - Download AAB from EAS dashboard
  - Test on real Android device (APK extraction or Internal Testing track)
  - Verify all features work
  - Test ads, analytics, Firebase connectivity

### Phase 5: Submit to Play Store

**Option A: Using EAS Submit (Easiest)**
```bash
eas submit --platform android --profile production
```
- Requires: Google Play Console service account JSON key
- [Setup Guide](https://docs.expo.dev/submit/android/)

**Option B: Manual Upload**
- [ ] Download AAB from EAS build dashboard
- [ ] Go to Play Console → Your App → Production
- [ ] Create new release
- [ ] Upload AAB file
- [ ] Add release notes

### Phase 6: Pre-Launch & Review

- [ ] **Set up pricing & distribution**
  - Select countries (recommend: Start with your home country, expand later)
  - Confirm "Free" pricing

- [ ] **Set up In-App Products** (if using premium subscriptions)
  - Configure subscription tiers
  - Set pricing

- [ ] **Review rollout options**
  - Consider: Internal Testing → Closed Testing → Open Testing → Production
  - OR: Go directly to Production (longer review time)

- [ ] **Submit for Review**
  - First review typically takes 3-7 days
  - Subsequent updates: 1-3 days

---

## 🍎 Platform: Apple App Store (iOS)

### Phase 1: Apple Developer Program

- [ ] **Enroll in Apple Developer Program**
  - Go to: https://developer.apple.com/programs/
  - Cost: $99/year
  - Requires: Apple ID, payment method, D-U-N-S number (for organizations)
  - Approval time: 1-2 days typically

### Phase 2: App Store Connect Setup

- [ ] **Create App in App Store Connect**
  - Go to: https://appstoreconnect.apple.com
  - Click "+" → New App
  - Platform: iOS
  - App Name: "ByeSmoke AI - Smart Quit Coach"
  - Language: English
  - Bundle ID: `com.zaynstudio.byesmokev00` (must match [app.json:23](../app.json#L23))
  - SKU: byesmoke-v00 (internal identifier)

### Phase 3: Store Listing Assets (iOS)

**App Icon:**
- [ ] 1024x1024 PNG (no transparency, no rounded corners)
  - Source: [assets/images/icon.png](../assets/images/icon.png)
  - Export as 1024x1024 if needed

**Screenshots (Required for ALL device sizes):**
- [ ] **iPhone 6.7" Display** (iPhone 14 Pro Max, 15 Pro Max)
  - Size: 1290x2796
  - Minimum: 3 screenshots, Maximum: 10

- [ ] **iPhone 6.5" Display** (iPhone 11 Pro Max, XS Max)
  - Size: 1242x2688
  - Minimum: 3 screenshots, Maximum: 10

- [ ] **iPhone 5.5" Display** (iPhone 8 Plus, 7 Plus) - Optional
  - Size: 1242x2208

- [ ] **iPad Pro (6th Gen) 12.9"** (if supporting tablets)
  - Size: 2048x2732
  - Minimum: 3 screenshots

**App Preview Videos (Optional but recommended):**
- [ ] 30-second app preview video showing key features
  - Capture on device using QuickTime (Mac required)

### Phase 4: App Information

- [ ] **Description** (4000 chars max):
  ```
  🫁 ByeSmoke AI - Your Personal Quit Smoking Coach

  Take control of your health with ByeSmoke AI, the intelligent quit smoking
  companion that provides personalized guidance, tracks your progress, and
  celebrates your milestones on your journey to becoming smoke-free.

  ✨ KEY FEATURES:

  🤖 AI-Powered Personal Coach
  Get personalized advice, motivation, and coping strategies powered by advanced
  AI technology. Your coach learns your patterns and provides support exactly
  when you need it.

  📊 Comprehensive Progress Tracking
  Watch your health improve in real-time with detailed metrics:
  • Days smoke-free
  • Money saved
  • Cigarettes avoided
  • Health improvements timeline

  🐱 Lungcat Companion
  Nurture your adorable virtual pet as you improve your health. Watch Lungcat
  grow and evolve alongside your progress - a fun, motivating reminder of your
  success!

  👥 Supportive Community
  Connect with others on the same journey. Share achievements, get encouragement,
  and celebrate milestones together.

  🎯 Daily Missions & Challenges
  Stay engaged with personalized daily missions that keep you motivated and on track.

  📴 Offline Support
  Access core features even without internet connection, so support is always
  available when you need it.

  💰 Track Your Savings
  See exactly how much money you're saving by quitting. Watch the numbers grow!

  🔒 PRIVACY & SECURITY:
  Your journey is personal and private. We use industry-standard encryption and
  never share your personal information with third parties.

  🌟 WHY BYESMOKE AI?

  ByeSmoke AI combines evidence-based quit smoking techniques with cutting-edge
  AI technology to provide truly personalized support. Whether you're having a
  craving, celebrating a milestone, or just need encouragement, ByeSmoke AI is
  there for you 24/7.

  Start your smoke-free journey today and join thousands who have successfully
  quit with ByeSmoke AI! 🚭
  ```

- [ ] **Keywords** (100 chars max, comma-separated):
  ```
  quit smoking,stop smoking,health,AI coach,smoking cessation,habit tracker,wellness
  ```

- [ ] **Promotional Text** (170 chars, appears above description):
  ```
  Your AI-powered companion for quitting smoking. Personalized support, progress tracking, and a cute Lungcat mascot to motivate you every step of the way! 🫁
  ```

- [ ] **Support URL**: Your support website
- [ ] **Marketing URL**: https://zaynstudio.app (optional)
- [ ] **Privacy Policy URL**: https://zaynstudio.app/byesmokeai/privacy-policy ✅

### Phase 5: Pricing & Availability

- [ ] **Price**: Free
- [ ] **Availability**: Select countries (start small, expand later)
- [ ] **App Store Distribution**: Select all applicable stores

### Phase 6: Age Rating

- [ ] Complete Age Rating Questionnaire
  - Expected rating: 12+ or 4+ (depending on health content policies)
  - Topics: Medical/treatment information, no violence/drugs

### Phase 7: App Review Information

- [ ] **Contact Information**
  - First Name, Last Name, Phone, Email

- [ ] **Demo Account** (IMPORTANT for reviewers!)
  - Username: [Create demo account]
  - Password: [Create demo password]
  - Notes: "Demo account with pre-populated data for testing"
  - **Action**: Verify demo account works (see [src/config/environment.ts:150](../src/config/environment.ts#L150))

- [ ] **Notes for Reviewer**:
  ```
  ByeSmoke AI is a health and wellness app designed to help users quit smoking.

  Key features for testing:
  1. Login with demo account to see pre-populated progress
  2. Dashboard shows health metrics and progress
  3. Tamagotchi screen features "Lungcat" - a virtual pet that improves as user progresses
  4. AI chat provides personalized quit smoking advice
  5. Ads are integrated but use test ads during review

  All ads comply with AdMob policies and are non-intrusive (interstitial after
  certain actions, rewarded ads optional for bonuses).

  Privacy: We collect minimal data (user progress, anonymous usage analytics)
  and use Firebase for authentication. Full privacy policy available at URL above.
  ```

### Phase 8: Build Production iOS App

**Requirements:**
- [ ] Mac computer (required for iOS builds)
- [ ] Apple Developer account enrolled

**Build Commands:**
```bash
# Build for production
eas build --platform ios --profile production

# This creates an IPA file optimized for App Store
# Build time: 15-25 minutes typically
```

- [ ] **Test the Production Build**
  - Download IPA from EAS dashboard
  - Test using TestFlight (recommended) or ad-hoc distribution
  - Verify all features work
  - Test ads, analytics, Firebase connectivity
  - Test on multiple device sizes if possible

### Phase 9: Submit to App Store

**Option A: Using EAS Submit (Easiest)**
```bash
eas submit --platform ios
```
- Requires: App Store Connect API Key
- [Setup Guide](https://docs.expo.dev/submit/ios/)

**Option B: Manual Upload via Xcode**
- [ ] Download IPA from EAS build dashboard
- [ ] Use Xcode → Transporter to upload IPA
- [ ] Select build in App Store Connect

### Phase 10: Prepare for Review

- [ ] **App Store Review Guidelines Check**
  - ✅ No misleading health claims
  - ✅ Privacy policy present
  - ✅ App functions as described
  - ✅ No crashes or bugs
  - ✅ Ads are non-intrusive
  - ✅ Demo account provided

- [ ] **Submit for Review**
  - First review typically takes 2-5 days
  - Rejections are common - be ready to respond quickly
  - Subsequent updates: 1-3 days

---

## 🔐 Security & Compliance Checklist

### API Keys & Secrets

- [ ] All production API keys stored securely (not in code)
- [ ] Firebase security rules configured for production
- [ ] Gemini API key has rate limits/quotas set
- [ ] AdMob account fully verified
- [ ] Test/demo mode disabled in production builds

### Privacy Compliance

- [ ] Privacy policy accessible and up-to-date ✅
- [ ] GDPR compliance (if targeting EU)
  - [ ] Cookie consent (if using web)
  - [ ] Data export capability
  - [ ] Account deletion capability

- [ ] COPPA compliance (if allowing users under 13)
  - Current age rating: Likely 12+ or higher (should be OK)

- [ ] Data collection disclosure
  - [ ] Analytics data disclosed in privacy policy
  - [ ] Ad tracking disclosed (ATT prompt for iOS) ✅ (see [app.json:29](../app.json#L29))

### Legal

- [ ] Terms of Service created (recommended)
- [ ] Content moderation policy (for community features)
- [ ] DMCA policy (if user-generated content exists)

---

## 🧪 Pre-Launch Testing Checklist

### Functionality Testing

- [ ] **Authentication**
  - [ ] Sign up with email
  - [ ] Sign in with email
  - [ ] Password reset
  - [ ] Demo account access
  - [ ] Sign out

- [ ] **Core Features**
  - [ ] Dashboard loads correctly
  - [ ] Progress tracking updates
  - [ ] Tamagotchi (Lungcat) interactions work
  - [ ] AI chat responds properly
  - [ ] Daily missions load
  - [ ] Community features work
  - [ ] Notifications trigger correctly

- [ ] **Ads**
  - [ ] Interstitial ads load (not too frequently)
  - [ ] Rewarded ads grant rewards correctly
  - [ ] Ads closeable and non-intrusive

- [ ] **Performance**
  - [ ] App launches in < 3 seconds
  - [ ] No crashes or freezes
  - [ ] Smooth animations (60 fps)
  - [ ] Efficient battery usage

- [ ] **Offline Mode**
  - [ ] Core features work without internet
  - [ ] Data syncs when back online

### Device Testing

- [ ] Test on low-end Android device (Android 9+)
- [ ] Test on high-end Android device (Android 14)
- [ ] Test on small screen phone (< 5.5")
- [ ] Test on large screen phone (6.5"+)
- [ ] Test on tablet (optional)
- [ ] Test on iOS device (if targeting iOS)
- [ ] Test on different Android manufacturers (Samsung, Pixel, OnePlus, etc.)

### Edge Cases

- [ ] Poor/no internet connection
- [ ] App in background for extended period
- [ ] User with no progress data
- [ ] User with extensive progress data
- [ ] Rapid clicking/interactions (stress test)
- [ ] Permission denials (notifications, etc.)

---

## 📋 Build Commands Reference

### Development Build (Testing)
```bash
# Android
eas build --platform android --profile development

# iOS
eas build --platform ios --profile development
```

### Preview Build (Internal Distribution)
```bash
# Android APK
eas build --platform android --profile preview

# iOS (TestFlight or ad-hoc)
eas build --platform ios --profile preview
```

### Production Build (Store Submission)
```bash
# Android AAB (Google Play)
eas build --platform android --profile production

# iOS IPA (App Store)
eas build --platform ios --profile production
```

### Submit to Stores
```bash
# Android
eas submit --platform android --profile production

# iOS
eas submit --platform ios
```

### Check Build Status
```bash
eas build:list
```

---

## 📊 Post-Submission Monitoring

### After Submitting to Stores

- [ ] Monitor review status daily
- [ ] Respond to reviewer questions within 24 hours
- [ ] Have support email ready for user questions
- [ ] Monitor crash reports (Firebase Crashlytics)
- [ ] Track analytics for user behavior
- [ ] Monitor app store reviews and respond

### First Week Post-Launch

- [ ] Check for crashes/bugs
- [ ] Monitor server costs (Firebase, Gemini API)
- [ ] Track user acquisition sources
- [ ] Gather user feedback
- [ ] Plan first update based on feedback

---

## 🚀 Quick Launch Checklist (TL;DR)

**Before Building:**
1. ✅ Replace AdMob test IDs in app.json
2. ✅ Set up production environment variables
3. ✅ Verify demo mode disabled
4. ✅ Create store accounts (Google Play + Apple)

**For Android:**
1. Build: `eas build --platform android --profile production`
2. Submit: `eas submit --platform android --profile production`
3. Complete Play Console listing with screenshots
4. Submit for review

**For iOS:**
1. Build: `eas build --platform ios --profile production`
2. Submit: `eas submit --platform ios`
3. Complete App Store Connect listing with screenshots
4. Submit for review

**Monitor:**
- Check review status daily
- Respond to any questions quickly
- Monitor crashes and user feedback

---

## 📞 Useful Links

- **Expo EAS Dashboard**: https://expo.dev/accounts/[your-account]/projects/byesmoke-v00
- **Google Play Console**: https://play.google.com/console
- **App Store Connect**: https://appstoreconnect.apple.com
- **Firebase Console**: https://console.firebase.google.com
- **AdMob Console**: https://apps.admob.com
- **Expo Documentation**: https://docs.expo.dev
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **EAS Submit Docs**: https://docs.expo.dev/submit/introduction/

---

## ✅ Status Tracker

**Overall Progress:** 🔴 Not Started

**Critical Blockers:**
- [ ] AdMob IDs need replacement
- [ ] Production environment variables need setup
- [ ] Store accounts need creation
- [ ] Screenshots need creation

**Estimated Time to Launch:**
- Account setup: 1-2 days
- Asset creation: 2-3 days
- Build & test: 1 day
- Review time: 3-7 days (Play Store), 2-5 days (App Store)
- **Total: ~2 weeks from start to approval**

---

## 🎯 Final Production Readiness Checklist (Added: 2025-10-13)

### Recently Completed
- [x] Daily bonus rewards system implemented
- [x] Timezone fixed (UTC → local time)
- [x] Reward unlock status persisted to AsyncStorage
- [x] Navigation fixed (Community Rankings → BadgeStats screen)
- [x] Dark mode visibility issues resolved
- [x] Legal emails updated to sandy@zaynstudio.app

### Critical Items Before Production Build

**1. AdMob Configuration** 🚨
- [ ] Create 4 ad units in AdMob Console:
  - [ ] Android Interstitial Ad Unit → Update `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID`
  - [ ] Android Rewarded Ad Unit → Update `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID`
  - [ ] iOS Interstitial Ad Unit → Update `EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS`
  - [ ] iOS Rewarded Ad Unit → Update `EXPO_PUBLIC_ADMOB_REWARDED_IOS`
- [ ] Replace placeholder App IDs in app.json (lines 82-84)

**2. Gemini AI Configuration** ⚠️
Currently using **mock responses** at `src/utils/geminiOptimizer.ts:357-360`
- [ ] Decision: Enable real Gemini API OR keep mocks with clear user messaging
- [ ] If enabling real API: Verify `EXPO_PUBLIC_GEMINI_API_KEY` is set
- [ ] If keeping mocks: Update UI to indicate "simulated coaching"
- [ ] Verify monthly cost cap ($5/month) is appropriate

**3. Testing Requirements**
- [ ] Test daily bonus rewards reset at midnight (wait until next day OR test with device time change)
- [ ] Test all 3 bonus rewards work:
  - [ ] XP Boost (+50 XP)
  - [ ] Community Rankings (navigates to BadgeStats → Community tab)
  - [ ] Streak Freeze (adds protection token)
- [ ] Test dark mode on all screens (tiles, text, icons visible)
- [ ] Test with real AdMob ads (not test ads):
  - [ ] Interstitial ads show after Tamagotchi tab navigation
  - [ ] Rewarded ads grant correct rewards
  - [ ] Frequency capping works (not too intrusive)

**4. Demo Account for App Store Review**
- [ ] Verify sandy@zaynstudio.app account has:
  - [ ] Pre-populated progress data
  - [ ] Premium upgrade button works (for testing premium features)
  - [ ] Access to all features for reviewer testing
- [ ] Document demo account credentials for App Store reviewer notes

**5. Environment Variables Checklist**
Verify ALL production environment variables are set via EAS secrets:
```bash
# Required for production
eas secret:list --scope project
```
Should show:
- [ ] EXPO_PUBLIC_FIREBASE_API_KEY
- [ ] EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
- [ ] EXPO_PUBLIC_FIREBASE_PROJECT_ID
- [ ] EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
- [ ] EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- [ ] EXPO_PUBLIC_FIREBASE_APP_ID
- [ ] EXPO_PUBLIC_GEMINI_API_KEY
- [ ] EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID
- [ ] EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS
- [ ] EXPO_PUBLIC_ADMOB_REWARDED_ANDROID
- [ ] EXPO_PUBLIC_ADMOB_REWARDED_IOS

**6. Code Configuration Verification**
- [ ] `src/config/environment.ts:150` - Confirm `enableDemoMode: false`
- [ ] `src/config/environment.ts:149` - Confirm `enableLogging: false`
- [ ] `app.json:82-84` - Real AdMob App IDs (not placeholders)

**7. Known Issues to Monitor**
- Daily reset logic uses local timezone - test across different timezones if targeting global
- Bonus rewards unlock status stored locally (AsyncStorage) - won't sync across devices
- Community Rankings navigation requires BadgeStatisticsScreen to accept `initialTab` param (✅ implemented)

**8. Post-Launch Monitoring Plan**
Week 1 priorities:
- [ ] Monitor Firebase costs (should stay under $5/month with current cap)
- [ ] Monitor AdMob revenue and fill rates
- [ ] Track daily bonus rewards usage (analytics)
- [ ] Monitor crash reports for daily reset logic
- [ ] Check user feedback on dark mode visibility

---

### Quick Pre-Build Command Checklist

**Before running production build:**
```bash
# 1. Verify environment variables
eas secret:list --scope project

# 2. Check git status (commit any changes)
git status

# 3. Build production
eas build --platform android --profile production
# OR
eas build --platform ios --profile production

# 4. After build completes, test thoroughly before submitting
```

---

*Good luck with your launch! 🎉*

*Latest session completed: 2025-10-13 - Daily bonus rewards, navigation fixes, dark mode improvements, legal updates*
