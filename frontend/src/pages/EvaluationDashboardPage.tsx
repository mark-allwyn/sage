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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadingSkeleton from '../components/LoadingSkeleton';
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
  const evaluateMutation = useEvaluateResponses({
    onSuccess: () => {
      setOpenRunDialog(false);
      refetchEvaluations();
    },
  });
  const deleteMutation = useDeleteEvaluation({
    onSuccess: () => {
      refetchEvaluations();
    },
  });

  const evaluations = evaluationsData?.evaluations || [];

  const handleRunEvaluation = () => {
    evaluateMutation.mutate({
      survey_id: runConfig.survey_id,
      run_id: runConfig.run_id || undefined,
      sample_size: runConfig.sample_size,
      metrics: runConfig.metrics,
      evaluator_model: runConfig.evaluator_model,
      threshold: runConfig.threshold,
    });
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

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        title="Evaluation Dashboard"
        subtitle="Monitor and evaluate LLM response quality using DeepEval metrics"
        icon={<AssessmentIcon />}
      />

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
          <Grid item xs={12} md={8} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetchEvaluations()}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleOpenRunDialog}
              disabled={!surveys || surveys.length === 0}
            >
              Run New Evaluation
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Evaluations List */}
      {loadingEvaluations ? (
        <LoadingSkeleton />
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
          {evaluations.map((evaluation) => (
            <Grid item xs={12} md={6} lg={4} key={evaluation.evaluation_id}>
              <Card>
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
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overall Score
                    </Typography>
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
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Run Evaluation Dialog */}
      <Dialog open={openRunDialog} onClose={() => setOpenRunDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Run New Evaluation</DialogTitle>
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
                <TextField
                  fullWidth
                  type="number"
                  label="Sample Size"
                  value={runConfig.sample_size}
                  onChange={(e) => setRunConfig({ ...runConfig, sample_size: parseInt(e.target.value) || 10 })}
                  helperText="Number of responses to evaluate (leave blank for 10% sample)"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Evaluation Metrics
                </Typography>
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
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Threshold"
                  value={runConfig.threshold}
                  onChange={(e) => setRunConfig({ ...runConfig, threshold: parseFloat(e.target.value) || 0.5 })}
                  helperText="Success threshold (0-1)"
                  InputProps={{ inputProps: { min: 0, max: 1, step: 0.1 } }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
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
                    <Typography variant="body2" color="text.secondary">
                      Overall Score
                    </Typography>
                    <Typography variant="h4" color={getScoreColor(selectedEvaluation.overall_mean_score)}>
                      {(selectedEvaluation.overall_mean_score * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Responses
                    </Typography>
                    <Typography variant="h6">{selectedEvaluation.total_responses}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Evaluated
                    </Typography>
                    <Typography variant="h6">{selectedEvaluation.evaluated_responses}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Successful
                    </Typography>
                    <Typography variant="h6">{selectedEvaluation.successful_evaluations}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Metric Scores */}
              <Typography variant="h6" gutterBottom>
                Metric Scores
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {Object.entries(selectedEvaluation.aggregated_scores).map(([metricName, scores]) => (
                  <Grid item xs={12} md={4} key={metricName}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ textTransform: 'capitalize' }}>
                        {metricName.replace(/_/g, ' ')}
                      </Typography>
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
                  <Typography variant="h6">Individual Evaluations ({selectedEvaluation.individual_evaluations.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Question ID</TableCell>
                          <TableCell>Respondent ID</TableCell>
                          <TableCell>Overall Score</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedEvaluation.individual_evaluations.map((evalResult, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{evalResult.question_id}</TableCell>
                            <TableCell>{evalResult.respondent_id}</TableCell>
                            <TableCell>
                              {evalResult.overall_score !== undefined
                                ? `${(evalResult.overall_score * 100).toFixed(1)}%`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={evalResult.success ? 'Success' : 'Failed'}
                                color={evalResult.success ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
    </Container>
  );
};

export default EvaluationDashboardPage;
