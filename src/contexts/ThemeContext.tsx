import React, { createContext, useContext, useEffect, useState } from 'react';
import { COLORS, DARK_COLORS } from '../utils/constants';
import { User } from '../types';

interface ThemeContextType {
  isDarkMode: boolean;
  colors: typeof COLORS;
  toggleDarkMode: () => void;
  canUseDarkMode: boolean;
  updateUser: (user: User | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check if user can use dark mode (premium feature)
  const canUseDarkMode = user?.isPremium || false;

  // Function to update user (called from screens)
  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser && newUser.isPremium) {
      setIsDarkMode(newUser.settings?.darkMode || false);
    } else {
      setIsDarkMode(false); // Force light mode for non-premium users
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
      } catch (error) {
        console.error('Error saving dark mode setting:', error);
      }
    }
  };

  const colors = isDarkMode ? DARK_COLORS : COLORS;

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      colors,
      toggleDarkMode,
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