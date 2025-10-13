/**
 * Mission Translation System
 * Provides language-consistent missions for all users
 */

import { Mission } from '../types';
import { Language, getTranslation } from './translations';
import { generateMissionId } from './helpers';

// Mission ID to translation key mapping - 50+ missions with new casual Indonesian content
const MISSION_TRANSLATION_MAP = {
  // Universal mission
  'daily-checkin': { title: 'checkInDaily', description: 'checkInDailyDesc' },
  
  // Ad unlock mission
  'watch-ad-for-missions': { title: 'unlockExtraMissions', description: 'unlockExtraMissionsDesc' },
  
  // BREATHING & MINDFULNESS (12 missions)
  'breathing-relax': { title: 'breathingRelax', description: 'breathingRelaxDesc' },
  'four-seven-eight-breathing': { title: 'fourSevenEightBreathing', description: 'fourSevenEightBreathingDesc' },
  'box-breathing': { title: 'boxBreathing', description: 'boxBreathingDesc' },
  'quiet-meditation': { title: 'quietMeditation', description: 'quietMeditationDesc' },
  'body-scan': { title: 'bodyScan', description: 'bodyScanDesc' },
  'positives-prayer': { title: 'positivesPrayer', description: 'positivesPrayerDesc' },
  'mindful-breathing': { title: 'mindfulBreathing', description: 'mindfulBreathingDesc' },
  'progressive-relaxation': { title: 'progressiveRelaxation', description: 'progressiveRelaxationDesc' },
  'mini-nap': { title: 'miniNap', description: 'miniNapDesc' },
  'stretch-breath': { title: 'stretchBreath', description: 'stretchBreathDesc' },
  'mood-check': { title: 'moodCheck', description: 'moodCheckDesc' },
  
  // MOVEMENT & EXERCISE (12 missions)
  'seven-minute-workout': { title: 'sevenMinuteWorkout', description: 'sevenMinuteWorkoutDesc' },
  'gentle-yoga': { title: 'gentleYoga', description: 'gentleYogaDesc' },
  'tai-chi-slow': { title: 'taiChiSlow', description: 'taiChiSlowDesc' },
  'traditional-dance': { title: 'traditionalDance', description: 'traditionalDanceDesc' },
  'gentle-stretch': { title: 'gentleStretch', description: 'gentleStretchDesc' },
  'mindful-walk': { title: 'mindfulWalk', description: 'mindfulWalkDesc' },
  'bodyweight-power': { title: 'bodWeightPower', description: 'bodWeightPowerDesc' },
  'core-challenge': { title: 'coreChallenge', description: 'coreChallengeDesc' },
  'dance-random': { title: 'danceRandom', description: 'danceRandomDesc' },
  'climb-stairs': { title: 'climbStairs', description: 'climbStairsDesc' },
  'mini-cardio': { title: 'miniCardio', description: 'miniCardioDesc' },
  'ten-thousand-steps': { title: 'tenThousandSteps', description: 'tenThousandStepsDesc' },
  
  // NUTRITION & HYDRATION (8 missions)
  'green-juice': { title: 'greenJuice', description: 'greenJuiceDesc' },
  'jamu-time': { title: 'jamuTime', description: 'jamuTimeDesc' },
  'mindful-eating': { title: 'mindfulEating', description: 'mindfulEatingDesc' },
  'hydrate-check': { title: 'hydrateCheck', description: 'hydrateCheckDesc' },
  'local-healthy-snack': { title: 'localHealthySnack', description: 'localHealthySnackDesc' },
  'no-sugar-hour': { title: 'noSugarHour', description: 'noSugarHourDesc' },
  'add-veggies': { title: 'addVeggies', description: 'addVeggiesDesc' },
  'fruit-break': { title: 'fruitBreak', description: 'fruitBreakDesc' },
  
  // LEARNING & GROWTH (8 missions)
  'read-wisdom': { title: 'readWisdom', description: 'readWisdomDesc' },
  'motivation-video': { title: 'motivationVideo', description: 'motivationVideoDesc' },
  'podcast-time': { title: 'podcastTime', description: 'podcastTimeDesc' },
  'new-skill': { title: 'newSkill', description: 'newSkillDesc' },
  'watch-documentary': { title: 'watchDocumentary', description: 'watchDocumentaryDesc' },
  'short-article': { title: 'shortArticle', description: 'shortArticleDesc' },
  'share-knowledge': { title: 'shareKnowledge', description: 'shareKnowledgeDesc' },
  'self-quiz': { title: 'selfQuiz', description: 'selfQuizDesc' },
  
  // CREATIVE & EXPRESSION (6 missions)
  'morning-journal': { title: 'morningJournal', description: 'morningJournalDesc' },
  'creative-work': { title: 'creativeWork', description: 'creativeWorkDesc' },
  'music-therapy': { title: 'musicTherapy', description: 'musicTherapyDesc' },
  'gratitude-note': { title: 'gratitudeNote', description: 'gratitudeNoteDesc' },
  'photo-of-day': { title: 'photoOfDay', description: 'photoOfDayDesc' },
  'playlist-mood': { title: 'playlistMood', description: 'playlistMoodDesc' },
  
  // SOCIAL & RELATIONSHIP (4 missions)
  'say-thanks': { title: 'sayThanks', description: 'sayThanksDesc' },
  'good-vibes-chat': { title: 'goodVibesChat', description: 'goodVibesChatDesc' },
  'family-time': { title: 'familyTime', description: 'familyTimeDesc' },
  'help-out': { title: 'helpOut', description: 'helpOutDesc' }
} as const;

