/**
 * Survey Run Detail Page
 * View detailed information about a specific survey run
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  CompareArrows as CompareArrowsIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useSurveyRun, useSurvey, useGroundTruths, useCompareToGroundTruth } from '../services/hooks';
import ResponseDataset from '../components/SurveyRunner/ResponseDataset';
import ComparisonResults from '../components/ComparisonResults';
import { exportSurveyRunToCSV, exportComparisonToCSV } from '../utils/csvExport';

const SurveyRunDetailPage: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedGroundTruth, setSelectedGroundTruth] = useState('');
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const [comparisonResultsOpen, setComparisonResultsOpen] = useState(false);

  // Check if we just completed this run (from URL params)
  const [searchParams, setSearchParams] = React.useState(new URLSearchParams(window.location.search));
  const justCompleted = searchParams.get('completed') === 'true';

  const { data: run, isLoading, error } = useSurveyRun(runId || '');
  const { data: survey } = useSurvey(run?.survey_id || '', { enabled: !!run });
  const { data: groundTruths } = useGroundTruths(run?.survey_id || '', { enabled: !!run });

  const compareMutation = useCompareToGroundTruth({
    onSuccess: (data) => {
      setComparisonResults(data);
      setCompareDialogOpen(false);
      setComparisonResultsOpen(true);
    },
  });

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
      alert(`Cannot export: Survey configuration "${run.survey_id}" not found. The survey file may have been deleted or renamed.`);
      return;
    }
    exportSurveyRunToCSV(run, survey);
  };

  const handleExportComparisonCSV = () => {
    if (!comparisonResults || !runId) return;
    exportComparisonToCSV(comparisonResults, runId);
  };

  const handleCompare = () => {
    if (runId && selectedGroundTruth) {
      compareMutation.mutate({ runId, groundTruthId: selectedGroundTruth });
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

      {/* Success Banner - Shows when just completed */}
      {justCompleted && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Survey Run Completed Successfully!
          </Typography>
          <Typography variant="body2">
            Your survey has been executed and {run.num_responses} responses have been collected from {run.num_profiles} profiles.
            Review the detailed results below.
          </Typography>
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Survey Run Details
          </Typography>
          <Typography variant="body1" color="text.secondary" fontFamily="monospace">
            {run.run_id}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<CompareArrowsIcon />} variant="outlined" onClick={() => setCompareDialogOpen(true)}>
            Compare to Ground Truth
          </Button>
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={handleExportJSON}>
            Export JSON
          </Button>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/history')}>
            Back
          </Button>
        </Box>
      </Box>

      {/* Run Metadata */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Run Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Survey
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {run.survey_name || run.survey_id}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Timestamp
            </Typography>
            <Typography variant="body1">{formatDate(run.timestamp)}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Profiles Generated
            </Typography>
            <Chip label={run.num_profiles} color="primary" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Responses Collected
            </Typography>
            <Chip label={run.num_responses} color="secondary" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Distributions Generated
            </Typography>
            <Chip label={run.num_distributions} color="info" />
          </Grid>
        </Grid>
      </Paper>

      {/* Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuration
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              LLM Provider
            </Typography>
            <Chip label={run.config.llm_provider} variant="outlined" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Model
            </Typography>
            <Chip label={run.config.model} variant="outlined" sx={{ fontFamily: 'monospace' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              LLM Temperature
            </Typography>
            <Typography variant="body1">{run.config.llm_temperature}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              SSR Temperature
            </Typography>
            <Typography variant="body1">{run.config.ssr_temperature}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Seed
            </Typography>
            <Typography variant="body1" fontFamily="monospace">
              {run.config.seed}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Normalization Method
            </Typography>
            <Chip label={run.config.normalize_method} variant="outlined" />
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      {survey && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            Survey Results
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
        </Box>
      )}

      {/* Compare to Ground Truth Dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Compare to Ground Truth</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a ground truth to compare this run against. The system will calculate statistical
            metrics including KL divergence, JS divergence, Wasserstein distance, and more.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Ground Truth</InputLabel>
            <Select
              value={selectedGroundTruth}
              label="Select Ground Truth"
              onChange={(e) => setSelectedGroundTruth(e.target.value)}
            >
              {groundTruths && groundTruths.length > 0 ? (
                groundTruths.map((gt) => (
                  <MenuItem key={gt.id} value={gt.id}>
                    {gt.name}
                    {gt.source === 'ssr_generated' && gt.generation_config && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({gt.generation_config.model}, n={gt.generation_config.num_profiles})
                      </Typography>
                    )}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No ground truths available for this survey
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCompare}
            variant="contained"
            disabled={!selectedGroundTruth || compareMutation.isPending}
          >
            {compareMutation.isPending ? 'Comparing...' : 'Compare'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comparison Results Dialog */}
      <Dialog
        open={comparisonResultsOpen}
        onClose={() => setComparisonResultsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Ground Truth Comparison Results</DialogTitle>
        <DialogContent>
          {comparisonResults && (
            <ComparisonResults
              comparisonResults={comparisonResults}
              groundTruths={groundTruths}
              survey={survey}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<DownloadIcon />} onClick={handleExportComparisonCSV} variant="outlined">
            Export CSV
          </Button>
          <Button onClick={() => setComparisonResultsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SurveyRunDetailPage;
