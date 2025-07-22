import { useTheme } from '../contexts/ThemeContext';
import { getTranslation, Language, Translations } from '../utils/translations';

export function useTranslation() {
  const { language } = useTheme();
  
  const t = getTranslation(language as Language);
  
  // Helper function for dynamic translations with parameters
  const translate = (key: string, params?: Record<string, string | number>): string => {
    // Navigate nested object keys (e.g., "dashboard.welcome")
    const keys = key.split('.');
    let value: any = t;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return key if translation not found (for debugging)
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Replace parameters in the string
    if (params) {
      return Object.entries(params).reduce((str, [param, val]) => {
        return str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val));
      }, value);
    }
    
    return value;
  };
  
  return {
    t,
    translate,
    language: language as Language,
  };
}

// Helper function for components that need quick access to specific sections
export function useTranslationFor(section: keyof Translations) {
  const { t, language } = useTranslation();
  return {
    t: t[section],
    language,
  };
}