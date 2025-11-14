"""
Model Validator for Multi-Modal Support

Enforces vision-capable model requirements when surveys contain media content.
Prevents execution with incompatible models and provides clear error messages.

Author: SAGE Team
"""

from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


# Vision-capable models by provider (all models support vision)
VISION_CAPABLE_MODELS: Dict[str, List[str]] = {
    'openai': [
        'gpt-5.1-instant',    # GPT-5.1 Instant (Latest, Nov 2025)
        'gpt-5.1-thinking',   # GPT-5.1 Thinking (Advanced Reasoning)
        'gpt-4o',             # GPT-4o
        'gpt-4o-mini',        # GPT-4o Mini (Fast and cost-effective)
        'gpt-4-turbo',        # GPT-4 Turbo
    ],
    'anthropic': [
        'claude-sonnet-4-5-20250929',   # Claude Sonnet 4.5 (Latest, Sep 2025)
        'claude-haiku-4-5-20251015',    # Claude Haiku 4.5 (Fast, Oct 2025)
        'claude-opus-4-1-20250805',     # Claude Opus 4.1 (Advanced Reasoning, Aug 2025)
        'claude-3-5-sonnet-20241022',   # Claude 3.5 Sonnet
        'claude-3-5-haiku-20241022',    # Claude 3.5 Haiku
        'claude-3-opus-20240229',       # Claude 3 Opus
    ]
}


class ModelIncompatibleError(Exception):
    """Raised when model does not support vision but survey contains media"""
    pass


class ModelValidator:
    """Validates model compatibility with survey requirements"""

    @staticmethod
    def is_vision_capable(provider: str, model_name: str) -> bool:
        """
        Check if a model supports vision/multi-modal inputs.

        Args:
            provider: LLM provider ('openai' or 'anthropic')
            model_name: Model name/identifier

        Returns:
            True if model supports vision, False otherwise
        """
        provider = provider.lower()
        if provider not in VISION_CAPABLE_MODELS:
            logger.warning(f"Unknown provider: {provider}, assuming no vision support")
            return False

        return model_name in VISION_CAPABLE_MODELS[provider]

    @staticmethod
    def get_vision_models(provider: str) -> List[str]:
        """
        Get list of vision-capable models for a provider.

        Args:
            provider: LLM provider ('openai' or 'anthropic')

        Returns:
            List of vision-capable model names
        """
        provider = provider.lower()
        return VISION_CAPABLE_MODELS.get(provider, [])

    @staticmethod
    def validate_model_for_survey(provider: str, model_name: str, has_media: bool):
        """
        Validate that model is compatible with survey content.

        Raises ModelIncompatibleError if survey has media but model doesn't support vision.

        Args:
            provider: LLM provider
            model_name: Model name
            has_media: Whether survey contains any media content

        Raises:
            ModelIncompatibleError: If model incompatible with survey
        """
        if not has_media:
            # No media, any model is fine
            return

        if not ModelValidator.is_vision_capable(provider, model_name):
            vision_models = ModelValidator.get_vision_models(provider)

            error_msg = (
                f"Cannot run survey: This survey contains media content but '{model_name}' "
                f"does not support vision capabilities.\n\n"
                f"Please select a vision-capable model for {provider}:\n"
            )

            for model in vision_models:
                error_msg += f"  - {model}\n"

            raise ModelIncompatibleError(error_msg.strip())

    @staticmethod
    def get_recommended_model(provider: str, has_media: bool) -> str:
        """
        Get recommended model for a given provider and survey type.

        Args:
            provider: LLM provider
            has_media: Whether survey contains media

        Returns:
            Recommended model name
        """
        provider = provider.lower()

        if has_media:
            # Return best vision model for each provider
            if provider == 'openai':
                return 'gpt-5.1-instant'  # Latest and best (Nov 2025)
            elif provider == 'anthropic':
                return 'claude-sonnet-4-5-20250929'  # Latest Claude (Sep 2025)
        else:
            # Default models (all support vision anyway)
            if provider == 'openai':
                return 'gpt-5.1-instant'  # Latest for text too
            elif provider == 'anthropic':
                return 'claude-sonnet-4-5-20250929'  # Latest for text too

        return ''

    @staticmethod
    def get_model_info(provider: str, model_name: str) -> Dict:
        """
        Get information about a model's capabilities.

        Args:
            provider: LLM provider
            model_name: Model name

        Returns:
            Dict with model info: {
                'supports_vision': bool,
                'supports_text': bool,
                'recommended_for_media': bool
            }
        """
        supports_vision = ModelValidator.is_vision_capable(provider, model_name)

        return {
            'supports_vision': supports_vision,
            'supports_text': True,  # All models support text
            'recommended_for_media': supports_vision,
            'provider': provider,
            'model_name': model_name
        }


def validate_survey_model(survey, provider: str, model_name: str):
    """
    Convenience function to validate survey against model.

    Args:
        survey: Survey object with has_media_categories() method
        provider: LLM provider
        model_name: Model name

    Raises:
        ModelIncompatibleError: If incompatible
    """
    has_media = survey.has_media_categories()
    ModelValidator.validate_model_for_survey(provider, model_name, has_media)
    logger.info(f"Model validation passed: {provider}/{model_name} compatible with survey (media={has_media})")
