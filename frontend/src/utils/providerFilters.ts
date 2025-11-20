/**
 * Provider and Model Filtering Utilities
 * Filters available providers and models based on system settings
 */

import {
  SystemSettings,
  LLMProvider,
  LLM_PROVIDERS,
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
  GEMINI_MODELS,
  OLLAMA_MODELS
} from '../services/types';

/**
 * Get only enabled providers from settings
 */
export const getEnabledProviders = (settings: SystemSettings | undefined) => {
  if (!settings) return [];

  return LLM_PROVIDERS.filter(provider => {
    const config = settings.providers[provider.value as LLMProvider];
    return config && config.enabled;
  });
};

/**
 * Get models for a specific provider, filtered by settings
 */
export const getEnabledModelsForProvider = (
  provider: LLMProvider,
  settings: SystemSettings | undefined
) => {
  if (!settings) return [];

  const providerConfig = settings.providers[provider];
  if (!providerConfig || !providerConfig.enabled) return [];

  // Get all models for this provider
  let allModels;
  if (provider === 'openai') allModels = OPENAI_MODELS;
  else if (provider === 'anthropic') allModels = ANTHROPIC_MODELS;
  else if (provider === 'gemini') allModels = GEMINI_MODELS;
  else allModels = OLLAMA_MODELS;

  // If provider has specific models configured, filter to only those
  if (providerConfig.models && providerConfig.models.length > 0) {
    return allModels.filter(model => providerConfig.models.includes(model.value));
  }

  // Otherwise return all models for this provider
  return allModels;
};

/**
 * Check if a specific provider is enabled
 */
export const isProviderEnabled = (
  provider: LLMProvider,
  settings: SystemSettings | undefined
) => {
  if (!settings) return false;
  const config = settings.providers[provider];
  return config && config.enabled;
};

/**
 * Get default provider (first enabled one)
 */
export const getDefaultProvider = (settings: SystemSettings | undefined): LLMProvider | null => {
  const enabledProviders = getEnabledProviders(settings);
  return enabledProviders.length > 0 ? enabledProviders[0].value as LLMProvider : null;
};

/**
 * Get default model for a provider
 */
export const getDefaultModel = (
  provider: LLMProvider,
  settings: SystemSettings | undefined
): string | null => {
  const models = getEnabledModelsForProvider(provider, settings);
  return models.length > 0 ? models[0].value : null;
};
