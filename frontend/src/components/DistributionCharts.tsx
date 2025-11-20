/**
 * Distribution Comparison Charts
 * Shows experiment vs ground truth probability distributions
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RatingDistribution, AggregatedDistribution, DistributionData, Survey } from '../services/types';

interface DistributionChartsProps {
  testRunDistributions?: DistributionData;
  groundTruthDistributions?: {
    [category: string]: {
      [question_id: string]: AggregatedDistribution;
    };
  };
  survey?: Survey;
}

const DistributionCharts: React.FC<DistributionChartsProps> = ({
  testRunDistributions,
  groundTruthDistributions,
  survey,
}) => {
  if (!testRunDistributions || !groundTruthDistributions) {
    return null;
  }

  // Helper to aggregate test run distributions for a question
  const aggregateTestDistributions = (
    category: string,
    questionId: string
  ): number[] | null => {
    const categoryData = testRunDistributions[category];
    if (!categoryData) return null;

    const questionData = categoryData[questionId];
    if (!questionData) return null;

    // Aggregate probabilities across all respondents
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

  // Helper to get question labels from survey
  const getQuestionLabels = (questionId: string): string[] | null => {
    if (!survey) return null;

    const question = survey.questions.find(q => q.id === questionId);
    if (!question || !question.scale) return null;

    const scaleEntries = Object.entries(question.scale)
      .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB));

    return scaleEntries.map(([_, label]) => label);
  };

  // Get all categories and questions
  const categories = Object.keys(groundTruthDistributions);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
        Distribution Comparisons: Experiment vs Ground Truth
      </Typography>

      {categories.map((category) => {
        const gtCategoryData = groundTruthDistributions[category];
        const questionIds = Object.keys(gtCategoryData);

        return (
          <Box key={category} sx={{ mb: 5 }}>
            {categories.length > 1 && (
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Category: {category}
              </Typography>
            )}

            <Grid container spacing={3}>
              {questionIds.map((questionId) => {
                const gtDist = gtCategoryData[questionId];
                const testDist = aggregateTestDistributions(category, questionId);

                if (!testDist) return null;

                // Get labels from survey or use numbers as fallback
                const textLabels = getQuestionLabels(questionId);
                const numRatings = gtDist.mean_probabilities.length;
                const labels = textLabels || Array.from({ length: numRatings }, (_, i) => `${i + 1}`);

                // Prepare chart data with text labels
                const chartData = labels.map((label, i) => ({
                  rating: label,
                  groundTruth: gtDist.mean_probabilities[i],
                  experiment: testDist[i],
                }));

                return (
                  <Grid item xs={12} md={6} key={`${category}-${questionId}`}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                          {questionId}
                        </Typography>
                        <ResponsiveContainer width="100%" height={380}>
                          <BarChart
                            data={chartData}
                            margin={{ top: 30, right: 20, left: 10, bottom: 80 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="rating"
                              label={{
                                value: 'Rating Scale',
                                position: 'insideBottom',
                                offset: -15,
                                style: { fontSize: '11px' }
                              }}
                              tick={{ fontSize: 10 }}
                              angle={-45}
                              textAnchor="end"
                              height={70}
                              interval={0}
                            />
                            <YAxis
                              label={{ value: 'Probability', angle: -90, position: 'insideLeft' }}
                              tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                              formatter={(value: number) => value.toFixed(3)}
                              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: '12px' }}
                              verticalAlign="top"
                              align="center"
                              iconSize={10}
                            />

                            {/* Ground truth as bars */}
                            <Bar
                              dataKey="groundTruth"
                              fill="#FF6E3A"
                              name="Ground Truth"
                              opacity={0.8}
                            />

                            {/* Experiment as bars */}
                            <Bar
                              dataKey="experiment"
                              fill="#367588"
                              name="Experiment"
                              opacity={0.8}
                            />
                          </BarChart>
                        </ResponsiveContainer>

                        {/* Show sample size */}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          Ground Truth: {gtDist.sample_size} samples | Experiment:{' '}
                          {Object.keys(testRunDistributions[category]?.[questionId] || {}).length}{' '}
                          respondents
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

export default DistributionCharts;
