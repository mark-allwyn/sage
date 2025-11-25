/**
 * MetricInterpretation Component
 *
 * Provides visual interpretation of statistical metrics with color-coded badges
 * and plain-language explanations to make technical metrics accessible to all users.
 */

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

export type MetricType = 'kl_divergence' | 'js_divergence' | 'wasserstein' | 'mae' | 'p_value';

interface QualityLevel {
  label: string;
  color: 'success' | 'info' | 'warning' | 'error';
  icon: React.ReactElement;
  description: string;
  score: number; // 0-100 for progress bar
}

interface MetricInterpretationProps {
  metricType: MetricType;
  value: number;
  std?: number;
  showProgressBar?: boolean;
  showTooltip?: boolean;
  compact?: boolean;
}

/**
 * Interprets KL Divergence values
 * Lower is better (0 = identical distributions)
 * Thresholds based on practical ML/statistics standards
 */
const interpretKLDivergence = (value: number): QualityLevel => {
  if (value < 0.01) {
    return {
      label: 'Excellent Match',
      color: 'success',
      icon: <CheckCircleIcon />,
      description: 'Distributions are nearly identical. Excellent replication of ground truth.',
      score: 100,
    };
  } else if (value < 0.05) {
    return {
      label: 'Very Good',
      color: 'success',
      icon: <CheckCircleIcon />,
      description: 'Distributions are very similar. Strong replication quality.',
      score: 85,
    };
  } else if (value < 0.15) {
    return {
      label: 'Good',
      color: 'info',
      icon: <InfoIcon />,
      description: 'Distributions show good similarity. Minor differences present.',
      score: 70,
    };
  } else if (value < 0.30) {
    return {
      label: 'Moderate',
      color: 'warning',
      icon: <WarningIcon />,
      description: 'Distributions have noticeable differences. May require investigation.',
      score: 50,
    };
  } else {
    return {
      label: 'Poor Match',
      color: 'error',
      icon: <ErrorIcon />,
      description: 'Distributions are substantially different. Significant divergence detected.',
      score: 25,
    };
  }
};

/**
 * Interprets JS Divergence values
 * Similar to KL but symmetric and bounded [0,1]
 */
const interpretJSDivergence = (value: number): QualityLevel => {
  if (value < 0.01) {
    return {
      label: 'Excellent Match',
      color: 'success',
      icon: <CheckCircleIcon />,
      description: 'Distributions are nearly identical. Excellent similarity.',
      score: 100,
    };
  } else if (value < 0.05) {
    return {
      label: 'Very Good',
      color: 'success',
      icon: <CheckCircleIcon />,
      description: 'Distributions are very similar. High quality match.',
      score: 85,
    };
  } else if (value < 0.10) {
    return {
      label: 'Good',
      color: 'info',
      icon: <InfoIcon />,
      description: 'Distributions show good similarity with minor variations.',
      score: 70,
    };
  } else if (value < 0.20) {
    return {
      label: 'Moderate',
      color: 'warning',
      icon: <WarningIcon />,
      description: 'Moderate differences between distributions detected.',
      score: 50,
    };
  } else {
    return {
      label: 'Poor Match',
      color: 'error',
      icon: <ErrorIcon />,
      description: 'Substantial differences between distributions.',
      score: 25,
    };
  }
};

/**
 * Interprets Wasserstein Distance
 * Earth Mover's Distance - lower is better
 */
const interpretWasserstein = (value: number): QualityLevel => {
  if (value < 0.10) {
    return {
      label: 'Excellent Match',
      color: 'success',
      icon: <CheckCircleIcon />,
      description: 'Very small distribution shift. Excellent alignment.',
      score: 100,
    };
  } else if (value < 0.25) {
    return {
      label: 'Very Good',
      color: 'success',
      icon: <CheckCircleIcon />,
      description: 'Small distribution shift. Good alignment.',
      score: 85,
    };
  } else if (value < 0.50) {
    return {
      label: 'Good',
      color: 'info',
      icon: <InfoIcon />,
      description: 'Moderate distribution shift. Acceptable similarity.',
      score: 70,
    };
  } else if (value < 1.00) {
    return {
      label: 'Moderate',
      color: 'warning',
      icon: <WarningIcon />,
      description: 'Noticeable distribution shift. Some divergence present.',
      score: 50,
    };
  } else {
    return {
      label: 'Poor Match',
      color: 'error',
      icon: <ErrorIcon />,
      description: 'Large distribution shift detected. Significant divergence.',
      score: 25,
    };
  }
};

/**
 * Interprets Mean Absolute Error
 * Average probability difference across all responses
 */
