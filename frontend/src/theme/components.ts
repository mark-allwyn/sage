/**
 * Component Theme Overrides for S.A.G.E
 * Modern styling for Material-UI components
 */

import { Components, Theme } from '@mui/material/styles';
import { borderRadius, shadows, transitions } from './spacing';

export const components: Components<Omit<Theme, 'components'>> = {
  // Button (Apple-like: minimal, clean)
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: borderRadius.xl,  // More rounded like Apple
        fontWeight: 500,  // Medium weight for better hierarchy
        padding: '10px 24px',
        boxShadow: 'none',
        transition: `all ${transitions.duration.short}ms ${transitions.easing.smooth}`,
        '&:hover': {
          boxShadow: 'none',
        },
        '&:active': {
          transform: 'scale(0.98)',  // Subtle press feedback
        },
      },
      contained: {
        '&:hover': {
          boxShadow: 'none',
        },
      },
      containedPrimary: {
        background: '#0B617C',  // Solid color, no gradient
        '&:hover': {
          background: '#094D63',
          boxShadow: '0 2px 8px rgba(11, 97, 124, 0.24)',  // Subtle shadow on hover
        },
      },
      sizeLarge: {
        padding: '14px 32px',
        fontSize: '1.0625rem',  // 17px - Apple's standard
      },
      outlined: {
        borderWidth: '1px',
        '&:hover': {
          borderWidth: '1px',
          backgroundColor: 'rgba(11, 97, 124, 0.04)',
        },
      },
    },
  },

  // Paper (Apple-like: minimal shadows, subtle borders)
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.lg,
        boxShadow: 'none',
        border: '1px solid #d2d2d7',
        transition: `all ${transitions.duration.standard}ms ${transitions.easing.smooth}`,
      },
      elevation0: {
        boxShadow: 'none',
        border: 'none',
      },
      elevation1: {
        boxShadow: 'none',
        border: '1px solid #d2d2d7',
      },
      elevation2: {
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e8e8ed',
      },
      elevation3: {
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e8e8ed',
      },
    },
  },

  // Card (Apple-like: clean, no transform on hover)
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.lg,
        boxShadow: 'none',
        border: '1px solid #e8e8ed',
        transition: `all ${transitions.duration.standard}ms ${transitions.easing.smooth}`,
        '&:hover': {
          borderColor: '#0B617C',
          boxShadow: '0 4px 16px rgba(11, 97, 124, 0.08)',
        },
      },
    },
  },

  // TextField
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: borderRadius.sm,
          transition: `all ${transitions.duration.short}ms ${transitions.easing.smooth}`,
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            },
          },
        },
      },
    },
  },

  // Input Base
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.sm,
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#0B617C',
        },
      },
      notchedOutline: {
        transition: `all ${transitions.duration.shortest}ms ${transitions.easing.smooth}`,
      },
    },
  },

  // Chip
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.sm,
        fontWeight: 500,
      },
      filled: {
        '&:hover': {
          boxShadow: shadows.card,
        },
      },
    },
  },

  // Alert
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md,
        padding: '12px 16px',
      },
      standardInfo: {
        backgroundColor: 'rgba(39, 226, 204, 0.1)',
        border: '1px solid rgba(39, 226, 204, 0.3)',
      },
      standardSuccess: {
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        border: '1px solid rgba(46, 125, 50, 0.3)',
      },
      standardWarning: {
        backgroundColor: 'rgba(237, 108, 2, 0.1)',
        border: '1px solid rgba(237, 108, 2, 0.3)',
      },
      standardError: {
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        border: '1px solid rgba(211, 47, 47, 0.3)',
      },
    },
  },

  // Drawer (Apple-like: clean sidebar)
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: '1px solid #d2d2d7',
        boxShadow: 'none',
        backgroundColor: '#fbfbfb',  // Subtle off-white
      },
    },
  },

  // AppBar (Apple-like: minimal top bar)
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        borderBottom: '1px solid #d2d2d7',
        borderRadius: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Translucent like Apple
        backdropFilter: 'blur(20px)',
      },
    },
  },

  // List Item Button (Apple-like: minimal, no transform)
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md,
        margin: '1px 12px',
        padding: '10px 12px',
        transition: `all ${transitions.duration.shortest}ms ${transitions.easing.smooth}`,
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(11, 97, 124, 0.08)',
          '&:hover': {
            backgroundColor: 'rgba(11, 97, 124, 0.12)',
          },
        },
      },
    },
  },

  // Tabs
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.9375rem',
        minHeight: 48,
        transition: `all ${transitions.duration.shortest}ms ${transitions.easing.smooth}`,
        '&:hover': {
          color: '#0B617C',
          opacity: 1,
        },
      },
    },
  },

  // Divider
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: '#E4EAED',
      },
    },
  },

  // Linear Progress
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.full,
        height: 8,
        backgroundColor: '#E4EAED',
      },
      bar: {
        borderRadius: borderRadius.full,
        background: 'linear-gradient(90deg, #0B617C 0%, #27E2CC 100%)',
      },
    },
  },

  // Circular Progress
  MuiCircularProgress: {
    styleOverrides: {
      root: {
        '& circle': {
          strokeLinecap: 'round',
        },
      },
    },
  },

  // Skeleton
  MuiSkeleton: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
      },
    },
  },

  // Tooltip
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#2F3638',
        borderRadius: borderRadius.sm,
        fontSize: '0.8125rem',
        padding: '8px 12px',
        boxShadow: shadows.elevated,
      },
      arrow: {
        color: '#2F3638',
      },
    },
  },

  // Select
  MuiSelect: {
    styleOverrides: {
      select: {
        '&:focus': {
          borderRadius: borderRadius.sm,
        },
      },
    },
  },

  // Menu
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: borderRadius.md,
        boxShadow: shadows.elevated,
        marginTop: 8,
      },
    },
  },

  // MenuItem
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.xs,
        margin: '2px 8px',
        padding: '8px 12px',
        transition: `all ${transitions.duration.shortest}ms ${transitions.easing.smooth}`,
        '&:hover': {
          backgroundColor: 'rgba(11, 97, 124, 0.06)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(11, 97, 124, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(11, 97, 124, 0.14)',
          },
        },
      },
    },
  },

  // Badge
  MuiBadge: {
    styleOverrides: {
      badge: {
        fontWeight: 600,
        fontSize: '0.7rem',
        minWidth: 20,
        height: 20,
      },
    },
  },

  // Slider
  MuiSlider: {
    styleOverrides: {
      root: {
        height: 6,
      },
      thumb: {
        width: 20,
        height: 20,
        '&:hover': {
          boxShadow: '0 0 0 8px rgba(11, 97, 124, 0.16)',
        },
        '&.Mui-focusVisible': {
          boxShadow: '0 0 0 8px rgba(11, 97, 124, 0.24)',
        },
      },
      track: {
        height: 6,
        borderRadius: borderRadius.full,
      },
      rail: {
        height: 6,
        borderRadius: borderRadius.full,
        opacity: 0.3,
      },
    },
  },

  // Global styles for better UX
  MuiCssBaseline: {
    styleOverrides: {
      '*:focus-visible': {
        outline: '2px solid #0B617C',
        outlineOffset: '2px',
        borderRadius: '4px',
      },
      '*:focus:not(:focus-visible)': {
        outline: 'none',
      },
      html: {
        scrollBehavior: 'smooth',
      },
      '::selection': {
        backgroundColor: 'rgba(11, 97, 124, 0.2)',
        color: 'inherit',
      },
      body: {
        backgroundImage: `
          radial-gradient(at 40% 20%, rgba(11, 97, 124, 0.02) 0, transparent 50%),
          radial-gradient(at 80% 80%, rgba(39, 226, 204, 0.02) 0, transparent 50%)
        `,
      },
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    },
  },
};

export default components;
