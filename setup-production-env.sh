#!/bin/bash

# ========================================
# ByeSmoke Production Environment Setup
# ========================================
# This script sets up all environment variables for EAS production builds
# Run this before your first production build: bash setup-production-env.sh

echo "🚀 Setting up ByeSmoke Production Environment Variables..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Firebase Configuration (7 variables)
echo "${BLUE}📱 Setting Firebase configuration...${NC}"
eas env:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "AIzaSyCzKtmjJoEqlnmTVroW2j3kX11sTMPXSB8" --scope project --type string --visibility plaintext --non-interactive
eas env:create --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "byesmokexp.firebaseapp.com" --scope project --type string --visibility plaintext --non-interactive
eas env:create --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "byesmokexp" --scope project --type string --visibility plaintext --non-interactive
eas env:create --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "byesmokexp.firebasestorage.app" --scope project --type string --visibility plaintext --non-interactive
eas env:create --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "161013631866" --scope project --type string --visibility plaintext --non-interactive
eas env:create --name EXPO_PUBLIC_FIREBASE_APP_ID --value "1:161013631866:web:2fdfca241dd7f0224c24c3" --scope project --type string --visibility plaintext --non-interactive
eas env:create --name EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID --value "G-XYDB63TDSZ" --scope project --type string --visibility plaintext --non-interactive

echo "${GREEN}✅ Firebase configuration set${NC}"
echo ""

# Gemini AI Configuration (1 variable)
echo "${BLUE}🤖 Setting Gemini AI configuration...${NC}"
eas env:create --name EXPO_PUBLIC_GEMINI_API_KEY --value "AIzaSyDdSZ_WsLk49cbJoCldcxG2oeBTz4RaqXY" --scope project --type string --visibility plaintext --non-interactive

echo "${GREEN}✅ Gemini AI configuration set${NC}"
echo ""

# AdMob Configuration (4 variables)
echo "${BLUE}📺 Setting AdMob configuration...${NC}"
eas env:create --name EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID --value "ca-app-pub-1627952637319380/9621683307" --scope project --type string --visibility plaintext --non-interactive
eas env:create --name EXPO_PUBLIC_ADMOB_REWARDED_ANDROID --value "ca-app-pub-1627952637319380/8842954103" --scope project --type string --visibility plaintext --non-interactive
eas env:create --name EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS --value "ca-app-pub-1627952637319380/3804457839" --scope project --type string --visibility plaintext --non-interactive
eas env:create --name EXPO_PUBLIC_ADMOB_REWARDED_IOS --value "ca-app-pub-1627952637319380/8324079353" --scope project --type string --visibility plaintext --non-interactive

echo "${GREEN}✅ AdMob configuration set${NC}"
echo ""

echo "${GREEN}🎉 All environment variables have been set successfully!${NC}"
echo ""
echo "Verify with: eas env:list --scope project"
echo ""
echo "Next steps:"
echo "1. Run: eas build --platform android --profile production"
echo "2. Or: eas build --platform ios --profile production"
echo ""
