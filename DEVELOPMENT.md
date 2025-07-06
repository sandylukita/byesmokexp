# ByeSmoke XP - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project
- Google Cloud account (for Gemini AI)


### Installation
```bash
# Install dependencies
npm install

# Install web dependencies (if testing on web)
npx expo install react-dom react-native-web @expo/metro-runtime

# Start development server
npm start
```

### Configuration Setup

1. **Firebase Configuration**
   ```bash
   # Copy example environment file
   cp .env.example .env
   ```
   
   Update `src/services/firebase.ts` with your Firebase config:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-firebase-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

2. **Gemini AI Configuration**
   Update `src/utils/constants.ts`:
   ```typescript
   export const GEMINI_API_KEY = 'your-gemini-api-key';
   ```


   
   ```typescript
   
     applicationId: 'your-app-id',
     bannerId: 'your-banner-id',
     interstitialId: 'your-interstitial-id',
     rewardedId: 'your-rewarded-id',
   };
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # App screens
│   ├── SplashScreen.tsx
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── ProgressScreen.tsx
│   ├── LeaderboardScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/         # Navigation setup
│   └── AppNavigator.tsx
├── services/           # External services
│   ├── firebase.ts     # Firebase configuration
│   ├── auth.ts         # Authentication service

│   ├── gemini.ts       # Gemini AI integration
│   ├── gamification.ts # Gamification logic
│   └── subscription.ts # Premium features
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
│   ├── constants.ts    # App constants
│   ├── helpers.ts      # Utility functions
│   └── accessibility.ts # Accessibility helpers
├── types/              # TypeScript definitions
│   └── index.ts
└── assets/             # Images, fonts, etc.
```

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create Firestore database

### 2. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public leaderboard data (read-only for all authenticated users)
    match /leaderboard/{document} {
      allow read: if request.auth != null;
      allow write: if false; // Managed by server
    }
  }
}
```

### 3. User Document Structure
```typescript
interface UserDocument {
  id: string;
  email: string;
  displayName: string;
  isPremium: boolean;
  quitDate: string; // ISO string
  cigarettesPerDay: number;
  cigarettePrice: number;
  streak: number;
  totalDays: number;
  xp: number;
  level: number;
  lastCheckIn: string | null;
  badges: Badge[];
  completedMissions: Mission[];
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}
```

## 🤖 Gemini AI Integration

### Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update `GEMINI_API_KEY` in constants
3. Test connection:
   ```typescript
   import { testGeminiConnection } from './src/services/gemini';
   await testGeminiConnection();
   ```

### Features
- **AI Missions**: Personalized daily missions based on user progress
- **AI Motivation**: Custom motivational messages
- **Personal Tips**: Context-aware health tips



### Setup


3. Get ad unit IDs


### Ad Types
- **Banner Ads**: Shown on free user screens
- **Interstitial Ads**: Full-screen ads between actions
- **Rewarded Ads**: Optional ads for bonus XP

## 🎮 Gamification System

### XP System
- **Check-in**: 10-30 XP (based on streak)
- **Mission Complete**: 10-30 XP (based on difficulty)
- **Milestone**: Bonus XP for achievements

### Badge System
- **First Day**: Complete first check-in
- **Week Warrior**: 7-day streak
- **Month Master**: 30-day streak
- **Streak Master**: 100-day streak
- **XP Collector**: 1000 total XP
- **Mission Master**: 50 completed missions

### Level Progression
```typescript
const XP_LEVELS = [
  { level: 1, xpRequired: 0, title: 'Pemula' },
  { level: 2, xpRequired: 100, title: 'Pejuang' },
  { level: 3, xpRequired: 250, title: 'Juara' },
  // ... up to level 10
];
```

## 💎 Premium Features

### Subscription Plans
- **Monthly**: Rp 29,000/month
- **Yearly**: Rp 299,000/year (17% discount)

### Premium Benefits
- 3 daily missions (vs 1 for free)
- AI-generated content
- Dark mode
- Ad-free experience
- Advanced analytics
- Personal coaching

## 🧪 Testing

### Test Accounts
```bash
# Admin account (has premium features)
Email: admin@byerokok.app
Password: password123

# Regular test account
Email: test@example.com
Password: test123
```

### Testing Checklist
- [ ] Authentication flow
- [ ] Onboarding process
- [ ] Daily check-in functionality
- [ ] Mission completion
- [ ] Badge earning
- [ ] Level progression
- [ ] Premium features

- [ ] Offline functionality
- [ ] Accessibility features

## 🚀 Building for Production

### 1. Environment Setup
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login
```

### 2. Build Configuration
Update `app.json`:
```json
{
  "expo": {
    "name": "ByeSmoke XP",
    "slug": "byesmoke-xp",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.byesmoke.xp"
    },
    "android": {
      "package": "com.byesmoke.xp"
    }
  }
}
```

### 3. Build Commands
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both platforms
eas build --platform all
```

### 4. Submission
```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## 🎨 Design Guidelines

### Colors
- **Primary**: #4A90E2 (Calming blue)
- **Secondary**: #27AE60 (Health green)
- **Accent**: #F39C12 (Warm orange)
- **Error**: #E74C3C (Alert red)
- **Success**: #2ECC71 (Achievement green)

### Typography
- **Headings**: Bold, 24-32px
- **Body**: Regular, 16px
- **Captions**: 12-14px
- **Line Height**: 1.4-1.6

### Spacing
- **Screen Padding**: 20px
- **Card Padding**: 16px
- **Element Spacing**: 8px, 16px, 24px
- **Touch Targets**: Minimum 44px

## ♿ Accessibility

### Implementation
- Screen reader support
- High contrast mode
- Large text support
- Voice control
- Reduced motion
- Focus management

### Testing
```bash
# Enable TalkBack (Android) or VoiceOver (iOS)
# Test all interactive elements
# Verify color contrast ratios
# Test with larger text sizes
```

## 🔧 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Check API keys in firebase.ts
   - Verify Firebase project settings
   - Check network connectivity

2. **Gemini AI Timeout**
   - Verify API key
   - Check rate limits
   - Implement fallback content


   - Check ad unit IDs
   
   - Test with test ad IDs first

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check Expo CLI version
   - Verify app.json configuration

### Debug Commands
```bash
# Clear Expo cache
expo r -c

# Reset Metro bundler
npx react-native start --reset-cache

# Check dependencies
npm audit

# View logs
npx react-native log-android
npx react-native log-ios
```

## 📊 Analytics & Monitoring

### Key Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Retention rates (D1, D7, D30)
- Check-in frequency
- Mission completion rates
- Premium conversion rate
- Average session duration

### Implementation
```typescript
// Track user events
import { analytics } from './src/services/firebase';

// Track check-in
analytics().logEvent('daily_checkin', {
  streak: user.streak,
  total_days: user.totalDays,
});

// Track mission completion
analytics().logEvent('mission_complete', {
  mission_type: mission.difficulty,
  xp_earned: mission.xpReward,
});
```

## 🔒 Security Best Practices

1. **Data Protection**
   - Hash sensitive data
   - Use HTTPS for all requests
   - Implement proper authentication
   - Regular security audits

2. **API Security**
   - Rate limiting
   - Input validation
   - Error handling
   - Secure API keys

3. **User Privacy**
   - Minimal data collection
   - Clear privacy policy
   - GDPR compliance
   - User data deletion

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For technical support or questions:
- Email: dev@byesmoke.app
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [docs.byesmoke.app](https://docs.byesmoke.app)