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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import {
  useEvaluations,
  useEvaluation,
  useEvaluateResponses,
  useDeleteEvaluation,
  useSurveys,
  useSurveyRuns,
} from '../services/hooks';
import {
  EvaluationListItem,
  EVALUATION_METRICS,
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
  GEMINI_MODELS,
} from '../services/types';

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

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
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

  const getScoreInterpretation = (score: number): string => {
    if (score >= 0.8) return 'Excellent - High quality response';
    if (score >= 0.6) return 'Good - Acceptable quality with room for improvement';
    return 'Needs Improvement - Review and refine prompts or model settings';
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
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={handleOpenRunDialog}
                  disabled={!surveys || surveys.length === 0}
                >
                  Run New Evaluation
                </Button>
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
            Run your first evaluation to start monitoring LLM response quality
          </Typography>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={handleOpenRunDialog}
            disabled={!surveys || surveys.length === 0}
          >
            Run New Evaluation
          </Button>
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

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formatTimestamp(evaluation.timestamp)}
                  </Typography>

                  <Box sx={{ my: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Overall Score
                      </Typography>
                      <Tooltip title={getScoreInterpretation(evaluation.overall_score)}>
                        <InfoIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={evaluation.overall_score * 100}
                        color={getScoreColor(evaluation.overall_score) as any}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {(evaluation.overall_score * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
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
                  <FormControl fullWidth>
                    <InputLabel>Evaluator Model</InputLabel>
                    <Select
                      value={runConfig.evaluator_model}
                      onChange={(e: SelectChangeEvent) => setRunConfig({ ...runConfig, evaluator_model: e.target.value })}
                      label="Evaluator Model"
                    >
                      <MenuItem disabled>OpenAI</MenuItem>
                      {OPENAI_MODELS.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))}
                      <MenuItem disabled>Anthropic</MenuItem>
                      {ANTHROPIC_MODELS.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))}
                      <MenuItem disabled>Google Gemini</MenuItem>
                      {GEMINI_MODELS.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))}
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
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Overall Score
                      </Typography>
                      <Tooltip title="Average score across all metrics and evaluated responses">
                        <InfoIcon sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                    <Typography variant="h4" color={getScoreColor(selectedEvaluation.overall_mean_score)}>
                      {(selectedEvaluation.overall_mean_score * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
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
                          color={getScoreColor(scores.mean) as any}
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
                        {getScoreInterpretation(scores.mean)}
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

                          {/* Overall Score */}
                          <Grid item xs={12} md={3}>
                            <Typography variant="caption" color="text.secondary">
                              Overall Score
                            </Typography>
                            <Typography variant="h5" color={getScoreColor(evalResult.overall_score || 0)}>
                              {evalResult.overall_score !== undefined
                                ? `${(evalResult.overall_score * 100).toFixed(1)}%`
                                : 'N/A'}
                            </Typography>
                          </Grid>

                          {/* Metric Scores with Reasoning */}
                          <Grid item xs={12} md={9}>
                            {evalResult.scores && Object.entries(evalResult.scores).map(([metricName, metricData]: [string, any]) => (
                              <Box key={metricName} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="body2" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                                    {metricName.replace(/_/g, ' ')}
                                  </Typography>
                                  <Chip
                                    label={`${(metricData.score * 100).toFixed(1)}%`}
                                    size="small"
                                    color={getScoreColor(metricData.score) as any}
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
          <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
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
                  This comparison shows metric trends across {compareMutation.data.num_evaluations} evaluations.
                  Use this to track quality improvements over time or compare different model configurations.
                </Typography>
              </Alert>

              {/* Metrics Comparison */}
              {Object.entries(compareMutation.data.metrics || {}).map(([metricName, metricDataArray]: [string, any]) => (
                <Paper key={metricName} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {metricName.replace(/_/g, ' ')}
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Evaluation</TableCell>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Model</TableCell>
                          <TableCell align="right">Mean Score</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metricDataArray.map((data: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>#{idx + 1}</TableCell>
                            <TableCell>{data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}</TableCell>
                            <TableCell>{data.model || 'N/A'}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={data.mean_score * 100}
                                  color={getScoreColor(data.mean_score) as any}
                                  sx={{ width: 100, height: 6, borderRadius: 1 }}
                                />
                                <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 50 }}>
                                  {(data.mean_score * 100).toFixed(1)}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ))}
            </Box>
          ) : (
            <Alert severity="info">Select evaluations and click Compare to see results</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompareDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EvaluationDashboardPage;
