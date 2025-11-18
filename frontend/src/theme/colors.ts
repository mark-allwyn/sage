/**
 * Color Tokens for S.A.G.E
 * Modern color system with brand identity
 */

// Brand Colors
export const brandColors = {
  tealBlue: '#0B617C',
  tealDark: '#022C33',
  turquoise: '#27E2CC',
  electricLime: '#C4F600',
  atomicOrange: '#F69560',
  cornflowerBlue: '#B09DF9',
  lightGrey: '#F1F5F6',
};

// Extended Color Palette
export const colors = {
  // Primary (Teal Blue)
  primary: {
    main: brandColors.tealBlue,
    light: '#1A7A99',
    dark: brandColors.tealDark,
    contrastText: '#FFFFFF',
  },

  // Secondary (Atomic Orange)
  secondary: {
    main: brandColors.atomicOrange,
    light: '#FF9D77',
    dark: '#E67B49',
    contrastText: '#FFFFFF',
  },

  // Accent Colors (for CTAs and highlights)
  accent: {
    turquoise: brandColors.turquoise,
    lime: brandColors.electricLime,
    purple: brandColors.cornflowerBlue,
    // Gradient combinations
    gradientTeal: `linear-gradient(135deg, ${brandColors.tealBlue} 0%, ${brandColors.turquoise} 100%)`,
    gradientLime: `linear-gradient(135deg, ${brandColors.turquoise} 0%, ${brandColors.electricLime} 100%)`,
    gradientPurple: `linear-gradient(135deg, ${brandColors.tealBlue} 0%, ${brandColors.cornflowerBlue} 100%)`,
  },

  // Semantic Colors
  success: {
    main: '#2E7D32',
    light: '#4CAF50',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  },

  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },

  warning: {
    main: '#ED6C02',
    light: '#FF9800',
    dark: '#E65100',
    contrastText: '#FFFFFF',
  },

  info: {
    main: brandColors.turquoise,
    light: '#4DEBD9',
    dark: '#1DB8A6',
    contrastText: '#022C33',
  },

  // Neutral Colors (refined greys)
  grey: {
    50: '#FAFBFC',
    100: '#F1F5F6',
    200: '#E4EAED',
    300: '#D1D9DD',
    400: '#9AA5AB',
    500: '#6B7780',
    600: '#4A5459',
    700: '#2F3638',
    800: '#1C2021',
    900: '#0F1112',
  },

  // Background Colors (Apple-like: pure, clean)
  background: {
    default: '#FFFFFF',      // Clean white background
    paper: '#FFFFFF',        // Pure white for cards
    elevated: '#FBFBFB',     // Subtle elevation
    subtle: '#F5F5F7',       // Apple-style subtle grey
  },

  // Text Colors (Apple-like: refined contrast)
  text: {
    primary: '#1d1d1f',      // Apple's near-black
    secondary: '#6e6e73',    // Apple's secondary grey
    disabled: '#86868b',     // Lighter grey
    hint: '#86868b',         // Same as disabled
  },

  // Border Colors (Apple-like: extremely subtle)
  border: {
    main: '#d2d2d7',         // Apple's light border
    light: '#e8e8ed',        // Even lighter
    dark: '#c7c7cc',         // Slightly darker
    focus: brandColors.tealBlue,
  },

  // Action Colors (hover, selected, etc.)
  action: {
    hover: 'rgba(11, 97, 124, 0.08)',
    hoverOpacity: 0.08,
    selected: 'rgba(11, 97, 124, 0.12)',
    selectedOpacity: 0.12,
    disabled: '#E4EAED',
    disabledBackground: '#F1F5F6',
    disabledOpacity: 0.38,
    focus: 'rgba(11, 97, 124, 0.16)',
    focusOpacity: 0.16,
    activatedOpacity: 0.16,
  },

  // Semantic Brand Colors for specific use cases
  semantic: {
    cta: {
      primary: brandColors.electricLime,
      secondary: brandColors.atomicOrange,
    },
    features: {
      new: brandColors.turquoise,
      beta: brandColors.cornflowerBlue,
      premium: brandColors.atomicOrange,
    },
    status: {
      running: brandColors.turquoise,
      completed: brandColors.electricLime,
      draft: brandColors.atomicOrange,
    },
  },
};

export default colors;