const interpretMAE = (value: number): QualityLevel => {
  if (value < 0.02) {
    return {
      label: 'Excellent Match',
      color: 'success',
      icon: <CheckCircleIcon />,
      description: 'Minimal probability differences. Excellent accuracy.',
      score: 100,
    };
  } else if (value < 0.05) {
    return {
      label: 'Very Good',
      color: 'success',
      icon: <CheckCircleIcon />,
      description: 'Small probability differences. High accuracy.',
      score: 85,
    };
  } else if (value < 0.10) {
    return {
      label: 'Good',
      color: 'info',
      icon: <InfoIcon />,
      description: 'Moderate probability differences. Good accuracy.',
      score: 70,
    };
  } else if (value < 0.20) {
    return {
      label: 'Moderate',
      color: 'warning',
      icon: <WarningIcon />,
      description: 'Noticeable probability differences. Moderate accuracy.',
      score: 50,
    };
  } else {
    return {
      label: 'Poor Match',
      color: 'error',
      icon: <ErrorIcon />,
      description: 'Large probability differences. Low accuracy.',
      score: 25,
    };
  }
};

/**
 * Interprets P-value from chi-squared test
 * Higher is better (>0.05 = statistically similar)
 */
const interpretPValue = (value: number): QualityLevel => {
  if (value >= 0.05) {
    return {
      label: 'Statistically Similar',
      color: 'success',
      icon: <CheckCircleIcon />,
      description: 'No significant difference detected. Distributions are statistically similar (p ≥ 0.05).',
      score: 100,
    };
  } else if (value >= 0.01) {
    return {
      label: 'Possibly Different',
      color: 'warning',
      icon: <WarningIcon />,
      description: 'Weak evidence of difference (0.01 ≤ p < 0.05). May warrant investigation.',
      score: 60,
    };
  } else {
    return {
      label: 'Significantly Different',
      color: 'error',
      icon: <ErrorIcon />,
      description: 'Strong evidence of difference (p < 0.01). Distributions are statistically different.',
      score: 20,
    };
  }
};

/**
 * Route to appropriate interpretation function based on metric type
 */
const getInterpretation = (metricType: MetricType, value: number): QualityLevel => {
  switch (metricType) {
    case 'kl_divergence':
      return interpretKLDivergence(value);
    case 'js_divergence':
      return interpretJSDivergence(value);
    case 'wasserstein':
      return interpretWasserstein(value);
    case 'mae':
      return interpretMAE(value);
    case 'p_value':
      return interpretPValue(value);
    default:
      return {
        label: 'Unknown',
        color: 'info',
        icon: <InfoIcon />,
        description: 'Unable to interpret this metric type.',
        score: 50,
      };
  }
};

/**
 * Format metric value for display
 */
const formatValue = (value: number | null | undefined, std?: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  const formattedValue = value.toFixed(4);
  if (std !== undefined && std !== null && !isNaN(std)) {
    return `${formattedValue} ± ${std.toFixed(4)}`;
  }
  return formattedValue;
};

const MetricInterpretation: React.FC<MetricInterpretationProps> = ({
  metricType,
  value,
  std,
  showProgressBar = true,
  showTooltip = true,
  compact = false,
}) => {
  // Handle null/undefined values
  if (value === null || value === undefined || isNaN(value)) {
    const message = metricType === 'p_value'
      ? 'Test not valid (insufficient data)'
      : 'No data available';

    const tooltip = metricType === 'p_value'
      ? 'Chi-squared test cannot be performed due to low expected frequencies. This typically occurs with sparse distributions or small sample sizes. Other metrics (KL, JS, Wasserstein) are still valid.'
      : 'No data available for this metric';

    const content = (
      <Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label="N/A"
            color="default"
            size={compact ? 'small' : 'medium'}
            sx={{ fontWeight: 600 }}
          />
          <Typography
            variant={compact ? 'caption' : 'body2'}
            color="text.secondary"
          >
            {message}
          </Typography>
        </Stack>
      </Box>
    );

    if (showTooltip) {
      return (
        <Tooltip title={tooltip} arrow placement="top">
          {content}
        </Tooltip>
      );
    }

    return content;
  }

  const interpretation = getInterpretation(metricType, value);

  const content = (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: compact ? 0.5 : 1 }}>
        <Chip
          icon={interpretation.icon}
          label={interpretation.label}
          color={interpretation.color}
          size={compact ? 'small' : 'medium'}
          sx={{ fontWeight: 600 }}
        />
        <Typography
          variant={compact ? 'caption' : 'body2'}
          color="text.secondary"
          fontFamily="monospace"
        >
          {formatValue(value, std)}
        </Typography>
      </Stack>

      {showProgressBar && (
        <LinearProgress
          variant="determinate"
          value={interpretation.score}
          color={interpretation.color}
          sx={{
            height: compact ? 6 : 8,
            borderRadius: 1,
            bgcolor: 'action.hover',
            mb: compact ? 0 : 1,
          }}
        />
      )}

      {!compact && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {interpretation.description}
        </Typography>
      )}
    </Box>
  );

  if (showTooltip && compact) {
    return (
      <Tooltip title={interpretation.description} arrow placement="top">
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default MetricInterpretation;
