/**
 * Difference Heatmap Component
 * Shows the difference between experiment and ground truth probability distributions
 * More intuitive than confusion matrices for distribution comparison
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Chip,
} from '@mui/material';
import type { DistributionData, AggregatedDistribution, Survey } from '../services/types';

interface DifferenceHeatmapProps {
  testRunDistributions?: DistributionData;
  groundTruthDistributions?: {
    [category: string]: {
      [question_id: string]: AggregatedDistribution;
    };
  };
  survey?: Survey;
}

interface DifferenceData {
  questionId: string;
  questionText: string;
  category: string;
  labels: string[];
  gtProbs: number[];
  expProbs: number[];
  differences: number[];
  mae: number;
  rmse: number;
  maxDiff: number;
  maxDiffRating: string;
}

const DifferenceHeatmap: React.FC<DifferenceHeatmapProps> = ({
  testRunDistributions,
  groundTruthDistributions,
  survey,
}) => {
  if (!testRunDistributions || !groundTruthDistributions) {
    return null;
  }

  // Helper to get question labels from survey
  const getQuestionLabels = (questionId: string): string[] | null => {
    if (!survey) return null;

    const question = survey.questions.find(q => q.id === questionId);
    if (!question) return null;

    // Handle yes_no questions specially
    if (question.type === 'yes_no') {
      return ['No', 'Yes'];
    }

    // For other question types, use the scale
    if (!question.scale) return null;

    const scaleEntries = Object.entries(question.scale)
      .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB));

    return scaleEntries.map(([_, label]) => label);
  };

  // Helper to get question text
  const getQuestionText = (questionId: string): string => {
    if (!survey) return questionId;

    const question = survey.questions.find(q => q.id === questionId);
    return question?.text || questionId;
  };

  // Helper to aggregate test run distributions
  const aggregateTestDistributions = (
    category: string,
    questionId: string
  ): number[] | null => {
    const categoryData = testRunDistributions[category];
    if (!categoryData) return null;

    const questionData = categoryData[questionId];
    if (!questionData) return null;

    const respondentIds = Object.keys(questionData);
    if (respondentIds.length === 0) return null;

    const firstDist = questionData[respondentIds[0]];
    const numRatings = firstDist.probabilities.length;

    const sumProbs = new Array(numRatings).fill(0);
    respondentIds.forEach((rid) => {
      const dist = questionData[rid];
      dist.probabilities.forEach((prob, idx) => {
        sumProbs[idx] += prob;
      });
    });

    return sumProbs.map((sum) => sum / respondentIds.length);
  };

  // Calculate difference data for a question
  const calculateDifferences = (
    category: string,
    questionId: string
  ): DifferenceData | null => {
    const gtCategoryData = groundTruthDistributions[category];
    if (!gtCategoryData) return null;

    const gtDist = gtCategoryData[questionId];
    if (!gtDist) return null;

    const expDist = aggregateTestDistributions(category, questionId);
    if (!expDist) return null;

    const numRatings = gtDist.mean_probabilities.length;

    // Calculate differences
    const differences = gtDist.mean_probabilities.map((gtProb, idx) =>
      expDist[idx] - gtProb
    );

    // Calculate metrics
    const absoluteDifferences = differences.map(d => Math.abs(d));
    const mae = absoluteDifferences.reduce((sum, d) => sum + d, 0) / numRatings;
    const rmse = Math.sqrt(
      differences.reduce((sum, d) => sum + d * d, 0) / numRatings
    );
    const maxDiff = Math.max(...absoluteDifferences);
    const maxDiffIdx = absoluteDifferences.indexOf(maxDiff);

    // Get labels
    const textLabels = getQuestionLabels(questionId);
    const labels = textLabels || Array.from({ length: numRatings }, (_, i) => `${i + 1}`);
    const maxDiffRating = labels[maxDiffIdx];

    return {
      questionId,
      questionText: getQuestionText(questionId),
      category,
      labels,
      gtProbs: gtDist.mean_probabilities,
      expProbs: expDist,
      differences,
      mae,
      rmse,
      maxDiff,
      maxDiffRating,
    };
  };

  // Build all difference data
  const buildAllDifferences = (): DifferenceData[] => {
    const allDifferences: DifferenceData[] = [];
    const categories = Object.keys(groundTruthDistributions);

    categories.forEach((category) => {
      const gtCategoryData = groundTruthDistributions[category];
      const questionIds = Object.keys(gtCategoryData);

      questionIds.forEach((questionId) => {
        const diffData = calculateDifferences(category, questionId);
        if (diffData) {
          allDifferences.push(diffData);
        }
      });
    });

    return allDifferences;
  };

  const allDifferences = buildAllDifferences();
  if (allDifferences.length === 0) return null;

  // Get color based on difference value
  const getDifferenceColor = (diff: number): string => {
    const absDiff = Math.abs(diff);

    if (absDiff < 0.02) return '#4caf50'; // Green - excellent
    if (absDiff < 0.05) return '#8bc34a'; // Light green - good
    if (absDiff < 0.10) return '#ffc107'; // Yellow - fair
    if (absDiff < 0.15) return '#ff9800'; // Orange - poor
    return '#f44336'; // Red - very poor
  };

  // Get quality assessment
  const getQualityAssessment = (mae: number): { label: string; color: string } => {
    if (mae < 0.02) return { label: 'Excellent', color: '#4caf50' };
    if (mae < 0.05) return { label: 'Good', color: '#8bc34a' };
    if (mae < 0.10) return { label: 'Fair', color: '#ffc107' };
    if (mae < 0.15) return { label: 'Poor', color: '#ff9800' };
    return { label: 'Very Poor', color: '#f44336' };
  };

  const cellSize = 55;
  const cellHeight = 75;

  // Render difference heatmap for a single question
  const renderDifferenceHeatmap = (data: DifferenceData) => {
    const quality = getQualityAssessment(data.mae);

    return (
      <Grid item xs={12} md={6} key={`${data.category}-${data.questionId}`}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  {data.questionText}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Question ID: {data.questionId}
                  {data.category !== 'default' && ` • Category: ${data.category}`}
                </Typography>
              </Box>
              <Chip
                label={quality.label}
                size="small"
                sx={{
                  bgcolor: quality.color,
                  color: 'white',
                  fontWeight: 'bold',
                  ml: 1,
                }}
              />
            </Box>

            {/* Heatmap */}
            <Box sx={{ overflowX: 'auto', mb: 2 }}>
              <Box sx={{ display: 'flex', minWidth: 'fit-content', justifyContent: 'center' }}>
                {data.labels.map((label, idx) => (
                  <Box key={idx} sx={{ width: cellSize, mx: 0.5 }}>
                    {/* Label */}
                    <Tooltip title={label} arrow>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'center',
                          mb: 0.5,
                          fontSize: '0.6rem',
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label.length > 10 ? `${label.substring(0, 9)}...` : label}
                      </Typography>
                    </Tooltip>

                    {/* Difference cell */}
                    <Tooltip
                      title={
                        <Box>
                          <Typography variant="caption" display="block">
                            <strong>Rating:</strong> {label}
                          </Typography>
                          <Typography variant="caption" display="block">
                            <strong>Ground Truth:</strong> {data.gtProbs[idx].toFixed(3)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            <strong>Experiment:</strong> {data.expProbs[idx].toFixed(3)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            <strong>Difference:</strong> {data.differences[idx] >= 0 ? '+' : ''}
                            {data.differences[idx].toFixed(3)}
                          </Typography>
                        </Box>
                      }
                      arrow
                    >
                      <Box
                        sx={{
                          width: cellSize,
                          height: cellHeight,
                          bgcolor: getDifferenceColor(data.differences[idx]),
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                          cursor: 'pointer',
                          transition: 'transform 0.1s, box-shadow 0.1s',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 3,
                            zIndex: 1,
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.6rem',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        >
                          {data.differences[idx] >= 0 ? '+' : ''}
                          {data.differences[idx].toFixed(3)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.55rem',
                            color: 'rgba(255,255,255,0.8)',
                            mt: 0.3,
                          }}
                        >
                          GT: {data.gtProbs[idx].toFixed(2)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.55rem',
                            color: 'rgba(255,255,255,0.8)',
                          }}
                        >
                          Exp: {data.expProbs[idx].toFixed(2)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Metrics Summary */}
            <Box sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    MAE
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {data.mae.toFixed(4)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    RMSE
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {data.rmse.toFixed(4)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Max Diff
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {data.maxDiff.toFixed(3)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    at {data.maxDiffRating}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ mt: 4, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Difference Heatmaps: Experiment vs Ground Truth
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Each heatmap shows the difference (Experiment - Ground Truth) for each rating value.
        Green colors indicate small differences (good alignment), while red/orange colors indicate large differences (poor alignment).
        Positive values (+) mean the experiment rated higher than ground truth; negative values (-) mean it rated lower.
      </Typography>

      <Grid container spacing={3}>
        {allDifferences.map(data => renderDifferenceHeatmap(data))}
      </Grid>

      {/* Legend and Interpretation Guide */}
      <Paper sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          How to Read These Heatmaps:
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
              <strong>Color Coding:</strong>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip
                label="< 0.02 Excellent"
                size="small"
                sx={{ bgcolor: '#4caf50', color: 'white' }}
              />
              <Chip
                label="0.02-0.05 Good"
                size="small"
                sx={{ bgcolor: '#8bc34a', color: 'white' }}
              />
              <Chip
                label="0.05-0.10 Fair"
                size="small"
                sx={{ bgcolor: '#ffc107', color: 'white' }}
              />
              <Chip
                label="0.10-0.15 Poor"
                size="small"
                sx={{ bgcolor: '#ff9800', color: 'white' }}
              />
              <Chip
                label="> 0.15 Very Poor"
                size="small"
                sx={{ bgcolor: '#f44336', color: 'white' }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
              <strong>Metrics Explained:</strong>
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
              • <strong>MAE (Mean Absolute Error):</strong> Average difference across all ratings
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
              • <strong>RMSE (Root Mean Squared Error):</strong> Emphasizes larger errors
            </Typography>
            <Typography variant="caption" display="block">
              • <strong>Max Diff:</strong> Largest difference at any single rating
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #ddd' }}>
          <Typography variant="caption" display="block" color="text.secondary">
            <strong>Interpretation:</strong> Green cells indicate excellent agreement. Yellow/orange cells show moderate differences.
            Red cells indicate significant misalignment that may need investigation. Check if the experiment consistently
            over-predicts or under-predicts certain ratings.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default DifferenceHeatmap;
