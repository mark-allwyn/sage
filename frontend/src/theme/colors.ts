/**
 * Color Tokens for S.A.G.E
 * Modern, professional color system with brand identity
 * Inspired by Apple, Stripe, and modern SaaS design
 */

// Brand Colors - Compelling AI/Tech Palette
// Inspired by leading AI companies (Anthropic, OpenAI, Linear, Vercel)
export const brandColors = {
  // Primary - Deep Indigo (intelligence, trust, sophistication)
  indigo: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',  // Main brand color
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Secondary - Electric Cyan (innovation, technology, energy)
  cyan: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',  // Main accent
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },

  // Accent - Vibrant Purple (creativity, AI)
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Success - Emerald Green (growth, success)
  emerald: {
    500: '#10B981',
    600: '#059669',
  },

  // Warning - Amber
  amber: {
    500: '#F59E0B',
    600: '#D97706',
  },

  // Error - Rose
  rose: {
    500: '#F43F5E',
    600: '#E11D48',
  },

  // Neutral - Cool gray tones
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
};

// Extended Color Palette
export const colors = {
  // Primary (Indigo - intelligence, trust, AI/tech)
  primary: {
    main: brandColors.indigo[600],
    light: brandColors.indigo[400],
    dark: brandColors.indigo[800],
    contrastText: '#FFFFFF',
  },

  // Secondary (Cyan - innovation, energy, technology)
  secondary: {
    main: brandColors.cyan[500],
    light: brandColors.cyan[300],
    dark: brandColors.cyan[700],
    contrastText: '#FFFFFF',
  },

  // Accent Colors (for CTAs and highlights)
  accent: {
    indigo: brandColors.indigo[500],
    cyan: brandColors.cyan[500],
    purple: brandColors.purple[500],
    // Strategic gradients for brand identity
    gradientPrimary: `linear-gradient(135deg, ${brandColors.indigo[600]} 0%, ${brandColors.indigo[500]} 100%)`,
    gradientHero: `linear-gradient(135deg, ${brandColors.indigo[700]} 0%, ${brandColors.purple[600]} 100%)`,
    gradientTech: `linear-gradient(135deg, ${brandColors.cyan[500]} 0%, ${brandColors.indigo[500]} 100%)`,
    gradientAI: `linear-gradient(135deg, ${brandColors.purple[600]} 0%, ${brandColors.indigo[600]} 100%)`,
  },

  // Semantic Colors (clear and purposeful)
  success: {
    main: brandColors.emerald[500],
    light: brandColors.emerald[500],
    dark: brandColors.emerald[600],
    contrastText: '#FFFFFF',
  },

  error: {
    main: brandColors.rose[500],
    light: brandColors.rose[500],
    dark: brandColors.rose[600],
    contrastText: '#FFFFFF',
  },

  warning: {
    main: brandColors.amber[500],
    light: brandColors.amber[500],
    dark: brandColors.amber[600],
    contrastText: '#FFFFFF',
  },

  info: {
    main: brandColors.cyan[500],
    light: brandColors.cyan[300],
    dark: brandColors.cyan[700],
    contrastText: '#FFFFFF',
  },

  // Neutral Colors (professional slate tones)
  grey: brandColors.slate,

  // Background Colors (clean and modern)
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
    elevated: brandColors.slate[50],
    subtle: brandColors.slate[100],
  },

  // Text Colors (excellent contrast and readability)
  text: {
    primary: brandColors.slate[900],
    secondary: brandColors.slate[600],
    disabled: brandColors.slate[400],
    hint: brandColors.slate[400],
  },

  // Border Colors (subtle and modern)
  border: {
    main: brandColors.slate[200],
    light: brandColors.slate[100],
    dark: brandColors.slate[300],
    focus: brandColors.indigo[600],
  },

  // Action Colors (hover, selected, etc.)
  action: {
    hover: `rgba(79, 70, 229, 0.08)`,  // Indigo
    hoverOpacity: 0.08,
    selected: `rgba(79, 70, 229, 0.12)`,
    selectedOpacity: 0.12,
    disabled: brandColors.slate[200],
    disabledBackground: brandColors.slate[100],
    disabledOpacity: 0.38,
    focus: `rgba(79, 70, 229, 0.16)`,
    focusOpacity: 0.16,
    activatedOpacity: 0.16,
  },

  // Semantic Brand Colors for specific use cases
  semantic: {
    cta: {
      primary: brandColors.indigo[600],
      secondary: brandColors.cyan[500],
    },
    features: {
      new: brandColors.cyan[500],
      beta: brandColors.purple[500],
      premium: brandColors.indigo[600],
    },
    status: {
      running: brandColors.cyan[500],
      completed: brandColors.emerald[500],
      pending: brandColors.purple[500],
      draft: brandColors.amber[500],
    },
  },
};

export default colors;
