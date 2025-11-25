/**
 * ComparisonResults Component
 *
 * Displays detailed comparison results between a test run and ground truth baseline.
 * Extracted from GroundTruthTestingPage.tsx to reduce component complexity.
 *
 * Features:
 * - Overall metrics (KL divergence, JS divergence, Wasserstein, MAE)
 * - Category-level breakdown
 * - Question-level detailed metrics
 * - Distribution visualizations
 * - Interpretation guide
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import DistributionCharts from './DistributionCharts';
import DifferenceHeatmap from './DifferenceHeatmap';
import MetricInterpretation from './MetricInterpretation';

interface OverallMetrics {
  mean_kl_divergence: number;
  std_kl_divergence: number;
  mean_js_divergence: number;
  std_js_divergence: number;
  mean_wasserstein: number;
  std_wasserstein: number;
  mean_mae: number;
  std_mae: number;
  num_questions_compared: number;
}

interface CategoryMetrics {
  mean_kl_divergence: number;
  mean_js_divergence: number;
  mean_wasserstein: number;
  mean_mae: number;
  num_questions: number;
}

interface QuestionMetrics {
  kl_divergence: number;
  js_divergence: number;
  wasserstein_distance: number;
  chi_squared: number;
  chi_squared_p_value: number;
  mean_absolute_error: number;
  significant_difference: boolean;
}

interface ComparisonData {
  overall_metrics: OverallMetrics;
  by_category?: Record<string, CategoryMetrics>;
  by_question?: Record<string, QuestionMetrics>;
}

interface ComparisonResultsData {
  run_id: string;
  ground_truth_id: string;
  comparison: ComparisonData;
  test_run_distributions: any;
  ground_truth_distributions: any;
}

interface GroundTruth {
  id: string;
  name: string;
}

interface ComparisonResultsProps {
  comparisonResults: ComparisonResultsData;
  groundTruths?: GroundTruth[];
  survey?: any;
}

const formatMetric = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return value.toFixed(4);
};

const ComparisonResults: React.FC<ComparisonResultsProps> = ({
  comparisonResults,
  groundTruths,
  survey,
}) => {
  return (
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
          <Grid item xs={12} md={6} lg={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 1 }}>
                  KL Divergence
                </Typography>
                <MetricInterpretation
                  metricType="kl_divergence"
                  value={comparisonResults.comparison.overall_metrics.mean_kl_divergence}
                  std={comparisonResults.comparison.overall_metrics.std_kl_divergence}
                  showProgressBar={true}
                  compact={false}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 1 }}>
                  JS Divergence
                </Typography>
                <MetricInterpretation
                  metricType="js_divergence"
                  value={comparisonResults.comparison.overall_metrics.mean_js_divergence}
                  std={comparisonResults.comparison.overall_metrics.std_js_divergence}
                  showProgressBar={true}
                  compact={false}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 1 }}>
                  Wasserstein Distance
                </Typography>
                <MetricInterpretation
                  metricType="wasserstein"
                  value={comparisonResults.comparison.overall_metrics.mean_wasserstein}
                  std={comparisonResults.comparison.overall_metrics.std_wasserstein}
                  showProgressBar={true}
                  compact={false}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 1 }}>
                  Mean Absolute Error
                </Typography>
                <MetricInterpretation
                  metricType="mae"
                  value={comparisonResults.comparison.overall_metrics.mean_mae}
                  std={comparisonResults.comparison.overall_metrics.std_mae}
                  showProgressBar={true}
                  compact={false}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Alert severity="info">
              Compared {comparisonResults.comparison.overall_metrics.num_questions_compared} questions across all categories.
              Quality indicators help interpret whether results match ground truth expectations.
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
                {Object.entries(comparisonResults.comparison.by_category || {}).map(([category, metrics]: [string, any]) => (
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
                {Object.entries(comparisonResults.comparison.by_question || {}).map(([questionKey, metrics]: [string, any]) => (
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
                      <MetricInterpretation
                        metricType="p_value"
                        value={metrics.chi_squared_p_value}
                        showProgressBar={false}
                        showTooltip={true}
                        compact={true}
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
  );
};

export default ComparisonResults;
