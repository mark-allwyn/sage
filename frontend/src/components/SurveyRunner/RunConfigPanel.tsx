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
} from '@mui/material';
import { RunSurveyConfig, LLM_PROVIDERS, OPENAI_MODELS, ANTHROPIC_MODELS } from '../../services/types';

interface RunConfigPanelProps {
  config: RunSurveyConfig;
  setConfig: (config: RunSurveyConfig) => void;
  disabled?: boolean;
}

const RunConfigPanel: React.FC<RunConfigPanelProps> = ({ config, setConfig, disabled }) => {
  const handleChange = (field: keyof RunSurveyConfig, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  const getModelOptions = () => {
    return config.llm_provider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Run Configuration
      </Typography>

      <Grid container spacing={3}>
        {/* Sample Size */}
        <Grid item xs={12}>
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
        </Grid>

        {/* LLM Configuration Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 1 }}>
            LLM Configuration
          </Typography>
        </Grid>

        {/* LLM Provider */}
        <Grid item xs={12}>
          <FormControl fullWidth disabled={disabled}>
            <InputLabel>LLM Provider</InputLabel>
            <Select
              value={config.llm_provider}
              label="LLM Provider"
              onChange={(e) => {
                // Update provider and model atomically
                const newProvider = e.target.value as 'openai' | 'anthropic';
                const newModels = newProvider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS;
                setConfig({
                  ...config,
                  llm_provider: newProvider,
                  model: newModels[0].value
                });
              }}
            >
              {LLM_PROVIDERS.map((provider) => (
                <MenuItem key={provider.value} value={provider.value}>
                  {provider.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Model */}
        <Grid item xs={12}>
          <FormControl fullWidth disabled={disabled}>
            <InputLabel>Model</InputLabel>
            <Select
              value={config.model}
              label="Model"
              onChange={(e) => handleChange('model', e.target.value)}
            >
              {getModelOptions().map((model) => (
                <MenuItem key={model.value} value={model.value}>
                  {model.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* LLM Temperature */}
        <Grid item xs={12}>
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">LLM Temperature</Typography>
              <Typography variant="body2" fontWeight="bold" color="primary">
                {config.llm_temperature}
              </Typography>
            </Box>
            <Slider
              value={config.llm_temperature}
              onChange={(_, value) => handleChange('llm_temperature', value)}
              min={0}
              max={2}
              step={0.1}
              marks={[
                { value: 0, label: '0 (Deterministic)' },
                { value: 1, label: '1' },
                { value: 2, label: '2 (Creative)' },
              ]}
              disabled={disabled}
            />
            <Typography variant="caption" color="text.secondary">
              Controls randomness in LLM responses
            </Typography>
          </Box>
        </Grid>

        {/* SSR Configuration Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
            SSR Configuration
          </Typography>
        </Grid>

        {/* SSR Temperature */}
        <Grid item xs={12}>
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">SSR Temperature</Typography>
              <Typography variant="body2" fontWeight="bold" color="primary">
                {config.ssr_temperature}
              </Typography>
            </Box>
            <Slider
              value={config.ssr_temperature}
              onChange={(_, value) => handleChange('ssr_temperature', value)}
              min={0.1}
              max={5}
              step={0.1}
              marks={[
                { value: 0.1, label: '0.1 (Sharp)' },
                { value: 1, label: '1' },
                { value: 5, label: '5 (Smooth)' },
              ]}
              disabled={disabled}
            />
            <Typography variant="caption" color="text.secondary">
              Controls distribution sharpness in SSR
            </Typography>
          </Box>
        </Grid>

        {/* Advanced Settings Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
            Advanced Settings
          </Typography>
        </Grid>

        {/* Seed */}
        <Grid item xs={12}>
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
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RunConfigPanel;
