"""
Correlation Analysis

Identify relationships between questions and determine key drivers.
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from collections import defaultdict


class CorrelationAnalyzer:
    """Identify relationships between questions and key drivers"""

    def __init__(self, run_data: Dict):
        """
        Initialize correlation analyzer

        Args:
            run_data: Survey run data with responses
        """
        self.run_data = run_data

        # Build response matrix (profile × question)
        self.response_matrix = self._build_response_matrix()

    def calculate_correlation_matrix(
        self,
        question_ids: List[str]
    ) -> Dict:
        """
        Calculate correlations between all questions

        Args:
            question_ids: List of question IDs to analyze

        Returns:
            Correlation matrix and significant relationships
        """
        if len(question_ids) < 2:
            return self._empty_correlation_result()

        # Build data matrix (respondents × questions)
        data_matrix = []
        valid_questions = []

        for question_id in question_ids:
            if question_id in self.response_matrix:
                scores = self.response_matrix[question_id]
                if len(scores) > 0:
                    data_matrix.append(scores)
                    valid_questions.append(question_id)

        if len(valid_questions) < 2:
            return self._empty_correlation_result()

        data_matrix = np.array(data_matrix)

        # Calculate Pearson correlations
        corr_matrix = np.corrcoef(data_matrix)

        # Find strong correlations (|r| > 0.6)
        strong_correlations = []
        moderate_correlations = []

        for i in range(len(valid_questions)):
            for j in range(i + 1, len(valid_questions)):
                r = float(corr_matrix[i, j])

                correlation_data = {
                    "question_a": valid_questions[i],
                    "question_b": valid_questions[j],
                    "correlation": r,
                    "strength": self._interpret_correlation(r),
                    "direction": "positive" if r > 0 else "negative"
                }

                if abs(r) > 0.6:
                    strong_correlations.append(correlation_data)
                elif abs(r) > 0.4:
                    moderate_correlations.append(correlation_data)

        # Sort by absolute correlation value
        strong_correlations.sort(key=lambda x: abs(x['correlation']), reverse=True)
        moderate_correlations.sort(key=lambda x: abs(x['correlation']), reverse=True)

        return {
            "correlation_matrix": corr_matrix.tolist(),
            "questions": valid_questions,
            "strong_correlations": strong_correlations,
            "moderate_correlations": moderate_correlations,
            "num_questions": len(valid_questions),
            "interpretation": self._generate_correlation_interpretation(
                strong_correlations,
                moderate_correlations
            )
        }

    def identify_key_drivers(
        self,
        outcome_question: str,
        predictor_questions: List[str]
    ) -> Dict:
        """
        Identify which questions drive the outcome question

        Uses correlation analysis to determine relative importance

        Args:
            outcome_question: The outcome/dependent variable question
            predictor_questions: Potential driver questions

        Returns:
            Driver analysis with ranked importance
        """
        if outcome_question not in self.response_matrix:
            return self._empty_driver_result(outcome_question)

        # Get outcome scores
        outcome_scores = self.response_matrix[outcome_question]

        if len(outcome_scores) == 0:
            return self._empty_driver_result(outcome_question)

        # Calculate correlations with each predictor
        drivers = []

        for predictor_id in predictor_questions:
            if predictor_id == outcome_question:
                continue

            if predictor_id not in self.response_matrix:
                continue

            predictor_scores = self.response_matrix[predictor_id]

            if len(predictor_scores) == 0:
                continue

            # Calculate correlation
            correlation = float(np.corrcoef(outcome_scores, predictor_scores)[0, 1])

            # Use absolute correlation as importance
            importance = abs(correlation)

            drivers.append({
                "question": predictor_id,
                "correlation": correlation,
                "importance": importance,
                "direction": "positive" if correlation > 0 else "negative",
                "strength": self._interpret_correlation(correlation)
            })

        # Sort by importance
        drivers.sort(key=lambda x: x['importance'], reverse=True)

        # Normalize importance scores
        if drivers:
            total_importance = sum(d['importance'] for d in drivers)
            if total_importance > 0:
                for driver in drivers:
                    driver['relative_importance'] = (
                        driver['importance'] / total_importance * 100
                    )

        # Identify top drivers
        top_driver = drivers[0] if drivers else None

        return {
            "outcome_question": outcome_question,
            "drivers": drivers,
            "top_driver": top_driver['question'] if top_driver else None,
            "top_driver_correlation": top_driver['correlation'] if top_driver else 0,
            "num_drivers": len(drivers),
            "interpretation": self._generate_driver_interpretation(drivers, outcome_question)
        }

    def find_question_clusters(
        self,
        question_ids: List[str],
        threshold: float = 0.6
    ) -> Dict:
        """
        Find clusters of highly correlated questions

        Args:
            question_ids: Questions to analyze
            threshold: Correlation threshold for clustering (default 0.6)

        Returns:
            Question clusters
        """
        # Calculate correlation matrix
        corr_result = self.calculate_correlation_matrix(question_ids)

        if not corr_result.get('questions'):
            return {"clusters": [], "num_clusters": 0}

        # Find clusters using simple threshold-based grouping
        questions = corr_result['questions']
        corr_matrix = np.array(corr_result['correlation_matrix'])

        clusters = []
        assigned = set()

        for i, question_i in enumerate(questions):
            if question_i in assigned:
                continue

            cluster = [question_i]
            assigned.add(question_i)

            # Find correlated questions
            for j, question_j in enumerate(questions):
                if i != j and question_j not in assigned:
                    if abs(corr_matrix[i, j]) >= threshold:
                        cluster.append(question_j)
                        assigned.add(question_j)

            if len(cluster) > 1:  # Only keep clusters with multiple questions
                clusters.append({
                    "questions": cluster,
                    "size": len(cluster),
                    "avg_correlation": self._calculate_cluster_avg_correlation(
                        cluster,
                        questions,
                        corr_matrix
                    )
                })

        return {
            "clusters": clusters,
            "num_clusters": len(clusters),
            "threshold": threshold,
            "total_questions": len(questions),
            "clustered_questions": len(assigned)
        }

    def _build_response_matrix(self) -> Dict[str, List[float]]:
        """Build matrix of question responses by profile"""
        # Group responses by profile and question
        profile_responses = defaultdict(dict)

        for response in self.run_data.get('responses', []):
            profile_id = response.get('profile_id')
            question_id = response.get('question_id')
            ssr_dist = response.get('ssr_distribution', {})
            expected_value = ssr_dist.get('expected_value')

            if expected_value is not None:
                profile_responses[profile_id][question_id] = expected_value

        # Build question-based matrix
        question_matrix = defaultdict(list)

        # Get all profile IDs in order
        profile_ids = sorted(profile_responses.keys())

        # For each question, collect scores in profile order
        all_questions = set()
        for responses in profile_responses.values():
            all_questions.update(responses.keys())

        for question_id in all_questions:
            scores = []
            for profile_id in profile_ids:
                if question_id in profile_responses[profile_id]:
                    scores.append(profile_responses[profile_id][question_id])

            question_matrix[question_id] = scores

        return dict(question_matrix)

    def _interpret_correlation(self, r: float) -> str:
        """Interpret correlation strength"""
        abs_r = abs(r)

        if abs_r >= 0.8:
            return "very strong"
        elif abs_r >= 0.6:
            return "strong"
        elif abs_r >= 0.4:
            return "moderate"
        elif abs_r >= 0.2:
            return "weak"
        else:
            return "negligible"

    def _generate_correlation_interpretation(
        self,
        strong_correlations: List[Dict],
        moderate_correlations: List[Dict]
    ) -> str:
        """Generate natural language interpretation of correlations"""
        if not strong_correlations and not moderate_correlations:
            return "No significant correlations found between questions."

        parts = []

        if strong_correlations:
            count = len(strong_correlations)
            parts.append(
                f"Found {count} strong correlation{'s' if count > 1 else ''} "
                f"between questions, indicating these measures are closely related."
            )

        if moderate_correlations:
            count = len(moderate_correlations)
            parts.append(
                f"Identified {count} moderate correlation{'s' if count > 1 else ''}, "
                f"suggesting some relationship between these questions."
            )

        return " ".join(parts)

    def _generate_driver_interpretation(
        self,
        drivers: List[Dict],
        outcome_question: str
    ) -> str:
        """Generate natural language interpretation of drivers"""
        if not drivers:
            return f"No significant drivers identified for {outcome_question}."

        top_driver = drivers[0]

        interpretation = (
            f"The strongest driver of {outcome_question} is {top_driver['question']} "
            f"with a {top_driver['strength']} {top_driver['direction']} correlation "
            f"(r={top_driver['correlation']:.3f})."
        )

        if len(drivers) > 1:
            interpretation += (
                f" Overall, {len(drivers)} questions show meaningful relationships "
                f"with the outcome."
            )

        return interpretation

    def _calculate_cluster_avg_correlation(
        self,
        cluster: List[str],
        questions: List[str],
        corr_matrix: np.ndarray
    ) -> float:
        """Calculate average correlation within a cluster"""
        indices = [questions.index(q) for q in cluster]

        correlations = []
        for i, idx_i in enumerate(indices):
            for idx_j in indices[i + 1:]:
                correlations.append(abs(corr_matrix[idx_i, idx_j]))

        return float(np.mean(correlations)) if correlations else 0.0

    def _empty_correlation_result(self) -> Dict:
        """Return empty correlation result"""
        return {
            "correlation_matrix": [],
            "questions": [],
            "strong_correlations": [],
            "moderate_correlations": [],
            "num_questions": 0,
            "interpretation": "Insufficient data for correlation analysis."
        }

    def _empty_driver_result(self, outcome_question: str) -> Dict:
        """Return empty driver result"""
        return {
            "outcome_question": outcome_question,
            "drivers": [],
            "top_driver": None,
            "top_driver_correlation": 0,
            "num_drivers": 0,
            "interpretation": "Insufficient data for driver analysis."
        }
