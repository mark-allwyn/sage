/**
 * Main Theme Configuration for S.A.G.E
 * Combines all theme modules into a cohesive design system
 */

import { createTheme } from '@mui/material/styles';
import { colors } from './colors';
import { typography } from './typography';
import { components } from './components';
import { shadows, borderRadius } from './spacing';

// Create the theme
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    background: colors.background,
    text: colors.text,
    divider: colors.border.main,
    action: colors.action,
  },
  typography,
  components,
  shape: {
    borderRadius: borderRadius.md,
  },
  shadows: [
    'none',
    shadows.card,
    shadows.card,
    shadows.elevated,
    shadows.elevated,
    shadows.elevatedHover,
    shadows.elevatedHover,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
    shadows.modal,
  ],
});

// Export everything for use in components
export { colors, borderRadius, shadows };
export default theme;
