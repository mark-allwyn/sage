/**
 * PageHeader Component
 * Consistent page header design for all pages
 */

import React from 'react';
import { Box, Typography, Chip, alpha } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  };
  icon?: React.ReactNode;
  gradient?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  icon,
  gradient = false,
}) => {
  if (gradient) {
    return (
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4338CA 0%, #7C3AED 50%, #9333EA 100%)',
          color: 'white',
          py: { xs: 4, md: 6 },
          px: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 40%), ' +
              'radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 40%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {badge && (
            <Chip
              label={badge.label}
              size="small"
              sx={{
                mb: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 600,
              }}
            />
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: subtitle ? 1.5 : 0 }}>
            {icon && (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                {icon}
              </Box>
            )}
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.875rem', md: '2.5rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {title}
            </Typography>
          </Box>
          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.0625rem',
                opacity: 0.95,
                lineHeight: 1.6,
                maxWidth: 800,
                ml: icon ? 8 : 0,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {badge && (
        <Chip
          label={badge.label}
          color={badge.color || 'primary'}
          size="small"
          sx={{
            mb: 2,
            fontWeight: 600,
          }}
        />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: subtitle ? 1.5 : 0 }}>
        {icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha('#4F46E5', 0.3)}`,
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.875rem', md: '2.5rem' },
          }}
        >
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: '1.0625rem',
            lineHeight: 1.6,
            maxWidth: 800,
            ml: icon ? 8 : 0,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;
