"""
Survey Pipeline Service

Encapsulates the complete SSR survey execution pipeline:
1. Generate respondent profiles from persona groups
2. Generate LLM responses for all profiles × questions
3. Apply SSR to convert text responses to probability distributions
4. Organize and structure results

Extracted from main.py to eliminate 300+ lines of code duplication.
"""
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass
from datetime import datetime
import time

from ssr_core.survey import Survey
from ssr_core.llm_client import (
    LLMClient,
    generate_diverse_profiles,
    RespondentProfile,
    Response
)
from ssr_core.ssr_model import SemanticSimilarityRater, RatingDistribution
from constants import DEFAULT_CATEGORY, DEFAULT_MAX_CONCURRENT


@dataclass
class PipelineConfig:
    """Configuration for survey pipeline execution"""
    llm_provider: str
    model: str
    llm_temperature: float
    ssr_temperature: float
    normalize_method: str = "paper"
    num_profiles: int = 50
    seed: int = 100
    max_concurrent: int = DEFAULT_MAX_CONCURRENT


@dataclass
class PipelineResult:
    """Results from survey pipeline execution"""
    run_id: str
    survey_id: str
    survey_name: str
    timestamp: str
    num_profiles: int
    num_responses: int
    num_distributions: int
    distributions: Dict[str, Dict[str, Dict[str, Any]]]
    aggregated_distributions: Optional[Dict] = None
    config: Optional[Dict] = None
    timing: Optional[Dict[str, float]] = None


@dataclass
class PipelineProgress:
    """Progress update during pipeline execution"""
    status: str  # 'starting', 'running', 'complete', 'error'
    message: str
    progress: float  # 0-100
    step: Optional[str] = None
    details: Optional[Dict] = None


