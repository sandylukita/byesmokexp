@echo off
REM ========================================
REM ByeSmoke Production Environment Setup
REM ========================================
REM This script sets up all environment variables for EAS production builds
REM Run this before your first production build: setup-production-env.bat

echo 🚀 Setting up ByeSmoke Production Environment Variables...
echo.

REM Firebase Configuration (7 variables)
echo 📱 Setting Firebase configuration...
call eas env:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "AIzaSyCzKtmjJoEqlnmTVroW2j3kX11sTMPXSB8" --scope project --type string --visibility plaintext --environment production --non-interactive
call eas env:create --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "byesmokexp.firebaseapp.com" --scope project --type string --visibility plaintext --environment production --non-interactive
call eas env:create --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "byesmokexp" --scope project --type string --visibility plaintext --environment production --non-interactive
call eas env:create --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "byesmokexp.firebasestorage.app" --scope project --type string --visibility plaintext --environment production --non-interactive
call eas env:create --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "161013631866" --scope project --type string --visibility plaintext --environment production --non-interactive
call eas env:create --name EXPO_PUBLIC_FIREBASE_APP_ID --value "1:161013631866:web:2fdfca241dd7f0224c24c3" --scope project --type string --visibility plaintext --environment production --non-interactive
call eas env:create --name EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID --value "G-XYDB63TDSZ" --scope project --type string --visibility plaintext --environment production --non-interactive

echo ✅ Firebase configuration set
echo.


REM Gemini AI Configuration (1 variable)
echo 🤖 Setting Gemini AI configuration...
call eas env:create --name EXPO_PUBLIC_GEMINI_API_KEY --value "AIzaSyDdSZ_WsLk49cbJoCldcxG2oeBTz4RaqXY" --scope project --type string --visibility plaintext --environment production --non-interactive

echo ✅ Gemini AI configuration set
echo.

REM AdMob Configuration (4 variables)
echo 📺 Setting AdMob configuration...
call eas env:create --name EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID --value "ca-app-pub-1627952637319380/9621683307" --scope project --type string --visibility plaintext --environment production --non-interactive
call eas env:create --name EXPO_PUBLIC_ADMOB_REWARDED_ANDROID --value "ca-app-pub-1627952637319380/8842954103" --scope project --type string --visibility plaintext --environment production --non-interactive
call eas env:create --name EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS --value "ca-app-pub-1627952637319380/3804457839" --scope project --type string --visibility plaintext --environment production --non-interactive
call eas env:create --name EXPO_PUBLIC_ADMOB_REWARDED_IOS --value "ca-app-pub-1627952637319380/8324079353" --scope project --type string --visibility plaintext --environment production --non-interactive

echo ✅ AdMob configuration set
echo.

echo 🎉 All environment variables have been set successfully!
echo.
echo Verify with: eas env:list --environment production
echo.
echo Next steps:
echo 1. Run: eas build --platform android --profile production
echo 2. Or: eas build --platform ios --profile production
echo.
pause
