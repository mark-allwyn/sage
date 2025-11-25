/**
 * Empty State Component
 * Provides helpful guidance when no data is available
 */

import React from 'react';
import { Box, Typography, Button, Stack, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircleOutline as CheckIcon } from '@mui/icons-material';
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
  hints?: string[];
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actions = [],
  compact = false,
  hints = [],
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
        sx={{ maxWidth: 480, mb: hints.length > 0 ? 3 : (actions.length > 0 ? 4 : 0), lineHeight: 1.6 }}
      >
        {description}
      </Typography>
      {hints.length > 0 && (
        <Box sx={{ maxWidth: 520, mb: actions.length > 0 ? 4 : 0, textAlign: 'left' }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, textAlign: 'center' }}>
            Quick Tips:
          </Typography>
          <List dense sx={{ bgcolor: 'background.default', borderRadius: 1, py: 1 }}>
            {hints.map((hint, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={hint}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
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
