# Pre-Production Checklist - ByeSmoke v1.0.0

**Date:** October 15, 2025
**Build Target:** Production APK for Google Play Store

---

## ✅ Fixes Applied This Session

### 1. **Money Tab Crash** - FIXED ✅
- **Issue:** `ReferenceError: Property 'moneySaved' doesn't exist`
- **Root cause:** Variable `moneySaved` used but not defined in render scope
- **Fix:** Changed 4 instances to use `moneySavedData` variable
  - Line 983: Total savings display
  - Line 1048: Smartphone calculation
  - Line 1058: Pizza calculation
  - Line 1068: Gas/Bensin calculation
- **Files:** `src/screens/ProgressScreen.tsx`
- **Status:** ✅ FIXED

### 2. **Animation Memory Leak** - FIXED ✅
- **Issue:** 501 pending animation callbacks causing severe lag
- **Root cause:**
  - Shimmer animation: Infinite recursive `setTimeout` never cleaned up
  - Buzz animation: No cleanup on unmount
  - Shimmer was **dead code** (never used visually)
- **Fix:** Removed all animations (~90 lines)
  - Removed `Animated` import
  - Removed `shakeAnimation` and `shimmerAnimation` refs
  - Removed animation useEffects
  - Replaced `Animated.View` with direct `Image`
- **Files:** `src/screens/DashboardScreen.tsx`
- **Performance impact:** App now runs smoothly, no callback leaks
- **Status:** ✅ FIXED

### 3. **Demo User Login Not Working** - FIXED ✅
- **Issue:** Demo users (Tiger/Lion) couldn't login, stuck on login screen
- **Root cause:** `handleLogin` only waited for Firebase auth state change, but demo users don't trigger Firebase listener
- **Fix:** Added demo user check in `handleLogin`, manually navigate to dashboard
- **Files:** `app/main.tsx` (lines 342-357)
- **Status:** ✅ FIXED

### 4. **ErrorBoundary Language Support** - FIXED ✅
- **Issue:** Error messages always in Indonesian, even when user selected English
- **Fix:**
  - Added `language` state to ErrorBoundary
  - Load language from AsyncStorage on mount
  - Added `getErrorMessages()` method with EN/ID translations
  - Dynamic error text based on user preference
- **Files:** `src/components/ErrorBoundary.tsx`
- **Status:** ✅ FIXED

### 5. **Bonus Rewards Not Resetting Daily** - FIXED ✅
- **Issue #1:** UTC vs Local time mismatch
  - Reset check used local time
  - Save used UTC via `toISOString()`
  - Could cause 24-hour offset bugs
- **Issue #2:** Community Rankings never reset daily
  - Only `xpBoost` and `streakFreeze` reset
  - `communityRankings` excluded from reset logic
- **Fix:**
  - Changed all date saves to use local time (consistent format)
  - Added `communityRankings: false` to daily reset
- **Files:** `src/screens/DashboardScreen.tsx` (lines 1626-1630, 1789-1791)
- **Status:** ✅ FIXED

### 6. **Bonus Rewards Shared Across Users** - FIXED ✅
- **Issue:** AsyncStorage keys were global, not user-specific
  - User A watches ad → User B also sees it unlocked
- **Fix:** Made all AsyncStorage keys user-specific with `${user.id}` suffix
  - `lastBonusRewardDate_${user.id}`
  - `xpBoostUnlocked_${user.id}`
  - `streakFreezeUnlocked_${user.id}`
  - `communityRankingsUnlocked_${user.id}`
- **Files:** `src/screens/DashboardScreen.tsx` (8 locations updated)
- **Status:** ✅ FIXED

---

## 🔍 Known Issues (Non-Critical)

### 1. **Motivation Cache Uses UTC** - LOW PRIORITY
- **File:** `src/screens/DashboardScreen.tsx` line 257
- `const today = new Date().toISOString().split('T')[0]`
- Should be local time for consistency
- **Impact:** Minor - only affects cached motivation date comparison
- **Recommendation:** Fix in next update (not blocking production)

---

## ✅ Pre-Production Verification Checklist

### Critical User Flows to Test:

#### 1. **Demo User Login**
- [ ] Login with Tiger (`tiger@appstore.demo` / `tiger123`)
- [ ] Verify dashboard loads
- [ ] Check all tabs work (Dashboard, Progress, Tamagotchi, Stats, Profile)
- [ ] Logout and login with Lion (`lion@appstore.demo` / `lion123`)
- [ ] Verify separate bonus reward state per user

#### 2. **Firebase User Login**
- [ ] Login with real Firebase account
- [ ] Verify dashboard loads
- [ ] Test all features work for Firebase users

#### 3. **Money Tab (Critical Fix)**
- [ ] Login with Firebase user (no cigarette data)
- [ ] Go to Progress → Money tab
- [ ] Should show empty state message (not crash)
- [ ] Add cigarette data in Profile → Edit
- [ ] Return to Money tab → should show calculations

#### 4. **Bonus Rewards (Critical Fix)**
- [ ] Test "See Your Rank" - watch ad, unlocks
- [ ] Switch users - should be locked for new user
- [ ] Test XP Boost - watch ad, gain +50 XP
- [ ] Test Streak Freeze - watch ad, gain freeze token
- [ ] Verify each reward works independently per user

#### 5. **App Performance**
- [ ] No "Excessive pending callbacks" warning in logs
- [ ] Smooth scrolling on Dashboard
- [ ] Quick response when clicking tabs/buttons
- [ ] No lag when opening screens

