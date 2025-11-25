/**
 * Run Progress Component
 * Shows progress during survey execution
 */

import React from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Divider,
  Button
} from '@mui/material';
import {
  PersonOutline as ProfileIcon,
  ChatBubbleOutline as ResponseIcon,
  QueryStats as SSRIcon,
  CheckCircleOutline as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

interface RunProgressProps {
  progress: number;
  messages: string[];
  currentStep?: string;
  details?: {
    num_api_calls?: number;
    num_batches?: number;
    concurrent_limit?: number;
  } | null;
  onCancel?: () => void;
}

const RunProgress: React.FC<RunProgressProps> = ({ progress, messages, currentStep, details, onCancel }) => {
  const getStepIcon = (step: string) => {
    switch (step) {
      case 'profiles':
        return <ProfileIcon fontSize="small" />;
      case 'responses':
        return <ResponseIcon fontSize="small" />;
      case 'ssr':
        return <SSRIcon fontSize="small" />;
      default:
        return <CheckIcon fontSize="small" />;
    }
  };

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'profiles':
        return 'Generating Profiles';
      case 'responses':
        return 'LLM Responses';
      case 'ssr':
        return 'Applying SSR';
      default:
        return 'Processing';
    }
  };

  return (
    <Paper sx={{ p: 3 }} role="status" aria-live="polite" aria-atomic="true">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Running Survey...
        </Typography>
        {onCancel && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            aria-label="Cancel survey run"
          >
            Cancel
          </Button>
        )}
      </Box>

      {/* Current Step Indicator */}
      {currentStep && (
        <Box sx={{ mb: 3 }}>
          <Chip
            icon={getStepIcon(currentStep)}
            label={getStepLabel(currentStep)}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'medium' }}
          />
        </Box>
      )}

      {/* Progress Bar */}
      <Box sx={{ my: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progress
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="primary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          aria-label={`Survey progress: ${progress}%`}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>

      {/* Details Section */}
      {details && Object.keys(details).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            {details.num_api_calls !== undefined && (
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary">
                    {details.num_api_calls}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    API Calls
                  </Typography>
                </Box>
              </Grid>
            )}
            {details.num_batches !== undefined && (
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary">
                    {details.num_batches}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Batches
                  </Typography>
                </Box>
              </Grid>
            )}
            {details.concurrent_limit !== undefined && (
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary">
                    {details.concurrent_limit}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Concurrent
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="body2" color="text.secondary" paragraph>
        This may take several minutes depending on the survey size and LLM provider.
      </Typography>
      <List
        dense
        sx={{
          maxHeight: 300,
          overflow: 'auto',
          bgcolor: 'background.default',
          borderRadius: 1,
          p: 1
        }}
        aria-label="Survey execution progress messages"
      >
        {messages.map((message, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={message}
              primaryTypographyProps={{
                variant: 'body2',
                fontFamily: 'monospace',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default RunProgress;
