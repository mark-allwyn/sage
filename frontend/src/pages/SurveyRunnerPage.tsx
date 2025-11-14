/**
 * Survey Runner Page
 * Execute surveys and view LLM responses
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useSurveys, useSurvey } from '../services/hooks';
import RunConfigPanel from '../components/SurveyRunner/RunConfigPanel';
import RunProgress from '../components/SurveyRunner/RunProgress';
import ResponseDataset from '../components/SurveyRunner/ResponseDataset';
import { RunSurveyConfig, RunSurveyResponse } from '../services/types';

const SurveyRunnerPage: React.FC = () => {
  const { surveyId: urlSurveyId } = useParams<{ surveyId?: string }>();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(urlSurveyId || '');
  const [runConfig, setRunConfig] = useState<RunSurveyConfig>({
    survey_id: '',
    num_profiles: 50,
    llm_provider: 'openai',
    model: 'gpt-3.5-turbo',
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
  const [isStreaming, setIsStreaming] = useState(false);

  const handleRunSurvey = async () => {
    if (!selectedSurveyId) {
      setSnackbar({
        open: true,
        message: 'Please select a survey first',
        severity: 'error',
      });
      return;
    }

    // Validate configuration before sending
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
    if (!['openai', 'anthropic'].includes(runConfig.llm_provider)) {
      validationErrors.push('Invalid LLM provider');
    }
    // Normalize method is always 'paper' (from research paper arXiv:2510.08338v2)
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
    setRunResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/run-survey-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...runConfig, survey_id: selectedSurveyId }),
      });

      // Handle non-200 responses
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

      let buffer = ''; // Buffer for incomplete lines

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.message) {
                setProgressMessages(prev => [...prev, data.message]);
              }
              if (data.progress !== undefined) {
                setCurrentProgress(data.progress);
              }

              if (data.status === 'complete' && data.result) {
                setRunResult(data.result);
                setSnackbar({
                  open: true,
                  message: `Survey completed! Generated ${data.result.num_responses} responses.`,
                  severity: 'success',
                });
              } else if (data.status === 'error') {
                setSnackbar({
                  open: true,
                  message: data.message,
                  severity: 'error',
                });
              }
            } catch (parseError) {
              console.error('Failed to parse SSE message:', line, parseError);
            }
          }
        }
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Run Survey
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Execute the complete SSR pipeline: generate profiles, collect LLM responses, and apply semantic similarity rating.
        </Typography>
      </Box>

      {/* Survey Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Survey</InputLabel>
          <Select
            value={selectedSurveyId}
            label="Select Survey"
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
      {survey && !surveyLoading && (
        <Paper sx={{ p: 4, mb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {survey.name}
            </Typography>

            {survey.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                {survey.description}
              </Typography>
            )}
          </Box>

          {survey.context && (
            <Box sx={{ mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                Survey Context
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {survey.context}
              </Typography>
            </Box>
          )}

          {/* Categories with Media */}
          {survey.categories && survey.categories.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom sx={{ mb: 2 }}>
                Categories ({survey.categories.length})
              </Typography>
              <Grid container spacing={2}>
                {survey.categories.map((category, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2.5, height: '100%' }}>
                      <Typography variant="body1" fontWeight="bold" gutterBottom>
                        {category.name}
                      </Typography>
                      {category.description && (
                        <Typography variant="body2" color="text.secondary" display="block" gutterBottom sx={{ mb: 2 }}>
                          {category.description}
                        </Typography>
                      )}

                      {/* Display image if present */}
                      {category.media_type === 'image' && (category.media_url || category.media_path) && (
                        <Box sx={{ mt: 2 }}>
                          <img
                            src={category.media_url || category.media_path}
                            alt={category.name}
                            style={{
                              width: '100%',
                              maxHeight: '200px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                            }}
                          />
                        </Box>
                      )}

                      {/* Display webpage URL if present */}
                      {category.media_type === 'webpage' && category.media_url && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                          <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                            Webpage URL:
                          </Typography>
                          <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                            {category.media_url}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Summary Stats Row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {survey.questions.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Questions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {survey.persona_groups.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Persona Groups
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {survey.categories?.length || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Categories
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {survey.sample_size}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target Sample
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Questions */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                Questions
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.default', borderRadius: 2, p: 2.5 }}>
                {survey.questions.map((q, index) => (
                  <Box key={q.id} sx={{ mb: 2.5, pb: 2.5, borderBottom: index < survey.questions.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
                    <Typography variant="body2" fontWeight="600">
                      Q{index + 1}. {q.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Type: {q.type.replace('_', ' ')}
                    </Typography>
                    {q.options && (
                      <Box sx={{ mt: 1.5, ml: 1 }}>
                        {q.options.map((option, optIndex) => (
                          <Typography key={optIndex} variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            • {option}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    {q.scale && (
                      <Box sx={{ mt: 1.5, ml: 1 }}>
                        {Object.entries(q.scale).map(([value, label]) => (
                          <Typography key={value} variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            {value}: {label}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Persona Groups */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                Persona Groups
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.default', borderRadius: 2, p: 2.5 }}>
                {survey.persona_groups.map((group, index) => (
                  <Box key={index} sx={{ mb: 2.5, pb: 2.5, borderBottom: index < survey.persona_groups.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                      <Typography variant="body2" fontWeight="600">
                        {group.name}
                      </Typography>
                      <Typography variant="caption" color="primary" fontWeight="bold">
                        Weight: {group.weight}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {group.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {group.personas.length} persona(s)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Configuration Panel */}
      {survey && !surveyLoading && !runResult && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <RunConfigPanel
              config={runConfig}
              setConfig={setRunConfig}
              disabled={isStreaming}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={isStreaming ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                onClick={handleRunSurvey}
                disabled={isStreaming || !selectedSurveyId}
              >
                {isStreaming ? 'Running...' : 'Run Survey'}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} lg={8}>
            {/* Progress Indicator */}
            {isStreaming && (
              <RunProgress progress={currentProgress} messages={progressMessages} />
            )}

            {/* Empty State */}
            {!runResult && !isStreaming && (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Configure the settings and click "Run Survey" to execute the pipeline
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {/* Results Display - Full Width */}
      {runResult && !isStreaming && survey && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Survey Results</Typography>
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
          <ResponseDataset result={runResult} survey={survey} />
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SurveyRunnerPage;
