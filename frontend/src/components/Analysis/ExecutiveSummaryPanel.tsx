/**
 * Executive Summary Panel
 * Professional survey report with visualizations
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useQuery, useQueries } from '@tanstack/react-query';
import { ExecutiveSummary } from '../../services/types';
import { getDemographicAnalysis } from '../../services/api';

interface ExecutiveSummaryPanelProps {
  summary?: ExecutiveSummary;
  insights?: any;
  runId: string;
  demographicFields: string[];
  hasDemographics: boolean;
}

const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'];

const ExecutiveSummaryPanel: React.FC<ExecutiveSummaryPanelProps> = ({
  summary,
  runId,
  demographicFields,
  hasDemographics
}) => {
  // Fetch demographic data for each field using useQueries (allows dynamic number of queries)
  const demographicQueries = useQueries({
    queries: demographicFields.map(field => ({
      queryKey: ['demographic-breakdown', runId, field],
      queryFn: () => getDemographicAnalysis(runId, field),
      enabled: hasDemographics && !!field,
    })),
  });
  if (!summary) {
    return (
      <Alert severity="info">
        Survey analysis is loading...
      </Alert>
    );
  }

  // Convert question findings into chart data
  const questionFindings = summary.question_findings || [];

  // Group by category for visualizations
  const categoryGroups: { [key: string]: typeof questionFindings } = {};
  questionFindings.forEach(finding => {
    const cat = finding.category || 'General';
    if (!categoryGroups[cat]) {
      categoryGroups[cat] = [];
    }
    categoryGroups[cat].push(finding);
  });

  // Get response breakdown from actual distribution data
  const getLikertBreakdown = (finding: typeof questionFindings[0]) => {
    if (!finding.distribution) return [];

    return Object.entries(finding.distribution).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / finding.n) * 100).toFixed(1)
    }));
  };

  return (
    <Box>
      {/* Survey Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AssessmentIcon color="primary" />
          <Typography variant="h5">
            Survey Response Summary
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h2" component="span" color="primary" fontWeight="bold">
                {summary.total_respondents}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                Total Respondents
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h2" component="span" color="primary" fontWeight="bold">
                {summary.total_questions}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                Questions Analyzed
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Demographic Breakdown */}
        {hasDemographics && demographicFields.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PeopleIcon color="secondary" />
                <Typography variant="h6">
                  Demographic Breakdown
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {demographicFields.map((field, index) => {
                  const queryResult = demographicQueries[index];
                  const demographicData = queryResult?.data;
                  const isLoading = queryResult?.isLoading;

                  if (isLoading) {
                    return (
                      <Grid item xs={12} sm={6} md={4} key={field}>
                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            {field.replace(/_/g, ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Loading...
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  }

                  if (!demographicData) return null;

                  const segments = demographicData.segments || {};
                  const totalSample: number = Object.values(segments).reduce(
                    (sum: number, seg: any) => sum + (seg.sample_size || 0),
                    0
                  );

                  return (
                    <Grid item xs={12} sm={6} md={4} key={field}>
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, height: '100%' }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="secondary.main" gutterBottom>
                          {field.replace(/_/g, ' ').toUpperCase()}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                          {Object.entries(segments).map(([segmentName, segment]: [string, any]) => {
                            const sampleSize = segment.sample_size || 0;
                            const percentage = totalSample > 0 ? ((sampleSize / totalSample) * 100).toFixed(1) : '0.0';
                            return (
                              <Box key={segmentName} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                  {segmentName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" fontWeight="medium">
                                    {sampleSize}
                                  </Typography>
                                  <Chip
                                    label={`${percentage}%`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ minWidth: 60, fontSize: '0.75rem' }}
                                  />
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </>
        )}
      </Paper>

      {/* Key Insights */}
      {summary.key_insights && summary.key_insights.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrendingUpIcon color="success" />
            <Typography variant="h6">
              Key Findings
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {summary.key_insights.map((insight, index) => (
              <Box key={index} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, borderLeft: 3, borderColor: 'primary.main' }}>
                <Typography variant="body1">
                  {insight}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Category Summary - Just show the findings */}
      {Object.keys(categoryGroups).length > 1 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Results by Category
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Survey responses organized by category
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(categoryGroups).map(([cat, findings]) => (
              <Grid item xs={12} md={6} lg={4} key={cat}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, height: '100%' }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {cat}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {findings.length} question{findings.length !== 1 ? 's' : ''} • {findings[0]?.n || 0} respondents
                  </Typography>
                  {findings.length > 0 && findings[0].finding && (
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      {findings[0].finding}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Question-by-Question Results */}
      {questionFindings.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detailed Question Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Response distribution and findings for each question
          </Typography>

          {questionFindings.map((finding, index) => (
            <Box key={finding.question_id} sx={{ mb: 4 }}>
              {index > 0 && <Divider sx={{ my: 3 }} />}

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Q{index + 1}: {finding.question}
                  </Typography>
                  {finding.category && finding.category !== 'General' && (
                    <Typography variant="caption" color="text.secondary" sx={{ bgcolor: 'primary.light', px: 1, py: 0.5, borderRadius: 1 }}>
                      {finding.category}
                    </Typography>
                  )}
                </Box>

                <Typography variant="body1" color="primary" fontWeight="medium" sx={{ my: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                  {finding.finding}
                </Typography>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={8}>
                    {(finding.type === 'likert_5' || finding.type === 'likert_7' || finding.type === 'yes_no') && getLikertBreakdown(finding).length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Response Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={getLikertBreakdown(finding)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                            <YAxis />
                            <Tooltip
                              formatter={(value: any, name: string, props: any) => {
                                const pct = props.payload.percentage;
                                return [`${value} (${pct}%)`, 'Responses'];
                              }}
                            />
                            <Bar dataKey="value" fill="#4CAF50">
                              {getLikertBreakdown(finding).map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Statistics
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Sample Size
                          </Typography>
                          <Typography variant="h6">
                            {finding.n}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Mean Response
                          </Typography>
                          <Typography variant="h6">
                            {finding.mean.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Median Response
                          </Typography>
                          <Typography variant="h6">
                            {finding.median.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Question Type
                          </Typography>
                          <Typography variant="body2">
                            {finding.type.replace('_', ' ').toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default ExecutiveSummaryPanel;
