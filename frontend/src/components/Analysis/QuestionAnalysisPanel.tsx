/**
 * Question Analysis Panel
 * Detailed table view of all question-level metrics
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  LinearProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { QuestionAnalysis } from '../../services/types';

interface QuestionAnalysisPanelProps {
  questions?: QuestionAnalysis[];
}

type SortField = 'mean' | 'top_box_pct' | 'net_score' | 'std';
type SortDirection = 'asc' | 'desc';

const QuestionAnalysisPanel: React.FC<QuestionAnalysisPanelProps> = ({ questions }) => {
  const [sortField, setSortField] = useState<SortField>('mean');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (!questions || questions.length === 0) {
    return (
      <Alert severity="info">
        Question analysis data is not available yet.
      </Alert>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    return (aValue - bValue) * modifier;
  });

  const getGradeColor = (grade: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (grade) {
      case 'A':
        return 'success';
      case 'B':
        return 'info';
      case 'C':
        return 'warning';
      case 'D':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProgressColor = (value: number): 'success' | 'info' | 'warning' | 'error' => {
    if (value >= 4.0) return 'success';
    if (value >= 3.0) return 'info';
    if (value >= 2.0) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Question Analysis ({questions.length} questions)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Detailed metrics for each survey question. Click column headers to sort.
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'mean'}
                  direction={sortField === 'mean' ? sortDirection : 'desc'}
                  onClick={() => handleSort('mean')}
                >
                  Mean
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Grade</TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'top_box_pct'}
                  direction={sortField === 'top_box_pct' ? sortDirection : 'desc'}
                  onClick={() => handleSort('top_box_pct')}
                >
                  Top Box %
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'net_score'}
                  direction={sortField === 'net_score' ? sortDirection : 'desc'}
                  onClick={() => handleSort('net_score')}
                >
                  Net Score
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'std'}
                  direction={sortField === 'std' ? sortDirection : 'desc'}
                  onClick={() => handleSort('std')}
                >
                  Std Dev
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Sample Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedQuestions.map((question, index) => (
              <TableRow key={question.question_id || index} hover>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Tooltip title={question.question_text}>
                    <Typography variant="body2" noWrap>
                      {question.question_text}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary">
                    {question.question_id}
                  </Typography>
                </TableCell>
                <TableCell>
                  {question.category && (
                    <Chip label={question.category} size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ minWidth: 100 }}>
                    <Typography variant="body1" fontWeight="bold">
                      {question.mean.toFixed(2)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(question.mean / 5) * 100}
                      color={getProgressColor(question.mean)}
                      sx={{ mt: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {question.ci_95_lower.toFixed(2)} - {question.ci_95_upper.toFixed(2)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={question.grade}
                    color={getGradeColor(question.grade)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{question.top_box_pct.toFixed(1)}%</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{question.net_score.toFixed(1)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{question.std.toFixed(2)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{question.sample_size}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QuestionAnalysisPanel;
