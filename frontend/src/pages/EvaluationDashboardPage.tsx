/**
 * Evaluation Dashboard Page
 * Displays LLM evaluation results using DeepEval metrics
 */

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  SelectChangeEvent,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  CompareArrows as CompareIcon,
  Info as InfoIcon,
  HelpOutline as HelpIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import {
  useEvaluations,
  useEvaluation,
  useEvaluateResponses,
  useDeleteEvaluation,
  useCompareEvaluations,
  useSurveys,
  useSurveyRuns,
  useSettings,
} from '../services/hooks';
import {
  EvaluationListItem,
  EVALUATION_METRICS,
} from '../services/types';
import { getEnabledProviders, getEnabledModelsForProvider } from '../utils/providerFilters';

const EvaluationDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>('');
  const [openRunDialog, setOpenRunDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openCompareDialog, setOpenCompareDialog] = useState(false);
  const [selectedEvaluationsForCompare, setSelectedEvaluationsForCompare] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  // Run evaluation form state
  const [runConfig, setRunConfig] = useState({
    survey_id: '',
    run_id: '',
    sample_size: 10,
    metrics: ['answer_relevancy', 'bias', 'hallucination'],
    evaluator_model: 'gpt-4o-mini',
    threshold: 0.5,
  });

  // Queries
  const { data: surveys } = useSurveys();
  const { data: evaluationsData, isLoading: loadingEvaluations, refetch: refetchEvaluations } = useEvaluations(
    selectedSurveyId || undefined
  );
  const { data: selectedEvaluation, isLoading: loadingEvaluation } = useEvaluation(
    selectedEvaluationId,
    { enabled: !!selectedEvaluationId }
  );
  const { data: surveyRuns } = useSurveyRuns(runConfig.survey_id || undefined);
  const { data: allSurveyRuns } = useSurveyRuns(); // Fetch all survey runs to check availability
  const { data: settings } = useSettings();

  const enabledProviders = getEnabledProviders(settings);
  const enabledOpenAIModels = getEnabledModelsForProvider('openai', settings);
  const enabledAnthropicModels = getEnabledModelsForProvider('anthropic', settings);

  // Mutations
  const compareMutation = useCompareEvaluations();
  const evaluateMutation = useEvaluateResponses({
    onSuccess: () => {
      setOpenRunDialog(false);
      refetchEvaluations();
    },
    onError: (error) => {
      console.error('Evaluation error:', error);
      alert(`Evaluation failed: ${error.message}`);
    },
  });
  const deleteMutation = useDeleteEvaluation({
    onSuccess: () => {
      refetchEvaluations();
    },
  });

  const evaluations = evaluationsData?.evaluations || [];
  const hasSurveyRuns = allSurveyRuns && allSurveyRuns.length > 0;
  const canRunEvaluation = surveys && surveys.length > 0 && hasSurveyRuns;

  const handleRunEvaluation = () => {
    const payload = {
      survey_id: runConfig.survey_id,
      run_id: runConfig.run_id || undefined,
      sample_size: runConfig.sample_size,
      metrics: runConfig.metrics,
      evaluator_model: runConfig.evaluator_model,
      threshold: runConfig.threshold,
    };
    console.log('Running evaluation with payload:', payload);
    evaluateMutation.mutate(payload);
  };

  const handleDeleteEvaluation = (evaluationId: string) => {
    if (window.confirm('Are you sure you want to delete this evaluation?')) {
      deleteMutation.mutate(evaluationId);
    }
  };

  const handleViewDetails = (evaluationId: string) => {
    setSelectedEvaluationId(evaluationId);
    setOpenDetailDialog(true);
  };

  const handleOpenRunDialog = () => {
    setRunConfig({
      ...runConfig,
      survey_id: selectedSurveyId || (surveys?.[0]?.id || ''),
    });
    setOpenRunDialog(true);
  };

  const handleMetricToggle = (metric: string) => {
    setRunConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric],
    }));
  };

  const handleToggleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedEvaluationsForCompare([]);
  };

  const handleSelectEvaluationForCompare = (evaluationId: string) => {
    setSelectedEvaluationsForCompare(prev =>
      prev.includes(evaluationId)
        ? prev.filter(id => id !== evaluationId)
        : [...prev, evaluationId]
    );
  };

  const handleCompare = () => {
    if (selectedEvaluationsForCompare.length < 2) {
      alert('Please select at least 2 evaluations to compare');
      return;
    }
    compareMutation.mutate(selectedEvaluationsForCompare);
    setOpenCompareDialog(true);
  };

  const getScoreColor = (score: number, metricName?: string): string => {
    // For bias and hallucination, lower scores are better (inverted)
    const isInvertedMetric = metricName && ['bias', 'hallucination'].includes(metricName.toLowerCase());

    if (isInvertedMetric) {
      if (score <= 0.2) return 'success';
      if (score <= 0.4) return 'warning';
      return 'error';
    } else {
      if (score >= 0.8) return 'success';
      if (score >= 0.6) return 'warning';
      return 'error';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getMetricExplanation = (metricName: string): string => {
    const explanations: Record<string, string> = {
      'answerrelevancy': 'Measures how well the response addresses the specific question asked. Higher scores indicate responses that stay on topic and provide relevant information.',
      'bias': 'Detects potential biases in responses including gender, racial, political, or other stereotypes. Lower scores indicate more neutral, unbiased responses.',
      'hallucination': 'Identifies when the LLM generates information not grounded in the provided context. Lower scores indicate more factual, context-based responses.',
    };
    return explanations[metricName.toLowerCase()] || 'No description available';
  };

  const getScoreInterpretation = (score: number, metricName?: string): string => {
    // For bias and hallucination, lower scores are better
    const isInvertedMetric = metricName && ['bias', 'hallucination'].includes(metricName.toLowerCase());

    if (isInvertedMetric) {
      if (score <= 0.2) return 'Excellent - Minimal issues detected';
      if (score <= 0.4) return 'Good - Acceptable quality with minor issues';
      return 'Needs Improvement - Review and refine prompts or model settings';
    } else {
      if (score >= 0.8) return 'Excellent - High quality response';
      if (score >= 0.6) return 'Good - Acceptable quality with room for improvement';
      return 'Needs Improvement - Review and refine prompts or model settings';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        title="Evaluation Dashboard"
        subtitle="Monitor and evaluate LLM response quality using DeepEval metrics"
        icon={<AssessmentIcon />}
      />

      {/* How It Works Section */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          How LLM Evaluation Works
        </Typography>
        <Typography variant="body2">
          DeepEval uses an "LLM-as-a-Judge" approach where a powerful evaluator model (like GPT-4)
          assesses the quality of responses from your survey LLMs. Each response is scored on multiple
          metrics including relevancy, bias, and hallucination. Scores range from 0 to 1 (0-100%),
          with higher scores indicating better quality. This helps you identify issues, compare model
          versions, and ensure consistent response quality across your surveys.
        </Typography>
      </Alert>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Survey</InputLabel>
              <Select
                value={selectedSurveyId}
                onChange={(e: SelectChangeEvent) => setSelectedSurveyId(e.target.value)}
                label="Filter by Survey"
              >
                <MenuItem value="">All Surveys</MenuItem>
                {surveys?.map((survey) => (
                  <MenuItem key={survey.id} value={survey.id}>
                    {survey.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetchEvaluations()}
            >
              Refresh
            </Button>
            {compareMode ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handleToggleCompareMode}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CompareIcon />}
                  onClick={handleCompare}
                  disabled={selectedEvaluationsForCompare.length < 2}
                >
                  Compare ({selectedEvaluationsForCompare.length})
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CompareIcon />}
                  onClick={handleToggleCompareMode}
                  disabled={evaluations.length < 2}
                >
                  Compare Evaluations
                </Button>
                <Tooltip
                  title={!hasSurveyRuns ? "You need to run a survey first before evaluating responses" : ""}
                  arrow
                >
                  <span>
                    <Button
                      variant="contained"
                      startIcon={<PlayIcon />}
                      onClick={handleOpenRunDialog}
                      disabled={!canRunEvaluation}
                    >
                      Run New Evaluation
                    </Button>
                  </span>
                </Tooltip>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Compare Mode Alert */}
      {compareMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Select 2 or more evaluations to compare. Click on evaluation cards to select them.
          </Typography>
        </Alert>
      )}

      {/* Evaluations List */}
      {loadingEvaluations ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : evaluations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No evaluations found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {!hasSurveyRuns
              ? "You need to run a survey first before you can evaluate responses"
              : "Run your first evaluation to start monitoring LLM response quality"}
          </Typography>
          <Tooltip
            title={!hasSurveyRuns ? "You need to run a survey first before evaluating responses" : ""}
            arrow
          >
            <span>
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleOpenRunDialog}
                disabled={!canRunEvaluation}
              >
                Run New Evaluation
              </Button>
            </span>
          </Tooltip>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {evaluations.map((evaluation) => {
            const isSelected = selectedEvaluationsForCompare.includes(evaluation.evaluation_id);
            return (
            <Grid item xs={12} md={6} lg={4} key={evaluation.evaluation_id}>
              <Card
                onClick={() => compareMode && handleSelectEvaluationForCompare(evaluation.evaluation_id)}
                sx={{
                  cursor: compareMode ? 'pointer' : 'default',
                  border: isSelected ? 2 : 0,
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  bgcolor: isSelected ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': compareMode ? {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  } : {},
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {evaluation.survey_id}
                    </Typography>
                    <Chip
                      label={evaluation.success ? 'Success' : 'Failed'}
                      color={evaluation.success ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    Run: {evaluation.run_id || 'N/A'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formatTimestamp(evaluation.timestamp)}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    {evaluation.evaluated_responses} responses evaluated
                  </Typography>
                </CardContent>
                <CardActions>
                  {!compareMode && (
                    <>
                      <Button
                        size="small"
                        onClick={() => handleViewDetails(evaluation.evaluation_id)}
                      >
                        View Details
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteEvaluation(evaluation.evaluation_id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                  {compareMode && isSelected && (
                    <Chip label="Selected" color="primary" size="small" />
                  )}
                </CardActions>
              </Card>
            </Grid>
            );
          })}
        </Grid>
      )}

      {/* Run Evaluation Dialog */}
      <Dialog open={openRunDialog} onClose={() => setOpenRunDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Run New Evaluation
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Evaluate your LLM survey responses for quality, bias, and accuracy
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {evaluateMutation.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {evaluateMutation.error.message}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Survey</InputLabel>
                  <Select
                    value={runConfig.survey_id}
                    onChange={(e: SelectChangeEvent) => setRunConfig({ ...runConfig, survey_id: e.target.value, run_id: '' })}
                    label="Survey"
                  >
                    {surveys?.map((survey) => (
                      <MenuItem key={survey.id} value={survey.id}>
                        {survey.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Survey Run (optional)</InputLabel>
                  <Select
                    value={runConfig.run_id}
                    onChange={(e: SelectChangeEvent) => setRunConfig({ ...runConfig, run_id: e.target.value })}
                    label="Survey Run (optional)"
                  >
                    <MenuItem value="">Latest Run</MenuItem>
                    {surveyRuns?.map((run) => (
                      <MenuItem key={run.run_id} value={run.run_id}>
                        {run.run_id} - {new Date(run.timestamp).toLocaleString()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Sample Size"
                    value={runConfig.sample_size}
                    onChange={(e) => setRunConfig({ ...runConfig, sample_size: parseInt(e.target.value) || 10 })}
                    helperText="Number of responses to evaluate. Smaller samples are faster but less comprehensive."
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                  <Tooltip title="Evaluating responses costs API credits. For large surveys, start with a small sample (10-50) to test, then increase for comprehensive analysis. DeepEval calls the evaluator model for each response.">
                    <InfoIcon sx={{ color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2">
                    Evaluation Metrics
                  </Typography>
                  <Tooltip title="Select one or more metrics to evaluate. Each metric measures a different aspect of response quality. Running multiple metrics provides a more comprehensive quality assessment.">
                    <InfoIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Box>
                <FormGroup>
                  {EVALUATION_METRICS.map((metric) => (
                    <FormControlLabel
                      key={metric.value}
                      control={
                        <Checkbox
                          checked={runConfig.metrics.includes(metric.value)}
                          onChange={() => handleMetricToggle(metric.value)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">{metric.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {metric.description}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <FormControl fullWidth disabled={enabledProviders.length === 0}>
                    <InputLabel>Evaluator Model</InputLabel>
                    <Select
                      value={runConfig.evaluator_model}
                      onChange={(e: SelectChangeEvent) => setRunConfig({ ...runConfig, evaluator_model: e.target.value })}
                      label="Evaluator Model"
                    >
                      {enabledOpenAIModels.length > 0 && <MenuItem disabled>OpenAI</MenuItem>}
                      {enabledOpenAIModels.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))}
                      {enabledAnthropicModels.length > 0 && <MenuItem disabled>Anthropic</MenuItem>}
                      {enabledAnthropicModels.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))}
                      {enabledProviders.length === 0 && (
                        <MenuItem disabled>No providers enabled - check Settings</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  <Tooltip title="The LLM model used to evaluate responses. GPT-4o Mini offers the best balance of cost and quality. More powerful models like GPT-4o may provide more nuanced evaluations but cost more.">
                    <InfoIcon sx={{ color: 'text.secondary', cursor: 'help', mt: 1 }} />
                  </Tooltip>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Success Threshold"
                    value={runConfig.threshold}
                    onChange={(e) => setRunConfig({ ...runConfig, threshold: parseFloat(e.target.value) || 0.5 })}
                    helperText="Minimum score to consider successful (0-1)"
                    InputProps={{ inputProps: { min: 0, max: 1, step: 0.1 } }}
                  />
                  <Tooltip title="Responses scoring above this threshold are considered successful. Default 0.5 means responses must score at least 50% to pass. Adjust based on your quality standards.">
                    <InfoIcon sx={{ color: 'text.secondary', cursor: 'help', mt: 1 }} />
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ flexGrow: 1, pl: 2 }}>
            {!runConfig.survey_id && (
              <Typography variant="caption" color="error">Please select a survey</Typography>
            )}
            {runConfig.survey_id && runConfig.metrics.length === 0 && (
              <Typography variant="caption" color="error">Please select at least one metric</Typography>
            )}
          </Box>
          <Button onClick={() => setOpenRunDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRunEvaluation}
            disabled={!runConfig.survey_id || runConfig.metrics.length === 0 || evaluateMutation.isPending}
            startIcon={evaluateMutation.isPending ? <CircularProgress size={20} /> : <PlayIcon />}
          >
            {evaluateMutation.isPending ? 'Evaluating...' : 'Run Evaluation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Evaluation Details Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Evaluation Details
          {selectedEvaluation && (
            <Typography variant="caption" display="block" color="text.secondary">
              {selectedEvaluation.survey_id} - {formatTimestamp(selectedEvaluation.timestamp)}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {loadingEvaluation ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedEvaluation ? (
            <Box sx={{ pt: 2 }}>
              {/* Summary */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Responses
                      </Typography>
                      <Tooltip title="Total number of responses in the survey run">
                        <InfoIcon sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                    <Typography variant="h6">{selectedEvaluation.total_responses}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Evaluated
                      </Typography>
                      <Tooltip title="Number of responses sampled for evaluation (based on sample size setting)">
                        <InfoIcon sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                    <Typography variant="h6">{selectedEvaluation.evaluated_responses}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Successful
                      </Typography>
                      <Tooltip title="Number of evaluations that completed without errors. Failed evaluations may indicate API issues or malformed responses.">
                        <InfoIcon sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                    <Typography variant="h6">{selectedEvaluation.successful_evaluations}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Survey Run
                      </Typography>
                      <Tooltip title="The survey run ID that was evaluated. Shows 'N/A' for evaluations created before run tracking was implemented.">
                        <InfoIcon sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {selectedEvaluation.run_id || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Metric Scores */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">
                  Metric Scores
                </Typography>
                <Tooltip title="Average scores for each evaluation metric across all sampled responses. Higher scores generally indicate better quality, though interpretation varies by metric.">
                  <InfoIcon sx={{ fontSize: 20, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {Object.entries(selectedEvaluation.aggregated_scores).map(([metricName, scores]) => (
                  <Grid item xs={12} md={4} key={metricName}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                          {metricName.replace(/_/g, ' ')}
                        </Typography>
                        <Tooltip title={getMetricExplanation(metricName)}>
                          <InfoIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={scores.mean * 100}
                          color={getScoreColor(scores.mean, metricName) as any}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {(scores.mean * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Min: {(scores.min * 100).toFixed(1)}% | Max: {(scores.max * 100).toFixed(1)}% | Count: {scores.count}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                        {getScoreInterpretation(scores.mean, metricName)}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Configuration */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Configuration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Evaluator Model
                      </Typography>
                      <Typography variant="body1">{selectedEvaluation.config.evaluator_model}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Threshold
                      </Typography>
                      <Typography variant="body1">{selectedEvaluation.config.threshold}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Metrics
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                        {selectedEvaluation.config.metrics.map((metric) => (
                          <Chip key={metric} label={metric} size="small" />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Individual Evaluations */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">Individual Evaluations ({selectedEvaluation.individual_evaluations.length})</Typography>
                    <Tooltip title="Detailed results for each evaluated response, including per-metric scores and AI-generated reasoning">
                      <InfoIcon sx={{ fontSize: 20, color: 'text.secondary', cursor: 'help' }} />
                    </Tooltip>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedEvaluation.individual_evaluations.map((evalResult, idx) => (
                      <Paper key={idx} sx={{ p: 2 }} variant="outlined">
                        <Grid container spacing={2}>
                          {/* Header Row */}
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Question: <strong>{evalResult.question_id}</strong> | Respondent: <strong>{evalResult.respondent_id}</strong>
                                </Typography>
                              </Box>
                              <Chip
                                label={evalResult.success ? 'Success' : 'Failed'}
                                color={evalResult.success ? 'success' : 'error'}
                                size="small"
                              />
                            </Box>
                          </Grid>

                          {/* Metric Scores with Reasoning */}
                          <Grid item xs={12}>
                            {evalResult.scores && Object.entries(evalResult.scores).map(([metricName, metricData]: [string, any]) => (
                              <Box key={metricName} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="body2" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                                    {metricName.replace(/_/g, ' ')}
                                  </Typography>
                                  <Chip
                                    label={`${(metricData.score * 100).toFixed(1)}%`}
                                    size="small"
                                    color={getScoreColor(metricData.score, metricName) as any}
                                  />
                                </Box>
                                {metricData.reason && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                                    {metricData.reason}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : (
            <Alert severity="error">Failed to load evaluation details</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog
        open={openCompareDialog}
        onClose={() => setOpenCompareDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Evaluation Comparison
          <Typography variant="caption" display="block" color="text.secondary">
            Comparing {selectedEvaluationsForCompare.length} evaluations
          </Typography>
        </DialogTitle>
        <DialogContent>
          {compareMutation.isPending ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : compareMutation.data ? (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Comparing {compareMutation.data.num_evaluations} evaluations across {Object.keys(compareMutation.data.model_averages || {}).length} models and {Object.keys(compareMutation.data.survey_averages || {}).length} surveys.
                  Use this to identify which models perform best for specific use cases.
                </Typography>
              </Alert>

              {/* Model Leaderboard */}
              {compareMutation.data.model_averages && Object.keys(compareMutation.data.model_averages).length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Model Leaderboard
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Average performance across all evaluations
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Rank</TableCell>
                          <TableCell>Model</TableCell>
                          {Object.keys(Object.values(compareMutation.data.model_averages)[0] || {}).map(metricName => (
                            <TableCell key={metricName} align="right" sx={{ textTransform: 'capitalize' }}>
                              {metricName.replace(/_/g, ' ')}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(compareMutation.data.model_averages)
                          .sort(([, aMetrics]: [string, any], [, bMetrics]: [string, any]) => {
                            // Sort by average of all metrics (for simplicity)
                            const aAvg = Object.values(aMetrics).reduce((sum: number, m: any) => sum + m.mean, 0) / Object.keys(aMetrics).length;
                            const bAvg = Object.values(bMetrics).reduce((sum: number, m: any) => sum + m.mean, 0) / Object.keys(bMetrics).length;
                            return bAvg - aAvg;
                          })
                          .map(([model, metrics]: [string, any], idx: number) => (
                            <TableRow key={model}>
                              <TableCell>
                                <Chip
                                  label={`#${idx + 1}`}
                                  size="small"
                                  color={idx === 0 ? 'primary' : 'default'}
                                  sx={{ fontWeight: 'bold' }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: idx === 0 ? 600 : 400 }}>
                                {model}
                              </TableCell>
                              {Object.entries(metrics).map(([metricName, metricData]: [string, any]) => (
                                <TableCell key={metricName} align="right">
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={metricData.mean * 100}
                                      color={getScoreColor(metricData.mean, metricName) as any}
                                      sx={{ width: 80, height: 6, borderRadius: 1 }}
                                    />
                                    <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 50 }}>
                                      {(metricData.mean * 100).toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 30 }}>
                                      (n={metricData.count})
                                    </Typography>
                                  </Box>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Survey Performance Breakdown */}
              {compareMutation.data.survey_averages && Object.keys(compareMutation.data.survey_averages).length > 1 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Survey-Specific Performance
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Average scores by survey type
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Survey ID</TableCell>
                          {Object.keys(Object.values(compareMutation.data.survey_averages)[0] || {}).map(metricName => (
                            <TableCell key={metricName} align="right" sx={{ textTransform: 'capitalize' }}>
                              {metricName.replace(/_/g, ' ')}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(compareMutation.data.survey_averages).map(([surveyId, metrics]: [string, any]) => (
                          <TableRow key={surveyId}>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                              {surveyId}
                            </TableCell>
                            {Object.entries(metrics).map(([metricName, metricData]: [string, any]) => (
                              <TableCell key={metricName} align="right">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={metricData.mean * 100}
                                    color={getScoreColor(metricData.mean, metricName) as any}
                                    sx={{ width: 80, height: 6, borderRadius: 1 }}
                                  />
                                  <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 50 }}>
                                    {(metricData.mean * 100).toFixed(1)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Time-Series Trends */}
              {Object.entries(compareMutation.data.metrics || {}).map(([metricName, metricDataArray]: [string, any]) => {
                // Prepare data for chart
                const chartData = metricDataArray
                  .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map((data: any, idx: number) => ({
                    index: idx + 1,
                    timestamp: new Date(data.timestamp).toLocaleDateString(),
                    timeDetail: new Date(data.timestamp).toLocaleString(),
                    score: Math.round(data.mean_score * 100),
                    model: data.model || 'Unknown',
                    survey_id: data.survey_id || 'N/A',
                    min_score: Math.round(data.min_score * 100),
                    max_score: Math.round(data.max_score * 100),
                  }));

                // Get unique models for color coding
                const uniqueModels = Array.from(new Set(chartData.map((d: any) => d.model))) as string[];
                const colors = ['#1976d2', '#dc004e', '#9c27b0', '#ff9800', '#4caf50', '#f44336'];

                return (
                  <Paper key={metricName} sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <TrendingUpIcon color="primary" />
                      <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                        {metricName.replace(/_/g, ' ')} - Trends Over Time
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {getMetricExplanation(metricName)}
                    </Typography>

                    {/* Chart */}
                    <Box sx={{ width: '100%', height: 400, mb: 3 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="index"
                            label={{ value: 'Evaluation #', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis
                            label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                            domain={[0, 100]}
                          />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <Paper sx={{ p: 2 }}>
                                    <Typography variant="caption" display="block" fontWeight="bold">
                                      Evaluation #{data.index}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                      {data.timeDetail}
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                      Model: {data.model}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                      Survey: {data.survey_id}
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }} fontWeight="bold">
                                      Score: {data.score}%
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                      Range: {data.min_score}-{data.max_score}%
                                    </Typography>
                                  </Paper>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          {uniqueModels.length === 1 ? (
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke={colors[0]}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              name={`${uniqueModels[0]} Score`}
                            />
                          ) : (
                            uniqueModels.map((model: string, idx: number) => (
                              <Line
                                key={`line-${model}-${idx}`}
                                type="monotone"
                                dataKey={(data: any) => data.model === model ? data.score : null}
                                stroke={colors[idx % colors.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                                name={`${model} Score`}
                                connectNulls
                              />
                            ))
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Summary Table */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2">View Detailed Data</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Survey ID</TableCell>
                                <TableCell>Model</TableCell>
                                <TableCell align="right">Score</TableCell>
                                <TableCell align="right">Range</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {chartData.map((data: any) => (
                                <TableRow key={data.index}>
                                  <TableCell>{data.index}</TableCell>
                                  <TableCell>{data.timeDetail}</TableCell>
                                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    {data.survey_id}
                                  </TableCell>
                                  <TableCell>{data.model}</TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" fontWeight="bold">
                                      {data.score}%
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="caption" color="text.secondary">
                                      {data.min_score}-{data.max_score}%
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                );
              })}
            </Box>
          ) : (
            <Alert severity="info">Select evaluations and click Compare to see results</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompareDialog(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EvaluationDashboardPage;