// Base mission data - 50+ missions with new casual Indonesian content
const BASE_MISSIONS = [
  // Universal check-in mission (always present)
  {
    id: 'daily-checkin',
    xpReward: 10,
    difficulty: 'easy' as const
  },
  
  // Ad unlock mission (special mission type)
  {
    id: 'watch-ad-for-missions',
    xpReward: 0, // No XP reward, the reward is unlocking more missions
    difficulty: 'easy' as const
  },
  
  // BREATHING & MINDFULNESS (11 missions)
  {
    id: 'breathing-relax',
    xpReward: 15,
    difficulty: 'easy' as const
  },
  {
    id: 'four-seven-eight-breathing',
    xpReward: 14,
    difficulty: 'easy' as const
  },
  {
    id: 'box-breathing',
    xpReward: 13,
    difficulty: 'easy' as const
  },
  {
    id: 'quiet-meditation',
    xpReward: 20,
    difficulty: 'medium' as const
  },
  {
    id: 'body-scan',
    xpReward: 18,
    difficulty: 'easy' as const
  },
  {
    id: 'positives-prayer',
    xpReward: 16,
    difficulty: 'easy' as const
  },
  {
    id: 'mindful-breathing',
    xpReward: 12,
    difficulty: 'easy' as const
  },
  {
    id: 'progressive-relaxation',
    xpReward: 19,
    difficulty: 'medium' as const
  },
  {
    id: 'mini-nap',
    xpReward: 15,
    difficulty: 'easy' as const
  },
  {
    id: 'stretch-breath',
    xpReward: 14,
    difficulty: 'easy' as const
  },
  {
    id: 'mood-check',
    xpReward: 12,
    difficulty: 'easy' as const
  },
  
  // MOVEMENT & EXERCISE (12 missions)
  {
    id: 'seven-minute-workout',
    xpReward: 30,
    difficulty: 'hard' as const
  },
  {
    id: 'gentle-yoga',
    xpReward: 22,
    difficulty: 'medium' as const
  },
  {
    id: 'tai-chi-slow',
    xpReward: 20,
    difficulty: 'medium' as const
  },
  {
    id: 'traditional-dance',
    xpReward: 18,
    difficulty: 'easy' as const
  },
  {
    id: 'gentle-stretch',
    xpReward: 16,
    difficulty: 'easy' as const
  },
  {
    id: 'mindful-walk',
    xpReward: 17,
    difficulty: 'easy' as const
  },
  {
    id: 'bodyweight-power',
    xpReward: 26,
    difficulty: 'hard' as const
  },
  {
    id: 'core-challenge',
    xpReward: 21,
    difficulty: 'medium' as const
  },
  {
    id: 'dance-random',
    xpReward: 18,
    difficulty: 'easy' as const
  },
  {
    id: 'climb-stairs',
    xpReward: 15,
    difficulty: 'easy' as const
  },
  {
    id: 'mini-cardio',
    xpReward: 20,
    difficulty: 'medium' as const
  },
  {
    id: 'ten-thousand-steps',
    xpReward: 35,
    difficulty: 'hard' as const
  },
  
  // NUTRITION & HYDRATION (8 missions)
  {
    id: 'green-juice',
    xpReward: 15,
    difficulty: 'easy' as const
  },
  {
    id: 'jamu-time',
    xpReward: 12,
    difficulty: 'easy' as const
  },
  {
    id: 'mindful-eating',
    xpReward: 14,
    difficulty: 'easy' as const
  },
  {
    id: 'hydrate-check',
    xpReward: 11,
    difficulty: 'easy' as const
  },
  {
    id: 'local-healthy-snack',
    xpReward: 13,
    difficulty: 'easy' as const
  },
  {
    id: 'no-sugar-hour',
    xpReward: 12,
    difficulty: 'easy' as const
  },
  {
    id: 'add-veggies',
    xpReward: 14,
    difficulty: 'easy' as const
  },
  {
    id: 'fruit-break',
    xpReward: 13,
    difficulty: 'easy' as const
  },
  
  // LEARNING & GROWTH (8 missions)
  {
    id: 'read-wisdom',
    xpReward: 18,
    difficulty: 'easy' as const
  },
  {
    id: 'motivation-video',
    xpReward: 16,
    difficulty: 'easy' as const
  },
  {
    id: 'podcast-time',
    xpReward: 17,
    difficulty: 'easy' as const
  },
  {
    id: 'new-skill',
    xpReward: 19,
    difficulty: 'medium' as const
  },
  {
    id: 'watch-documentary',
    xpReward: 20,
    difficulty: 'medium' as const
  },
  {
    id: 'short-article',
    xpReward: 15,
    difficulty: 'easy' as const
  },
  {
    id: 'share-knowledge',
    xpReward: 16,
    difficulty: 'easy' as const
  },
  {
    id: 'self-quiz',
    xpReward: 14,
    difficulty: 'easy' as const
  },
  
  // CREATIVE & EXPRESSION (6 missions)
  {
    id: 'morning-journal',
    xpReward: 17,
    difficulty: 'easy' as const
  },
  {
    id: 'creative-work',
    xpReward: 16,
    difficulty: 'easy' as const
  },
  {
    id: 'music-therapy',
    xpReward: 14,
    difficulty: 'easy' as const
  },
  {
    id: 'gratitude-note',
    xpReward: 15,
    difficulty: 'easy' as const
  },
  {
    id: 'photo-of-day',
    xpReward: 14,
    difficulty: 'easy' as const
  },
  {
    id: 'playlist-mood',
    xpReward: 13,
    difficulty: 'easy' as const
  },
  
  // SOCIAL & RELATIONSHIP (4 missions)
  {
    id: 'say-thanks',
    xpReward: 12,
    difficulty: 'easy' as const
  },
  {
    id: 'good-vibes-chat',
    xpReward: 13,
    difficulty: 'easy' as const
  },
  {
    id: 'family-time',
    xpReward: 18,
    difficulty: 'easy' as const
  },
  {
    id: 'help-out',
    xpReward: 20,
    difficulty: 'medium' as const
  }
];

