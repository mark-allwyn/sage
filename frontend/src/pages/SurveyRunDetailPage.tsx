/**
 * Survey Run Detail Page
 * Unified page with tabs for Overview, Analysis, Validation, and Exports
 */

import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  TextField,
  InputAdornment,
  Collapse,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  CompareArrows as CompareArrowsIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  Security as SecurityIcon,
  GetApp as GetAppIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Psychology as PsychologyIcon,
  CloudUpload as CloudUploadIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import {
  useSurveyRun,
  useSurvey,
  useGroundTruths,
  useCompareToGroundTruth,
} from '../services/hooks';
import { useQuery } from '@tanstack/react-query';
import { getAnalysisSummary, getComparisonHistory, getComparison, deleteComparison } from '../services/api';
import ResponseDataset from '../components/SurveyRunner/ResponseDataset';
import ComparisonResults from '../components/ComparisonResults';
import ExecutiveSummaryPanel from '../components/Analysis/ExecutiveSummaryPanel';
import AnalysisProgressIndicator from '../components/AnalysisProgressIndicator';
import { exportSurveyRunToCSV, exportComparisonToCSV } from '../utils/csvExport';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`run-tabpanel-${index}`}
      aria-labelledby={`run-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SurveyRunDetailPage: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize active tab from query parameter or default to 0
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam ? parseInt(tabParam, 10) : 0;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Validation tab state
  const [selectedGroundTruth, setSelectedGroundTruth] = useState('');
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const [groundTruthSearch, setGroundTruthSearch] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // Check if we just completed this run
  const justCompleted = searchParams.get('completed') === 'true';

  // Data fetching
  const { data: run, isLoading, error } = useSurveyRun(runId || '');
  const { data: survey } = useSurvey(run?.survey_id || '', { enabled: !!run });
  const { data: groundTruths } = useGroundTruths(run?.survey_id || '', { enabled: !!run });

  // Analysis data
  const { data: analysisSummary } = useQuery({
    queryKey: ['analysis-summary', runId],
    queryFn: () => getAnalysisSummary(runId!),
    enabled: !!runId && activeTab === 1,
  });

  // Comparison history
  const { data: comparisonHistory, refetch: refetchComparisonHistory } = useQuery({
    queryKey: ['comparison-history', runId],
    queryFn: () => getComparisonHistory(runId!),
    enabled: !!runId && activeTab === 2,
  });

  const compareMutation = useCompareToGroundTruth({
    onSuccess: (data) => {
      setComparisonResults(data);
      refetchComparisonHistory(); // Refresh history after new comparison
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCompare = () => {
    if (runId && selectedGroundTruth) {
      compareMutation.mutate({ runId, groundTruthId: selectedGroundTruth });
    }
  };

  const handleExportJSON = () => {
    if (!run) return;
    const dataStr = JSON.stringify(run, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${run.run_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!run) {
      alert('Cannot export: Survey run data is not loaded');
      return;
    }
    if (!survey) {
      alert(`Cannot export: Survey configuration "${run.survey_id}" not found.`);
      return;
    }
    exportSurveyRunToCSV(run, survey);
  };

  const handleExportComparisonCSV = () => {
    if (!comparisonResults || !runId) return;
    exportComparisonToCSV(comparisonResults, runId);
  };

  const handleViewHistoricalComparison = async (comparisonId: string) => {
    try {
      const data = await getComparison(comparisonId);
      setComparisonResults(data);
    } catch (error) {
      console.error('Error loading historical comparison:', error);
      alert('Failed to load comparison');
    }
  };

  const handleDeleteComparison = async (comparisonId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when deleting

    if (!window.confirm('Are you sure you want to delete this comparison?')) {
      return;
    }

    try {
      await deleteComparison(comparisonId);
      refetchComparisonHistory(); // Refresh history after delete

      // If the deleted comparison is currently displayed, clear it
      if (comparisonResults?.id === comparisonId) {
        setComparisonResults(null);
      }
    } catch (error) {
      console.error('Error deleting comparison:', error);
      alert('Failed to delete comparison');
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !run) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading survey run details. The run may not exist.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/history')}>
          Back to History
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/')}
          sx={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          Home
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/history')}
          sx={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          Results
        </Link>
        <Typography color="text.primary">{run.run_id}</Typography>
      </Breadcrumbs>

      {/* Success Banner */}
      {justCompleted && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Survey Run Completed Successfully!
          </Typography>
          <Typography variant="body2">
            Your survey has been executed and {run.num_responses} responses have been collected from {run.num_profiles} profiles.
          </Typography>
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Survey Run Results
          </Typography>
          <Typography variant="body1" color="text.secondary" fontFamily="monospace">
            {run.run_id}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/history')}>
            Back to History
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="run detail tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<InfoIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<BarChartIcon />} iconPosition="start" label="Analysis" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Validation" />
          <Tab icon={<GetAppIcon />} iconPosition="start" label="Exports" />
        </Tabs>

        {/* Tab 0: Overview */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Left Column: Run Info and Stats */}
            <Grid item xs={12} md={6}>
              {/* Run Metadata */}
              <Paper sx={{ p: 3, mb: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Run Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Survey
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {run.survey_name || run.survey_id}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Timestamp
                    </Typography>
                    <Typography variant="body1">{formatDate(run.timestamp)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1.5 }}>
                      Results Summary
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Profiles Generated
                        </Typography>
                        <Chip label={run.num_profiles} color="primary" size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Responses Collected
                        </Typography>
                        <Chip label={run.num_responses} color="secondary" size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Distributions Generated
                        </Typography>
                        <Chip label={run.num_distributions} color="info" size="small" />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Right Column: Configuration */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Configuration
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      LLM Provider
                    </Typography>
                    <Chip label={run.config.llm_provider} variant="outlined" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Model
                    </Typography>
                    <Chip label={run.config.model} variant="outlined" sx={{ fontFamily: 'monospace' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1.5 }}>
                      Parameters
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          LLM Temperature
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {run.config.llm_temperature}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          SSR Temperature
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {run.config.ssr_temperature}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Seed
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" fontFamily="monospace">
                          {run.config.seed}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Normalization
                        </Typography>
                        <Chip label={run.config.normalize_method} variant="outlined" size="small" />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Full Width: Results Dataset */}
            {survey && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    Response Details
                  </Typography>
                  <ResponseDataset
                    result={{
                      run_id: run.run_id,
                      survey_id: run.survey_id,
                      num_profiles: run.num_profiles,
                      num_responses: run.num_responses,
                      num_distributions: run.num_distributions,
                      distributions: run.distributions,
                      config: run.config,
                    }}
                    survey={survey}
                  />
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Tab 1: Analysis */}
        <TabPanel value={activeTab} index={1}>
          {analysisSummary ? (
            <>
              <ExecutiveSummaryPanel
                summary={analysisSummary.executive_summary}
                runId={runId!}
                demographicFields={analysisSummary.context?.demographic_fields || []}
                hasDemographics={analysisSummary.context?.has_demographics || false}
              />
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate(`/analysis/${runId}`)}
                >
                  View Full Analysis Dashboard
                </Button>
              </Box>
            </>
          ) : (
            <AnalysisProgressIndicator
              responseCount={run?.num_responses}
              questionCount={survey?.questions?.length}
            />
          )}
        </TabPanel>

        {/* Tab 2: Validation */}
        <TabPanel value={activeTab} index={2}>
          <Box>
            {/* Empty state when no ground truths exist */}
            {(!groundTruths || groundTruths.length === 0) && (
              <Alert
                severity="info"
                sx={{ mb: 3 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/ground-truth')}
                  >
                    Create Ground Truth
                  </Button>
                }
              >
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  No Ground Truths Available
                </Typography>
                <Typography variant="body2">
                  Create a ground truth baseline to validate your synthetic survey data against real responses.
                </Typography>
              </Alert>
            )}

            {/* Ground Truth Selection */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Select Ground Truth Baseline
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Compare this run against a ground truth to validate data quality
                  </Typography>
                </Box>
                {groundTruths && groundTruths.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/ground-truth')}
                  >
                    Manage Ground Truths
                  </Button>
                )}
              </Box>

              {/* Search Field - always visible when ground truths exist */}
              {groundTruths && groundTruths.length > 0 && (
                <>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search ground truths by name, source, or model..."
                    value={groundTruthSearch}
                    onChange={(e) => setGroundTruthSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: groundTruths && (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="text.secondary">
                            {groundTruths.filter((gt) => {
                              if (!groundTruthSearch) return true;
                              const searchLower = groundTruthSearch.toLowerCase();
                              return (
                                gt.name.toLowerCase().includes(searchLower) ||
                                gt.source.toLowerCase().includes(searchLower) ||
                                (gt.generation_config?.model || '').toLowerCase().includes(searchLower)
                              );
                            }).length} of {groundTruths.length}
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2, mt: 2 }}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Ground Truth</InputLabel>
                    <Select
                      value={selectedGroundTruth}
                      label="Ground Truth"
                      onChange={(e) => setSelectedGroundTruth(e.target.value)}
                    >
                      {groundTruths
                        .filter((gt) => {
                          if (!groundTruthSearch) return true;
                          const searchLower = groundTruthSearch.toLowerCase();
                          return (
                            gt.name.toLowerCase().includes(searchLower) ||
                            gt.source.toLowerCase().includes(searchLower) ||
                            (gt.generation_config?.model || '').toLowerCase().includes(searchLower)
                          );
                        })
                        .map((gt) => (
                          <MenuItem key={gt.id} value={gt.id}>
                            {gt.name}
                            {gt.source === 'ssr_generated' && gt.generation_config && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                ({gt.generation_config.model}, n={gt.generation_config.num_profiles})
                              </Typography>
                            )}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CompareArrowsIcon />}
                    onClick={handleCompare}
                    disabled={!selectedGroundTruth || compareMutation.isPending}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    {compareMutation.isPending ? 'Comparing...' : 'Run Comparison'}
                  </Button>
                </>
              )}
            </Paper>

            {/* Comparison Results */}
            {comparisonResults && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Comparison Results
                </Typography>
                <ComparisonResults
                  comparisonResults={comparisonResults}
                  groundTruths={groundTruths}
                  survey={survey}
                />
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportComparisonCSV}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setComparisonResults(null)}
                  >
                    Clear Results
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Comparison History - Collapsible */}
            {comparisonHistory && comparisonHistory.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => setHistoryExpanded(!historyExpanded)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="h6">
                      Comparison History
                    </Typography>
                    <Chip
                      label={comparisonHistory.length}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <IconButton size="small">
                    {historyExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                <Collapse in={historyExpanded}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
                    Click on a previous comparison to view its results
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {comparisonHistory.map((item) => (
                      <Paper
                        key={item.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'primary.main',
                          },
                        }}
                        onClick={() => handleViewHistoricalComparison(item.id)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {item.ground_truth_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(item.created_at)} • {item.num_questions_compared} questions compared
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={item.mean_kl_divergence !== null ? `KL: ${item.mean_kl_divergence.toFixed(4)}` : 'N/A'}
                              size="small"
                              color={
                                item.mean_kl_divergence !== null && item.mean_kl_divergence < 0.05
                                  ? 'success'
                                  : item.mean_kl_divergence !== null && item.mean_kl_divergence < 0.15
                                  ? 'info'
                                  : 'warning'
                              }
                            />
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => handleDeleteComparison(item.id, e)}
                              sx={{ ml: 1 }}
                              aria-label={`Delete comparison with ${item.ground_truth_name}`}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Collapse>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* Tab 3: Exports */}
        <TabPanel value={activeTab} index={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Export Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Download survey run data in various formats for further analysis.
            </Typography>

            <Grid container spacing={3}>
              {/* Raw Data Exports */}
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Raw Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Export complete survey run data including all responses and distributions.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportCSV}
                      fullWidth
                    >
                      Export as CSV
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportJSON}
                      fullWidth
                    >
                      Export as JSON
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Analysis Exports */}
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Analysis Reports
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Export statistical analysis and summary reports.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => navigate(`/analysis/${runId}`)}
                      fullWidth
                    >
                      View Full Analysis Dashboard
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Comparison Exports */}
              {comparisonResults && (
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
                    <Typography variant="h6" gutterBottom>
                      Validation Results
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Export ground truth comparison results.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportComparisonCSV}
                      fullWidth
                    >
                      Export Comparison CSV
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SurveyRunDetailPage;
