/**
 * Survey Preview Page
 * View and explore survey configurations
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  Button,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useSurveys, useSurvey } from '../services/hooks';
import SurveyDetails from '../components/SurveyPreview/SurveyDetails';
import QuestionList from '../components/SurveyPreview/QuestionList';
import PersonaGroupList from '../components/SurveyPreview/PersonaGroupList';
import CategoryList from '../components/SurveyPreview/CategoryList';

const SurveyPreviewPage: React.FC = () => {
  const { surveyId: urlSurveyId } = useParams<{ surveyId?: string }>();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(urlSurveyId || '');
  const navigate = useNavigate();

  const { data: surveys, isLoading: surveysLoading, error: surveysError } = useSurveys();
  const {
    data: survey,
    isLoading: surveyLoading,
    error: surveyError,
  } = useSurvey(selectedSurveyId, { enabled: !!selectedSurveyId });

  const handleSurveyChange = (event: any) => {
    setSelectedSurveyId(event.target.value);
  };

  const handleViewAsUser = () => {
    if (selectedSurveyId) {
      navigate(`/user-view/${selectedSurveyId}`);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Survey Preview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View survey configurations, questions, categories, and persona groups.
        </Typography>
      </Box>

      {/* Survey Selector */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Select Survey
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a survey to view its details and configuration
            </Typography>
          </Box>
          {selectedSurveyId && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<VisibilityIcon />}
              onClick={handleViewAsUser}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Test as Respondent
            </Button>
          )}
        </Box>
        <FormControl fullWidth>
          <InputLabel>Select Survey</InputLabel>
          <Select
            value={selectedSurveyId}
            label="Select Survey"
            onChange={handleSurveyChange}
            disabled={surveysLoading}
          >
            <MenuItem value="">
              <em>Choose a survey...</em>
            </MenuItem>
            {surveys?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name} ({s.num_questions} questions, {s.num_persona_groups} persona groups)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Loading States */}
      {surveysLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error States */}
      {surveysError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading surveys. Please ensure the backend API is running.
        </Alert>
      )}

      {surveyError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading survey details.
        </Alert>
      )}

      {/* Survey Details */}
      {surveyLoading && selectedSurveyId && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {survey && !surveyLoading && (
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <SurveyDetails survey={survey} />
          </Grid>

          {/* Categories (if any) */}
          {survey.categories && survey.categories.length > 0 && (
            <Grid item xs={12}>
              <CategoryList categories={survey.categories} />
            </Grid>
          )}

          {/* Questions */}
          <Grid item xs={12}>
            <QuestionList questions={survey.questions} categories={survey.categories} />
          </Grid>

          {/* Persona Groups */}
          <Grid item xs={12}>
            <PersonaGroupList personaGroups={survey.persona_groups} />
          </Grid>
        </Grid>
      )}

      {/* Empty State */}
      {!selectedSurveyId && !surveysLoading && surveys && surveys.length > 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Select a survey from the dropdown above to view its details
          </Typography>
        </Paper>
      )}

      {!surveysLoading && surveys && surveys.length === 0 && (
        <Alert severity="info">
          No surveys found. Create a survey using the Survey Builder.
        </Alert>
      )}
    </Box>
  );
};

export default SurveyPreviewPage;
