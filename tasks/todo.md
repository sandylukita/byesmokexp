# Daily Check-in Functionality Analysis

## Task: Find where the daily check-in functionality is implemented

### Plan

1. [x] Explore the codebase structure and identify relevant files
2. [x] Search for check-in related code and functions
3. [x] Analyze the check-in process and heat map functionality
4. [x] Look for any automatic or background processes
5. [x] Document findings about how check-ins work

### Key Findings

#### 1. Where Check-ins are Processed

**Primary Location: `src/screens/DashboardScreen.tsx`**
- `handleCheckIn()` function (lines 460-645) - Main check-in processing
- `canCheckInToday()` helper function validates if user can check in
- Updates user's `lastCheckIn`, `streak`, `totalDays`, `xp`, and `dailyXP`
- Awards badges and completes daily check-in mission
- Uses Firebase for real users, demo storage for development

**Helper Functions in `src/utils/helpers.ts`:**
- `canCheckInToday()` (line 95) - Checks if user can check in today
- `hasCheckedInToday()` (line 104) - Checks if user already checked in
- `calculateStreak()` (line 113) - Calculates streak continuation/reset logic
- `addDailyXP()` (line 492) - Adds XP to daily tracking for heat map

#### 2. Check-in Logic Details

**Check-in Validation:**
- Users can only check in once per day
- Uses `Date.toDateString()` comparison to determine if already checked in
- Streak resets if user skips a day (checks yesterday vs last check-in)

**What Happens During Check-in:**
- Awards 10 XP base reward
- Updates streak (continues or resets to 1)
- Updates `longestStreak` if current streak exceeds it
- Updates `totalDays` based on quit date calculation
- Completes "daily-checkin" mission automatically
- Checks for and awards new badges
- Stores daily XP for heat map visualization

#### 3. Heat Map Implementation

**Location: `src/screens/ProgressScreen.tsx` (lines 429-576)**
- Displays monthly calendar view of user activity
- Uses `dailyXP` data to determine activity intensity
- Color coding based on XP earned per day:
  - 0 XP: Empty/gray
  - 10-19 XP: Light green (check-in only)
  - 20-49 XP: Medium green (check-in + some missions)
  - 50+ XP: Dark green (high activity)
- Supports month navigation to view historical data

#### 4. Mission System Integration

**Daily Missions (`src/utils/constants.ts` lines 434-470):**
- "daily-checkin" is always the first mission available
- Premium users get 3 additional random missions daily
- Free users only get the daily check-in mission
- Mission completion awards additional XP beyond check-in

**Mission Processing (`src/services/gamification.ts`):**
- `completeMission()` function handles mission completion
- Integrates with badge system for progress tracking
- Updates user's `completedMissions` array with timestamps

#### 5. No Automatic Check-in Functionality Found

**Important Discovery:**
- **There is NO automatic check-in system implemented**
- **There are NO background processes or scheduled tasks**
- **There are NO push notifications for reminders**
- All check-ins are **manual user-initiated actions**

**Evidence:**
- No `setInterval`, `setTimeout`, or scheduling libraries found for check-ins
- No background service implementations
- No notification scheduling code
- Settings mention notifications are "coming soon" (not implemented)
- Users must manually open the app and tap the check-in button

#### 6. Data Storage

**Firebase Users:**
- Real-time syncing with Firestore
- `users` collection stores all check-in data
- Includes `lastCheckIn`, `streak`, `totalDays`, `dailyXP` fields

**Demo Users:**
- Local storage using `@react-native-async-storage/async-storage`
- Same data structure as Firebase users
- Used for development and testing

#### 7. Badge System Integration

**Badge Awarding (`src/services/gamification.ts`):**
- Automatic badge checking after each check-in
- Badges for streak milestones (7, 30, 100+ days)
- First check-in awards "Langkah Pertama" badge
- Premium users have access to more badge types

### Summary

The daily check-in functionality is entirely **manual** and **user-driven**. Users must:

1. Open the app
2. Navigate to the dashboard
3. Manually tap the check-in button
4. Can only check in once per day

There are **no automatic check-ins, background processes, or reminder notifications**. The heat map visualization relies entirely on user-initiated check-ins and mission completions to track daily activity levels.

The system is designed around building user engagement through manual interaction rather than automated processes.