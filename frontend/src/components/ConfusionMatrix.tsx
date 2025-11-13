/**
 * Confusion Matrix Component
 * Shows alignment between experiment and ground truth rating distributions
 * Displays one confusion matrix per question with text labels from the scale
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import type { DistributionData, AggregatedDistribution, Survey, Question } from '../services/types';

interface ConfusionMatrixProps {
  testRunDistributions?: DistributionData;
  groundTruthDistributions?: {
    [category: string]: {
      [question_id: string]: AggregatedDistribution;
    };
  };
  survey?: Survey;
}

interface MatrixData {
  matrix: number[][];
  labels: string[];
  maxValue: number;
  questionId: string;
  questionText: string;
  category: string;
}

const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
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
    if (!question || !question.scale) return null;

    // Extract labels from scale object
    const scaleEntries = Object.entries(question.scale)
      .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB));

    return scaleEntries.map(([_, label]) => label);
  };

  // Helper to get question info
  const getQuestionInfo = (questionId: string): { text: string; question: Question } | null => {
    if (!survey) return null;

    const question = survey.questions.find(q => q.id === questionId);
    if (!question) return null;

    return { text: question.text, question };
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

  // Build individual confusion matrix for a specific question
  const buildQuestionMatrix = (
    category: string,
    questionId: string
  ): MatrixData | null => {
    const gtCategoryData = groundTruthDistributions[category];
    if (!gtCategoryData) return null;

    const gtDist = gtCategoryData[questionId];
    if (!gtDist) return null;

    const testDist = aggregateTestDistributions(category, questionId);
    if (!testDist) return null;

    const numRatings = gtDist.mean_probabilities.length;

    // Initialize matrix
    const matrix: number[][] = Array(numRatings)
      .fill(0)
      .map(() => Array(numRatings).fill(0));

    // Calculate confusion matrix for this question
    gtDist.mean_probabilities.forEach((gtProb, actualIdx) => {
      testDist.forEach((testProb, predIdx) => {
        matrix[actualIdx][predIdx] = gtProb * testProb;
      });
    });

    const maxValue = Math.max(...matrix.flat());

    // Get labels from survey if available, otherwise use numbers
    const textLabels = getQuestionLabels(questionId);
    const labels = textLabels || Array.from({ length: numRatings }, (_, i) => `${i + 1}`);

    // Get question info
    const questionInfo = getQuestionInfo(questionId);
    const questionText = questionInfo?.text || questionId;

    return {
      matrix,
      labels,
      maxValue,
      questionId,
      questionText,
      category
    };
  };

  // Build all question matrices
  const buildAllMatrices = (): MatrixData[] => {
    const matrices: MatrixData[] = [];
    const categories = Object.keys(groundTruthDistributions);

    categories.forEach((category) => {
      const gtCategoryData = groundTruthDistributions[category];
      const questionIds = Object.keys(gtCategoryData);

      questionIds.forEach((questionId) => {
        const matrixData = buildQuestionMatrix(category, questionId);
        if (matrixData) {
          matrices.push(matrixData);
        }
      });
    });

    return matrices;
  };

  const allMatrices = buildAllMatrices();
  if (allMatrices.length === 0) return null;

  // Color interpolation based on value
  const getColor = (value: number, maxValue: number): string => {
    const intensity = maxValue > 0 ? value / maxValue : 0;
    // Gradient from light blue to dark blue
    const r = Math.round(54 + (255 - 54) * (1 - intensity));
    const g = Math.round(117 + (255 - 117) * (1 - intensity));
    const b = Math.round(136 + (255 - 136) * (1 - intensity));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const cellSize = 50;
  const fontSize = 10;
  const labelFontSize = 11;

  // Render a single confusion matrix
  const renderMatrix = (matrixData: MatrixData) => {
    const { matrix, labels, maxValue, questionId, questionText, category } = matrixData;

    return (
      <Grid item xs={12} md={6} key={`${category}-${questionId}`}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
              {questionText}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Question ID: {questionId} {category !== 'default' && `• Category: ${category}`}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
              <Box sx={{ position: 'relative', minWidth: 'fit-content' }}>
                {/* Y-axis label */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: -35,
                    top: '50%',
                    transform: 'translateY(-50%) rotate(-90deg)',
                    transformOrigin: 'center',
                  }}
                >
                  <Typography variant="caption" fontWeight="bold" fontSize={labelFontSize}>
                    Ground Truth
                  </Typography>
                </Box>

                {/* Matrix with labels */}
                <Box sx={{ ml: 6 }}>
                  {/* Column headers (Predicted) */}
                  <Box sx={{ display: 'flex', mb: 0.5, ml: `${cellSize}px` }}>
                    {labels.map((label, idx) => (
                      <Box
                        key={`col-${idx}`}
                        sx={{
                          width: cellSize,
                          textAlign: 'center',
                          px: 0.5,
                        }}
                      >
                        <Tooltip title={label} arrow>
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            fontSize={labelFontSize}
                            sx={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {label.length > 8 ? `${label.substring(0, 7)}...` : label}
                          </Typography>
                        </Tooltip>
                      </Box>
                    ))}
                  </Box>

                  {/* Matrix rows */}
                  {matrix.map((row, rowIdx) => (
                    <Box key={`row-${rowIdx}`} sx={{ display: 'flex', mb: 0.5 }}>
                      {/* Row label (Actual) */}
                      <Box
                        sx={{
                          width: cellSize,
                          height: cellSize,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pr: 0.5,
                        }}
                      >
                        <Tooltip title={labels[rowIdx]} arrow placement="left">
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            fontSize={labelFontSize}
                            sx={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: cellSize - 4,
                            }}
                          >
                            {labels[rowIdx].length > 8 ? `${labels[rowIdx].substring(0, 7)}...` : labels[rowIdx]}
                          </Typography>
                        </Tooltip>
                      </Box>

                      {/* Matrix cells */}
                      {row.map((value, colIdx) => (
                        <Tooltip
                          key={`cell-${rowIdx}-${colIdx}`}
                          title={
                            <Box>
                              <Typography variant="caption" display="block">
                                <strong>Ground Truth:</strong> {labels[rowIdx]}
                              </Typography>
                              <Typography variant="caption" display="block">
                                <strong>Experiment:</strong> {labels[colIdx]}
                              </Typography>
                              <Typography variant="caption" display="block">
                                <strong>Value:</strong> {value.toFixed(4)}
                              </Typography>
                            </Box>
                          }
                          arrow
                        >
                          <Box
                            sx={{
                              width: cellSize,
                              height: cellSize,
                              bgcolor: getColor(value, maxValue),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #ddd',
                              cursor: 'pointer',
                              transition: 'transform 0.1s',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                zIndex: 1,
                                border: '2px solid #333',
                              },
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: fontSize,
                                fontWeight: 'bold',
                                color: value / maxValue > 0.5 ? 'white' : 'black',
                              }}
                            >
                              {value.toFixed(2)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  ))}

                  {/* X-axis label */}
                  <Box sx={{ textAlign: 'center', mt: 1, ml: `${cellSize}px` }}>
                    <Typography variant="caption" fontWeight="bold" fontSize={labelFontSize}>
                      Experiment
                    </Typography>
                  </Box>
                </Box>

                {/* Mini Legend */}
                <Box sx={{ mt: 2, ml: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" fontSize={9}>Low</Typography>
                    <Box
                      sx={{
                        width: 100,
                        height: 12,
                        background: 'linear-gradient(to right, rgb(255, 255, 255), rgb(54, 117, 136))',
                        border: '1px solid #ddd',
                      }}
                    />
                    <Typography variant="caption" fontSize={9}>High</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ mt: 4, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Confusion Matrices: Experiment vs Ground Truth
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Each matrix shows how predicted ratings (experiment) align with actual ratings (ground truth) for a specific question.
        Darker colors indicate higher probability density. Diagonal cells represent perfect agreement.
      </Typography>

      <Grid container spacing={3}>
        {allMatrices.map(matrixData => renderMatrix(matrixData))}
      </Grid>

      {/* Interpretation guide */}
      <Paper sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
          How to Read These Matrices:
        </Typography>
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
          • <strong>Diagonal cells</strong> (top-left to bottom-right): Perfect agreement between experiment and ground truth
        </Typography>
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
          • <strong>Off-diagonal cells</strong>: Misalignment - experiment predicted different ratings than ground truth
        </Typography>
        <Typography variant="caption" display="block">
          • <strong>Darker colors</strong>: Higher probability density at that rating combination
        </Typography>
      </Paper>
    </Box>
  );
};

export default ConfusionMatrix;
