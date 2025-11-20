"""
Unit Tests for SurveyPipeline Service

Tests the extracted survey pipeline logic that was previously duplicated
across multiple endpoints in main.py.
"""
import pytest
from services.survey_pipeline import (
    SurveyPipeline,
    PipelineConfig,
    PipelineResult,
    PipelineProgress
)


class TestPipelineConfig:
    """Tests for PipelineConfig dataclass"""

    def test_pipeline_config_creation(self):
        """Test creating pipeline configuration"""
        config = PipelineConfig(
            llm_provider="openai",
            model="gpt-4",
            llm_temperature=0.7,
            ssr_temperature=1.0,
            num_profiles=50
        )

        assert config.llm_provider == "openai"
        assert config.model == "gpt-4"
        assert config.llm_temperature == 0.7
        assert config.ssr_temperature == 1.0
        assert config.num_profiles == 50
        assert config.normalize_method == "paper"  # Default value

    def test_pipeline_config_defaults(self):
        """Test default values in pipeline configuration"""
        config = PipelineConfig(
            llm_provider="anthropic",
            model="claude-3-sonnet",
            llm_temperature=0.5,
            ssr_temperature=1.2
        )

        assert config.normalize_method == "paper"
        assert config.num_profiles == 50
        assert config.seed == 100
        # max_concurrent should use DEFAULT_MAX_CONCURRENT from constants


class TestPipelineProgress:
    """Tests for PipelineProgress dataclass"""

    def test_progress_creation(self):
        """Test creating progress update"""
        progress = PipelineProgress(
            status='running',
            message='Step 1/3: Generating profiles...',
            progress=10,
            step='profiles'
        )

        assert progress.status == 'running'
        assert progress.message == 'Step 1/3: Generating profiles...'
        assert progress.progress == 10
        assert progress.step == 'profiles'
        assert progress.details is None

    def test_progress_with_details(self):
        """Test progress with additional details"""
        progress = PipelineProgress(
            status='running',
            message='Generating responses...',
            progress=50,
            step='responses',
            details={'num_api_calls': 100, 'batches': 5}
        )

        assert progress.details['num_api_calls'] == 100
        assert progress.details['batches'] == 5


class TestPipelineResult:
    """Tests for PipelineResult dataclass"""

    def test_pipeline_result_structure(self):
        """Test pipeline result structure"""
        result = PipelineResult(
            run_id="run_20240101_120000",
            survey_id="test_survey",
            survey_name="Test Survey",
            timestamp="2024-01-01T12:00:00",
            num_profiles=50,
            num_responses=150,
            num_distributions=150,
            distributions={}
        )

        assert result.run_id == "run_20240101_120000"
        assert result.survey_id == "test_survey"
        assert result.num_profiles == 50
        assert result.num_responses == 150
        assert result.aggregated_distributions is None  # Optional
        assert result.timing is None  # Optional


# Note: Full integration tests for SurveyPipeline.run() will require
# mocking LLM clients and SSR models. Those belong in tests/integration/
# and will be added in Phase 2 of the test coverage plan.
