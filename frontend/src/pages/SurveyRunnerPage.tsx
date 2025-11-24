/**
 * Survey Runner Page
 * Execute surveys and view LLM responses
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
  Snackbar,
} from '@mui/material';
import { PlayArrow as PlayArrowIcon, CreateOutlined as CreateIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useSurveys, useSurvey } from '../services/hooks';
import RunConfigPanel from '../components/SurveyRunner/RunConfigPanel';
import RunProgress from '../components/SurveyRunner/RunProgress';
import ResponseDataset from '../components/SurveyRunner/ResponseDataset';
import { RunSurveyConfig, RunSurveyResponse } from '../services/types';
import { EmptyState } from '../components/EmptyState';
import PageHeader from '../components/PageHeader';

const SurveyRunnerPage: React.FC = () => {
  const navigate = useNavigate();
  const { surveyId: urlSurveyId } = useParams<{ surveyId?: string }>();
  // Only use URL survey ID if it's valid (not empty and not 'unknown')
  const initialSurveyId = urlSurveyId && urlSurveyId !== 'unknown' ? urlSurveyId : '';
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(initialSurveyId);
  const [runConfig, setRunConfig] = useState<RunSurveyConfig>({
    survey_id: '',
    num_profiles: 50,
    llm_provider: 'openai',
    model: 'gpt-4o-mini',
    llm_temperature: 0.7,
    ssr_temperature: 1.0,
    normalize_method: 'paper',
    seed: 100,
  });
  const [runResult, setRunResult] = useState<RunSurveyResponse | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: surveys, isLoading: surveysLoading, error: surveysError } = useSurveys();
  const {
    data: survey,
    isLoading: surveyLoading,
    error: surveyError,
  } = useSurvey(selectedSurveyId, { enabled: !!selectedSurveyId });

  const handleSurveyChange = (event: any) => {
    const newSurveyId = event.target.value;
    setSelectedSurveyId(newSurveyId);
    setRunConfig({ ...runConfig, survey_id: newSurveyId });
    setRunResult(null);
  };

  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progressDetails, setProgressDetails] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleRunSurvey = async () => {
    console.log('=== STARTING SURVEY RUN ===');
    console.log('Selected Survey ID:', selectedSurveyId);

    if (!selectedSurveyId) {
      setSnackbar({
        open: true,
        message: 'Please select a survey first',
        severity: 'error',
      });
      return;
    }

    // Validation
    const validationErrors: string[] = [];
    if (runConfig.num_profiles < 10 || runConfig.num_profiles > 500) {
      validationErrors.push('Number of profiles must be between 10 and 500');
    }
    if (runConfig.llm_temperature < 0 || runConfig.llm_temperature > 2) {
      validationErrors.push('LLM temperature must be between 0 and 2');
    }
    if (runConfig.ssr_temperature < 0.1 || runConfig.ssr_temperature > 5) {
      validationErrors.push('SSR temperature must be between 0.1 and 5');
    }
    if (runConfig.seed < 0 || runConfig.seed > 10000) {
      validationErrors.push('Seed must be between 0 and 10000');
    }
    if (!['openai', 'anthropic', 'ollama'].includes(runConfig.llm_provider)) {
      validationErrors.push('Invalid LLM provider');
    }
    if (runConfig.normalize_method !== 'paper') {
      validationErrors.push('Normalization method must be "paper"');
    }

    if (validationErrors.length > 0) {
      setSnackbar({
        open: true,
        message: `Configuration errors: ${validationErrors.join('; ')}`,
        severity: 'error',
      });
      return;
    }

    setIsStreaming(true);
    setProgressMessages([]);
    setCurrentProgress(0);
    setCurrentStep('');
    setProgressDetails(null);
    setRunResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/run-survey-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...runConfig, survey_id: selectedSurveyId }),
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          const errorMessages = errorData.detail?.map((err: any) =>
            `${err.loc.join('.')}: ${err.msg}`
          ).join(', ') || 'Validation error';
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const jsonStr = line.substring(6);
              const data = JSON.parse(jsonStr);
              console.log('Received SSE data:', data);

              if (data.status === 'progress' || data.status === 'running' || data.status === 'starting') {
                setProgressMessages((prev) => [...prev, data.message]);
                setCurrentProgress(data.progress || 0);
                setCurrentStep(data.step || '');
                setProgressDetails(data.details || null);
              } else if (data.status === 'complete' || data.status === 'completed') {
                console.log('Survey completed! Data:', data);
                console.log('Run ID:', data.result?.run_id);

                // Show success message and navigate immediately
                setSnackbar({
                  open: true,
                  message: 'Survey completed! Opening results...',
                  severity: 'success',
                });

                // Navigate to results page
                const runId = data.result?.run_id;
                if (runId) {
                  console.log('Navigating to:', `/runs/${runId}?completed=true`);
                  // Use a delay to let the success message show
                  setTimeout(() => {
                    navigate(`/runs/${runId}?completed=true`);
                  }, 3000);
                } else {
                  console.error('No run_id in result:', data);
                }
              } else if (data.status === 'error') {
                throw new Error(data.message || 'Unknown error occurred');
              }
            } catch (parseError) {
              console.error('Failed to parse SSE message:', parseError);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Survey run error:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Failed to run survey'}`,
        severity: 'error',
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Run Survey"
        subtitle="Execute the complete SSR pipeline and generate synthetic audience responses"
        icon={<PlayArrowIcon sx={{ fontSize: 28 }} />}
      />

      {/* Empty State - No Surveys */}
      {!surveysLoading && surveys && surveys.length === 0 && (
        <Paper sx={{ mb: 3 }}>
          <EmptyState
            icon={<CreateIcon />}
            title="No surveys available"
            description="You need to create a survey first before you can run it. Head to the Survey Builder to get started."
            actions={[
              { label: "Create Survey", primary: true, href: "/builder" },
              { label: "View Examples", href: "/overview" }
            ]}
          />
        </Paper>
      )}

      {/* Survey Selector */}
      {!surveysLoading && surveys && surveys.length > 0 && (
        <Paper sx={{ p: 4, mb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Select Survey
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a survey configuration you've created in the Survey Builder
            </Typography>
          </Box>
          <FormControl fullWidth>
            <InputLabel>Survey</InputLabel>
            <Select
              value={selectedSurveyId}
              label="Survey"
              onChange={handleSurveyChange}
              disabled={surveysLoading || isStreaming}
            >
              <MenuItem value="">
                <em>Choose a survey...</em>
              </MenuItem>
              {surveys?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.num_questions} questions)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

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

      {/* Survey Overview - Compact */}
      {survey && !surveyLoading && (
        <Paper sx={{ p: 4, mb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {survey.name}
            </Typography>
            {survey.description && (
              <Typography variant="body2" color="text.secondary">
                {survey.description}
              </Typography>
            )}
          </Box>

          {/* Summary Stats - Compact */}
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {survey.questions.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Questions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {survey.persona_groups.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Personas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {survey.categories?.length || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Categories
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Configuration Panel - Compact Single Column */}
      {survey && !surveyLoading && !runResult && !isStreaming && (
        <Box>
          <RunConfigPanel
            config={runConfig}
            setConfig={setRunConfig}
            disabled={isStreaming}
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={handleRunSurvey}
              disabled={!selectedSurveyId}
              sx={{ px: 8, py: 1.5, fontSize: '1.1rem' }}
            >
              Run Survey
            </Button>
          </Box>
        </Box>
      )}

      {/* Running State - Split Layout */}
      {survey && !surveyLoading && !runResult && isStreaming && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <RunConfigPanel
              config={runConfig}
              setConfig={setRunConfig}
              disabled={isStreaming}
            />
          </Grid>
          <Grid item xs={12} lg={8}>
            <RunProgress
              progress={currentProgress}
              messages={progressMessages}
              currentStep={currentStep}
              details={progressDetails}
            />
          </Grid>
        </Grid>
      )}

      {/* Results Display - Full Width */}
      {runResult && !isStreaming && survey && (
        <Box>
          <Paper sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Survey Results
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate(`/runs/${runResult.run_id}`)}
                >
                  View Full Details
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setRunResult(null);
                    setProgressMessages([]);
                    setCurrentProgress(0);
                  }}
                >
                  Run Another Survey
                </Button>
              </Box>
            </Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Survey completed successfully!
              </Typography>
              <Typography variant="body2">
                Run ID: <code style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{runResult.run_id}</code>
                {' • '}
                {runResult.num_responses} responses collected from {runResult.num_profiles} profiles
              </Typography>
            </Alert>
            <ResponseDataset
              result={runResult}
              survey={survey}
            />
          </Paper>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SurveyRunnerPage;
