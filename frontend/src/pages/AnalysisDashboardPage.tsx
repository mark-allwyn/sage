/**
 * Analysis Dashboard Page
 * Comprehensive analysis view for survey run results
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
  getAnalysisSummary,
  getAnalysisInsights,
  exportAnalysisCSV,
  exportQuestionDataCSV,
  exportResponseDataCSV,
  getSummaryReport,
} from '../services/api';
import { useSurveyRun, useSurvey } from '../services/hooks';

// Sub-components
import ExecutiveSummaryPanel from '../components/Analysis/ExecutiveSummaryPanel';
import DemographicOverview from '../components/Analysis/DemographicOverview';
import QuestionAnalysisPanel from '../components/Analysis/QuestionAnalysisPanel';

const AnalysisDashboardPage: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Fetch data
  const { data: run, isLoading: runLoading } = useSurveyRun(runId || '');
  const { data: survey } = useSurvey(run?.survey_id || '', { enabled: !!run });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analysis-summary', runId],
    queryFn: () => getAnalysisSummary(runId!),
    enabled: !!runId,
  });

  const { data: insights } = useQuery({
    queryKey: ['analysis-insights', runId],
    queryFn: () => getAnalysisInsights(runId!),
    enabled: !!runId,
  });

  const isLoading = runLoading || summaryLoading;

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportFullAnalysis = async () => {
    if (!runId) return;
    try {
      const blob = await exportAnalysisCSV(runId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis_${runId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
    handleExportClose();
  };

  const handleExportQuestions = async () => {
    if (!runId) return;
    try {
      const blob = await exportQuestionDataCSV(runId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `questions_${runId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
    handleExportClose();
  };

  const handleExportResponses = async () => {
    if (!runId) return;
    try {
      const blob = await exportResponseDataCSV(runId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `responses_${runId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
    handleExportClose();
  };

  const handleExportSummary = async () => {
    if (!runId) return;
    try {
      const report = await getSummaryReport(runId);
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `summary_${runId}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
    handleExportClose();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!run || !summary) {
    return (
      <Alert severity="error">
        Failed to load analysis data. The run may not exist or analysis is not available.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/history')}
            sx={{ cursor: 'pointer' }}
          >
            Survey History
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate(`/runs/${runId}`)}
            sx={{ cursor: 'pointer' }}
          >
            Run {runId?.slice(0, 8)}
          </Link>
          <Typography variant="body2" color="text.primary">
            Analysis
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Survey Analysis Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {survey?.name || 'Survey Analysis'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/runs/${runId}`)}
            >
              Back to Run
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportClick}
            >
              Export
            </Button>
            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={handleExportClose}
            >
              <MenuItem onClick={handleExportFullAnalysis}>
                <ListItemIcon>
                  <AssessmentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Full Analysis (CSV)</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleExportQuestions}>
                <ListItemIcon>
                  <TableChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Question Data (CSV)</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleExportResponses}>
                <ListItemIcon>
                  <TableChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Response Data (CSV)</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleExportSummary}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Summary Report (TXT)</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>

      {/* Executive Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <ExecutiveSummaryPanel
          summary={summary.executive_summary}
          insights={insights}
          runId={runId!}
          demographicFields={summary.context?.demographic_fields || []}
          hasDemographics={summary.context?.has_demographics || false}
        />
      </Paper>

      {/* Demographic Overview - moved after Executive Summary */}
      {summary.context?.has_demographics && summary.context?.demographic_fields?.length > 0 && (
        <DemographicOverview
          runId={runId!}
          demographicFields={summary.context.demographic_fields}
        />
      )}

      {/* Question Analysis - with expandable demographic charts */}
      {summary.question_analysis && summary.question_analysis.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <QuestionAnalysisPanel
            questions={summary.question_analysis}
            runId={runId!}
            demographicFields={summary.context?.demographic_fields || []}
          />
        </Paper>
      )}
    </Box>
  );
};

export default AnalysisDashboardPage;
