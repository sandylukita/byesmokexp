# AdMob Production Setup Guide

## Current Status
- ✅ **Test Ad Unit IDs**: Currently configured and working
- ❌ **Production Ad Unit IDs**: Need to be created and configured

## Why You Need Production Ad Unit IDs
- Test IDs don't generate real revenue
- App Store requires proper ad implementation for monetized apps
- Production IDs provide real analytics and performance data

---

## Step 1: Create AdMob Account & App

### 1.1 AdMob Console Setup
1. Go to [AdMob Console](https://apps.admob.com/)
2. Sign in with your Google account
3. Click **"Get started"** if new to AdMob

### 1.2 Add Your App
1. Click **"Apps"** → **"Add app"**
2. Choose **"Add your app manually"** 
3. Fill in app details:
   - **App name**: ByeSmoke AI - Smart Quit Coach
   - **Platform**: iOS and Android
   - **Store URL**: (add after app store approval)

---

## Step 2: Create Ad Units

### 2.1 Create Interstitial Ad Units
1. In AdMob Console → **"Ad units"** → **"Add ad unit"**
2. Select **"Interstitial"**
3. Configure:
   - **Ad unit name**: "ByeSmoke Interstitial"
   - **Ad format**: Interstitial
   - **Advanced settings**: Default

**Create for both platforms:**
- iOS Interstitial Ad Unit
- Android Interstitial Ad Unit

### 2.2 Create Rewarded Ad Units  
1. Create **"Rewarded"** ad unit
2. Configure:
   - **Ad unit name**: "ByeSmoke Rewarded"
   - **Ad format**: Rewarded
   - **Reward**: "Unlock Mission" - 1 unit

**Create for both platforms:**
- iOS Rewarded Ad Unit  
- Android Rewarded Ad Unit

---

## Step 3: Update Environment Configuration

### 3.1 Get Your Ad Unit IDs
After creating ad units, you'll get IDs like:
- `ca-app-pub-1234567890123456/1234567890` (Interstitial)
- `ca-app-pub-1234567890123456/0987654321` (Rewarded)

### 3.2 Update .env File
Replace the test IDs in your `.env` file:

```bash
# Replace these test IDs with your real AdMob ad unit IDs:
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID=ca-app-pub-YOUR-PUBLISHER-ID/YOUR-INTERSTITIAL-ANDROID
EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS=ca-app-pub-YOUR-PUBLISHER-ID/YOUR-INTERSTITIAL-IOS
EXPO_PUBLIC_ADMOB_REWARDED_ANDROID=ca-app-pub-YOUR-PUBLISHER-ID/YOUR-REWARDED-ANDROID
EXPO_PUBLIC_ADMOB_REWARDED_IOS=ca-app-pub-YOUR-PUBLISHER-ID/YOUR-REWARDED-IOS
```

### 3.3 Update app.json
Update the AdMob app IDs in `app.json`:

```json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-YOUR-PUBLISHER-ID~YOUR-ANDROID-APP-ID",
        "iosAppId": "ca-app-pub-YOUR-PUBLISHER-ID~YOUR-IOS-APP-ID"
      }
    ]
  ]
}
```

---

## Current Implementation Status

### ✅ Already Implemented
- AdMob SDK integration
- Error handling and retry logic  
- Ad cooldown and frequency limits
- Proper ad lifecycle management
- Test ad unit IDs working correctly

### 🔄 Needs Production Setup
- Create real AdMob account and app
- Generate production ad unit IDs
- Update environment configuration
- Test with production ad units
- Submit for app store review

---

**Note**: Keep test ad unit IDs in development environment and only use production IDs for production builds.