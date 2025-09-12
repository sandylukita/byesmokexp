import { TextStyle } from 'react-native';
import { COLORS, FONTS } from './constants';

// Typography helper function
export const getTextStyle = (variant: keyof typeof FONTS.styles): TextStyle => {
  return {
    ...FONTS.styles[variant],
    fontFamily: FONTS.fontFamily,
  };
};

// Predefined text styles for common use cases
export const TYPOGRAPHY = {
  // Headings
  display: getTextStyle('display'),
  h1: getTextStyle('h1'),
  h2: getTextStyle('h2'),
  h3: getTextStyle('h3'),
  h4: getTextStyle('h4'),
  h5: getTextStyle('h5'),
  
  // Body text
  bodyLarge: getTextStyle('bodyLarge'),
  bodyMedium: getTextStyle('bodyMedium'),
  bodySmall: getTextStyle('bodySmall'),
  
  // Special text
  caption: getTextStyle('caption'),
  button: getTextStyle('button'),
  
  // Colored variants
  displayWhite: {
    ...getTextStyle('display'),
    color: COLORS.white,
  },
  h1White: {
    ...getTextStyle('h1'),
    color: COLORS.white,
  },
  h2White: {
    ...getTextStyle('h2'),
    color: COLORS.white,
  },
  h3White: {
    ...getTextStyle('h3'),
    color: COLORS.white,
  },
  h4White: {
    ...getTextStyle('h4'),
    color: COLORS.white,
  },
  h5White: {
    ...getTextStyle('h5'),
    color: COLORS.white,
  },
  bodyLargeWhite: {
    ...getTextStyle('bodyLarge'),
    color: COLORS.white,
  },
  bodyMediumWhite: {
    ...getTextStyle('bodyMedium'),
    color: COLORS.white,
  },
  bodySmallWhite: {
    ...getTextStyle('bodySmall'),
    color: COLORS.white,
  },
  captionWhite: {
    ...getTextStyle('caption'),
    color: COLORS.white,
  },
  
  // Primary color variants
  h1Primary: {
    ...getTextStyle('h1'),
    color: COLORS.primary,
  },
  h2Primary: {
    ...getTextStyle('h2'),
    color: COLORS.primary,
  },
  bodyLargePrimary: {
    ...getTextStyle('bodyLarge'),
    color: COLORS.primary,
  },
  
  // Secondary text
  bodyMediumSecondary: {
    ...getTextStyle('bodyMedium'),
    color: COLORS.textSecondary,
  },
  bodySmallSecondary: {
    ...getTextStyle('bodySmall'),
    color: COLORS.textSecondary,
  },
  captionSecondary: {
    ...getTextStyle('caption'),
    color: COLORS.textSecondary,
  },
  
  // Success/Error states
  bodyMediumSuccess: {
    ...getTextStyle('bodyMedium'),
    color: COLORS.success,
  },
  bodyMediumError: {
    ...getTextStyle('bodyMedium'),
    color: COLORS.error,
  },

  displayLarge: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: "Inter, 'SF Pro', 'Roboto', sans-serif",
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: "Inter, 'SF Pro', 'Roboto', sans-serif",
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: "Inter, 'SF Pro', 'Roboto', sans-serif",
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: "Inter, 'SF Pro', 'Roboto', sans-serif",
    letterSpacing: 0,
  },
};

// Helper function to create custom text styles
export const createTextStyle = (
  baseStyle: keyof typeof FONTS.styles,
  overrides: Partial<TextStyle> = {}
): TextStyle => {
  return {
    ...getTextStyle(baseStyle),
    ...overrides,
  };
}; 