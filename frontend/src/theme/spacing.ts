/**
 * Spacing Configuration for S.A.G.E
 * Consistent spacing system for modern, breathable layouts
 */

// Spacing scale (MUI uses 8px base unit)
// We'll define semantic spacing tokens for consistency
export const spacing = {
  // Base unit: 8px
  unit: 8,

  // Semantic tokens
  tokens: {
    // Micro spacing
    xxs: 4,   // 4px - very tight spacing
    xs: 8,    // 8px  - tight spacing
    sm: 12,   // 12px - small spacing

    // Standard spacing
    md: 16,   // 16px - standard spacing
    lg: 24,   // 24px - comfortable spacing
    xl: 32,   // 32px - generous spacing
    xxl: 48,  // 48px - section spacing

    // Large spacing
    '3xl': 64,  // 64px - large section spacing
    '4xl': 96,  // 96px - page section spacing
    '5xl': 128, // 128px - major section spacing
  },

  // Container padding
  container: {
    mobile: 16,  // 16px on mobile
    tablet: 24,  // 24px on tablet
    desktop: 32, // 32px on desktop
  },

  // Section spacing
  section: {
    sm: 32,  // Small sections
    md: 48,  // Medium sections
    lg: 64,  // Large sections
    xl: 96,  // Extra large sections
  },

  // Component spacing
  component: {
    card: 24,      // Card padding
    paper: 24,     // Paper padding
    paperLarge: 32, // Large paper padding
    gap: 16,       // Gap between items
    gapLarge: 24,  // Large gap between items
  },
};

// Shadows (refined for modern depth perception)
export const shadows = {
  // Subtle shadows for cards
  card: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  cardHover: '0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',

  // Medium shadows for elevated elements
  elevated: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
  elevatedHover: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',

  // Large shadows for modals/dialogs
  modal: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',

  // Focus shadows (for keyboard navigation)
  focus: '0 0 0 4px rgba(11, 97, 124, 0.2)',
  focusError: '0 0 0 4px rgba(211, 47, 47, 0.2)',
  focusSuccess: '0 0 0 4px rgba(46, 125, 50, 0.2)',
};

// Border Radius (consistent rounding)
export const borderRadius = {
  xs: 4,   // Small elements
  sm: 6,   // Buttons, inputs
  md: 8,   // Cards, papers
  lg: 12,  // Large cards
  xl: 16,  // Hero sections
  xxl: 24, // Extra large elements
  full: 9999, // Pills, badges
};

// Transitions (consistent animation timing)
export const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    // Standard easing
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',

    // Modern easings for smoother animations
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    snappy: 'cubic-bezier(0.2, 0.0, 0.1, 1)',
  },
};

export default spacing;