/**
 * Get translated missions based on user's language preference
 */
export const getTranslatedMissions = (
  language: Language = 'id',
  count: number = 3,
  shuffle: boolean = true
): Mission[] => {
  const t = getTranslation(language);
  
  let missionsToUse = [...BASE_MISSIONS];
  
  // Shuffle if requested
  if (shuffle) {
    missionsToUse = missionsToUse.sort(() => 0.5 - Math.random());
  }
  
  // Take requested count
  const selectedMissions = missionsToUse.slice(0, count);
  
  // Map to translated missions
  return selectedMissions.map(mission => {
    const translationKeys = MISSION_TRANSLATION_MAP[mission.id as keyof typeof MISSION_TRANSLATION_MAP];
    
    if (!translationKeys) {
      console.warn(`No translation found for mission: ${mission.id}`);
      return {
        id: mission.id, // Use static mission ID 
        title: mission.id,
        description: 'Mission description',
        xpReward: mission.xpReward,
        difficulty: mission.difficulty,
        isCompleted: false,
        completedAt: null,
        isAIGenerated: false
      };
    }
    
    return {
      id: mission.id, // Use static mission ID instead of random
      title: t.missions[translationKeys.title as keyof typeof t.missions] as string,
      description: t.missions[translationKeys.description as keyof typeof t.missions] as string,
      xpReward: mission.xpReward,
      difficulty: mission.difficulty,
      isCompleted: false,
      completedAt: null,
      isAIGenerated: false
    };
  });
};

