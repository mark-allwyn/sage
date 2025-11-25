"""
Demographic Analysis

Analyze survey results by demographic segments and identify target audiences.
"""

import numpy as np
from typing import Dict, List, Optional
from collections import defaultdict

from ..core.statistical_tests import StatisticalTester
from ..core.metrics_calculator import MetricsCalculator


class DemographicAnalyzer:
    """Analyze survey results by demographic segments"""

    def __init__(self, run_data: Dict, statistical_tester: StatisticalTester):
        """
        Initialize demographic analyzer

        Args:
            run_data: Survey run data with responses and profiles
            statistical_tester: Statistical testing utility
        """
        self.run_data = run_data
        self.tester = statistical_tester
        self.calculator = MetricsCalculator()

        # Build profile lookup for fast access
        self.profiles_by_id = {
            profile['id']: profile
            for profile in run_data.get('profiles', [])
        }

    def analyze_by_demographic(
        self,
        question_id: str,
        demographic_field: str
    ) -> Dict:
        """
        Analyze question performance by demographic segment

        Args:
            question_id: Question to analyze
            demographic_field: 'gender', 'age_group', 'occupation', 'persona_group', etc.

        Returns:
            Segment analysis with statistical tests
        """
        # Group responses by demographic segment
        segments = self._group_responses_by_demographic(question_id, demographic_field)

        if not segments:
            return self._empty_demographic_result(demographic_field)

        # Calculate metrics for each segment
        segment_metrics = {}
        segment_distributions = {}

        for segment_name, responses in segments.items():
            if not responses:
                continue

            # Extract SSR distributions
            distributions = [
                r.get('ssr_distribution', {})
                for r in responses
                if r.get('ssr_distribution')
            ]

            if distributions:
                metrics = self.calculator.calculate_question_metrics(distributions)
                segment_metrics[segment_name] = {
                    "mean": metrics['mean'],
                    "std": metrics['std'],
                    "top_box_pct": metrics['top_box_pct'],
                    "bottom_box_pct": metrics['bottom_box_pct'],
                    "net_score": metrics['net_score'],
                    "sample_size": metrics['sample_size'],
                    "grade": metrics['grade']
                }
                segment_distributions[segment_name] = distributions

        if not segment_metrics:
            return self._empty_demographic_result(demographic_field)

        # Statistical comparison
        comparison_result = self._compare_segments(
            segment_distributions,
            list(segment_metrics.keys())
        )

        # Rank segments by performance
        ranked_segments = sorted(
            segment_metrics.items(),
            key=lambda x: x[1]['mean'],
            reverse=True
        )

        return {
            "demographic_field": demographic_field,
            "question_id": question_id,
            "segment_metrics": segment_metrics,
            "statistical_comparison": comparison_result,
            "best_segment": ranked_segments[0][0] if ranked_segments else None,
            "worst_segment": ranked_segments[-1][0] if ranked_segments else None,
            "ranked_segments": [s[0] for s in ranked_segments],
            "num_segments": len(segment_metrics)
        }

    def analyze_all_demographics(
        self,
        question_id: str
    ) -> Dict:
        """
        Analyze question across all available demographic fields

        Returns:
            Analysis for each demographic field
        """
        demographic_fields = self._get_available_demographics()

        results = {}
        for field in demographic_fields:
            results[field] = self.analyze_by_demographic(question_id, field)

        return {
            "question_id": question_id,
            "demographics": results,
            "available_fields": demographic_fields
        }

    def identify_target_audience(
        self,
        question_ids: List[str]
    ) -> Dict:
        """
        Identify which demographic segments perform best overall

        Args:
            question_ids: List of question IDs to analyze

        Returns:
            Target audience analysis with top-performing segments
        """
        demographic_fields = self._get_available_demographics()

        overall_scores = {}

        for field in demographic_fields:
            field_scores = defaultdict(list)

            # Collect scores for each segment across all questions
            for question_id in question_ids:
                segments = self._group_responses_by_demographic(question_id, field)

                for segment_name, responses in segments.items():
                    if not responses:
                        continue

                    # Get expected values
                    expected_values = [
                        r.get('ssr_distribution', {}).get('expected_value')
                        for r in responses
                        if r.get('ssr_distribution', {}).get('expected_value') is not None
                    ]

                    if expected_values:
                        field_scores[segment_name].extend(expected_values)

            # Calculate average scores
            segment_analysis = {}
            for segment_name, scores in field_scores.items():
                if scores:
                    segment_analysis[segment_name] = {
                        "mean_score": float(np.mean(scores)),
                        "std": float(np.std(scores)),
                        "sample_size": len(scores),
                        "consistency": float(1 - (np.std(scores) / np.mean(scores))) if np.mean(scores) > 0 else 0
                    }

            overall_scores[field] = segment_analysis

        # Identify top segments across all demographics
        top_segments = self._rank_all_segments(overall_scores)

        return {
            "by_demographic": overall_scores,
            "top_segments": top_segments[:5],  # Top 5
            "target_audience_profile": self._create_segment_profile(top_segments[0]) if top_segments else None
        }

    def compare_demographics_across_questions(
        self,
        question_ids: List[str],
        demographic_field: str
    ) -> Dict:
        """
        Compare how demographic segments perform across multiple questions

        Args:
            question_ids: Questions to analyze
            demographic_field: Demographic field to compare

        Returns:
            Comparison matrix of segments × questions
        """
        segments = set()
        question_segment_scores = {}

        # Collect scores for each question/segment combination
        for question_id in question_ids:
            segment_responses = self._group_responses_by_demographic(
                question_id,
                demographic_field
            )

            question_scores = {}
            for segment_name, responses in segment_responses.items():
                segments.add(segment_name)

                expected_values = [
                    r.get('ssr_distribution', {}).get('expected_value')
                    for r in responses
                    if r.get('ssr_distribution', {}).get('expected_value') is not None
                ]

                if expected_values:
                    question_scores[segment_name] = {
                        "mean": float(np.mean(expected_values)),
                        "n": len(expected_values)
                    }

            question_segment_scores[question_id] = question_scores

        # Create comparison matrix
        segments = sorted(list(segments))

        return {
            "demographic_field": demographic_field,
            "segments": segments,
            "questions": question_ids,
            "scores_matrix": question_segment_scores,
            "segment_averages": self._calculate_segment_averages(
                question_segment_scores,
                segments
            )
        }

    def _group_responses_by_demographic(
        self,
        question_id: str,
        demographic_field: str
    ) -> Dict[str, List[Dict]]:
        """Group responses by demographic field value"""
        segments = defaultdict(list)

        for response in self.run_data.get('responses', []):
            if response.get('question_id') != question_id:
                continue

            profile_id = response.get('profile_id')
            profile = self.profiles_by_id.get(profile_id)

            if not profile:
                continue

            # Get demographic value
            demographic_value = profile.get(demographic_field)

            if demographic_value:
                segments[str(demographic_value)].append(response)

        return dict(segments)

    def _compare_segments(
        self,
        segment_distributions: Dict[str, List[Dict]],
        segment_names: List[str]
    ) -> Dict:
        """Compare segments statistically"""
        if len(segment_names) < 2:
            return {"comparison_type": "none", "message": "Not enough segments to compare"}

        # Extract expected values for each segment
        segment_scores = {}
        for name in segment_names:
            distributions = segment_distributions.get(name, [])
            scores = [d.get('expected_value') for d in distributions if d.get('expected_value') is not None]
            if scores:
                segment_scores[name] = scores

        if len(segment_scores) == 2:
            # Two groups - t-test
            names = list(segment_scores.keys())
            return {
                "comparison_type": "t-test",
                "result": self.tester.compare_two_groups(
                    segment_scores[names[0]],
                    segment_scores[names[1]],
                    names[0],
                    names[1]
                )
            }
        elif len(segment_scores) > 2:
            # Multiple groups - ANOVA
            return {
                "comparison_type": "anova",
                "result": self.tester.compare_multiple_groups(segment_scores)
            }
        else:
            return {"comparison_type": "none", "message": "Not enough valid segments"}

    def _get_available_demographics(self) -> List[str]:
        """Get list of available demographic fields"""
        if not self.run_data.get('profiles'):
            return []

        # Check first profile for demographic fields
        first_profile = self.run_data['profiles'][0]

        # Common demographic fields
        possible_fields = [
            'gender', 'age_group', 'occupation',
            'persona_group', 'income', 'education',
            'location', 'marital_status'
        ]

        available = []
        for field in possible_fields:
            if field in first_profile and first_profile[field]:
                available.append(field)

        return available

    def _rank_all_segments(self, overall_scores: Dict) -> List[Dict]:
        """Rank all segments across all demographics"""
        all_segments = []

        for field, segments in overall_scores.items():
            for segment_name, metrics in segments.items():
                all_segments.append({
                    "demographic_field": field,
                    "segment": segment_name,
                    "mean_score": metrics['mean_score'],
                    "sample_size": metrics['sample_size'],
                    "consistency": metrics['consistency']
                })

        # Sort by mean score
        all_segments.sort(key=lambda x: x['mean_score'], reverse=True)

        return all_segments

    def _create_segment_profile(self, top_segment: Dict) -> Dict:
        """Create detailed profile for a top-performing segment"""
        if not top_segment:
            return {}

        field = top_segment['demographic_field']
        segment = top_segment['segment']

        # Count profiles in this segment
        count = sum(
            1 for profile in self.run_data.get('profiles', [])
            if str(profile.get(field)) == segment
        )

        return {
            "demographic_field": field,
            "segment_value": segment,
            "mean_score": top_segment['mean_score'],
            "profile_count": count,
            "consistency": top_segment.get('consistency', 0),
            "recommendation": f"Target {field}={segment} segment for optimal performance"
        }

    def _calculate_segment_averages(
        self,
        question_segment_scores: Dict,
        segments: List[str]
    ) -> Dict:
        """Calculate average scores for each segment across all questions"""
        segment_averages = {}

        for segment in segments:
            scores = []
            for question_scores in question_segment_scores.values():
                if segment in question_scores:
                    scores.append(question_scores[segment]['mean'])

            if scores:
                segment_averages[segment] = {
                    "mean": float(np.mean(scores)),
                    "std": float(np.std(scores)),
                    "num_questions": len(scores)
                }

        return segment_averages

    def _empty_demographic_result(self, demographic_field: str) -> Dict:
        """Return empty result structure"""
        return {
            "demographic_field": demographic_field,
            "question_id": None,
            "segment_metrics": {},
            "statistical_comparison": {"comparison_type": "none"},
            "best_segment": None,
            "worst_segment": None,
            "ranked_segments": [],
            "num_segments": 0
        }
