/**
 * Loading Skeleton Components
 * Provide visual feedback while content loads
 */

import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid, Paper } from '@mui/material';

/**
 * Skeleton for a single card component
 */
export const CardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
      </Box>
    </CardContent>
  </Card>
);

/**
 * Skeleton for a full page with card grid
 */
export const PageSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="text" width="40%" height={56} sx={{ mb: 3 }} />
    <Skeleton variant="text" width="60%" height={24} sx={{ mb: 4 }} />
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <CardSkeleton />
        </Grid>
      ))}
    </Grid>
  </Box>
);

/**
 * Skeleton for form elements
 */
export const FormSkeleton: React.FC = () => (
  <Paper sx={{ p: 3 }}>
    <Skeleton variant="text" width="30%" height={40} sx={{ mb: 3 }} />
    {[1, 2, 3].map((i) => (
      <Box key={i} sx={{ mb: 3 }}>
        <Skeleton variant="text" width="20%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
      </Box>
    ))}
    <Skeleton variant="rectangular" width={120} height={42} sx={{ borderRadius: 2, mt: 2 }} />
  </Paper>
);

/**
 * Skeleton for survey builder page
 */
export const SurveyBuilderSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="text" width="40%" height={48} sx={{ mb: 4 }} />
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 1, mb: 2 }} />
    </Box>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormSkeleton />
      </Grid>
    </Grid>
  </Box>
);

/**
 * Skeleton for survey runner page
 */
export const SurveyRunnerSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="text" width="40%" height={48} sx={{ mb: 4 }} />
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
            </Box>
          ))}
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 3 }} />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

/**
 * Skeleton for list items
 */
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <Box>
    {Array.from({ length: items }).map((_, i) => (
      <Paper key={i} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
        </Box>
      </Paper>
    ))}
  </Box>
);

/**
 * Skeleton for hero section
 */
export const HeroSkeleton: React.FC = () => (
  <Box sx={{ textAlign: 'center', py: { xs: 8, md: 12 } }}>
    <Skeleton
      variant="text"
      width="70%"
      height={80}
      sx={{ mx: 'auto', mb: 3 }}
    />
    <Skeleton
      variant="text"
      width="50%"
      height={40}
      sx={{ mx: 'auto', mb: 5 }}
    />
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
      <Skeleton variant="rectangular" width={140} height={48} sx={{ borderRadius: 3 }} />
      <Skeleton variant="rectangular" width={140} height={48} sx={{ borderRadius: 3 }} />
    </Box>
  </Box>
);

export default {
  CardSkeleton,
  PageSkeleton,
  FormSkeleton,
  SurveyBuilderSkeleton,
  SurveyRunnerSkeleton,
  ListSkeleton,
  HeroSkeleton,
};
