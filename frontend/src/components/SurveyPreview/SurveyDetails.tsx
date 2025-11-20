/**
 * Survey Details Component
 * Display basic survey information
 */

import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { Survey } from '../../services/types';

interface SurveyDetailsProps {
  survey: Survey;
}

const SurveyDetails: React.FC<SurveyDetailsProps> = ({ survey }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {survey.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {survey.description}
      </Typography>

      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Context
        </Typography>
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {survey.context}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="text.secondary">
            Questions
          </Typography>
          <Typography variant="h6">
            {survey.questions.length}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle2" color="text.secondary">
            Persona Groups
          </Typography>
          <Typography variant="h6">
            {survey.persona_groups.length}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle2" color="text.secondary">
            Categories
          </Typography>
          <Typography variant="h6">
            {survey.categories?.length || 0}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SurveyDetails;