/**
 * Get translated missions with seeded randomization for daily consistency
 */
export const getTranslatedMissionsWithSeed = (
  language: Language = 'id',
  count: number = 3,
  seed: string
): Mission[] => {
  const t = getTranslation(language);
  
  // Filter out special missions (daily-checkin and watch-ad-for-missions) from random selection
  const randomMissions = BASE_MISSIONS.filter(m => 
    m.id !== 'daily-checkin' && m.id !== 'watch-ad-for-missions'
  );
  
  // Create seeded random function
  const createSeededRandom = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Linear congruential generator for consistent randomization
    let state = Math.abs(hash);
    return () => {
      state = (state * 1664525 + 1013904223) % Math.pow(2, 32);
      return state / Math.pow(2, 32);
    };
  };
  
  const seededRandom = createSeededRandom(seed);
  let missionsToUse = [...randomMissions];
  
  // Seeded shuffle using Fisher-Yates algorithm
  for (let i = missionsToUse.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [missionsToUse[i], missionsToUse[j]] = [missionsToUse[j], missionsToUse[i]];
  }
  
  // Select the requested number of random missions
  const selectedMissions = missionsToUse.slice(0, count);
  
  // Map to translated missions
  return selectedMissions.map(mission => {
    const translationKeys = MISSION_TRANSLATION_MAP[mission.id as keyof typeof MISSION_TRANSLATION_MAP];
    
    if (!translationKeys) {
      console.warn(`No translation found for mission: ${mission.id}`);
      return {
        id: mission.id, // Use static mission ID 
        title: mission.id,
        description: 'Mission description',
        xpReward: mission.xpReward,
        difficulty: mission.difficulty,
        isCompleted: false,
        completedAt: null,
        isAIGenerated: false
      };
    }
    
    return {
      id: mission.id, // Use static mission ID instead of random
      title: t.missions[translationKeys.title as keyof typeof t.missions] as string,
      description: t.missions[translationKeys.description as keyof typeof t.missions] as string,
      xpReward: mission.xpReward,
      difficulty: mission.difficulty,
      isCompleted: false,
      completedAt: null,
      isAIGenerated: false
    };
  });
};

/**
 * Get a specific translated mission by ID
 */
export const getTranslatedMission = (
  missionId: string,
  language: Language = 'id'
): Mission | null => {
  const t = getTranslation(language);
  
  const baseMission = BASE_MISSIONS.find(m => m.id === missionId);
  if (!baseMission) {
    console.warn(`Mission not found: ${missionId}`);
    return null;
  }
  
  const translationKeys = MISSION_TRANSLATION_MAP[missionId as keyof typeof MISSION_TRANSLATION_MAP];
  if (!translationKeys) {
    console.warn(`No translation found for mission: ${missionId}`);
    return null;
  }
  
  return {
    id: missionId, // Use the mission ID passed in
    title: t.missions[translationKeys.title as keyof typeof t.missions] as string,
    description: t.missions[translationKeys.description as keyof typeof t.missions] as string,
    xpReward: baseMission.xpReward,
    difficulty: baseMission.difficulty,
    isCompleted: false,
    completedAt: null,
    isAIGenerated: false
  };
};

/**
 * Get available mission IDs
 */
export const getAvailableMissionIds = (): string[] => {
  return BASE_MISSIONS.map(m => m.id);
};

/**
 * Validate mission translations (for development/debugging)
 */
export const validateMissionTranslations = (): {
  missingTranslations: string[];
  isValid: boolean;
} => {
  const missingTranslations: string[] = [];
  
  for (const mission of BASE_MISSIONS) {
    const translationKeys = MISSION_TRANSLATION_MAP[mission.id as keyof typeof MISSION_TRANSLATION_MAP];
    if (!translationKeys) {
      missingTranslations.push(mission.id);
    }
  }
  
  return {
    missingTranslations,
    isValid: missingTranslations.length === 0
  };
};

// Export for backward compatibility
export const TRANSLATED_MISSIONS = {
  getAll: getTranslatedMissions,
  getById: getTranslatedMission,
  getIds: getAvailableMissionIds,
  validate: validateMissionTranslations
};

export default {
  getTranslatedMissions,
  getTranslatedMission,
  getAvailableMissionIds,
  validateMissionTranslations
};