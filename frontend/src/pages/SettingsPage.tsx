/**
 * Settings Page
 * System configuration, API key management, and provider settings
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Snackbar,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { useHealthCheck, useSettings, useUpdateProviderSettings } from '../services/hooks';
import PageHeader from '../components/PageHeader';
import {
  LLM_PROVIDERS,
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
  LLMProvider,
  ProviderConfig,
} from '../services/types';

const SettingsPage: React.FC = () => {
  const { data: health, isLoading, error } = useHealthCheck();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const updateProvider = useUpdateProviderSettings();

  // Local state for form
  const [providers, setProviders] = useState<{ [key in LLMProvider]: ProviderConfig }>({
    openai: { enabled: false, api_key: '', models: [] },
    anthropic: { enabled: false, api_key: '', models: [] },
  });

  const [showApiKeys, setShowApiKeys] = useState<{ [key in LLMProvider]: boolean }>({
    openai: false,
    anthropic: false,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Load settings from backend when available
  useEffect(() => {
    if (settings) {
      setProviders(settings.providers as { [key in LLMProvider]: ProviderConfig });
    }
  }, [settings]);

  const getModelsForProvider = (provider: LLMProvider) => {
    switch (provider) {
      case 'openai':
        return OPENAI_MODELS;
      case 'anthropic':
        return ANTHROPIC_MODELS;
      default:
        return [];
    }
  };

  const handleProviderToggle = (provider: LLMProvider) => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: !prev[provider].enabled,
      },
    }));
  };

  const handleApiKeyChange = (provider: LLMProvider, value: string) => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        api_key: value,
      },
    }));
  };

  const handleModelsChange = (provider: LLMProvider, models: string[]) => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        models,
      },
    }));
  };

  const toggleShowApiKey = (provider: LLMProvider) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const handleSaveProvider = async (provider: LLMProvider) => {
    const config = providers[provider];

    try {
      await updateProvider.mutateAsync({
        provider,
        enabled: config.enabled,
        api_key: config.api_key || undefined,
        models: config.models,
      });

      setSnackbar({
        open: true,
        message: `Settings saved for ${provider}! Changes will take effect on next survey run.`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error saving ${provider} settings`,
        severity: 'error',
      });
    }
  };

  const getProviderStatus = (provider: LLMProvider): 'active' | 'configured' | 'disabled' => {
    const config = providers[provider];
    if (!config.enabled) return 'disabled';

    // Check if API key is masked (from backend)
    if (config.api_key && config.api_key.length > 0 && !config.api_key.startsWith('****')) {
      // User just entered a new key
      return 'configured';
    }
    if (config.api_key && config.api_key.startsWith('****')) {
      // Key is masked, meaning it exists on backend
      return 'active';
    }
    return 'configured';
  };

  if (settingsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Settings"
        subtitle="System configuration and status monitoring"
        icon={<SettingsIcon sx={{ fontSize: 28 }} />}
      />

      {/* System Status */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          System Status
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Monitor the health and connectivity of backend services
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Checking API status...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" icon={<ErrorIcon />}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              Backend API Offline
            </Typography>
            <Typography variant="body2">
              Unable to connect to the backend API at http://localhost:8000. Please ensure the backend server is running.
            </Typography>
          </Alert>
        )}

        {health && !error && (
          <>
            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="medium">
                All Systems Operational
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    API Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip
                      label="Online"
                      color="success"
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Backend: Connected
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    API Version
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {health.version || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current backend version
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    API Message
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {health.message}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>

      {/* Provider Configuration */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            LLM Provider Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure API keys and select models for each provider
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            API keys are securely stored on the backend in <code>backend/settings.json</code>.
            Keys are masked when displayed for security. Click "Save" for each provider to update settings.
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {LLM_PROVIDERS.map((provider) => {
            const config = providers[provider.value];
            const status = getProviderStatus(provider.value);
            const availableModels = getModelsForProvider(provider.value);
            const isApiKeyMasked = config.api_key?.startsWith('****');

            return (
              <Accordion key={provider.value} defaultExpanded={config.enabled}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.enabled}
                          onChange={() => handleProviderToggle(provider.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {provider.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {config.models.length} model{config.models.length !== 1 ? 's' : ''} selected
                      </Typography>
                    </Box>
                    <Chip
                      label={status === 'active' ? 'Active' : status === 'configured' ? 'Needs API Key' : 'Disabled'}
                      color={status === 'active' ? 'success' : status === 'configured' ? 'warning' : 'default'}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* API Key Input */}
                    <TextField
                        fullWidth
                        label="API Key"
                        type={showApiKeys[provider.value] ? 'text' : 'password'}
                        value={config.api_key || ''}
                        onChange={(e) => handleApiKeyChange(provider.value, e.target.value)}
                        placeholder={isApiKeyMasked ? 'API key is set (masked)' : `Enter your ${provider.label} API key`}
                        disabled={!config.enabled}
                        helperText={isApiKeyMasked ? 'Enter a new key to update, or leave as-is to keep existing key' : ''}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <KeyIcon fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => toggleShowApiKey(provider.value)}
                                edge="end"
                              >
                                {showApiKeys[provider.value] ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                    {/* Model Selection */}
                    <FormControl fullWidth disabled={!config.enabled}>
                      <InputLabel>Select Models</InputLabel>
                      <Select
                        multiple
                        value={config.models}
                        onChange={(e) => handleModelsChange(provider.value, e.target.value as string[])}
                        input={<OutlinedInput label="Select Models" />}
                        renderValue={(selected) => `${selected.length} model${selected.length !== 1 ? 's' : ''} selected`}
                      >
                        {availableModels.map((model) => (
                          <MenuItem key={model.value} value={model.value}>
                            <Checkbox checked={config.models.indexOf(model.value) > -1} />
                            <ListItemText
                              primary={model.label}
                              secondary={model.supportsVision ? 'Supports vision' : ''}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Model List Preview */}
                    {config.models.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                          Selected models:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {config.models.map((modelValue) => {
                            const modelInfo = availableModels.find(m => m.value === modelValue);
                            return (
                              <Chip
                                key={modelValue}
                                label={modelInfo?.label || modelValue}
                                size="small"
                                variant="outlined"
                                icon={modelInfo?.supportsVision ? <CheckCircleIcon fontSize="small" /> : undefined}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    )}

                    {/* Save Button */}
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveProvider(provider.value)}
                      disabled={updateProvider.isPending}
                      fullWidth
                    >
                      {updateProvider.isPending ? 'Saving...' : `Save ${provider.label} Settings`}
                    </Button>

                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </Paper>

      {/* Snackbar for save notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
