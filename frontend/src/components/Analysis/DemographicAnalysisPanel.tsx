/**
 * Demographic Analysis Panel
 * Segment-level analysis across different demographic fields
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getDemographicAnalysis } from '../../services/api';
import { DemographicAnalysis } from '../../services/types';

interface DemographicAnalysisPanelProps {
  runId: string;
  demographicFields: string[];
}

const DemographicAnalysisPanel: React.FC<DemographicAnalysisPanelProps> = ({
  runId,
  demographicFields,
}) => {
  const [selectedField, setSelectedField] = useState(demographicFields[0] || '');

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['demographic-analysis', runId, selectedField],
    queryFn: () => getDemographicAnalysis(runId, selectedField),
    enabled: !!selectedField,
  });

  if (demographicFields.length === 0) {
    return (
      <Alert severity="info">
        No demographic data available for this survey.
      </Alert>
    );
  }

  if (!selectedField) {
    return null;
  }

  const formatFieldName = (field: string) => {
    return field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderSegmentTable = (data: DemographicAnalysis) => {
    const segments = Object.entries(data.segment_metrics || {});
    if (segments.length === 0) {
      return (
        <Alert severity="info">
          No segment data available for this demographic field.
        </Alert>
      );
    }

    // Sort by mean score descending
    const sortedSegments = segments.sort((a, b) => b[1].mean - a[1].mean);

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Segment</TableCell>
              <TableCell align="center">Mean Score</TableCell>
              <TableCell align="center">Top Box %</TableCell>
              <TableCell align="center">Std Dev</TableCell>
              <TableCell align="center">Sample Size</TableCell>
              <TableCell align="center">95% CI</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedSegments.map(([segment, metrics], index) => (
              <TableRow key={segment} hover>
                <TableCell>
                  <Chip label={index + 1} size="small" color={index === 0 ? 'success' : 'default'} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={index === 0 ? 'bold' : 'normal'}>
                    {segment}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ minWidth: 100 }}>
                    <Typography variant="body1" fontWeight="bold">
                      {metrics.mean.toFixed(2)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(metrics.mean / 5) * 100}
                      color={index === 0 ? 'success' : index === sortedSegments.length - 1 ? 'error' : 'primary'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{metrics.top_box_pct.toFixed(1)}%</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{metrics.std.toFixed(2)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{metrics.sample_size}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" color="text.secondary">
                    {metrics.ci_95_lower.toFixed(2)} - {metrics.ci_95_upper.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Demographic Segmentation Analysis
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Demographic Field</InputLabel>
          <Select
            value={selectedField}
            label="Demographic Field"
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
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading demographic analysis...</Typography>
        </Box>
      ) : analysis ? (
        <>
          {/* Top and Bottom Segments */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="success.main">
                      Top Segment
                    </Typography>
                  </Box>
                  <Typography variant="h4" gutterBottom>
                    {analysis.top_segment?.segment || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mean Score: <strong>{analysis.top_segment?.mean_score?.toFixed(2) || 'N/A'}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sample Size: {analysis.top_segment?.sample_size || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="error.main">
                      Bottom Segment
                    </Typography>
                  </Box>
                  <Typography variant="h4" gutterBottom>
                    {analysis.bottom_segment?.segment || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mean Score: <strong>{analysis.bottom_segment?.mean_score?.toFixed(2) || 'N/A'}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sample Size: {analysis.bottom_segment?.sample_size || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Statistical Significance */}
          {analysis.statistical_significance !== undefined && (
            <Alert
              severity={analysis.statistical_significance ? 'warning' : 'info'}
              sx={{ mb: 3 }}
            >
              {analysis.statistical_significance ? (
                <>
                  Differences between segments are <strong>statistically significant</strong>
                  {analysis.p_value && ` (p = ${analysis.p_value.toFixed(4)})`}
                  {analysis.effect_size && `, Effect size (Cohen's d) = ${analysis.effect_size.toFixed(3)}`}
                </>
              ) : (
                <>
                  Differences between segments are <strong>not statistically significant</strong>
                  {analysis.p_value && ` (p = ${analysis.p_value.toFixed(4)})`}
                </>
              )}
            </Alert>
          )}

          {/* Segment Table */}
          {renderSegmentTable(analysis)}
        </>
      ) : (
        <Alert severity="info">
          No demographic analysis available for this field.
        </Alert>
      )}
    </Box>
  );
};

export default DemographicAnalysisPanel;
