"""
Metrics Calculator

Calculate comprehensive statistical metrics from SSR probability distributions.
"""

import numpy as np
from scipy import stats
from typing import Dict, List, Tuple, Optional
from collections import Counter


class MetricsCalculator:
    """Calculate comprehensive metrics from SSR distributions"""

    def calculate_question_metrics(self, distributions: List[Dict]) -> Dict:
        """
        Calculate metrics for a single question across respondents

        Args:
            distributions: List of SSR probability distributions, each containing:
                - expected_value: float
                - mode: int
                - entropy: float
                - probabilities: List[float]

        Returns:
            Comprehensive metrics dictionary
        """
        if not distributions:
            return self._empty_metrics()

        # Extract expected values (already calculated in SSR)
        expected_values = [d['expected_value'] for d in distributions]
        modes = [d['mode'] for d in distributions]
        entropies = [d['entropy'] for d in distributions]

        # Aggregate probability distributions
        prob_matrix = np.array([d['probabilities'] for d in distributions])
        mean_distribution = np.mean(prob_matrix, axis=0)
        std_distribution = np.std(prob_matrix, axis=0)

        # Calculate basic statistics
        mean_score = float(np.mean(expected_values))
        median_score = float(np.median(expected_values))
        std_score = float(np.std(expected_values))

        # Calculate Top Box (top 2) and Bottom Box (bottom 2) %
        top_box_pct = self._calculate_top_box(prob_matrix)
        bottom_box_pct = self._calculate_bottom_box(prob_matrix)

        # Net Score (Top Box - Bottom Box)
        net_score = top_box_pct - bottom_box_pct

        # Confidence interval (95%)
        ci_95 = stats.t.interval(
            0.95,
            len(expected_values) - 1,
            loc=mean_score,
            scale=stats.sem(expected_values)
        )

        # Average entropy (measure of uncertainty)
        mean_entropy = float(np.mean(entropies))

        # Mode distribution
        mode_distribution = self._mode_distribution(modes)

        return {
            "mean": mean_score,
            "median": median_score,
            "std": std_score,
            "ci_95_lower": float(ci_95[0]),
            "ci_95_upper": float(ci_95[1]),
            "margin_of_error": float((ci_95[1] - ci_95[0]) / 2),
            "top_box_pct": top_box_pct,
            "bottom_box_pct": bottom_box_pct,
            "net_score": net_score,
            "mean_distribution": mean_distribution.tolist(),
            "std_distribution": std_distribution.tolist(),
            "mean_entropy": mean_entropy,
            "mode_distribution": mode_distribution,
            "sample_size": len(distributions),
            "grade": self._assign_grade(mean_score)
        }

    def calculate_overall_metrics(self, question_metrics: List[Dict]) -> Dict:
        """
        Calculate overall survey metrics from question-level metrics

        Args:
            question_metrics: List of metrics dictionaries from calculate_question_metrics

        Returns:
            Overall survey metrics
        """
        if not question_metrics:
            return self._empty_metrics()

        means = [m['mean'] for m in question_metrics]
        top_boxes = [m['top_box_pct'] for m in question_metrics]
        net_scores = [m['net_score'] for m in question_metrics]

        return {
            "overall_mean": float(np.mean(means)),
            "overall_top_box_pct": float(np.mean(top_boxes)),
            "overall_net_score": float(np.mean(net_scores)),
            "mean_range": (float(np.min(means)), float(np.max(means))),
            "grade": self._assign_grade(np.mean(means)),
            "num_questions": len(question_metrics)
        }

    def _calculate_top_box(self, prob_matrix: np.ndarray) -> float:
        """Calculate % who gave top 2 ratings"""
        if prob_matrix.shape[1] < 2:
            return 0.0

        # Sum last 2 columns of probability matrix
        top_2_probs = prob_matrix[:, -2:].sum(axis=1)
        return float(np.mean(top_2_probs) * 100)

    def _calculate_bottom_box(self, prob_matrix: np.ndarray) -> float:
        """Calculate % who gave bottom 2 ratings"""
        if prob_matrix.shape[1] < 2:
            return 0.0

        bottom_2_probs = prob_matrix[:, :2].sum(axis=1)
        return float(np.mean(bottom_2_probs) * 100)

    def _mode_distribution(self, modes: List[int]) -> Dict[int, float]:
        """Calculate distribution of mode values"""
        if not modes:
            return {}

        mode_counts = Counter(modes)
        total = len(modes)

        return {
            mode: (count / total * 100)
            for mode, count in mode_counts.items()
        }

    def _assign_grade(self, mean_score: float) -> str:
        """
        Assign letter grade based on mean score (assuming 1-7 scale)

        Grading scale:
        - A: 6.0+  (Excellent)
        - A-: 5.5-5.9 (Very Good)
        - B+: 5.0-5.4 (Good)
        - B: 4.5-4.9 (Above Average)
        - C+: 4.0-4.4 (Average)
        - C: 3.5-3.9 (Below Average)
        - D: <3.5 (Poor)
        """
        if mean_score >= 6.0:
            return "A"
        elif mean_score >= 5.5:
            return "A-"
        elif mean_score >= 5.0:
            return "B+"
        elif mean_score >= 4.5:
            return "B"
        elif mean_score >= 4.0:
            return "C+"
        elif mean_score >= 3.5:
            return "C"
        else:
            return "D"

    def _empty_metrics(self) -> Dict:
        """Return empty metrics structure"""
        return {
            "mean": 0.0,
            "median": 0.0,
            "std": 0.0,
            "ci_95_lower": 0.0,
            "ci_95_upper": 0.0,
            "margin_of_error": 0.0,
            "top_box_pct": 0.0,
            "bottom_box_pct": 0.0,
            "net_score": 0.0,
            "mean_distribution": [],
            "std_distribution": [],
            "mean_entropy": 0.0,
            "mode_distribution": {},
            "sample_size": 0,
            "grade": "N/A"
        }

    def calculate_distribution_chart_data(
        self,
        mean_distribution: List[float],
        scale_labels: List[str]
    ) -> List[Dict]:
        """
        Prepare data for distribution chart visualization

        Args:
            mean_distribution: Average probability distribution across respondents
            scale_labels: Labels for each point on the scale

        Returns:
            List of {label, percentage} dictionaries for charting
        """
        return [
            {
                "label": label,
                "percentage": float(prob * 100),
                "value": idx + 1
            }
            for idx, (label, prob) in enumerate(zip(scale_labels, mean_distribution))
        ]
