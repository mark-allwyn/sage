"""
Category Comparison Analysis

Compare performance across survey categories (for multi-category surveys).
"""

import numpy as np
from typing import Dict, List, Optional
from collections import defaultdict

from ..core.statistical_tests import StatisticalTester
from ..core.metrics_calculator import MetricsCalculator


class CategoryComparator:
    """Compare performance across survey categories"""

    def __init__(self, run_data: Dict, statistical_tester: StatisticalTester):
        """
        Initialize category comparator

        Args:
            run_data: Survey run data with responses
            statistical_tester: Statistical testing utility
        """
        self.run_data = run_data
        self.tester = statistical_tester
        self.calculator = MetricsCalculator()

        # Build category lookup
        self.categories = self._extract_categories()
        self.questions_by_category = self._group_questions_by_category()

    def compare_all_categories(self) -> Dict:
        """
        Compare performance across all categories

        Returns:
            Overall category comparison with rankings
        """
        if not self.categories:
            return self._empty_category_result()

        # Calculate metrics for each category
        category_metrics = {}

        for category_id, category_name in self.categories.items():
            question_ids = self.questions_by_category.get(category_id, [])

            if not question_ids:
                continue

            # Collect all responses for this category
            category_distributions = []

            for question_id in question_ids:
                for response in self.run_data.get('responses', []):
                    if response.get('question_id') == question_id:
                        ssr_dist = response.get('ssr_distribution')
                        if ssr_dist:
                            category_distributions.append(ssr_dist)

            if category_distributions:
                metrics = self.calculator.calculate_question_metrics(category_distributions)
                category_metrics[category_id] = {
                    "category_name": category_name,
                    "mean": metrics['mean'],
                    "std": metrics['std'],
                    "top_box_pct": metrics['top_box_pct'],
                    "bottom_box_pct": metrics['bottom_box_pct'],
                    "net_score": metrics['net_score'],
                    "grade": metrics['grade'],
                    "sample_size": metrics['sample_size'],
                    "num_questions": len(question_ids)
                }

        if not category_metrics:
            return self._empty_category_result()

        # Rank categories by performance
        ranked_categories = sorted(
            category_metrics.items(),
            key=lambda x: x[1]['mean'],
            reverse=True
        )

        # Statistical comparison
        comparison_result = self._compare_categories_statistically(category_metrics)

        # Identify winner
        winner = ranked_categories[0] if ranked_categories else None

        return {
            "category_metrics": category_metrics,
            "ranked_categories": [
                {
                    "category_id": cat_id,
                    "category_name": metrics['category_name'],
                    "mean": metrics['mean'],
                    "grade": metrics['grade'],
                    "rank": idx + 1
                }
                for idx, (cat_id, metrics) in enumerate(ranked_categories)
            ],
            "winner": {
                "category_id": winner[0],
                "category_name": winner[1]['category_name'],
                "mean": winner[1]['mean'],
                "grade": winner[1]['grade']
            } if winner else None,
            "statistical_comparison": comparison_result,
            "num_categories": len(category_metrics),
            "interpretation": self._generate_category_interpretation(
                ranked_categories,
                comparison_result
            )
        }

    def compare_categories_by_question(self) -> Dict:
        """
        Compare categories question-by-question

        Returns:
            Question-level category comparison
        """
        if not self.categories:
            return {"question_comparisons": [], "num_questions": 0}

        # Get all questions
        all_questions = set()
        for questions in self.questions_by_category.values():
            all_questions.update(questions)

        question_comparisons = []

        for question_id in all_questions:
            # Get category for this question
            question_category = self._get_question_category(question_id)

            if not question_category:
                continue

            # Get responses for this question
            question_responses = [
                r for r in self.run_data.get('responses', [])
                if r.get('question_id') == question_id
            ]

            if not question_responses:
                continue

            # Calculate metrics
            distributions = [
                r.get('ssr_distribution')
                for r in question_responses
                if r.get('ssr_distribution')
            ]

            if distributions:
                metrics = self.calculator.calculate_question_metrics(distributions)

                question_comparisons.append({
                    "question_id": question_id,
                    "category_id": question_category['id'],
                    "category_name": question_category['name'],
                    "mean": metrics['mean'],
                    "std": metrics['std'],
                    "grade": metrics['grade'],
                    "top_box_pct": metrics['top_box_pct'],
                    "sample_size": metrics['sample_size']
                })

        # Sort by category and mean
        question_comparisons.sort(
            key=lambda x: (x['category_id'], -x['mean'])
        )

        return {
            "question_comparisons": question_comparisons,
            "num_questions": len(question_comparisons),
            "categories": self.categories
        }

    def identify_category_strengths_weaknesses(self) -> Dict:
        """
        Identify strongest and weakest questions within each category

        Returns:
            Strengths and weaknesses by category
        """
        if not self.categories:
            return {"category_insights": {}}

        category_insights = {}

        for category_id, category_name in self.categories.items():
            question_ids = self.questions_by_category.get(category_id, [])

            if not question_ids:
                continue

            # Calculate metrics for each question
            question_metrics = []

            for question_id in question_ids:
                responses = [
                    r for r in self.run_data.get('responses', [])
                    if r.get('question_id') == question_id
                ]

                distributions = [
                    r.get('ssr_distribution')
                    for r in responses
                    if r.get('ssr_distribution')
                ]

                if distributions:
                    metrics = self.calculator.calculate_question_metrics(distributions)
                    question_metrics.append({
                        "question_id": question_id,
                        "mean": metrics['mean'],
                        "grade": metrics['grade'],
                        "top_box_pct": metrics['top_box_pct'],
                        "bottom_box_pct": metrics['bottom_box_pct']
                    })

            if question_metrics:
                # Sort by mean score
                question_metrics.sort(key=lambda x: x['mean'], reverse=True)

                category_insights[category_id] = {
                    "category_name": category_name,
                    "strongest_questions": question_metrics[:3],  # Top 3
                    "weakest_questions": question_metrics[-3:],   # Bottom 3
                    "avg_score": float(np.mean([q['mean'] for q in question_metrics])),
                    "num_questions": len(question_metrics)
                }

        return {
            "category_insights": category_insights,
            "num_categories": len(category_insights)
        }

    def compare_categories_by_demographic(
        self,
        demographic_field: str
    ) -> Dict:
        """
        Compare how different demographic segments rate each category

        Args:
            demographic_field: Demographic field to analyze

        Returns:
            Category × demographic comparison
        """
        if not self.categories:
            return {"category_demographic_analysis": {}}

        # Build profile lookup
        profiles_by_id = {
            profile['id']: profile
            for profile in self.run_data.get('profiles', [])
        }

        category_demographic_analysis = {}

        for category_id, category_name in self.categories.items():
            question_ids = self.questions_by_category.get(category_id, [])

            if not question_ids:
                continue

            # Group responses by demographic
            demographic_scores = defaultdict(list)

            for question_id in question_ids:
                for response in self.run_data.get('responses', []):
                    if response.get('question_id') != question_id:
                        continue

                    profile_id = response.get('profile_id')
                    profile = profiles_by_id.get(profile_id)

                    if not profile:
                        continue

                    demographic_value = profile.get(demographic_field)
                    expected_value = response.get('ssr_distribution', {}).get('expected_value')

                    if demographic_value and expected_value is not None:
                        demographic_scores[str(demographic_value)].append(expected_value)

            # Calculate metrics for each demographic segment
            segment_metrics = {}
            for segment, scores in demographic_scores.items():
                if scores:
                    segment_metrics[segment] = {
                        "mean": float(np.mean(scores)),
                        "std": float(np.std(scores)),
                        "sample_size": len(scores)
                    }

            if segment_metrics:
                # Find best and worst segments
                ranked_segments = sorted(
                    segment_metrics.items(),
                    key=lambda x: x[1]['mean'],
                    reverse=True
                )

                category_demographic_analysis[category_id] = {
                    "category_name": category_name,
                    "segment_metrics": segment_metrics,
                    "best_segment": ranked_segments[0][0] if ranked_segments else None,
                    "worst_segment": ranked_segments[-1][0] if ranked_segments else None
                }

        return {
            "demographic_field": demographic_field,
            "category_demographic_analysis": category_demographic_analysis,
            "num_categories": len(category_demographic_analysis)
        }

    def _extract_categories(self) -> Dict[str, str]:
        """Extract categories from survey data"""
        categories = {}

        # Check if survey has categories
        survey = self.run_data.get('survey', {})

        if 'categories' in survey:
            for category in survey['categories']:
                categories[category['id']] = category['name']

        return categories

    def _group_questions_by_category(self) -> Dict[str, List[str]]:
        """Group questions by their category"""
        questions_by_category = defaultdict(list)

        survey = self.run_data.get('survey', {})

        for question in survey.get('questions', []):
            category_id = question.get('category_id')
            if category_id:
                questions_by_category[category_id].append(question['id'])

        return dict(questions_by_category)

    def _get_question_category(self, question_id: str) -> Optional[Dict]:
        """Get category information for a question"""
        for category_id, question_ids in self.questions_by_category.items():
            if question_id in question_ids:
                return {
                    "id": category_id,
                    "name": self.categories.get(category_id, "Unknown")
                }
        return None

    def _compare_categories_statistically(
        self,
        category_metrics: Dict
    ) -> Dict:
        """Compare categories statistically"""
        if len(category_metrics) < 2:
            return {
                "comparison_type": "none",
                "message": "Not enough categories to compare"
            }

        # Collect scores for each category
        category_scores = {}

        for category_id in category_metrics.keys():
            question_ids = self.questions_by_category.get(category_id, [])
            scores = []

            for question_id in question_ids:
                for response in self.run_data.get('responses', []):
                    if response.get('question_id') == question_id:
                        expected_value = response.get('ssr_distribution', {}).get('expected_value')
                        if expected_value is not None:
                            scores.append(expected_value)

            if scores:
                category_scores[category_id] = scores

        if len(category_scores) == 2:
            # Two categories - t-test
            cat_ids = list(category_scores.keys())
            return {
                "comparison_type": "t-test",
                "result": self.tester.compare_two_groups(
                    category_scores[cat_ids[0]],
                    category_scores[cat_ids[1]],
                    self.categories[cat_ids[0]],
                    self.categories[cat_ids[1]]
                )
            }
        elif len(category_scores) > 2:
            # Multiple categories - ANOVA
            # Map category IDs to names for the comparison
            named_scores = {
                self.categories[cat_id]: scores
                for cat_id, scores in category_scores.items()
            }
            return {
                "comparison_type": "anova",
                "result": self.tester.compare_multiple_groups(named_scores)
            }
        else:
            return {
                "comparison_type": "none",
                "message": "Not enough valid category data"
            }

    def _generate_category_interpretation(
        self,
        ranked_categories: List[tuple],
        comparison_result: Dict
    ) -> str:
        """Generate natural language interpretation"""
        if not ranked_categories:
            return "No categories available for comparison."

        winner = ranked_categories[0]
        interpretation = (
            f"{winner[1]['category_name']} is the top-performing category "
            f"with a mean score of {winner[1]['mean']:.2f} (Grade {winner[1]['grade']})."
        )

        if len(ranked_categories) > 1:
            loser = ranked_categories[-1]
            interpretation += (
                f" {loser[1]['category_name']} scored lowest at {loser[1]['mean']:.2f} "
                f"(Grade {loser[1]['grade']})."
            )

        # Add statistical significance if available
        if comparison_result.get('comparison_type') in ['t-test', 'anova']:
            result = comparison_result.get('result', {})
            if result.get('significant'):
                interpretation += " These differences are statistically significant."
            else:
                interpretation += " However, these differences are not statistically significant."

        return interpretation

    def _empty_category_result(self) -> Dict:
        """Return empty result structure"""
        return {
            "category_metrics": {},
            "ranked_categories": [],
            "winner": None,
            "statistical_comparison": {"comparison_type": "none"},
            "num_categories": 0,
            "interpretation": "No categories found in survey."
        }
