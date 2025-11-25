/**
 * SSR Generation Dialog Component
 *
 * Dialog for generating ground truth data via the SSR pipeline.
 * Extracted from GroundTruthTestingPage.tsx to reduce component complexity.
 *
 * Features:
 * - Configure ground truth name and description
 * - Select LLM provider and model
 * - Configure SSR parameters (num_profiles, temperatures, seed)
 * - Display progress and errors during generation
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Divider,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { CreateGroundTruthFromSSRRequest } from '../services/types';
import { getDefaultModel } from '../utils/providerFilters';

interface ProviderOption {
  value: string;
  label: string;
}

interface ModelOption {
  value: string;
  label: string;
}

interface SSRGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  ssrConfig: CreateGroundTruthFromSSRRequest;
  onConfigChange: (config: CreateGroundTruthFromSSRRequest) => void;
  onSubmit: () => void;
  enabledProviders: ProviderOption[];
  enabledModels: ModelOption[];
  settings?: any;
  isPending: boolean;
  isError: boolean;
  error: any;
}

const SSRGenerationDialog: React.FC<SSRGenerationDialogProps> = ({
  open,
  onClose,
  ssrConfig,
  onConfigChange,
  onSubmit,
  enabledProviders,
  enabledModels,
  settings,
  isPending,
  isError,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Generate Ground Truth via SSR Pipeline</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {enabledProviders.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No LLM providers are enabled. Please go to Settings to configure at least one provider (OpenAI, Anthropic, Gemini, or Ollama).
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 3 }}>
            This will run the full SSR pipeline using your survey's persona groups to generate a
            high-quality ground truth baseline. Higher profile counts produce better results but take longer.
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Ground Truth Name"
                fullWidth
                required
                value={ssrConfig.name}
                onChange={(e) => onConfigChange({ ...ssrConfig, name: e.target.value })}
                placeholder="e.g., GPT-4 Baseline n=500"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={ssrConfig.description}
                onChange={(e) => onConfigChange({ ...ssrConfig, description: e.target.value })}
                placeholder="Optional: Describe this ground truth"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Configuration
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Number of Profiles"
                type="number"
                fullWidth
                required
                value={ssrConfig.num_profiles}
                onChange={(e) =>
                  onConfigChange({ ...ssrConfig, num_profiles: parseInt(e.target.value) })
                }
                inputProps={{ min: 10, max: 2000 }}
                helperText="Recommended: 50-100 for testing, 500+ for production"
              />
            </Grid>

            <Grid item xs={12}>
              <Accordion defaultExpanded={false}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Advanced Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required disabled={enabledProviders.length === 0}>
                        <InputLabel>LLM Provider</InputLabel>
                        <Select
                          value={ssrConfig.llm_provider}
                          label="LLM Provider"
                          onChange={(e) => {
                            // Update provider and model atomically
                            const newProvider = e.target.value as 'openai' | 'anthropic';
                            const newModel = getDefaultModel(newProvider, settings);
                            onConfigChange({
                              ...ssrConfig,
                              llm_provider: newProvider,
                              model: newModel || ''
                            });
                          }}
                        >
                          {enabledProviders.map((provider) => (
                            <MenuItem key={provider.value} value={provider.value}>
                              {provider.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required disabled={enabledModels.length === 0}>
                        <InputLabel>Model</InputLabel>
                        <Select
                          value={ssrConfig.model}
                          label="Model"
                          onChange={(e) => onConfigChange({ ...ssrConfig, model: e.target.value })}
                        >
                          {enabledModels.map((model) => (
                            <MenuItem key={model.value} value={model.value}>
                              {model.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        label="LLM Temperature"
                        type="number"
                        fullWidth
                        required
                        value={ssrConfig.llm_temperature}
                        onChange={(e) =>
                          onConfigChange({ ...ssrConfig, llm_temperature: parseFloat(e.target.value) })
                        }
                        inputProps={{ min: 0, max: 2, step: 0.1 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        label="SSR Temperature"
                        type="number"
                        fullWidth
                        required
                        value={ssrConfig.ssr_temperature}
                        onChange={(e) =>
                          onConfigChange({ ...ssrConfig, ssr_temperature: parseFloat(e.target.value) })
                        }
                        inputProps={{ min: 0.1, max: 5, step: 0.1 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Random Seed"
                        type="number"
                        fullWidth
                        required
                        value={ssrConfig.seed}
                        onChange={(e) => onConfigChange({ ...ssrConfig, seed: parseInt(e.target.value) })}
                        inputProps={{ min: 0, max: 10000 }}
                        helperText="For reproducibility"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          {isPending && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                Generating ground truth... This may take several minutes.
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom fontWeight="medium">
                Error creating ground truth
              </Typography>
              <Typography variant="body2">
                {(() => {
                  if (error?.response?.data?.detail) {
                    return typeof error.response.data.detail === 'string'
                      ? error.response.data.detail
                      : JSON.stringify(error.response.data.detail, null, 2);
                  }
                  return error?.message || 'Please check your configuration and try again.';
                })()}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!ssrConfig.name || isPending}
        >
          {isPending ? 'Generating...' : 'Generate Ground Truth'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SSRGenerationDialog;
