/**
 * AnalysisProgressIndicator Component
 *
 * Provides visual feedback during analysis loading with simulated progress
 * and stage descriptions to improve perceived performance and set expectations.
 *
 * Future enhancement: Connect to backend WebSocket for real-time progress updates
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  RadioButtonUnchecked as RadioButtonIcon,
} from '@mui/icons-material';

interface AnalysisStage {
  name: string;
  description: string;
  estimatedDuration: number; // in seconds
}

const ANALYSIS_STAGES: AnalysisStage[] = [
  {
    name: 'Loading survey data',
    description: 'Retrieving survey responses and metadata',
    estimatedDuration: 2,
  },
  {
    name: 'Processing responses',
    description: 'Analyzing response patterns and distributions',
    estimatedDuration: 3,
  },
  {
    name: 'Calculating statistics',
    description: 'Computing means, medians, and confidence intervals',
    estimatedDuration: 2,
  },
  {
    name: 'Generating insights',
    description: 'Creating executive summary and key findings',
    estimatedDuration: 3,
  },
  {
    name: 'Preparing visualizations',
    description: 'Building charts and data displays',
    estimatedDuration: 2,
  },
];

interface AnalysisProgressIndicatorProps {
  responseCount?: number;
  questionCount?: number;
}

const AnalysisProgressIndicator: React.FC<AnalysisProgressIndicatorProps> = ({
  responseCount,
  questionCount,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Calculate total estimated time based on data size
  const baseTime = ANALYSIS_STAGES.reduce((sum, stage) => sum + stage.estimatedDuration, 0);
  const scaleFactor = responseCount && questionCount
    ? Math.max(1, (responseCount * questionCount) / 1000)
    : 1;
  const totalEstimatedTime = baseTime * scaleFactor;

  useEffect(() => {
    // Update progress every 100ms
    const progressInterval = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 0.1;

        // Calculate progress (asymptotic curve - never quite reaches 100%)
        // This creates a realistic feeling of progress that slows near completion
        const rawProgress = (newTime / totalEstimatedTime) * 100;
        const asymptoticProgress = 95 * (1 - Math.exp(-rawProgress / 50));
        setProgress(Math.min(asymptoticProgress, 95));

        // Determine current stage
        let cumulativeTime = 0;
        for (let i = 0; i < ANALYSIS_STAGES.length; i++) {
          cumulativeTime += ANALYSIS_STAGES[i].estimatedDuration * scaleFactor;
          if (newTime < cumulativeTime) {
            setCurrentStageIndex(i);
            break;
          }
        }
        if (newTime >= totalEstimatedTime * 0.9) {
          setCurrentStageIndex(ANALYSIS_STAGES.length - 1);
        }

        return newTime;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [totalEstimatedTime, scaleFactor]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.ceil(seconds)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getStageIcon = (index: number) => {
    if (index < currentStageIndex) {
      return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
    } else if (index === currentStageIndex) {
      return <HourglassIcon sx={{ color: 'primary.main', fontSize: 20 }} />;
    } else {
      return <RadioButtonIcon sx={{ color: 'action.disabled', fontSize: 20 }} />;
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Analyzing Survey Results
        </Typography>
        {responseCount && questionCount && (
          <Typography variant="body2" color="text.secondary">
            Processing {responseCount.toLocaleString()} responses across {questionCount} questions
          </Typography>
        )}
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progress
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${Math.round(progress)}%`}
              size="small"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="caption" color="text.secondary">
              ~{formatTime(Math.max(0, totalEstimatedTime - elapsedTime))} remaining
            </Typography>
          </Stack>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 1,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
              transition: 'transform 0.2s ease-in-out',
            }
          }}
        />
      </Box>

      {/* Stage List */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
          Analysis Stages
        </Typography>
        <Stack spacing={1.5}>
          {ANALYSIS_STAGES.map((stage, index) => (
            <Box
              key={stage.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 1,
                bgcolor: index === currentStageIndex ? 'action.selected' : 'transparent',
                transition: 'background-color 0.3s',
                border: '1px solid',
                borderColor: index === currentStageIndex ? 'primary.main' : 'transparent',
              }}
            >
              {getStageIcon(index)}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight={index === currentStageIndex ? 600 : 400}
                  color={index < currentStageIndex ? 'success.main' : 'text.primary'}
                >
                  {stage.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stage.description}
                </Typography>
              </Box>
              {index < currentStageIndex && (
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
              )}
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Helpful Tip */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: 'info.lighter',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.light',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          💡 <strong>Tip:</strong> Analysis time scales with response count. Larger datasets take longer to process.
        </Typography>
      </Box>
    </Paper>
  );
};

export default AnalysisProgressIndicator;
