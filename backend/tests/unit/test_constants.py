"""
Unit Tests for Constants

Ensures all constants are properly defined and have sensible values.
"""
import pytest


class TestConstants:
    """Tests for application constants"""

    def test_default_category_exists(self):
        """Ensure DEFAULT_CATEGORY is defined"""
        from constants import DEFAULT_CATEGORY
        assert DEFAULT_CATEGORY == "general"
        assert isinstance(DEFAULT_CATEGORY, str)

    def test_default_max_concurrent_exists(self):
        """Ensure DEFAULT_MAX_CONCURRENT is defined"""
        from constants import DEFAULT_MAX_CONCURRENT
        assert DEFAULT_MAX_CONCURRENT == 20
        assert isinstance(DEFAULT_MAX_CONCURRENT, int)
        assert DEFAULT_MAX_CONCURRENT > 0

    def test_ssr_temperature_range(self):
        """Ensure SSR temperature is in valid range"""
        from constants import DEFAULT_SSR_TEMPERATURE
        assert 0.1 <= DEFAULT_SSR_TEMPERATURE <= 5.0

    def test_llm_temperature_range(self):
        """Ensure LLM temperature is in valid range"""
        from constants import DEFAULT_LLM_TEMPERATURE
        assert 0 <= DEFAULT_LLM_TEMPERATURE <= 2.0

    def test_profile_limits(self):
        """Ensure profile limits are sensible"""
        from constants import MIN_NUM_PROFILES, MAX_NUM_PROFILES, DEFAULT_NUM_PROFILES

        assert MIN_NUM_PROFILES < MAX_NUM_PROFILES
        assert MIN_NUM_PROFILES <= DEFAULT_NUM_PROFILES <= MAX_NUM_PROFILES
        assert MIN_NUM_PROFILES > 0

    def test_normalize_method(self):
        """Ensure normalize method is defined"""
        from constants import DEFAULT_NORMALIZE_METHOD
        assert DEFAULT_NORMALIZE_METHOD == "paper"
        assert isinstance(DEFAULT_NORMALIZE_METHOD, str)