class SurveyPipeline:
    """
    Encapsulates the full SSR survey execution pipeline.

    This class eliminates ~300 lines of duplicated code across multiple
    endpoints by providing a reusable, testable pipeline implementation.

    Usage:
        config = PipelineConfig(
            llm_provider="openai",
            model="gpt-4",
            llm_temperature=0.7,
            ssr_temperature=1.0,
            num_profiles=100
        )

        pipeline = SurveyPipeline(survey, config)
        result = await pipeline.run_async(progress_callback=my_callback)
    """

    def __init__(self, survey: Survey, config: PipelineConfig):
        self.survey = survey
        self.config = config
        self.timing: Dict[str, float] = {}

    def run(
        self,
        progress_callback: Optional[Callable[[PipelineProgress], None]] = None
    ) -> PipelineResult:
        """
        Execute the complete pipeline synchronously.

        Args:
            progress_callback: Optional callback for progress updates

        Returns:
            PipelineResult with all generated data
        """
        start_time = time.time()

        # Step 1: Generate profiles
        if progress_callback:
            progress_callback(PipelineProgress(
                status='running',
                message=f'Step 1/3: Generating {self.config.num_profiles} profiles...',
                progress=10,
                step='profiles'
            ))

        profile_start = time.time()
        profiles = generate_diverse_profiles(
            n_profiles=self.config.num_profiles,
            persona_groups=self.survey.persona_groups
        )
        self.timing['profile_generation'] = time.time() - profile_start

        if progress_callback:
            progress_callback(PipelineProgress(
                status='running',
                message=f'Generated {len(profiles)} profiles',
                progress=25,
                step='profiles'
            ))

        # Step 2: Generate LLM responses
        num_api_calls = len(profiles) * len(self.survey.questions)
        num_batches = (num_api_calls + self.config.max_concurrent - 1) // self.config.max_concurrent

        if progress_callback:
            progress_callback(PipelineProgress(
                status='running',
                message=f'Step 2/3: Generating LLM responses ({num_api_calls} API calls)...',
                progress=30,
                step='responses',
                details={
                    'num_api_calls': num_api_calls,
                    'num_batches': num_batches,
                    'concurrent_limit': self.config.max_concurrent
                }
            ))

        llm_start = time.time()
        llm_client = LLMClient(
            provider=self.config.llm_provider,
            model=self.config.model,
            temperature=self.config.llm_temperature
        )
        responses = llm_client.generate_responses_concurrent(
            self.survey,
            profiles,
            max_concurrent=self.config.max_concurrent
        )
        self.timing['llm_generation'] = time.time() - llm_start

        if progress_callback:
            progress_callback(PipelineProgress(
                status='running',
                message=f'Generated {len(responses)} responses in {self.timing["llm_generation"]:.1f}s',
                progress=60,
                step='responses'
            ))

        # Step 3: Apply SSR
        if progress_callback:
            progress_callback(PipelineProgress(
                status='running',
                message=f'Step 3/3: Applying SSR to {len(responses)} responses...',
                progress=65,
                step='ssr'
            ))

        ssr_start = time.time()
        rater = SemanticSimilarityRater(
            temperature=self.config.ssr_temperature,
            normalize_method=self.config.normalize_method
        )
        distributions = rater.rate_responses(responses, self.survey, show_progress=False)
        self.timing['ssr_application'] = time.time() - ssr_start

        if progress_callback:
            progress_callback(PipelineProgress(
                status='running',
                message=f'Generated {len(distributions)} distributions in {self.timing["ssr_application"]:.1f}s',
                progress=90,
                step='ssr'
            ))

        # Step 4: Organize results
        organized_distributions = self._organize_distributions(distributions, responses)

        self.timing['total'] = time.time() - start_time

        # Create result
        run_id = f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        result = PipelineResult(
            run_id=run_id,
            survey_id=self.survey.id if hasattr(self.survey, 'id') else 'unknown',
            survey_name=self.survey.name,
            timestamp=datetime.now().isoformat(),
            num_profiles=len(profiles),
            num_responses=len(responses),
            num_distributions=len(distributions),
            distributions=organized_distributions,
            config={
                'llm_provider': self.config.llm_provider,
                'model': self.config.model,
                'llm_temperature': self.config.llm_temperature,
                'ssr_temperature': self.config.ssr_temperature,
                'normalize_method': self.config.normalize_method,
                'num_profiles': self.config.num_profiles,
                'seed': self.config.seed
            },
            timing=self.timing
        )

        if progress_callback:
            progress_callback(PipelineProgress(
                status='complete',
                message='Pipeline complete',
                progress=100,
                step='complete'
            ))

        return result

    def _organize_distributions(
        self,
        distributions: List[RatingDistribution],
        responses: List[Response]
    ) -> Dict[str, Dict[str, Dict[str, Any]]]:
        """
        Organize distributions by category and question.

        Uses O(1) lookup to avoid N+1 pattern.
        """
        from main import build_response_lookup

        # Build O(1) lookup dictionary
        response_lookup = build_response_lookup(responses)

        organized: Dict[str, Dict[str, Dict[str, Any]]] = {}

        for dist in distributions:
            # Get category and profile using O(1) lookup
            response = response_lookup.get((dist.respondent_id, dist.question_id))
            category = response.category or DEFAULT_CATEGORY if response else DEFAULT_CATEGORY
            profile = response.respondent_profile if response else {}

            if category not in organized:
                organized[category] = {}

            if dist.question_id not in organized[category]:
                organized[category][dist.question_id] = {}

            organized[category][dist.question_id][dist.respondent_id] = {
                "probabilities": dist.distribution.tolist(),
                "mode": int(dist.mode),
                "expected_value": float(dist.expected_value),
                "entropy": float(dist.entropy),
                "text_response": dist.text_response or "",
                "gender": profile.get('gender', 'Unknown'),
                "age_group": profile.get('age_group', 'Unknown'),
                "persona_group": profile.get('persona_group', 'General'),
                "occupation": profile.get('occupation', 'Unknown')
            }

        return organized

    async def run_async(
        self,
        progress_callback: Optional[Callable[[PipelineProgress], None]] = None
    ) -> PipelineResult:
        """
        Execute the complete pipeline asynchronously.

        Currently wraps the synchronous run() method. Can be enhanced
        with true async LLM calls in the future.

        Args:
            progress_callback: Optional callback for progress updates

        Returns:
            PipelineResult with all generated data
        """
        import asyncio

        # For now, run synchronously in thread pool to avoid blocking
        # Future: Make LLMClient truly async
        return await asyncio.to_thread(self.run, progress_callback)
