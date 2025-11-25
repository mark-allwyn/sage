/**
 * Insights Panel
 * Natural language insights and detailed analysis
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Collapse,
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getDetailedInsights } from '../../services/api';
import { DetailedInsight } from '../../services/types';

interface InsightsPanelProps {
  insights?: any;
  runId: string;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, runId }) => {
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set([0]));
  const [showDetailed, setShowDetailed] = useState(false);

  const { data: detailedInsights, isLoading: detailedLoading } = useQuery({
    queryKey: ['detailed-insights', runId],
    queryFn: () => getDetailedInsights(runId),
    enabled: showDetailed,
  });

  const toggleInsight = (index: number) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedInsights(newExpanded);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getSeverityColor = (severity: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  if (!insights) {
    return (
      <Alert severity="info">
        Insights are being generated. This may take a moment.
      </Alert>
    );
  }

  const renderInsightCard = (insight: DetailedInsight, index: number) => {
    const isExpanded = expandedInsights.has(index);

    return (
      <Card key={index} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {getSeverityIcon(insight.severity)}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {insight.title}
              </Typography>
            </Box>
            <Chip
              label={insight.severity.toUpperCase()}
              color={getSeverityColor(insight.severity)}
              size="small"
            />
          </Box>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {insight.insight}
          </Typography>

          {insight.recommendations && insight.recommendations.length > 0 && (
            <>
              <Button
                onClick={() => toggleInsight(index)}
                endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                size="small"
              >
                {isExpanded ? 'Hide' : 'Show'} Recommendations ({insight.recommendations.length})
              </Button>

              <Collapse in={isExpanded}>
                <Box sx={{ mt: 2, pl: 2, borderLeft: 3, borderColor: 'primary.main' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommendations:
                  </Typography>
                  <List dense>
                    {insight.recommendations.map((rec, idx) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {idx + 1}. {rec}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Collapse>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Analysis Insights
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Natural language insights generated from your survey data
      </Typography>

      {/* Executive Summary Insights */}
      {insights.executive_summary && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Executive Summary
          </Typography>

          {insights.executive_summary.summary && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {insights.executive_summary.summary}
            </Alert>
          )}

          {insights.executive_summary.key_insights && insights.executive_summary.key_insights.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Key Insights:
              </Typography>
              <List>
                {insights.executive_summary.key_insights.map((insight: string, idx: number) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Chip label={idx + 1} size="small" color="primary" sx={{ mr: 2 }} />
                            <Typography variant="body2">{insight}</Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}

      {/* Detailed Insights */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setShowDetailed(!showDetailed)}
          endIcon={showDetailed ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {showDetailed ? 'Hide' : 'Show'} Detailed Insights
        </Button>
      </Box>

      {showDetailed && (
        <>
          {detailedLoading ? (
            <Alert severity="info">Loading detailed insights...</Alert>
          ) : detailedInsights?.insights && detailedInsights.insights.length > 0 ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Detailed Analysis ({detailedInsights.insights.length} insights)
              </Typography>
              {detailedInsights.insights.map((insight: DetailedInsight, index: number) =>
                renderInsightCard(insight, index)
              )}
            </Box>
          ) : (
            <Alert severity="info">No detailed insights available.</Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default InsightsPanel;
