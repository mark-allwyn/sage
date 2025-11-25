"""
Survey Type Detection and Analysis Strategy

Intelligently detects survey structure and recommends appropriate analyses.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class AnalysisContext:
    """Context for analysis decisions"""
    survey_type: str
    has_categories: bool
    num_categories: int
    has_demographics: bool
    has_text_responses: bool
    question_types: List[str]
    recommended_analyses: List[str]
    sample_size: int


class SurveyAnalysisDetector:
    """Intelligently detect survey structure and recommend analysis approaches"""

    def detect_analysis_context(self, survey: Dict, run_data: Dict) -> AnalysisContext:
        """
        Analyze survey structure to determine analysis strategy

        Args:
            survey: Survey definition with questions, categories, persona_groups
            run_data: Survey run results with responses and distributions

        Returns:
            AnalysisContext with survey type and recommended analyses
        """
        has_categories = bool(survey.get('categories') and len(survey.get('categories', [])) > 0)
        num_categories = len(survey.get('categories', [])) if has_categories else 0

        # Determine survey type
        if not has_categories:
            survey_type = "GENERAL"
        elif num_categories == 1:
            survey_type = "SINGLE_CATEGORY"
        else:
            survey_type = "MULTI_CATEGORY"

        # Check data availability
        has_demographics = self._has_demographic_data(run_data)
        has_text = self._has_text_responses(run_data)

        # Classify questions
        question_types = self._classify_questions(survey)

        # Recommend analyses
        recommended = self._recommend_analyses(
            survey_type,
            has_demographics,
            has_text,
            num_categories
        )

        # Get sample size
        sample_size = self._get_sample_size(run_data)

        return AnalysisContext(
            survey_type=survey_type,
            has_categories=has_categories,
            num_categories=num_categories,
            has_demographics=has_demographics,
            has_text_responses=has_text,
            question_types=question_types,
            recommended_analyses=recommended,
            sample_size=sample_size
        )

    def _has_demographic_data(self, run_data: Dict) -> bool:
        """Check if run has demographic information in profiles"""
        if not run_data.get('profiles'):
            return False

        # Check if profiles have demographic fields
        first_profile = run_data['profiles'][0] if run_data['profiles'] else {}
        demo_fields = ['gender', 'age_group', 'occupation', 'persona_group']
        return any(field in first_profile for field in demo_fields)

    def _has_text_responses(self, run_data: Dict) -> bool:
        """Check if any responses include text data"""
        if not run_data.get('responses'):
            return False

        # Check if any response has text_response field
        for response in run_data['responses'][:10]:  # Sample first 10
            if response.get('text_response'):
                return True

        return False

    def _classify_questions(self, survey: Dict) -> List[str]:
        """Classify question types in the survey"""
        question_types = set()

        for question in survey.get('questions', []):
            q_type = question.get('type', 'rating')
            question_types.add(q_type)

        return list(question_types)

    def _recommend_analyses(
        self,
        survey_type: str,
        has_demo: bool,
        has_text: bool,
        num_cat: int
    ) -> List[str]:
        """Recommend which analyses to perform based on survey characteristics"""
        analyses = [
            "descriptive_statistics",
            "question_performance",
            "distribution_analysis"
        ]

        if has_demo:
            analyses.extend([
                "demographic_segmentation",
                "target_audience_identification"
            ])

        if survey_type == "MULTI_CATEGORY":
            analyses.extend([
                "category_comparison",
                "competitive_positioning",
                "winner_analysis"
            ])

        if has_text:
            analyses.extend([
                "text_analytics",
                "sentiment_analysis",
                "theme_extraction"
            ])

        # Always useful
        analyses.extend([
            "correlation_analysis",
            "key_drivers"
        ])

        return analyses

    def _get_sample_size(self, run_data: Dict) -> int:
        """Get number of respondents"""
        return len(run_data.get('profiles', []))