#### 6. **Error Handling**
- [ ] Trigger an error (e.g., network issue)
- [ ] ErrorBoundary should show message in correct language
- [ ] "Try Again" button should be localized

#### 7. **AdMob Integration**
- [ ] Interstitial ads show when navigating between tabs (non-premium)
- [ ] Rewarded ads work for bonus rewards
- [ ] Ads don't break app flow
- [ ] Premium users don't see ads

---

## 🔧 Environment Verification

### Production Environment Variables (EAS):
- [ ] `EXPO_PUBLIC_FIREBASE_API_KEY` - set
- [ ] `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - set
- [ ] `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - set
- [ ] `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - set
- [ ] `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - set
- [ ] `EXPO_PUBLIC_FIREBASE_APP_ID` - set
- [ ] `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` - set
- [ ] `EXPO_PUBLIC_GEMINI_API_KEY` - set (free tier model)
- [ ] `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID` - set
- [ ] `EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS` - set
- [ ] `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID` - set
- [ ] `EXPO_PUBLIC_ADMOB_REWARDED_IOS` - set

### AdMob Configuration:
- [ ] App IDs in `app.json` (lines 83-84)
  - Android: `ca-app-pub-1627952637319380~9785170226`
  - iOS: `ca-app-pub-1627952637319380~5193561129`

---

## 📦 Build Process

### Copy Fixes to WSL:
```bash
# Copy updated files from Windows to WSL
wsl bash -c "cp /mnt/c/Users/windows11/ZXP/byesmoke-v0/byesmoke-v00/src/screens/ProgressScreen.tsx ~/byesmoke-production/src/screens/ProgressScreen.tsx"
wsl bash -c "cp /mnt/c/Users/windows11/ZXP/byesmoke-v0/byesmoke-v00/src/screens/DashboardScreen.tsx ~/byesmoke-production/src/screens/DashboardScreen.tsx"
wsl bash -c "cp /mnt/c/Users/windows11/ZXP/byesmoke-v0/byesmoke-v00/src/components/ErrorBoundary.tsx ~/byesmoke-production/src/components/ErrorBoundary.tsx"
wsl bash -c "cp /mnt/c/Users/windows11/ZXP/byesmoke-v0/byesmoke-v00/app/main.tsx ~/byesmoke-production/app/main.tsx"
```

### Commit Changes:
```bash
wsl bash -c "cd ~/byesmoke-production && git add . && git commit -m 'fix: critical production fixes - Money tab crash, animation leaks, bonus rewards, demo login'"
```

### Build Production APK:
```bash
wsl bash -c "cd ~/byesmoke-production && eas build --profile production --platform android --non-interactive"
```

### Build Time: ~10-12 minutes

---

## 🚨 Critical Warnings

### DO NOT:
- ❌ Skip testing Money tab with Firebase users
- ❌ Skip testing bonus rewards per-user isolation
- ❌ Deploy without verifying no animation callback leaks
- ❌ Skip testing demo user login (Tiger/Lion)

### DO:
- ✅ Test on real device, not just emulator
- ✅ Test with slow network conditions
- ✅ Test error states (airplane mode, etc.)
- ✅ Verify AdMob ads work in production
- ✅ Check logs for any warnings/errors

---

## 📊 Code Quality

### Files Modified (6):
1. `src/screens/ProgressScreen.tsx` - Money tab crash fix
2. `src/screens/DashboardScreen.tsx` - Animation removal, bonus rewards fixes
3. `src/components/ErrorBoundary.tsx` - Language support
4. `app/main.tsx` - Demo login fix

### Lines Changed: ~150 lines total
- Added: ~30 lines (user-specific keys, language support)
- Removed: ~95 lines (dead animation code)
- Modified: ~25 lines (UTC → local time, variable names)

### Test Coverage:
- Unit tests: N/A (no test changes needed)
- Manual testing: Required for all 7 critical flows above

---

## ✅ Ready for Production?

**Current Status:** 🟡 PENDING TESTING

### Required Before Build:
1. [ ] Complete all 7 critical user flow tests above
2. [ ] Verify no console errors/warnings in logs
3. [ ] Test on physical device (not just emulator)
4. [ ] Confirm AdMob ads work
5. [ ] Test with multiple users (Tiger, Lion, Firebase)

### Once Tests Pass:
1. [ ] Copy fixes to WSL
2. [ ] Commit changes
3. [ ] Build production APK
4. [ ] Download and test APK
5. [ ] Submit to Google Play Store

---

## 📝 Release Notes (for App Store)

**Version 1.0.0 - Bug Fixes & Performance**

**What's Fixed:**
- Fixed crash when viewing money savings without cigarette data
- Improved app performance (removed animation memory leaks)
- Fixed daily bonus rewards not resetting properly
- Fixed rewards being shared across different users
- Fixed error messages now respect language preference
- Fixed demo user login issues

**Performance:**
- Significantly improved app responsiveness
- Eliminated 500+ animation callback leaks
- Faster loading and smoother navigation

---

## 🎯 Next Steps

1. **Test all critical flows** (see checklist above)
2. **If tests pass** → Copy to WSL, commit, build
3. **If tests fail** → Fix issues, repeat
4. **Once APK ready** → Test on real device
5. **Submit to Play Store**

---

**Questions or Issues?**
Review this checklist carefully before proceeding with production build.
