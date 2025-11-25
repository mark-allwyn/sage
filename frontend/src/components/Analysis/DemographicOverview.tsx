/**
 * Demographic Overview Component
 * Compact visualization of response distributions by demographic segments
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getDemographicAnalysis } from '../../services/api';
import { DemographicAnalysis, DemographicSegment, QuestionDistribution } from '../../services/types';

interface DemographicOverviewProps {
  runId: string;
  demographicFields: string[];
}

const DemographicOverview: React.FC<DemographicOverviewProps> = ({
  runId,
  demographicFields,
}) => {
  const [selectedField, setSelectedField] = useState(demographicFields[0] || '');
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['demographic-analysis', runId, selectedField],
    queryFn: () => getDemographicAnalysis(runId, selectedField),
    enabled: !!selectedField,
  });

  // Get list of questions from first segment
  const questions = React.useMemo(() => {
    if (!analysis?.segments) return [];
    const firstSegment = Object.values(analysis.segments)[0] as DemographicSegment | undefined;
    return firstSegment?.questions || [];
  }, [analysis]);

  // Set default selected question
  React.useEffect(() => {
    if (questions.length > 0 && !selectedQuestion) {
      setSelectedQuestion(questions[0].question_id);
    }
  }, [questions, selectedQuestion]);

  const formatFieldName = (field: string) => {
    return field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const prepareChartData = () => {
    if (!analysis || !selectedQuestion) return [];

    const segments = analysis.segments as { [key: string]: DemographicSegment };
    const questionData = Object.entries(segments).map(([segmentName, segment]) => {
      const question = segment.questions.find((q: QuestionDistribution) => q.question_id === selectedQuestion);
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
    if (!analysis || !selectedQuestion) return [];

    const firstSegment = Object.values(analysis.segments)[0] as DemographicSegment | undefined;
    const question = firstSegment?.questions.find((q: QuestionDistribution) => q.question_id === selectedQuestion);
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
  const selectedQuestionData = questions.find((q: QuestionDistribution) => q.question_id === selectedQuestion);

  // Color palette for different response options
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4'];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Response Distributions by Demographics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compare how different demographic groups responded
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 180 }} size="small">
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

          <FormControl sx={{ minWidth: 250 }} size="small">
            <InputLabel>Question</InputLabel>
            <Select
              value={selectedQuestion}
              label="Question"
              onChange={(e) => setSelectedQuestion(e.target.value)}
            >
              {questions.map((q: QuestionDistribution) => (
                <MenuItem key={q.question_id} value={q.question_id}>
                  {q.question_text.length > 40 ? q.question_text.substring(0, 40) + '...' : q.question_text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading demographic data...</Typography>
        </Box>
      ) : analysis && chartData.length > 0 ? (
        <>
          {selectedQuestionData && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {selectedQuestionData.question_text}
              </Typography>
            </Box>
          )}

          <ResponsiveContainer width="100%" height={300}>
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

          {analysis.statistical_tests?.[selectedQuestion]?.significant && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`Statistically significant difference (p = ${analysis.statistical_tests[selectedQuestion].p_value.toFixed(4)})`}
                color="warning"
                size="small"
              />
            </Box>
          )}
        </>
      ) : (
        <Alert severity="info">
          No demographic data available for this selection.
        </Alert>
      )}
    </Paper>
  );
};

export default DemographicOverview;
