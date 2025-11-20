/**
 * Empty State Component
 * Provides helpful guidance when no data is available
 */

import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actions = [],
  compact = false,
}) => {
  const navigate = useNavigate();

  const handleActionClick = (action: EmptyStateAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      navigate(action.href);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: compact ? 300 : 400,
        textAlign: 'center',
        py: compact ? 6 : 8,
        px: 2,
      }}
    >
      <Box
        sx={{
          fontSize: compact ? 48 : 64,
          color: 'primary.main',
          opacity: 0.5,
          mb: 3,
          '& > svg': {
            fontSize: 'inherit',
          }
        }}
      >
        {icon}
      </Box>
      <Typography
        variant={compact ? 'h6' : 'h5'}
        gutterBottom
        sx={{ fontWeight: 600, mb: 1 }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 480, mb: actions.length > 0 ? 4 : 0, lineHeight: 1.6 }}
      >
        {description}
      </Typography>
      {actions.length > 0 && (
        <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.primary ? 'contained' : 'outlined'}
              size="large"
              onClick={() => handleActionClick(action)}
              sx={{ px: 4 }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default EmptyState;
