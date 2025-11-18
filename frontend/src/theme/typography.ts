/**
 * Typography Configuration for S.A.G.E
 * Modern font system with Inter and Plus Jakarta Sans
 */

import { TypographyOptions } from '@mui/material/styles/createTypography';

// Font Families (Apple-like: SF Pro inspired)
export const fontFamilies = {
  // Primary font for body text and UI elements (SF Pro inspired)
  body: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  // Display font for headings (SF Pro Display inspired)
  heading: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Plus Jakarta Sans", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  // Monospace for code
  mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace',
};

// Typography Configuration
export const typography: TypographyOptions = {
  fontFamily: fontFamilies.body,

  // Headings (Apple-like: refined, lighter weights)
  h1: {
    fontFamily: fontFamilies.heading,
    fontSize: '3rem', // 48px - Apple's large hero size
    fontWeight: 600,  // Lighter than bold
    lineHeight: 1.083,
    letterSpacing: '-0.015em',
  },
  h2: {
    fontFamily: fontFamilies.heading,
    fontSize: '2.5rem', // 40px
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontFamily: fontFamilies.heading,
    fontSize: '2rem', // 32px
    fontWeight: 600,
    lineHeight: 1.125,
    letterSpacing: '-0.005em',
  },
  h4: {
    fontFamily: fontFamilies.heading,
    fontSize: '1.5rem', // 24px
    fontWeight: 600,
    lineHeight: 1.167,
    letterSpacing: '0em',
  },
  h5: {
    fontFamily: fontFamilies.heading,
    fontSize: '1.25rem', // 20px
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '0em',
  },
  h6: {
    fontFamily: fontFamilies.heading,
    fontSize: '1.0625rem', // 17px - Apple's body emphasis size
    fontWeight: 600,
    lineHeight: 1.235,
    letterSpacing: '0em',
  },

  // Body Text
  body1: {
    fontFamily: fontFamilies.body,
    fontSize: '1rem', // 16px
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0em',
  },
  body2: {
    fontFamily: fontFamilies.body,
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: 1.57,
    letterSpacing: '0em',
  },

  // Subtitles
  subtitle1: {
    fontFamily: fontFamilies.body,
    fontSize: '1.125rem', // 18px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  subtitle2: {
    fontFamily: fontFamilies.body,
    fontSize: '1rem', // 16px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0em',
  },

  // Misc
  button: {
    fontFamily: fontFamilies.body,
    fontSize: '0.9375rem', // 15px
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.01em',
    textTransform: 'none',
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: '0.75rem', // 12px
    fontWeight: 400,
    lineHeight: 1.66,
    letterSpacing: '0.01em',
  },
  overline: {
    fontFamily: fontFamilies.body,
    fontSize: '0.75rem', // 12px
    fontWeight: 600,
    lineHeight: 2.66,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

export default typography;
