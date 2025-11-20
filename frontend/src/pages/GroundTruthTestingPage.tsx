/**
 * Ground Truth Testing Page
 * Create ground truths, run experiments, and compare results
 * Redesigned with stepper workflow for better UX
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
} from '@mui/material';
import {
  Science as ScienceIcon,
  CloudUpload as CloudUploadIcon,
  Psychology as PsychologyIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  CompareArrows as CompareArrowsIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Casino as CasinoIcon,
} from '@mui/icons-material';
import DistributionCharts from '../components/DistributionCharts';
import DifferenceHeatmap from '../components/DifferenceHeatmap';
import {
  useSurveys,
  useSurvey,
  useGroundTruths,
  useGroundTruth,
  useDeleteGroundTruth,
  useCreateGroundTruthFromSSR,
  useRunSurvey,
  useSurveyRuns,
  useCompareToGroundTruth,
} from '../services/hooks';
import { CreateGroundTruthFromSSRRequest, RunSurveyRequest, LLM_PROVIDERS, OPENAI_MODELS, ANTHROPIC_MODELS, UploadGroundTruthCSVResponse } from '../services/types';
import { EmptyState } from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { uploadGroundTruthCSV, getErrorMessage } from '../services/api';

const GroundTruthTestingPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSurvey, setSelectedSurvey] = useState('');

  // Step 2 UI State
  const [expandedAccordion, setExpandedAccordion] = useState<string>('basic');
  const [showPreviousRuns, setShowPreviousRuns] = useState(false);

  // SSR Ground Truth Generation State
  const [ssrDialogOpen, setSSRDialogOpen] = useState(false);
  const [ssrConfig, setSSRConfig] = useState<CreateGroundTruthFromSSRRequest>({
    survey_id: '',
    name: '',
    description: '',
    num_profiles: 50,
    llm_provider: 'openai',
    model: 'gpt-4o-mini',
    llm_temperature: 0.7,
    ssr_temperature: 1.0,
    normalize_method: 'paper',
    seed: 42,
  });

  // Experiment Runner State
  const [selectedGroundTruth, setSelectedGroundTruth] = useState('');
  const [experimentConfig, setExperimentConfig] = useState<RunSurveyRequest>({
    survey_id: '',
    num_profiles: 50,
    llm_provider: 'openai',
    model: 'gpt-4o-mini',
    llm_temperature: 0.7,
    ssr_temperature: 1.0,
    normalize_method: 'paper',
    seed: Math.floor(Math.random() * 10000),
  });
  const [comparisonResults, setComparisonResults] = useState<any>(null);

  // Ground Truth View State
  const [viewingGroundTruthId, setViewingGroundTruthId] = useState<string | null>(null);

  // CSV Upload State
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: surveys } = useSurveys();
  const { data: survey } = useSurvey(selectedSurvey, { enabled: !!selectedSurvey });
  const { data: groundTruths, refetch: refetchGroundTruths } = useGroundTruths(selectedSurvey || undefined);
  const { data: surveyRuns, refetch: refetchSurveyRuns } = useSurveyRuns(selectedSurvey || undefined);
  const { data: viewingGroundTruth } = useGroundTruth(viewingGroundTruthId || '', {
    enabled: !!viewingGroundTruthId,
  });

  const createSSRMutation = useCreateGroundTruthFromSSR({
    onSuccess: () => {
      refetchGroundTruths();
      setSSRDialogOpen(false);
      // Reset form
      setSSRConfig({
        ...ssrConfig,
        name: '',
        description: '',
      });
    },
  });

  const deleteMutation = useDeleteGroundTruth({
    onSuccess: () => {
      refetchGroundTruths();
    },
  });

  const runSurveyMutation = useRunSurvey({
    onSuccess: (data) => {
      refetchSurveyRuns();
      // Automatically compare to ground truth
      if (selectedGroundTruth && data.run_id) {
        compareToGroundTruthMutation.mutate({
          runId: data.run_id,
          groundTruthId: selectedGroundTruth,
        });
      }
    },
  });

  const compareToGroundTruthMutation = useCompareToGroundTruth({
    onSuccess: (data) => {
      setComparisonResults(data);
      console.log('Comparison Results:', data);
      // Move to results step
      setActiveStep(2);
    },
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step: number) => {
    // Allow navigation to completed steps
    if (step === 0) {
      setActiveStep(step);
    } else if (step === 1 && selectedSurvey) {
      setActiveStep(step);
    } else if (step === 2 && comparisonResults) {
      setActiveStep(step);
    }
  };

  const handleOpenSSRDialog = () => {
    if (!selectedSurvey) {
      alert('Please select a survey first');
      return;
    }
    setSSRConfig({ ...ssrConfig, survey_id: selectedSurvey });
    setSSRDialogOpen(true);
  };

  const handleCreateSSRGroundTruth = () => {
    createSSRMutation.mutate(ssrConfig);
  };

  const handleDeleteGroundTruth = (gtId: string) => {
    if (window.confirm('Are you sure you want to delete this ground truth?')) {
      deleteMutation.mutate(gtId);
    }
  };

  const handleDownloadGroundTruth = async (gtId: string, gtName: string) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/ground-truths/${gtId}`);

      if (!response.ok) {
        throw new Error('Failed to download ground truth');
      }

      const data = await response.json();

      // Convert ground truth data to CSV format
      const csvRows: string[] = [];

      // Add metadata header
      csvRows.push('# Ground Truth Metadata');
      csvRows.push(`# ID: ${data.id}`);
      csvRows.push(`# Name: ${data.name}`);
      csvRows.push(`# Survey: ${data.survey_name}`);
      csvRows.push(`# Source: ${data.source}`);
      csvRows.push(`# Created: ${data.created_at}`);
      csvRows.push(`# Number of Profiles: ${data.num_profiles || 'N/A'}`);
      csvRows.push(`# Number of Responses: ${data.num_responses || 'N/A'}`);
      csvRows.push('');

      // Add aggregated distributions data
      csvRows.push('# Aggregated Distributions by Question');
      csvRows.push('Category,Question ID,Rating,Probability,Sample Size');

      for (const [category, questions] of Object.entries(data.aggregated_distributions || {})) {
        for (const [questionId, questionData] of Object.entries(questions as any)) {
          const probs = (questionData as any).mean_probabilities || [];
          const sampleSize = (questionData as any).sample_size || 0;

          probs.forEach((prob: number, idx: number) => {
            const rating = idx + 1;
            csvRows.push(`"${category}","${questionId}",${rating},${prob},${sampleSize}`);
          });
        }
      }

      csvRows.push('');
      csvRows.push('# Raw Individual Distributions');
      csvRows.push('Category,Question ID,Respondent ID,Rating,Probability,Mode,Expected Value,Entropy,Gender,Age Group,Persona Group,Occupation');

      // Add raw distributions data
      for (const [category, questions] of Object.entries(data.raw_distributions || {})) {
        for (const [questionId, respondents] of Object.entries(questions as any)) {
          for (const [respondentId, distData] of Object.entries(respondents as any)) {
            const dist = distData as any;
            const probs = dist.probabilities || [];

            probs.forEach((prob: number, idx: number) => {
              const rating = idx + 1;
              csvRows.push(
                `"${category}","${questionId}","${respondentId}",${rating},${prob},${dist.mode || ''},${dist.expected_value || ''},${dist.entropy || ''},"${dist.gender || ''}","${dist.age_group || ''}","${dist.persona_group || ''}","${dist.occupation || ''}"`
              );
            });
          }
        }
      }

      // Create CSV blob
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${gtName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${gtId}.csv`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading ground truth:', error);
      alert('Failed to download ground truth. Please try again.');
    }
  };

  const handleOpenUploadDialog = () => {
    if (!selectedSurvey) {
      alert('Please select a survey first');
      return;
    }
    setUploadDialogOpen(true);
    setUploadFile(null);
    setUploadName('');
    setUploadDescription('');
    setUploadError(null);
    setUploadPreview(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadError(null);
    }
  };

  const handleUploadCSV = async () => {
    if (!uploadFile || !selectedSurvey || !uploadName) {
      setUploadError('Please provide a file, name, and ensure a survey is selected');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const result: UploadGroundTruthCSVResponse = await uploadGroundTruthCSV(
        selectedSurvey,
        uploadName,
        uploadDescription,
        uploadFile,
        (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      );

      if (result.success) {
        setUploadPreview(result.preview);
        refetchGroundTruths();
        setUploadDialogOpen(false);
        // Reset form
        setUploadFile(null);
        setUploadName('');
        setUploadDescription('');
        setUploadProgress(0);
        alert(`Ground truth "${uploadName}" uploaded successfully!`);
      } else {
        setUploadError(result.errors?.map(e => e.message).join(', ') || 'Upload failed');
      }
    } catch (error) {
      setUploadError(getErrorMessage(error));
      console.error('CSV upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunExperiment = () => {
    if (!selectedGroundTruth) {
      alert('Please select a ground truth first');
      return;
    }
    // Set survey_id before running
    const configWithSurvey = { ...experimentConfig, survey_id: selectedSurvey };
    setExperimentConfig(configWithSurvey);
    runSurveyMutation.mutate(configWithSurvey);
  };

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : '');
  };

  const handleRandomizeSeed = () => {
    setExperimentConfig({
      ...experimentConfig,
      seed: Math.floor(Math.random() * 10000),
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getModelOptions = () => {
    return ssrConfig.llm_provider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS;
  };

  const getExperimentModelOptions = () => {
    return experimentConfig.llm_provider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS;
  };

  const formatMetric = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return value.toFixed(4);
  };

  const steps = [
    {
      label: 'Select Survey & Ground Truth',
      description: 'Choose a survey and create or select a ground truth baseline',
    },
    {
      label: 'Run Experiment',
      description: 'Configure and execute a survey run for comparison',
    },
    {
      label: 'View Results',
      description: 'Analyze comparison metrics and visualizations',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Ground Truth Experiments"
        subtitle="Validate synthetic data quality by comparing survey runs against ground truth baselines"
        icon={<ScienceIcon sx={{ fontSize: 28 }} />}
        badge={{ label: "Beta", color: "secondary" }}
      />

      {/* Workflow Stepper */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Select Survey & Ground Truth */}
          <Step>
            <StepLabel
              optional={selectedSurvey && groundTruths && groundTruths.length > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main">
                    Survey selected, {groundTruths.length} ground truth{groundTruths.length !== 1 ? 's' : ''} available
                  </Typography>
                </Box>
              ) : null}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleStepClick(0)}
            >
              <Typography variant="h6">{steps[0].label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {steps[0].description}
              </Typography>

              {/* Survey Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  1. Select Survey
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Survey</InputLabel>
                  <Select
                    value={selectedSurvey}
                    label="Survey"
                    onChange={(e) => setSelectedSurvey(e.target.value)}
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
                {survey && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>{survey.name}</strong> • {survey.questions.length} questions • Persona Groups: {survey.persona_groups.map(pg => pg.name).join(', ')}
                    </Typography>
                  </Alert>
                )}
              </Box>

              {selectedSurvey && (
                <>
                  <Divider sx={{ my: 3 }} />

                  {/* Ground Truth Management */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      2. Create or Select Ground Truth
                    </Typography>

                    {/* Existing Ground Truths */}
                    {groundTruths && groundTruths.length > 0 ? (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Available ground truths for this survey:
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Source</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Config</TableCell>
                                <TableCell align="right">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {groundTruths.map((gt) => (
                                <TableRow key={gt.id} hover>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                      {gt.name}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={gt.source === 'ssr_generated' ? 'SSR' : 'Uploaded'}
                                      size="small"
                                      color={gt.source === 'ssr_generated' ? 'primary' : 'default'}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatDate(gt.created_at)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {gt.source === 'ssr_generated' && gt.generation_config && (
                                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        <Chip label={gt.generation_config.model} size="small" variant="outlined" />
                                        <Chip label={`n=${gt.generation_config.num_profiles}`} size="small" variant="outlined" />
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => setViewingGroundTruthId(gt.id)}
                                      title="View Details"
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => handleDownloadGroundTruth(gt.id, gt.name)}
                                      title="Download"
                                    >
                                      <DownloadIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteGroundTruth(gt.id)}
                                      title="Delete"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ) : (
                      <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          No ground truths yet for this survey
                        </Typography>
                        <Typography variant="body2">
                          Create a ground truth baseline using the options below to enable experiments.
                        </Typography>
                      </Alert>
                    )}

                    {/* Create Ground Truth Options */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                              <PsychologyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                              <Typography variant="h6">Generate via SSR</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Run the full SSR pipeline using your survey's persona groups to create a high-quality baseline.
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<PsychologyIcon />}
                              onClick={handleOpenSSRDialog}
                            >
                              Generate Ground Truth
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                              <CloudUploadIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
                              <Typography variant="h6" color="text.secondary">Upload Data</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Upload ground truth from real survey results in CSV format with probability distributions.
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              variant="outlined"
                              fullWidth
                              startIcon={<CloudUploadIcon />}
                              onClick={handleOpenUploadDialog}
                            >
                              Upload CSV Data
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Navigation */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<NavigateNextIcon />}
                      disabled={!selectedSurvey || !groundTruths || groundTruths.length === 0}
                    >
                      Continue to Experiments
                    </Button>
                    {(!groundTruths || groundTruths.length === 0) && (
                      <Tooltip title="Create at least one ground truth to continue">
                        <span>
                          <Button disabled variant="outlined">Waiting for Ground Truth...</Button>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                </>
              )}
            </StepContent>
          </Step>

          {/* Step 2: Run Experiment */}
          <Step>
            <StepLabel
              optional={selectedGroundTruth ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main">
                    Ground truth selected, ready to run
                  </Typography>
                </Box>
              ) : null}
              sx={{ cursor: selectedSurvey ? 'pointer' : 'default' }}
              onClick={() => handleStepClick(1)}
            >
              <Typography variant="h6">{steps[1].label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {steps[1].description}
              </Typography>

              {/* Ground Truth Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Select Ground Truth for Comparison
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Ground Truth</InputLabel>
                  <Select
                    value={selectedGroundTruth}
                    label="Ground Truth"
                    onChange={(e) => setSelectedGroundTruth(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Select a ground truth...</em>
                    </MenuItem>
                    {groundTruths?.map((gt) => (
                      <MenuItem key={gt.id} value={gt.id}>
                        {gt.name} ({gt.source === 'ssr_generated' ? 'SSR' : 'Uploaded'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {selectedGroundTruth && (
                <>
                  {/* Inline Experiment Configuration */}
                  <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <PlayArrowIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">New Experiment Configuration</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Configure parameters and run the SSR pipeline
                        </Typography>
                      </Box>
                    </Box>

                    <Alert severity="info" sx={{ mb: 3 }}>
                      Comparing against: <strong>{groundTruths?.find(gt => gt.id === selectedGroundTruth)?.name}</strong>
                    </Alert>

                    {/* Basic Settings Accordion */}
                    <Accordion
                      expanded={expandedAccordion === 'basic'}
                      onChange={handleAccordionChange('basic')}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            Basic Settings
                          </Typography>
                          {expandedAccordion !== 'basic' && (
                            <Chip
                              label={`${experimentConfig.num_profiles} profiles, seed ${experimentConfig.seed}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Number of Profiles"
                              type="number"
                              fullWidth
                              value={experimentConfig.num_profiles}
                              onChange={(e) =>
                                setExperimentConfig({ ...experimentConfig, num_profiles: parseInt(e.target.value) })
                              }
                              inputProps={{ min: 10, max: 2000 }}
                              helperText="Recommended: 50-100 for testing"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <TextField
                                label="Random Seed"
                                type="number"
                                fullWidth
                                value={experimentConfig.seed}
                                onChange={(e) => setExperimentConfig({ ...experimentConfig, seed: parseInt(e.target.value) })}
                                inputProps={{ min: 0, max: 10000 }}
                                helperText="Different seed = different results"
                              />
                              <Tooltip title="Generate random seed">
                                <IconButton
                                  onClick={handleRandomizeSeed}
                                  sx={{ mt: 1 }}
                                  color="primary"
                                >
                                  <CasinoIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>

                    {/* LLM Configuration Accordion */}
                    <Accordion
                      expanded={expandedAccordion === 'llm'}
                      onChange={handleAccordionChange('llm')}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            LLM Configuration
                          </Typography>
                          {expandedAccordion !== 'llm' && (
                            <Chip
                              label={`${experimentConfig.llm_provider}: ${experimentConfig.model}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>LLM Provider</InputLabel>
                              <Select
                                value={experimentConfig.llm_provider}
                                label="LLM Provider"
                                onChange={(e) =>
                                  setExperimentConfig({
                                    ...experimentConfig,
                                    llm_provider: e.target.value as 'openai' | 'anthropic',
                                    model: e.target.value === 'openai' ? 'gpt-4o-mini' : 'claude-3-haiku-20240307',
                                  })
                                }
                              >
                                {LLM_PROVIDERS.map((provider) => (
                                  <MenuItem key={provider.value} value={provider.value}>
                                    {provider.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Model</InputLabel>
                              <Select
                                value={experimentConfig.model}
                                label="Model"
                                onChange={(e) => setExperimentConfig({ ...experimentConfig, model: e.target.value })}
                              >
                                {getExperimentModelOptions().map((model) => (
                                  <MenuItem key={model.value} value={model.value}>
                                    {model.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>

                    {/* Advanced Settings Accordion */}
                    <Accordion
                      expanded={expandedAccordion === 'advanced'}
                      onChange={handleAccordionChange('advanced')}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            Advanced Settings
                          </Typography>
                          {expandedAccordion !== 'advanced' && (
                            <Chip
                              label={`LLM temp: ${experimentConfig.llm_temperature}, SSR temp: ${experimentConfig.ssr_temperature}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="LLM Temperature"
                              type="number"
                              fullWidth
                              value={experimentConfig.llm_temperature}
                              onChange={(e) =>
                                setExperimentConfig({ ...experimentConfig, llm_temperature: parseFloat(e.target.value) })
                              }
                              inputProps={{ min: 0, max: 2, step: 0.1 }}
                              helperText="Controls response randomness (0-2)"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="SSR Temperature"
                              type="number"
                              fullWidth
                              value={experimentConfig.ssr_temperature}
                              onChange={(e) =>
                                setExperimentConfig({ ...experimentConfig, ssr_temperature: parseFloat(e.target.value) })
                              }
                              inputProps={{ min: 0.1, max: 5, step: 0.1 }}
                              helperText="Rating distribution temperature (0.1-5)"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>

                    {/* Run Button */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrowIcon />}
                        onClick={handleRunExperiment}
                        disabled={runSurveyMutation.isPending || compareToGroundTruthMutation.isPending}
                        sx={{ px: 6 }}
                      >
                        {runSurveyMutation.isPending
                          ? 'Running Experiment...'
                          : 'Run Experiment (Est. 3-5 min)'}
                      </Button>
                    </Box>

                    {/* Progress Indicator */}
                    {(runSurveyMutation.isPending || compareToGroundTruthMutation.isPending) && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress />
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                          {runSurveyMutation.isPending
                            ? 'Running SSR pipeline... This may take several minutes.'
                            : 'Comparing results to ground truth...'}
                        </Typography>
                      </Box>
                    )}

                    {/* Error Display */}
                    {runSurveyMutation.isError && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Error running experiment
                        </Typography>
                        <Typography variant="body2">
                          {(() => {
                            const error = runSurveyMutation.error as any;
                            if (error?.response?.data?.detail) {
                              return typeof error.response.data.detail === 'string'
                                ? error.response.data.detail
                                : JSON.stringify(error.response.data.detail, null, 2);
                            }
                            return error?.message || 'Please try again.';
                          })()}
                        </Typography>
                      </Alert>
                    )}
                  </Paper>

                  {/* Divider */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
                    <Divider sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                    <Divider sx={{ flexGrow: 1 }} />
                  </Box>

                  {/* Collapsible Previous Runs Section */}
                  {surveyRuns && surveyRuns.length > 0 && (
                    <Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => setShowPreviousRuns(!showPreviousRuns)}
                        endIcon={showPreviousRuns ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{ mb: showPreviousRuns ? 2 : 0 }}
                      >
                        {showPreviousRuns ? 'Hide' : 'Compare'} Previous Run ({surveyRuns.length} available)
                      </Button>

                      <Collapse in={showPreviousRuns}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Select a previous experiment run to compare against the selected ground truth:
                          </Typography>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Run ID</TableCell>
                                  <TableCell>Timestamp</TableCell>
                                  <TableCell>Model</TableCell>
                                  <TableCell>Profiles</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {surveyRuns.slice(0, 5).map((run) => (
                                  <TableRow key={run.run_id} hover>
                                    <TableCell>
                                      <Typography variant="body2" fontFamily="monospace" fontSize="0.7rem">
                                        {run.run_id}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                                        {formatDate(run.timestamp)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip label={run.config.model} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                      <Chip label={`n=${run.num_profiles}`} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Button
                                        size="small"
                                        startIcon={<CompareArrowsIcon />}
                                        onClick={() =>
                                          compareToGroundTruthMutation.mutate({
                                            runId: run.run_id,
                                            groundTruthId: selectedGroundTruth,
                                          })
                                        }
                                        disabled={compareToGroundTruthMutation.isPending}
                                      >
                                        Compare
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Paper>
                      </Collapse>
                    </Box>
                  )}
                </>
              )}

              {/* Navigation */}
              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <Button
                  onClick={handleBack}
                  startIcon={<NavigateBeforeIcon />}
                >
                  Back
                </Button>
                {compareToGroundTruthMutation.isPending && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Comparing to ground truth...
                    </Typography>
                  </Box>
                )}
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: View Results */}
          <Step>
            <StepLabel
              sx={{ cursor: comparisonResults ? 'pointer' : 'default' }}
              onClick={() => handleStepClick(2)}
            >
              <Typography variant="h6">{steps[2].label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {steps[2].description}
              </Typography>

              {!comparisonResults ? (
                <EmptyState
                  icon={<CompareArrowsIcon />}
                  title="No results yet"
                  description="Run an experiment in Step 2 to see comparison metrics and visualizations here."
                  compact
                />
              ) : (
                <Box>
                  {/* Header Information */}
                  <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
                    <Typography variant="h6" gutterBottom>
                      Comparison Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">
                          Run ID
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {comparisonResults.run_id}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">
                          Ground Truth
                        </Typography>
                        <Typography variant="body2">
                          {groundTruths?.find(gt => gt.id === comparisonResults.ground_truth_id)?.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">
                          Survey
                        </Typography>
                        <Typography variant="body2">{survey?.name}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Overall Metrics */}
                  <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
                    <Typography variant="h6" gutterBottom>
                      Overall Metrics
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Mean KL Divergence
                            </Typography>
                            <Typography variant="h5">
                              {formatMetric(comparisonResults.comparison.overall_metrics.mean_kl_divergence)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ± {formatMetric(comparisonResults.comparison.overall_metrics.std_kl_divergence)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Mean JS Divergence
                            </Typography>
                            <Typography variant="h5">
                              {formatMetric(comparisonResults.comparison.overall_metrics.mean_js_divergence)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ± {formatMetric(comparisonResults.comparison.overall_metrics.std_js_divergence)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Mean Wasserstein
                            </Typography>
                            <Typography variant="h5">
                              {formatMetric(comparisonResults.comparison.overall_metrics.mean_wasserstein)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ± {formatMetric(comparisonResults.comparison.overall_metrics.std_wasserstein)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Mean Absolute Error
                            </Typography>
                            <Typography variant="h5">
                              {formatMetric(comparisonResults.comparison.overall_metrics.mean_mae)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ± {formatMetric(comparisonResults.comparison.overall_metrics.std_mae)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Alert severity="info">
                          Compared {comparisonResults.comparison.overall_metrics.num_questions_compared} questions.
                          Lower values indicate better similarity to ground truth.
                        </Alert>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* By Category Metrics */}
                  {Object.keys(comparisonResults.comparison.by_category || {}).length > 0 && (
                    <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
                      <Typography variant="h6" gutterBottom>
                        Metrics by Category
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">KL Divergence</TableCell>
                              <TableCell align="right">JS Divergence</TableCell>
                              <TableCell align="right">Wasserstein</TableCell>
                              <TableCell align="right">MAE</TableCell>
                              <TableCell align="right">Questions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(comparisonResults.comparison.by_category).map(([category, metrics]: [string, any]) => (
                              <TableRow key={category}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">
                                    {category}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">{formatMetric(metrics.mean_kl_divergence)}</TableCell>
                                <TableCell align="right">{formatMetric(metrics.mean_js_divergence)}</TableCell>
                                <TableCell align="right">{formatMetric(metrics.mean_wasserstein)}</TableCell>
                                <TableCell align="right">{formatMetric(metrics.mean_mae)}</TableCell>
                                <TableCell align="right">
                                  <Chip label={metrics.num_questions} size="small" />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  )}

                  {/* By Question Metrics */}
                  {Object.keys(comparisonResults.comparison.by_question || {}).length > 0 && (
                    <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
                      <Typography variant="h6" gutterBottom>
                        Metrics by Question
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Question</TableCell>
                              <TableCell align="right">KL Div</TableCell>
                              <TableCell align="right">JS Div</TableCell>
                              <TableCell align="right">Wasserstein</TableCell>
                              <TableCell align="right">Chi²</TableCell>
                              <TableCell align="right">P-Value</TableCell>
                              <TableCell align="right">MAE</TableCell>
                              <TableCell align="center">Significant?</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(comparisonResults.comparison.by_question).map(([questionKey, metrics]: [string, any]) => (
                              <TableRow key={questionKey}>
                                <TableCell>
                                  <Typography variant="body2" fontFamily="monospace" fontSize="0.7rem">
                                    {questionKey}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">{formatMetric(metrics.kl_divergence)}</TableCell>
                                <TableCell align="right">{formatMetric(metrics.js_divergence)}</TableCell>
                                <TableCell align="right">{formatMetric(metrics.wasserstein_distance)}</TableCell>
                                <TableCell align="right">{formatMetric(metrics.chi_squared)}</TableCell>
                                <TableCell align="right">{formatMetric(metrics.chi_squared_p_value)}</TableCell>
                                <TableCell align="right">{formatMetric(metrics.mean_absolute_error)}</TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={metrics.significant_difference ? 'Yes' : 'No'}
                                    color={metrics.significant_difference ? 'warning' : 'success'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Statistical significance (p &lt; 0.05) indicates distributions are different. "No" means statistically similar to ground truth (good!).
                      </Alert>
                    </Paper>
                  )}

                  {/* Distribution Charts */}
                  <Box sx={{ mb: 3 }}>
                    <DistributionCharts
                      testRunDistributions={comparisonResults.test_run_distributions}
                      groundTruthDistributions={comparisonResults.ground_truth_distributions}
                      survey={survey}
                    />
                  </Box>

                  {/* Difference Heatmap */}
                  <Box sx={{ mb: 3 }}>
                    <DifferenceHeatmap
                      testRunDistributions={comparisonResults.test_run_distributions}
                      groundTruthDistributions={comparisonResults.ground_truth_distributions}
                      survey={survey}
                    />
                  </Box>

                  {/* Interpretation Guide */}
                  <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      How to Interpret Results
                    </Typography>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="primary.main">
                          Reading the Charts
                        </Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Orange bars:</strong> Ground truth baseline
                          </Typography>
                          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Blue line:</strong> Experimental run
                          </Typography>
                          <Typography component="li" variant="body2">
                            <strong>Good match:</strong> Blue closely follows orange
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="primary.main">
                          Understanding Metrics
                        </Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                            <strong>KL/JS/Wasserstein:</strong> Lower = more similar (0 = identical)
                          </Typography>
                          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                            <strong>P-value ≥ 0.05:</strong> Statistically similar (good!)
                          </Typography>
                          <Typography component="li" variant="body2">
                            <strong>MAE:</strong> Average probability difference (lower is better)
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

              {/* Navigation */}
              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <Button
                  onClick={handleBack}
                  startIcon={<NavigateBeforeIcon />}
                >
                  Back to Experiments
                </Button>
                {comparisonResults && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setComparisonResults(null);
                      setActiveStep(1);
                    }}
                  >
                    Run Another Comparison
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>

      {/* SSR Ground Truth Creation Dialog */}
      <Dialog open={ssrDialogOpen} onClose={() => setSSRDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Ground Truth via SSR Pipeline</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              This will run the full SSR pipeline using your survey's persona groups to generate a
              high-quality ground truth baseline. Higher profile counts produce better results but take longer.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Ground Truth Name"
                  fullWidth
                  required
                  value={ssrConfig.name}
                  onChange={(e) => setSSRConfig({ ...ssrConfig, name: e.target.value })}
                  placeholder="e.g., GPT-4 Baseline n=500"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={ssrConfig.description}
                  onChange={(e) => setSSRConfig({ ...ssrConfig, description: e.target.value })}
                  placeholder="Optional: Describe this ground truth"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Configuration
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Number of Profiles"
                  type="number"
                  fullWidth
                  required
                  value={ssrConfig.num_profiles}
                  onChange={(e) =>
                    setSSRConfig({ ...ssrConfig, num_profiles: parseInt(e.target.value) })
                  }
                  inputProps={{ min: 10, max: 2000 }}
                  helperText="Recommended: 50-100 for testing, 500+ for production"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Random Seed"
                  type="number"
                  fullWidth
                  required
                  value={ssrConfig.seed}
                  onChange={(e) => setSSRConfig({ ...ssrConfig, seed: parseInt(e.target.value) })}
                  inputProps={{ min: 0, max: 10000 }}
                  helperText="For reproducibility"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>LLM Provider</InputLabel>
                  <Select
                    value={ssrConfig.llm_provider}
                    label="LLM Provider"
                    onChange={(e) =>
                      setSSRConfig({
                        ...ssrConfig,
                        llm_provider: e.target.value as 'openai' | 'anthropic',
                        model: e.target.value === 'openai' ? 'gpt-4o-mini' : 'claude-3-haiku-20240307',
                      })
                    }
                  >
                    {LLM_PROVIDERS.map((provider) => (
                      <MenuItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={ssrConfig.model}
                    label="Model"
                    onChange={(e) => setSSRConfig({ ...ssrConfig, model: e.target.value })}
                  >
                    {getModelOptions().map((model) => (
                      <MenuItem key={model.value} value={model.value}>
                        {model.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="LLM Temperature"
                  type="number"
                  fullWidth
                  required
                  value={ssrConfig.llm_temperature}
                  onChange={(e) =>
                    setSSRConfig({ ...ssrConfig, llm_temperature: parseFloat(e.target.value) })
                  }
                  inputProps={{ min: 0, max: 2, step: 0.1 }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="SSR Temperature"
                  type="number"
                  fullWidth
                  required
                  value={ssrConfig.ssr_temperature}
                  onChange={(e) =>
                    setSSRConfig({ ...ssrConfig, ssr_temperature: parseFloat(e.target.value) })
                  }
                  inputProps={{ min: 0.1, max: 5, step: 0.1 }}
                />
              </Grid>
            </Grid>

            {createSSRMutation.isPending && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Generating ground truth... This may take several minutes.
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {createSSRMutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom fontWeight="medium">
                  Error creating ground truth
                </Typography>
                <Typography variant="body2">
                  {(() => {
                    const error = createSSRMutation.error as any;
                    if (error?.response?.data?.detail) {
                      return typeof error.response.data.detail === 'string'
                        ? error.response.data.detail
                        : JSON.stringify(error.response.data.detail, null, 2);
                    }
                    return error?.message || 'Please check your configuration and try again.';
                  })()}
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSSRDialogOpen(false)} disabled={createSSRMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateSSRGroundTruth}
            variant="contained"
            disabled={!ssrConfig.name || createSSRMutation.isPending}
          >
            {createSSRMutation.isPending ? 'Generating...' : 'Generate Ground Truth'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Ground Truth from CSV</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Upload ground truth data from real survey results in CSV format. The file should contain probability distributions for each respondent and question.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Ground Truth Name"
                  fullWidth
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g., Real Survey Results Q1 2024"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Optional: Describe the source of this data"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  CSV File
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  sx={{ py: 2 }}
                >
                  {uploadFile ? uploadFile.name : 'Choose CSV File'}
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={handleFileSelect}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Expected format: Category, Question ID, Respondent ID, Rating, Probability
                </Typography>
              </Grid>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} sx={{ flexGrow: 1 }} />
                    <Typography variant="body2">{uploadProgress}%</Typography>
                  </Box>
                </Grid>
              )}

              {uploadError && (
                <Grid item xs={12}>
                  <Alert severity="error">
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      Upload Error
                    </Typography>
                    <Typography variant="body2">{uploadError}</Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUploadCSV}
            variant="contained"
            disabled={!uploadFile || !uploadName || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          >
            {isUploading ? 'Uploading...' : 'Upload Ground Truth'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ground Truth Details Dialog */}
      <Dialog
        open={!!viewingGroundTruthId}
        onClose={() => setViewingGroundTruthId(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ground Truth Details</DialogTitle>
        <DialogContent>
          {viewingGroundTruth ? (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {viewingGroundTruth.name}
                  </Typography>
                  {viewingGroundTruth.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {viewingGroundTruth.description}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Source
                  </Typography>
                  <Chip
                    label={viewingGroundTruth.source === 'ssr_generated' ? 'SSR Generated' : 'Uploaded'}
                    color={viewingGroundTruth.source === 'ssr_generated' ? 'primary' : 'default'}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">{formatDate(viewingGroundTruth.created_at)}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Profiles
                  </Typography>
                  <Typography variant="body2">{viewingGroundTruth.num_profiles}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Responses
                  </Typography>
                  <Typography variant="body2">{viewingGroundTruth.num_responses}</Typography>
                </Grid>

                {viewingGroundTruth.generation_config && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ mt: 2, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Generation Configuration
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Model
                      </Typography>
                      <Typography variant="body2">{viewingGroundTruth.generation_config.model}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Seed
                      </Typography>
                      <Typography variant="body2">{viewingGroundTruth.generation_config.seed}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingGroundTruthId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroundTruthTestingPage;
