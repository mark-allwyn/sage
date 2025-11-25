/**
 * Question Demographic Chart Component
 * Compact demographic distribution chart for individual questions
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getDemographicAnalysis } from '../../services/api';
import { DemographicAnalysis, DemographicSegment, QuestionDistribution } from '../../services/types';

interface QuestionDemographicChartProps {
  runId: string;
  questionId: string;
  demographicFields: string[];
}

const QuestionDemographicChart: React.FC<QuestionDemographicChartProps> = ({
  runId,
  questionId,
  demographicFields,
}) => {
  const [selectedField, setSelectedField] = useState(demographicFields[0] || '');

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['demographic-analysis', runId, selectedField],
    queryFn: () => getDemographicAnalysis(runId, selectedField),
    enabled: !!selectedField && !!runId,
  });

  const formatFieldName = (field: string) => {
    return field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const prepareChartData = () => {
    if (!analysis) return [];

    const segments = analysis.segments as { [key: string]: DemographicSegment };
    const questionData = Object.entries(segments).map(([segmentName, segment]) => {
      const question = segment.questions.find((q: QuestionDistribution) => q.question_id === questionId);
      if (!question) return null;

      // Build data object with segment name and probabilities for each response option
      const dataPoint: Record<string, string | number> = { segment: segmentName };

      // Get labels from scale
      const labels = question.scale_labels?.labels || {};
      question.probabilities.forEach((prob: number, index: number) => {
        const label = labels[String(index + 1)] || `Option ${index + 1}`;
        dataPoint[label] = (prob * 100).toFixed(1);
      });

      return dataPoint;
    }).filter(Boolean);

    return questionData;
  };

  const getResponseLabels = () => {
    if (!analysis) return [];

    const firstSegment = Object.values(analysis.segments)[0] as DemographicSegment | undefined;
    const question = firstSegment?.questions.find((q: QuestionDistribution) => q.question_id === questionId);
    if (!question) return [];

    const labels = question.scale_labels?.labels || {};
    return Object.values(labels);
  };

  if (demographicFields.length === 0) {
    return null;
  }

  if (!selectedField) {
    return null;
  }

  const chartData = prepareChartData();
  const responseLabels = getResponseLabels();

  // Color palette for different response options
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4'];

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Response Distributions by Demographics
        </Typography>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Demographic</InputLabel>
          <Select
            value={selectedField}
            label="Demographic"
            onChange={(e) => setSelectedField(e.target.value)}
          >
            {demographicFields.map((field) => (
              <MenuItem key={field} value={field}>
                {formatFieldName(field)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">Loading demographic data...</Typography>
        </Box>
      ) : chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" />
              <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any) => `${value}%`} />
              <Legend />
              {responseLabels.map((label: string, index: number) => (
                <Bar key={label} dataKey={label} fill={colors[index % colors.length]} stackId="a" />
              ))}
            </BarChart>
          </ResponsiveContainer>

          {analysis?.statistical_tests?.[questionId]?.significant && (
            <Box sx={{ mt: 1 }}>
              <Chip
                label={`Statistically significant (p = ${analysis.statistical_tests[questionId].p_value.toFixed(4)})`}
                color="warning"
                size="small"
              />
            </Box>
          )}
        </>
      ) : (
        <Alert severity="info" sx={{ mt: 1 }}>
          No demographic data available for this question.
        </Alert>
      )}
    </Box>
  );
};

export default QuestionDemographicChart;
