import React, { createContext, useContext, useEffect, useState } from 'react';
import { COLORS, DARK_COLORS } from '../utils/constants';
import { User } from '../types';
import { Language, getDeviceLanguage } from '../utils/translations';

interface ThemeContextType {
  isDarkMode: boolean;
  colors: typeof COLORS;
  language: string;
  toggleDarkMode: () => void;
  setLanguage: (language: Language) => void;
  canUseDarkMode: boolean;
  updateUser: (user: User | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguageState] = useState<string>(() => {
    // Use device language detection for initial language
    return getDeviceLanguage();
  });
  const [user, setUser] = useState<User | null>(null);
  const [pendingSettingsUpdate, setPendingSettingsUpdate] = useState<any>(null);

  // Dark mode is now available for all users
  const canUseDarkMode = true;
  
  // Load user data directly if not available (for dark mode check)
  useEffect(() => {
    const loadUserForDarkMode = async () => {
      if (!user) {
        try {
          // Import here to avoid circular dependencies
          const { auth } = await import('../services/firebase');
          const { getUserDocument } = await import('../services/auth');
          const { demoGetCurrentUser } = await import('../services/demoAuth');
          
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            const userData = await getUserDocument(firebaseUser.uid);
            if (userData) {
              console.log('🌙 Loading Firebase user settings:', {
                userId: userData.id,
                settings: userData.settings,
                darkMode: userData.settings?.darkMode
              });
              setUser(userData);
              setIsDarkMode(userData.settings?.darkMode || false);
              setLanguageState(userData.settings?.language || getDeviceLanguage());
              console.log('🌙 ✅ Firebase user theme initialized:', {
                isDarkMode: userData.settings?.darkMode || false
              });
            }
          } else {
            const demoUser = demoGetCurrentUser();
            if (demoUser) {
              console.log('🌙 Loading demo user settings:', {
                userId: demoUser.id,
                settings: demoUser.settings,
                darkMode: demoUser.settings?.darkMode
              });
              setUser(demoUser);
              setIsDarkMode(demoUser.settings?.darkMode || false);
              setLanguageState(demoUser.settings?.language || getDeviceLanguage());
              console.log('🌙 ✅ Demo user theme initialized:', {
                isDarkMode: demoUser.settings?.darkMode || false
              });
            }
          }
        } catch (error) {
          console.log('Could not load user for theme context');
        }
      }
    };
    
    loadUserForDarkMode();
  }, []); // Only run once on mount

  // Function to update user (called from screens)
  const updateUser = (newUser: User | null) => {
    console.log('🌙 UpdateUser called:', {
      hasUser: !!newUser,
      userId: newUser?.id,
      darkMode: newUser?.settings?.darkMode,
      hasPendingUpdate: !!pendingSettingsUpdate
    });
    setUser(newUser);
    if (newUser) {
      const newDarkMode = newUser.settings?.darkMode || false;
      console.log('🌙 Updating theme from external user update:', {
        oldDarkMode: isDarkMode,
        newDarkMode
      });
      setIsDarkMode(newDarkMode);
      
      // Update language from user settings, fallback to device language, then to Indonesian
      setLanguageState(newUser.settings?.language || getDeviceLanguage());
      
      // Retry pending updates if user is now properly authenticated
      if (pendingSettingsUpdate) {
        console.log('🌙 🔄 Retrying pending settings update for newly authenticated user');
        setTimeout(async () => {
          try {
            const { auth } = await import('../services/firebase');
            const { updateUserDocument } = await import('../services/auth');
            
            const firebaseUser = auth.currentUser;
            if (firebaseUser && firebaseUser.uid === newUser.id) {
              await updateUserDocument(firebaseUser.uid, { settings: pendingSettingsUpdate });
              setPendingSettingsUpdate(null);
              console.log('🌙 ✅ Successfully applied pending settings update');
            }
          } catch (error) {
            console.log('🌙 ❌ Failed to retry pending update:', error);
          }
        }, 1000);
      }
    }
  };

  const setLanguage = (newLanguage: Language) => {
    console.log('🎯 ThemeContext.setLanguage called with:', newLanguage, 'User exists:', !!user);
    // Always update language state immediately for UI changes
    setLanguageState(newLanguage);
    console.log('🎯 Language state updated to:', newLanguage);
    
    // If user exists, save settings to storage (but don't update user object to prevent loading states)
    if (user) {
      // Prepare updated user settings for storage only
      const updatedUser = {
        ...user,
        settings: {
          ...user.settings,
          language: newLanguage
        }
      };
      
      // Save to storage (Firebase or demo) - completely non-blocking
      // Fire-and-forget approach to prevent any UI blocking
      setTimeout(async () => {
        try {
          // Import here to avoid circular dependencies
          const { auth } = await import('../services/firebase');
          const { updateUserDocument } = await import('../services/auth');
          const { demoUpdateUser, demoGetCurrentUser } = await import('../services/demoAuth');
          
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            // Ensure the authenticated user matches the user document ID
            if (firebaseUser.uid !== user.id) {
              console.log('🎯 ⚠️ User ID mismatch - skipping Firebase language update', { 
                firebaseUid: firebaseUser.uid, 
                userDocId: user.id 
              });
              return;
            }
            
            await updateUserDocument(firebaseUser.uid, { settings: updatedUser.settings });
          } else {
            const demoUser = demoGetCurrentUser();
            if (demoUser && demoUser.id === user.id) {
              await demoUpdateUser(user.id, { settings: updatedUser.settings });
            }
          }
          
          console.log('Language updated to:', newLanguage);
        } catch (error: any) {
          // Silent fail - don't affect UI
        }
      }, 0);
    }
  };

  const toggleDarkMode = () => {
    console.log('🌙 ===== DARK MODE TOGGLE STARTED =====');
    console.log('🌙 Dark mode toggle started:', {
      userExists: !!user,
      currentDarkMode: isDarkMode,
      canUseDarkMode,
      userSettings: user?.settings
    });
    
    if (user) {
      const newDarkMode = !isDarkMode;
      console.log('🌙 Toggling dark mode:', isDarkMode, '→', newDarkMode);
      
      // Update dark mode state immediately - no user object updates to prevent loading states
      setIsDarkMode(newDarkMode);
      console.log('🌙 Dark mode state updated to:', newDarkMode);
      console.log('🌙 ===== DARK MODE TOGGLE COMPLETED =====');
      
      // Prepare updated user settings for storage only
      const updatedUser = {
        ...user,
        settings: {
          ...user.settings,
          darkMode: newDarkMode
        }
      };
      
      // Save to storage (Firebase or demo) - completely non-blocking
      // Fire-and-forget approach to prevent any UI blocking or loading states
      setTimeout(async () => {
        try {
          // Import here to avoid circular dependencies
          const { auth } = await import('../services/firebase');
          const { updateUserDocument } = await import('../services/auth');
          const { demoUpdateUser, demoGetCurrentUser } = await import('../services/demoAuth');
          
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            // Ensure the authenticated user matches the user document ID
            if (firebaseUser.uid !== user.id) {
              console.log('🌙 ⚠️ User ID mismatch - skipping Firebase update', { 
                firebaseUid: firebaseUser.uid, 
                userDocId: user.id 
              });
              return;
            }
            
            console.log('🌙 Saving to Firebase...', { 
              uid: firebaseUser.uid, 
              settings: updatedUser.settings,
              isAuthenticated: !!firebaseUser.uid
            });
            await updateUserDocument(firebaseUser.uid, { settings: updatedUser.settings });
            console.log('🌙 ✅ Saved to Firebase successfully');
          } else {
            const demoUser = demoGetCurrentUser();
            console.log('🌙 Demo user check:', { demoUserExists: !!demoUser, demoUserId: demoUser?.id, currentUserId: user.id });
            if (demoUser && demoUser.id === user.id) {
              console.log('🌙 Saving to demo storage...', { userId: user.id, settings: updatedUser.settings });
              await demoUpdateUser(user.id, { settings: updatedUser.settings });
              console.log('🌙 ✅ Saved to demo storage successfully');
            }
          }
          
          // Clear any pending updates since this save was successful
          if (pendingSettingsUpdate) {
            setPendingSettingsUpdate(null);
          }
        } catch (error: any) {
          console.log('🌙 ❌ Error saving dark mode preference:', error.message);
          
          // Check for specific Firebase permission errors
          if (error.message?.includes('Missing or insufficient permissions')) {
            console.log('🌙 🔐 Permission error detected - user may not be properly authenticated');
            // Check auth state
            const { auth } = await import('../services/firebase');
            const currentUser = auth.currentUser;
            console.log('🌙 Auth check:', {
              hasFirebaseUser: !!currentUser,
              firebaseUid: currentUser?.uid,
              userDocId: user.id,
              isAuthenticated: !!currentUser?.uid
            });
          }
          
          // Store the pending update to retry later (for any error)
          setPendingSettingsUpdate(updatedUser.settings);
          console.log('🌙 📝 Stored pending update for retry:', updatedUser.settings);
        }
      }, 0);
    } else {
      console.log('🌙 ❌ Cannot toggle dark mode: No user found');
    }
  };

  const colors = isDarkMode ? DARK_COLORS : COLORS;
  
  // Debug: Track color changes
  React.useEffect(() => {
    console.log('🌙 Theme colors updated:', { 
      isDarkMode, 
      primaryColor: colors.primary,
      backgroundColor: colors.background 
    });
  }, [isDarkMode, colors.primary, colors.background]);

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      colors,
      language,
      toggleDarkMode,
      setLanguage,
      canUseDarkMode,
      updateUser,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};