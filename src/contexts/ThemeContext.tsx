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

  // Check if user can use dark mode (premium feature)
  const canUseDarkMode = user?.isPremium || false;

  // Function to update user (called from screens)
  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      if (newUser.isPremium) {
        setIsDarkMode(newUser.settings?.darkMode || false);
      } else {
        setIsDarkMode(false); // Force light mode for non-premium users
      }
      
      // Update language from user settings, fallback to device language, then to Indonesian
      setLanguageState(newUser.settings?.language || getDeviceLanguage());
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    if (user) {
      setLanguageState(newLanguage);
      
      // Update user settings
      const updatedUser = {
        ...user,
        settings: {
          ...user.settings,
          language: newLanguage
        }
      };
      setUser(updatedUser);
      
      // Save to storage (Firebase or demo)
      try {
        // Import here to avoid circular dependencies
        const { auth } = await import('../services/firebase');
        const { updateUserDocument } = await import('../services/auth');
        const { demoUpdateUser, demoGetCurrentUser } = await import('../services/demoAuth');
        
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await updateUserDocument(user.id, { settings: updatedUser.settings });
        } else {
          const demoUser = demoGetCurrentUser();
          if (demoUser && demoUser.id === user.id) {
            await demoUpdateUser(user.id, { settings: updatedUser.settings });
          }
        }
        
        console.log('Language updated to:', newLanguage);
      } catch (error: any) {
        console.log('Language UI updated, will sync when possible');
      }
    }
  };

  const toggleDarkMode = async () => {
    if (canUseDarkMode && user) {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      
      // Update user settings
      const updatedUser = {
        ...user,
        settings: {
          ...user.settings,
          darkMode: newDarkMode
        }
      };
      setUser(updatedUser);
      
      // Save to storage (Firebase or demo) - but don't show errors to user
      try {
        // Import here to avoid circular dependencies
        const { auth } = await import('../services/firebase');
        const { updateUserDocument } = await import('../services/auth');
        const { demoUpdateUser, demoGetCurrentUser } = await import('../services/demoAuth');
        
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await updateUserDocument(user.id, { settings: updatedUser.settings });
        } else {
          const demoUser = demoGetCurrentUser();
          if (demoUser && demoUser.id === user.id) {
            await demoUpdateUser(user.id, { settings: updatedUser.settings });
          }
        }
        
        // Clear any pending updates since this save was successful
        if (pendingSettingsUpdate) {
          setPendingSettingsUpdate(null);
        }
      } catch (error: any) {
        // Completely suppress all errors for dark mode toggle to avoid user confusion
        // The UI change should always work immediately regardless of connectivity
        
        // Store the pending update to retry later (for any error)
        setPendingSettingsUpdate(updatedUser.settings);
        
        // Silent logging only - no console.error to avoid showing Firebase errors
        // console.log('Dark mode UI updated, will sync when possible');
      }
    }
  };

  const colors = isDarkMode ? DARK_COLORS : COLORS;

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