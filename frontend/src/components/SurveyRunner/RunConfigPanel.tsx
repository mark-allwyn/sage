/**
 * Run Config Panel Component
 * Configuration options for running surveys
 * Normalization method is always 'paper' (from arXiv:2510.08338v2)
 */

import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Slider,
  Box,
  Tooltip,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { HelpOutline as HelpIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { RunSurveyConfig } from '../../services/types';
import { useSettings } from '../../services/hooks';
import { getEnabledProviders, getEnabledModelsForProvider, getDefaultProvider, getDefaultModel } from '../../utils/providerFilters';

interface RunConfigPanelProps {
  config: RunSurveyConfig;
  setConfig: (config: RunSurveyConfig) => void;
  disabled?: boolean;
}

const RunConfigPanel: React.FC<RunConfigPanelProps> = ({ config, setConfig, disabled }) => {
  const { data: settings } = useSettings();

  const handleChange = (field: keyof RunSurveyConfig, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  const enabledProviders = getEnabledProviders(settings);
  const enabledModels = getEnabledModelsForProvider(config.llm_provider, settings);

  // Auto-select default provider and model if current ones are not enabled
  React.useEffect(() => {
    if (settings && enabledProviders.length > 0) {
      const currentProviderEnabled = enabledProviders.some(p => p.value === config.llm_provider);
      const currentModelEnabled = enabledModels.some(m => m.value === config.model);

      if (!currentProviderEnabled || !currentModelEnabled) {
        const defaultProvider = getDefaultProvider(settings);
        const defaultModel = defaultProvider ? getDefaultModel(defaultProvider, settings) : null;
        if (defaultProvider && defaultModel) {
          setConfig({
            ...config,
            llm_provider: defaultProvider,
            model: defaultModel
          });
        }
      }
    }
  }, [settings, enabledProviders, enabledModels, config.llm_provider, config.model]);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Typography variant="h5">
          Run Configuration
        </Typography>
        <Tooltip title="Configure how the survey will be executed: choose the AI model, set the number of synthetic respondents, and adjust parameters for response generation and analysis.">
          <IconButton size="small">
            <HelpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {enabledProviders.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No LLM providers are enabled. Please go to Settings to configure at least one provider (OpenAI or Anthropic).
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sample Size */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <TextField
              fullWidth
              type="number"
              label="Number of Profiles"
              value={config.num_profiles}
              onChange={(e) => handleChange('num_profiles', parseInt(e.target.value) || 50)}
              inputProps={{ min: 10, max: 500 }}
              helperText="Number of respondent profiles to generate (10-500)"
              disabled={disabled}
            />
            <Tooltip title="How many synthetic respondents to create. More profiles provide richer data but take longer to process. Start with 50-100 for testing.">
              <IconButton size="small" sx={{ mt: 1 }}>
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>

        {/* Advanced Settings Accordion */}
        <Grid item xs={12}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Advanced Settings
                </Typography>
                <Tooltip title="Configure LLM provider/model, temperature settings, SSR parameters, and random seed for reproducibility.">
                  <IconButton size="small" sx={{ p: 0 }}>
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* LLM Configuration Section */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" color="primary">
                      LLM Configuration
                    </Typography>
                    <Tooltip title="Choose the AI provider and model that will generate synthetic survey responses. Different models have different capabilities, costs, and response styles.">
                      <IconButton size="small">
                        <HelpIcon fontSize="small" sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>

                {/* LLM Provider */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <FormControl fullWidth disabled={disabled || enabledProviders.length === 0}>
                      <InputLabel>LLM Provider</InputLabel>
                      <Select
                        value={config.llm_provider}
                        label="LLM Provider"
                        onChange={(e) => {
                          // Update provider and model atomically
                          const newProvider = e.target.value as 'openai' | 'anthropic';
                          const newModel = getDefaultModel(newProvider, settings);
                          setConfig({
                            ...config,
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
                    <Tooltip title="Select between OpenAI (GPT models) or Anthropic (Claude models). Make sure you have API keys configured.">
                      <IconButton size="small" sx={{ mt: 1 }}>
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>

                {/* Model */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <FormControl fullWidth disabled={disabled || enabledModels.length === 0}>
                      <InputLabel>Model</InputLabel>
                      <Select
                        value={config.model}
                        label="Model"
                        onChange={(e) => handleChange('model', e.target.value)}
                      >
                        {enabledModels.map((model) => (
                          <MenuItem key={model.value} value={model.value}>
                            {model.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Tooltip title="Choose the specific model version. Newer/larger models (GPT-4, Claude 3.5 Sonnet) are more capable but cost more. Smaller models (GPT-3.5) are faster and cheaper.">
                      <IconButton size="small" sx={{ mt: 1 }}>
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>

                {/* LLM Temperature */}
                <Grid item xs={12}>
                  <Box sx={{ pt: 1, px: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>LLM Temperature</Typography>
                        <Tooltip title="Controls creativity vs consistency in AI responses. Lower values (0-0.5) = more deterministic and focused. Higher values (1.5-2) = more creative and diverse. Default 0.7 works well for most surveys.">
                          <IconButton size="small" sx={{ p: 0.25 }}>
                            <HelpIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {config.llm_temperature}
                      </Typography>
                    </Box>
                    <Box sx={{ px: 1, pb: 2 }}>
                      <Slider
                        value={config.llm_temperature}
                        onChange={(_, value) => handleChange('llm_temperature', value)}
                        min={0}
                        max={2}
                        step={0.1}
                        marks={[
                          { value: 0, label: '0' },
                          { value: 0.5, label: '0.5' },
                          { value: 1, label: '1' },
                          { value: 1.5, label: '1.5' },
                          { value: 2, label: '2' },
                        ]}
                        disabled={disabled}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1 }}>
                      0 = Deterministic, 1 = Balanced, 2 = Creative
                    </Typography>
                  </Box>
                </Grid>

                {/* SSR Configuration Section */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <Typography variant="subtitle2" color="primary">
                      SSR Configuration
                    </Typography>
                    <Tooltip title="Semantic Similarity Rating (SSR) converts text responses into probability distributions. These parameters control how the conversion is performed.">
                      <IconButton size="small">
                        <HelpIcon fontSize="small" sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>

                {/* SSR Temperature */}
                <Grid item xs={12}>
                  <Box sx={{ pt: 1, px: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>SSR Temperature</Typography>
                        <Tooltip title="Controls how 'sharp' or 'smooth' the probability distributions are. Lower values (0.1-0.5) = sharper peaks, higher confidence. Higher values (2-5) = smoother distributions, more uncertainty. Default 1.0 is recommended.">
                          <IconButton size="small" sx={{ p: 0.25 }}>
                            <HelpIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {config.ssr_temperature}
                      </Typography>
                    </Box>
                    <Box sx={{ px: 1, pb: 2 }}>
                      <Slider
                        value={config.ssr_temperature}
                        onChange={(_, value) => handleChange('ssr_temperature', value)}
                        min={0.1}
                        max={5}
                        step={0.1}
                        marks={[
                          { value: 0.1, label: '0.1' },
                          { value: 1, label: '1' },
                          { value: 2.5, label: '2.5' },
                          { value: 5, label: '5' },
                        ]}
                        disabled={disabled}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1 }}>
                      0.1 = Sharp distributions, 1 = Balanced, 5 = Smooth distributions
                    </Typography>
                  </Box>
                </Grid>

                {/* Seed */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Reproducibility
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Random Seed"
                      value={config.seed}
                      onChange={(e) => handleChange('seed', parseInt(e.target.value) || 100)}
                      inputProps={{ min: 0, max: 10000 }}
                      helperText="For reproducibility (0-10000)"
                      disabled={disabled}
                    />
                    <Tooltip title="Set a seed value to make results reproducible. Using the same seed with the same configuration will produce identical results. Useful for testing and comparing different settings.">
                      <IconButton size="small" sx={{ mt: 1 }}>
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RunConfigPanel;
