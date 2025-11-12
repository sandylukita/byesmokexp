# Apple Sign In Configuration Guide

Complete guide for setting up Apple Sign In for ByeSmoke AI app.

## Part 1: Firebase Console Setup ✅ (COMPLETED)

You've already enabled Apple Sign In in Firebase Console:
- ✅ Enabled Apple provider
- ✅ OAuth callback URL: `https://byesmokexp.firebaseapp.com/__/auth/handler`
- ✅ Services ID left blank (not required for iOS native apps)

## Part 2: Apple Developer Console Setup

### Prerequisites
- Active Apple Developer account
- Access to https://developer.apple.com/account

### Step-by-Step Instructions

#### Step 1: Enable Sign In with Apple for Your App ID

1. **Go to Apple Developer Console**
   - Navigate to: https://developer.apple.com/account
   - Click on **Certificates, Identifiers & Profiles**

2. **Find Your App ID**
   - Click **Identifiers** in the left sidebar
   - Search for: `com.zaynstudio.byesmoke`
   - Click on your app identifier

3. **Enable Sign In with Apple Capability**
   - Scroll down to the **Capabilities** section
   - Find **Sign In with Apple**
   - ✅ Check the box to enable it
   - Select **Enable as a primary App ID**
   - Click **Save** at the top right

4. **Confirm the Changes**
   - You'll see a confirmation dialog
   - Click **Confirm** to apply changes

#### Step 2: Verify App ID Configuration

After saving, verify that:
- ✅ Sign In with Apple shows as **Enabled** in your App ID capabilities
- ✅ The configuration is set to **Primary App ID**

#### Step 3: Update Your Provisioning Profiles (If Needed)

If you're using manual code signing:

1. Go to **Profiles** in the left sidebar
2. Find your app's provisioning profile
3. Click **Edit**
4. Re-generate the profile to include the new capability
5. Download and install the updated profile

**Note:** If you're using automatic signing with EAS Build (recommended), this step is handled automatically.

## Part 3: Testing Apple Sign In

### Requirements for Testing
- **Physical iOS device** (iOS 13 or later)
- Cannot test on iOS Simulator (Apple limitation)
- Device must be signed in to iCloud

### Testing Steps

1. **Build the app with EAS:**
   ```bash
   eas build --platform ios --profile development
   ```

2. **Install on your physical iOS device**

3. **Test Apple Sign In:**
   - Open the app
   - Go to Login or Sign Up screen
   - Tap "Sign in with Apple" button
   - Follow the Apple authentication flow
   - Choose to share or hide your email
   - Complete sign-in

### Expected Behavior

**On Login Screen:**
- Black Apple Sign In button appears below Google button (iOS only)
- Button shows "Sign in with Apple"

**On Sign Up Screen:**
- Black Apple Sign Up button appears below Google button (iOS only)
- Button shows "Sign up with Apple"

**During Authentication:**
- Apple's native authentication sheet appears
- User can choose to:
  - Share their real email
  - Hide their email (Apple's privacy feature)
- User can choose to share or hide their name

**After Successful Sign In:**
- User is authenticated via Firebase
- User document is created in Firestore (if new user)
- User is redirected to onboarding or dashboard

## Part 4: Troubleshooting

### Common Issues

#### Issue 1: "Apple Sign-In is not available on this device"
**Solution:** Must use a physical iOS device, not simulator

#### Issue 2: "Sign in was cancelled"
**Solution:** User cancelled the authentication. This is normal behavior.

#### Issue 3: Authentication fails with error
**Checklist:**
- ✅ Apple Sign In enabled in Firebase Console?
- ✅ Sign In with Apple capability enabled in App ID?
- ✅ Device signed in to iCloud?
- ✅ Device running iOS 13 or later?
- ✅ App built with updated app.json (includes expo-apple-authentication plugin)?

#### Issue 4: Email is hidden/anonymous
**Solution:** This is Apple's privacy feature! The email will be in format: `privaterelay.appleid.com`
- This is intentional and meets Apple's Guideline 4.8 requirements
- Firebase can still authenticate the user
- User data is stored with this anonymous email

### Logs to Check

When testing, check Expo logs for:
```
🍎 Starting Apple Sign-In...
✅ Apple Sign-In successful
✅ Firebase authentication successful: [uid]
📝 Creating new user document for Apple sign-in
✅ User document created successfully
```

## Part 5: Production Deployment

### Before Submitting to App Store

1. **Build production iOS app:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Test on TestFlight:**
   - Upload build to TestFlight
   - Test Apple Sign In with real users
   - Verify "Hide My Email" works correctly

3. **Submit to App Store with explanation:**

   Reply to App Review with:

   > "We have added Apple Sign In as an equivalent login option to comply with Guideline 4.8.
   >
   > **Apple Sign In meets all requirements:**
   > 1. It limits data collection to the user's name and email address only
   > 2. It allows users to keep their email address private using Apple's "Hide My Email" feature
   > 3. It does not collect interactions with the app for advertising purposes without consent
   >
   > **How to test:**
   > - Open the app on an iOS device (iOS 13+)
   > - Tap "Sign in with Apple" on the login screen
   > - The native Apple authentication sheet will appear
   > - Users can choose to hide their email address for privacy
   >
   > The Apple Sign In button is prominently displayed on both the login and sign-up screens. Users can choose between Apple Sign In, Google Sign In, or traditional email/password authentication."

## Part 6: Verification Checklist

Before submitting to App Store, verify:

### Code Implementation
- ✅ `expo-apple-authentication` package installed
- ✅ Plugin added to app.json
- ✅ `signInWithApple()` function in auth.ts
- ✅ Apple Sign In button in LoginScreen.tsx
- ✅ Apple Sign Up button in SignUpScreen.tsx
- ✅ Platform.OS check ensures iOS-only display
- ✅ Version bumped to 1.0.9

### Firebase Configuration
- ✅ Apple provider enabled in Firebase Auth
- ✅ OAuth callback URL configured

### Apple Developer Configuration
- ✅ Sign In with Apple capability enabled for App ID
- ✅ App ID: `com.zaynstudio.byesmoke`

### Testing
- ✅ Tested on physical iOS device
- ✅ Apple Sign In flow works end-to-end
- ✅ New user creation works
- ✅ Existing user login works
- ✅ "Hide My Email" feature works
- ✅ User document created in Firestore

### App Store Submission
- ✅ Production build created
- ✅ TestFlight testing completed
- ✅ Response to reviewer prepared
- ✅ Screenshots showing Apple Sign In button (if requested)

## Additional Resources

- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Firebase Apple Auth Setup](https://firebase.google.com/docs/auth/ios/apple)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [App Store Review Guidelines 4.8](https://developer.apple.com/app-store/review/guidelines/#sign-in-with-apple)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Expo logs for error messages
3. Verify all configuration steps completed
4. Test on multiple physical iOS devices
5. Check Firebase Console for authentication logs

---

**Status:** Ready for production deployment
**Version:** 1.0.9
**Last Updated:** November 12, 2025
