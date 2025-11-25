/**
 * Breadcrumb Navigation Component
 * Provides contextual wayfinding for users
 */

import React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { useSurveys, useSurveyRuns } from '../services/hooks';

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/overview': 'System Overview',
  '/builder': 'Survey Builder',
  '/preview': 'Preview',
  '/user-view': 'User View',
  '/runner': 'Run Survey',
  '/ground-truth': 'Ground Truth Testing',
  '/history': 'History',
  '/surveys': 'Surveys',
  '/run': 'Run',
  '/results': 'Results',
  '/experiments': 'Experiments',
};

export const AppBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Fetch data for dynamic labels
  const { data: surveys } = useSurveys();
  const { data: runs } = useSurveyRuns();

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  // Helper to get friendly label for IDs
  const getFriendlyLabel = (value: string, index: number): string => {
    // Check if it's a UUID or ID pattern
    const isUUID = /^[a-f0-9-]{36}$/i.test(value);
    const isShortId = /^[a-f0-9]{8,}$/i.test(value);

    if (isUUID || isShortId) {
      const previousSegment = index > 0 ? pathnames[index - 1] : '';

      // Handle run IDs
      if (previousSegment === 'runs' && runs) {
        const run = runs.find(r => r.run_id === value);
        if (run) {
          return `Run ${value.slice(0, 8)}...`;
        }
      }

      // Handle survey IDs
      if ((previousSegment === 'surveys' || previousSegment === 'preview') && surveys) {
        const survey = surveys.find(s => s.id === value);
        if (survey) {
          return survey.name;
        }
      }

      // Default: shorten long IDs
      return value.slice(0, 8) + '...';
    }

    // Return mapped label or capitalized segment
    return routeLabels[`/${value}`] || value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{
        mb: 3,
        '& .MuiBreadcrumbs-separator': {
          color: 'text.secondary',
        }
      }}
      aria-label="breadcrumb navigation"
    >
      <Link
        component={RouterLink}
        to="/"
        underline="hover"
        color="text.secondary"
        sx={{
          fontSize: '0.875rem',
          transition: 'color 0.2s',
          '&:hover': {
            color: 'primary.main',
          }
        }}
      >
        Home
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const label = getFriendlyLabel(value, index);

        return last ? (
          <Typography
            key={to}
            color="text.primary"
            fontWeight={600}
            fontSize="0.875rem"
          >
            {label}
          </Typography>
        ) : (
          <Link
            key={to}
            component={RouterLink}
            to={to}
            underline="hover"
            color="text.secondary"
            sx={{
              fontSize: '0.875rem',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'primary.main',
              }
            }}
          >
            {label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default AppBreadcrumbs;
